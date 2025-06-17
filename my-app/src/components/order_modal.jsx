import React, { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

function OrdersModal({ storeId, onClose }) {
  const [orderData, setOrderData] = useState(null);
  const [completedIds, setCompletedIds] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // WebSocket 연결
    const socket = new SockJS('http://localhost:8080/ws');
    const client = Stomp.over(socket);

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

        console.log('✅ WebSocket connected');
        setIsConnected(true);
        // ✅ 연결 후 초기 주문 데이터 요청 (GET)
        try {
          const res = await fetch(`http://localhost:8080/api/orders/getMenu`, {
            method: 'GET',
            credentials: 'include',
          });
          if (!res.ok) throw new Error('주문 데이터 불러오기 실패');
          const data = await res.json();
          setOrderData(data);
        } catch (err) {
          console.error('❌ 주문 목록 불러오기 실패:', err);
        }
        // ✅ WebSocket 구독

      },
      (error) => {
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

  // ✅ 주문 완료 처리
  const markOrderAsCompleted = async (orderGroupId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/orders/${orderGroupId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ active: true }), // 필요 시 제거 가능
      });

      if (!res.ok) throw new Error('완료 처리 실패');
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
          orderData.groups.map((group) => {
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
                  {group.items.map((item, idx) => (
                    <li key={idx} className="flex justify-between border-b py-1">
                      <span>{item.menuName} × {item.quantity}</span>
                      <span>₩{item.price.toLocaleString()}</span>
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
}

export default OrdersModal;
