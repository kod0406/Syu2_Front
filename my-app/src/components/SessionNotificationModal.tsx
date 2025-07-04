import "./SessionNotificationModal.css";
import React, { useEffect } from "react";

interface SessionNotificationModalProps {
  notification: {
    type: "SESSION_INVALIDATED" | "NEW_DEVICE_LOGIN" | "FORCE_LOGOUT";
    message: string;
    reason?: string;
    newDeviceInfo?: {
      ip: string;
      browser: string;
      os: string;
    };
    deviceInfo?: {
      ip: string;
      browser: string;
      os: string;
    };
    timestamp: string;
  } | null;
  onClose: () => void;
  onLoginRedirect: () => void;
  onClearSession: () => void;
}

const SessionNotificationModal: React.FC<SessionNotificationModalProps> = ({
  notification,
  onClose,
  onLoginRedirect,
  onClearSession,
}) => {
  // 세션 무효화의 경우 10초 후 자동 리다이렉트
  useEffect(() => {
    if (notification && notification.type === "SESSION_INVALIDATED") {
      const timer = setTimeout(() => {
        onClearSession();
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [notification, onClearSession]);

  if (!notification) return null;

  const getModalConfig = () => {
    switch (notification.type) {
      case "SESSION_INVALIDATED":
        const deviceInfo = notification.newDeviceInfo;
        return {
          title: "🚨 세션 만료 알림",
          message: `다른 기기에서 로그인하여 현재 세션이 만료되었습니다.\n\n새 로그인 기기 정보:\n• IP: ${deviceInfo?.ip}\n• 브라우저: ${deviceInfo?.browser}\n• 운영체제: ${deviceInfo?.os}\n\n보안을 위해 다시 로그인해주세요.`,
          type: "warning" as const,
          borderColor: "border-l-orange-500",
          buttons: [
            {
              text: "다시 로그인",
              action: onLoginRedirect,
              primary: true,
            },
          ],
        };

      case "FORCE_LOGOUT":
        return {
          title: "⚠️ 강제 로그아웃",
          message: `관리자에 의해 강제 로그아웃되었습니다.\n\n사유: ${notification.reason}`,
          type: "error" as const,
          borderColor: "border-l-red-500",
          buttons: [
            {
              text: "확인",
              action: onClearSession,
              primary: true,
            },
          ],
        };

      default:
        return {
          title: "알림",
          message: notification.message,
          type: "info" as const,
          borderColor: "border-l-blue-500",
          buttons: [
            {
              text: "확인",
              action: onClose,
              primary: true,
            },
          ],
        };
    }
  };
  const config = getModalConfig();

  return (
    <div className="fixed top-0 left-0 w-full h-full z-[9999]">
      <div className="bg-black bg-opacity-50 w-full h-full flex items-center justify-center animate-fade-in">
        <div
          className={`bg-white rounded-xl max-w-lg min-w-80 mx-5 shadow-2xl animate-slide-up overflow-hidden border-l-4 ${config.borderColor} sm:mx-4 sm:min-w-auto sm:max-w-[calc(100%-32px)]`}
        >
          <div className="px-6 pt-6 pb-4 border-b border-gray-200 bg-gray-50 sm:px-5 sm:pt-5 sm:pb-3">
            <h3 className="m-0 text-xl font-semibold text-gray-800 sm:text-lg">
              {config.title}
            </h3>
          </div>
          <div className="px-6 py-6 leading-relaxed text-gray-600 text-sm whitespace-pre-line sm:px-5 sm:py-5 sm:text-xs">
            <p className="m-0">
              {config.message.split("\n").map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  {index < config.message.split("\n").length - 1 && <br />}
                </React.Fragment>
              ))}
            </p>
          </div>
          <div className="px-6 pt-4 pb-6 text-right bg-gray-50 border-t border-gray-200 sm:px-5 sm:pt-3 sm:pb-5">
            {config.buttons.map((button, index) => (
              <button
                key={index}
                className={`px-5 py-2.5 ml-3 border-none rounded-md cursor-pointer text-sm font-medium transition-all duration-200 min-w-20 hover:-translate-y-px hover:shadow-lg ${
                  button.primary
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-gray-500 text-white hover:bg-gray-600"
                } sm:px-4 sm:py-2 sm:ml-2 sm:text-xs`}
                onClick={button.action}
              >
                {button.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionNotificationModal;
