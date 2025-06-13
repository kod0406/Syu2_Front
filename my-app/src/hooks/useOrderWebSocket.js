import { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

export default function useOrderWebSocket(storeId) {
  const [orderData, setOrderData] = useState(null);
  const clientRef = useRef(null);

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws');
    const client = Stomp.over(socket);

    clientRef.current = client;

    client.connect(
      {},
      () => {
        console.log('✅ WebSocket connected');

        client.subscribe(`/topic/orders/${storeId}`, (message) => {
          try {
            const payload = JSON.parse(message.body);
            console.log('📦 받은 메시지:', payload);
            setOrderData(payload);
          } catch (err) {
            console.error('❌ 메시지 파싱 오류:', err);
          }
        });
      },
      (error) => {
        console.error('❌ WebSocket 연결 실패:', error);
      }
    );

    return () => {
      if (clientRef.current) {
        try {
          clientRef.current.disconnect(() => {
            console.log('❌ WebSocket disconnected');
          });
        } catch (err) {
          console.warn('🔌 연결 종료 중 오류 발생:', err);
        }
      }
    };
  }, [storeId]);

  return { orderData };
}
