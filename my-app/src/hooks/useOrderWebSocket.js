import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

export default function useOrderWebSocketAndFetch(storeId) {
  const [orderData, setOrderData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef(null);

  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/ws");
    const client = Stomp.over(socket);
    clientRef.current = client;

    client.connect(
      {},
      async () => {
        console.log("✅ WebSocket connected");
        setIsConnected(true);

        // ✅ 연결 성공 후 GET 요청 실행
        try {
          const res = await fetch(
            `http://localhost:8080/api/orders/active?storeId=${storeId}`,
            {
              method: "GET",
              credentials: "include",
            }
          );

          if (!res.ok) throw new Error("주문 데이터 가져오기 실패");

          const data = await res.json();
          console.log("📦 초기 주문 데이터:", data);
          setOrderData(data);
        } catch (err) {
          console.error("❌ 초기 주문 데이터 오류:", err);
        }

        // ✅ 이후에 WebSocket 구독도 가능
        client.subscribe(`/topic/orders/${storeId}`, (message) => {
          try {
            const payload = JSON.parse(message.body);
            console.log("📨 받은 실시간 메시지:", payload);
            setOrderData(payload);
          } catch (err) {
            console.error("❌ 메시지 파싱 오류:", err);
          }
        });
      },
      (error) => {
        console.error("❌ WebSocket 연결 실패:", error);
      }
    );

    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect(() => {
          console.log("❌ WebSocket disconnected");
        });
      }
    };
  }, [storeId]);

  return { orderData, isConnected };
}
