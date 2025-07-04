import React, { useEffect } from "react";
import "./SessionNotificationToast.css";

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
    <div className="notification-toast info">
      <div className="toast-header">
        <strong>🔐 새 기기 로그인 감지</strong>
        <button className="toast-close" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="toast-body">
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
