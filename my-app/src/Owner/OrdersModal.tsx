import React, { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import { Stomp, CompatClient } from '@stomp/stompjs';
import api from '../API/TokenConfig';

interface OrdersModalProps {
  storeId: number;
  onClose: () => void;
}

const OrdersModal: React.FC<OrdersModalProps> = ({ storeId, onClose }) => {
  const [orderData, setOrderData] = useState<any>(null);
  const [completedIds, setCompletedIds] = useState<number[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = new SockJS(`${process.env.REACT_APP_API_URL}/ws`);
    const client: CompatClient = Stomp.over(socket);

    client.connect(
      {},
      async () => {
        client.subscribe(`/topic/orders/${storeId}`, (message) => {
          try {
            const payload = JSON.parse(message.body);
            console.log('📨 실시간 메시지 수신:', payload);
            setOrderData(payload);
          } catch (err) {
            console.error('❌ 실시간 메시지 파싱 실패:', err);
          }
        });

        setIsConnected(true);

        try {
          const res = await api.get(`/api/orders/getMenu`);
          setOrderData(res.data);
        } catch (err) {
          console.error('❌ 주문 목록 불러오기 실패:', err);
        }
      },
      (error: unknown) => {
        console.error('❌ WebSocket 연결 실패:', error);
      }
    );

    return () => {
      if (client.connected) {
        client.disconnect(() => {
          console.log('❌ WebSocket 연결 종료');
        });
      }
    };
  }, [storeId]);

  const markOrderAsCompleted = async (orderGroupId: number) => {
    try {
      await api.post(`/api/orders/${orderGroupId}/complete`, {
        active: true,
      });

      setCompletedIds((prev) => [...prev, orderGroupId]);
      console.log(`✅ 주문 그룹 ${orderGroupId} 완료 처리됨`);
    } catch (err) {
      console.error('❌ 오류 발생:', err);
      alert('주문 완료 처리 중 오류 발생');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow w-[500px] max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">📦 실시간 주문 현황</h2>

        {!isConnected ? (
          <p>🕐 서버 연결 중...</p>
        ) : orderData && orderData.groups?.length > 0 ? (
          orderData.groups.map((group: any) => {
            const isCompleted = completedIds.includes(group.orderGroupId);
            return (
              <div
                key={group.orderGroupId}
                className={`border rounded p-3 mb-4 ${isCompleted ? 'opacity-50' : ''}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold">🧾 주문 그룹 #{group.orderGroupId}</h3>
                  <button
                    onClick={() => markOrderAsCompleted(group.orderGroupId)}
                    className="text-sm px-2 py-1 bg-green-500 text-white rounded disabled:opacity-50"
                    disabled={isCompleted}
                  >
                    ✅ 완료
                  </button>
                </div>
                <ul className="space-y-1">
                  {group.items.map((item: any, idx: number) => (
                    <li key={idx} className="flex justify-between border-b py-1">
                      <span>{item.menuName} × {item.quantity}</span>
                      <span>₩{(item.price * item.quantity).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })
        ) : (
          <p>📭 아직 주문 없음</p>
        )}

        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-blue-500 text-white rounded">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdersModal;