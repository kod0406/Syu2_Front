import React, { useEffect } from "react";

interface SessionNotificationToastProps {
  notification: {
    type: "NEW_DEVICE_LOGIN";
    message: string;
    deviceInfo: {
      ip: string;
      browser: string;
      os: string;
    };
    timestamp: string;
  } | null;
  onClose: () => void;
  duration?: number;
}

const SessionNotificationToast: React.FC<SessionNotificationToastProps> = ({
  notification,
  onClose,
  duration = 8000,
}) => {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [notification, duration, onClose]);

  if (!notification || notification.type !== "NEW_DEVICE_LOGIN") return null;

  const deviceInfo = notification.deviceInfo;

  return (
    <div className="fixed top-5 right-5 bg-white rounded-xl shadow-2xl max-w-sm min-w-80 z-[9998] animate-slide-in border border-gray-200 border-l-4 border-l-blue-500 sm:top-4 sm:right-4 sm:left-4 sm:max-w-none sm:min-w-auto">
      <div className="px-5 py-4 pb-3 flex justify-between items-center border-b border-gray-200 bg-slate-50 rounded-t-xl sm:px-4 sm:py-3.5 sm:pb-2.5">
        <strong className="text-slate-800 text-sm font-semibold">
          🔐 새 기기 로그인 감지
        </strong>
        <button
          className="bg-none border-none text-xl cursor-pointer text-slate-500 p-0 w-6 h-6 flex items-center justify-center rounded transition-all duration-200 hover:bg-slate-200 hover:text-slate-600"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      <div className="px-5 py-4 text-xs leading-6 text-slate-600 sm:px-4 sm:py-3.5 sm:text-xs">
        새로운 기기에서 로그인이 감지되었습니다.
        <br />
        <br />
        로그인 기기 정보:
        <br />• IP: {deviceInfo.ip}
        <br />• 브라우저: {deviceInfo.browser}
        <br />• 운영체제: {deviceInfo.os}
      </div>
    </div>
  );
};

export default SessionNotificationToast;
