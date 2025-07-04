import { useState, useEffect, useRef, useCallback } from "react";
import SockJS from "sockjs-client";
import { Stomp, Client, Frame, Message } from "@stomp/stompjs";

interface DeviceInfo {
  ip: string;
  browser: string;
  os: string;
}

interface SessionNotification {
  type: "SESSION_INVALIDATED" | "NEW_DEVICE_LOGIN" | "FORCE_LOGOUT";
  message: string;
  reason?: string;
  newDeviceInfo?: DeviceInfo;
  deviceInfo?: DeviceInfo;
  timestamp: string;
}

interface WebSocketConnectionInfo {
  success: boolean;
  userId: string;
  userType: string;
  topicPath: string;
}

/**
 * 세션 알림을 위한 React Hook
 * 백엔드의 WebSocket 세션 무효화 알림을 처리합니다.
 */
export const useSessionNotification = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [notification, setNotification] = useState<SessionNotification | null>(
    null
  );
  const stompClientRef = useRef<Client | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const maxReconnectAttempts = 5;
  const reconnectDelayRef = useRef<number>(3000);

  // 백엔드 서버 URL 설정 (useOrderWebSocket과 동일하게)
  const getServerUrl = () => {
    if (process.env.NODE_ENV === "development") {
      return process.env.REACT_APP_API_URL || "http://localhost:8080";
    }
    return "";
  };

  // WebSocket 연결
  const connectWebSocket = useCallback(
    (topicPath: string) => {
      if (isConnected || !topicPath) {
        // console.log(`WebSocket 연결 스킵: isConnected=${isConnected}, topicPath=${topicPath}`);
        return;
      }

      try {
        // console.log('🔌 WebSocket 연결 시도 중...', topicPath);

        const serverUrl = getServerUrl();
        const socketUrl = `${serverUrl}/ws`;
        // console.log('🌐 WebSocket 서버 URL:', socketUrl);

        const socket = new SockJS(socketUrl);
        const stompClient = Stomp.over(socket);

        // 디버그 모드 활성화 (개발환경에서)
        if (process.env.NODE_ENV === "development") {
          stompClient.debug = (str) => {
            console.log("🔍 STOMP:", str);
          };
        } else {
          stompClient.debug = () => {};
        }

        // 연결 헤더 설정
        const connectHeaders = {
          Authorization: document.cookie.includes("access_token=")
            ? `Bearer ${
                document.cookie.split("access_token=")[1]?.split(";")[0]
              }`
            : "",
        };

        stompClient.connect(
          connectHeaders,
          (frame: Frame) => {
            console.log("✅ WebSocket 연결 성공!");
            setIsConnected(true);
            reconnectAttemptsRef.current = 0;
            reconnectDelayRef.current = 3000; // 딜레이 리셋

            // 개인 세션 알림 구독
            stompClient.subscribe(topicPath, (message: Message) => {
              // console.log('🔔 WebSocket 메시지 수신 (RAW):', message);
              try {
                const notificationData: SessionNotification = JSON.parse(
                  message.body
                );
                console.log("🔔 세션 알림 수신:", notificationData);
                setNotification(notificationData);
              } catch (parseError) {
                console.error("❌ 메시지 파싱 오류:", parseError, message.body);
              }
            });

            console.log(`📡 세션 알림 구독 완료: ${topicPath}`);
          },
          (error: any) => {
            console.error("❌ WebSocket 연결 오류:", error);
            setIsConnected(false);
            scheduleReconnect(topicPath);
          }
        );

        stompClientRef.current = stompClient;
      } catch (error) {
        console.error("WebSocket 연결 실패:", error);
        scheduleReconnect(topicPath);
      }
    },
    [isConnected]
  );

  // 재연결 스케줄링
  const scheduleReconnect = useCallback(
    (topicPath: string) => {
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current++;
        // console.log(`🔄 WebSocket 재연결 시도 (${reconnectAttemptsRef.current}/${maxReconnectAttempts}) ${reconnectDelayRef.current}ms 후...`);

        setTimeout(() => {
          connectWebSocket(topicPath);
        }, reconnectDelayRef.current);

        // 재연결 딜레이 증가 (최대 30초)
        reconnectDelayRef.current = Math.min(
          reconnectDelayRef.current * 1.5,
          30000
        );
      } else {
        console.error("❌ WebSocket 재연결 시도 횟수 초과");
      }
    },
    [connectWebSocket]
  );

  // WebSocket 연결 초기화
  const initializeWebSocket = useCallback(async (): Promise<boolean> => {
    try {
      // console.log('🚀 WebSocket 초기화 시작...');

      // 서버에서 WebSocket 연결 정보 가져오기
      const serverUrl = getServerUrl();
      const response = await fetch(
        `${serverUrl}/api/session/connect-websocket`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // console.log('📡 WebSocket 연결 정보 요청 응답:', response.status);

      if (!response.ok) {
        console.warn(
          "WebSocket 연결 정보를 가져올 수 없습니다:",
          response.status
        );
        // 응답 내용도 로깅
        const errorText = await response.text();
        console.warn("WebSocket 연결 정보 오류 내용:", errorText);
        return false;
      }

      const data: WebSocketConnectionInfo = await response.json();
      // console.log('📨 WebSocket 연결 정보 수신:', data);

      if (data.success) {
        // console.log('🔗 WebSocket 연결 정보 수신:', {
        //     userId: data.userId,
        //     userType: data.userType,
        //     topicPath: data.topicPath
        // });
        //
        console.log("🎯 구독할 토픽 경로:", data.topicPath);

        // WebSocket 연결 시작
        connectWebSocket(data.topicPath);
        return true;
      } else {
        console.error("❌ WebSocket 연결 정보 실패:", data);
        return false;
      }
    } catch (error) {
      console.error("WebSocket 초기화 오류:", error);
      return false;
    }
  }, [connectWebSocket]);

  // 연결 해제
  const disconnect = useCallback(() => {
    if (stompClientRef.current && isConnected) {
      try {
        stompClientRef.current.deactivate();
        // console.log('🔌 WebSocket 연결 해제');
        setIsConnected(false);
      } catch (error) {
        console.error("WebSocket 연결 해제 오류:", error);
      }
    }
  }, [isConnected]);

  // 알림 상태 초기화
  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  // 세션 정리 및 리다이렉트
  const clearSessionAndRedirect = useCallback(async () => {
    try {
      const serverUrl = getServerUrl();
      // 세션 만료 API 호출
      await fetch(`${serverUrl}/api/session/session-expired`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: "다른 기기에서 로그인",
        }),
      });
    } catch (error) {
      console.error("세션 정리 오류:", error);
    }

    // 토큰 쿠키 삭제 (클라이언트 측에서도)
    document.cookie =
      "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    document.cookie =
      "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";

    // 역할별 로그인 페이지로 리다이렉트
    const currentPath = window.location.pathname;
    if (
      currentPath.includes("/owner/") ||
      currentPath.includes("/dashboard/")
    ) {
      // 점주 관련 페이지에서 세션 만료된 경우 점주 로그인 페이지로
      window.location.href = "/owner/login";
    } else {
      // 그 외의 경우 고객 로그인 페이지로
      window.location.href = "/customer/login";
    }
  }, []);

  // 컴포넌트 마운트 시 WebSocket 초기화
  useEffect(() => {
    // 로그인 상태인 경우에만 WebSocket 연결
    // const hasToken = document.cookie.includes('access_token=');
    // console.log('🏁 useSessionNotification 초기화 - 토큰 존재:', hasToken);
    if (document.cookie.includes("access_token=")) {
      // console.log('🚀 WebSocket 초기화 시작...');
      const timer = setTimeout(() => {
        initializeWebSocket();
      }, 100);
      return () => clearTimeout(timer);
    }

    // 컴포넌트 언마운트 시 연결 해제
    return () => {
      // console.log('🧹 useSessionNotification 정리 중...');
      disconnect();
    };
  }, [initializeWebSocket, disconnect]);

  // 쿠키 변경 감지를 위한 추가 useEffect
  useEffect(() => {
    const checkCookieChange = () => {
      const hasToken = document.cookie.includes("access_token=");

      if (hasToken && !isConnected) {
        // console.log('🔄 쿠키 변경 감지 - WebSocket 연결 시도');
        initializeWebSocket();
      } else if (!hasToken && isConnected) {
        // console.log('🔄 토큰 삭제 감지 - WebSocket 연결 해제');
        disconnect();
      }
    };

    // 쿠키 변경 감지를 위한 폴링 (1초마다)
    const interval = setInterval(checkCookieChange, 1000);

    return () => clearInterval(interval);
  }, [isConnected, initializeWebSocket, disconnect]);

  return {
    isConnected,
    notification,
    clearNotification,
    clearSessionAndRedirect,
    disconnect,
  };
};
