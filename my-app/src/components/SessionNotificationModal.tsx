import React, { useEffect } from 'react';
import './SessionNotificationModal.css';

interface SessionNotificationModalProps {
    notification: {
        type: 'SESSION_INVALIDATED' | 'NEW_DEVICE_LOGIN' | 'FORCE_LOGOUT';
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
    onClearSession
}) => {
    // 세션 무효화의 경우 5초 후 자동 리다이렉트 (Hook을 조건부 호출하지 않도록 상단으로 이동)
    useEffect(() => {
        if (notification && notification.type === 'SESSION_INVALIDATED') {
            const timer = setTimeout(() => {
                onClearSession();
            }, 10000);

            return () => clearTimeout(timer);
        }
    }, [notification, onClearSession]);

    if (!notification) return null;

    const getModalConfig = () => {
        switch (notification.type) {
            case 'SESSION_INVALIDATED':
                const deviceInfo = notification.newDeviceInfo;
                return {
                    title: '🚨 세션 만료 알림',
                    message: `다른 기기에서 로그인하여 현재 세션이 만료되었습니다.\n\n새 로그인 기기 정보:\n• IP: ${deviceInfo?.ip}\n• 브라우저: ${deviceInfo?.browser}\n• 운영체제: ${deviceInfo?.os}\n\n보안을 위해 다시 로그인해주세요.`,
                    type: 'warning' as const,
                    buttons: [
                        {
                            text: '다시 로그인',
                            action: onLoginRedirect,
                            primary: true
                        }
                    ]
                };

            case 'FORCE_LOGOUT':
                return {
                    title: '⚠️ 강제 로그아웃',
                    message: `관리자에 의해 강제 로그아웃되었습니다.\n\n사유: ${notification.reason}`,
                    type: 'error' as const,
                    buttons: [
                        {
                            text: '확인',
                            action: onClearSession,
                            primary: true
                        }
                    ]
                };

            default:
                return {
                    title: '알림',
                    message: notification.message,
                    type: 'info' as const,
                    buttons: [
                        {
                            text: '확인',
                            action: onClose,
                            primary: true
                        }
                    ]
                };
        }
    };

    const config = getModalConfig();

    return (
        <div className="session-notification-modal">
            <div className="modal-backdrop">
                <div className={`modal-content ${config.type}`}>
                    <div className="modal-header">
                        <h3>{config.title}</h3>
                    </div>
                    <div className="modal-body">
                        <p>
                            {config.message.split('\n').map((line, index) => (
                                <React.Fragment key={index}>
                                    {line}
                                    {index < config.message.split('\n').length - 1 && <br />}
                                </React.Fragment>
                            ))}
                        </p>
                    </div>
                    <div className="modal-footer">
                        {config.buttons.map((button, index) => (
                            <button
                                key={index}
                                className={`btn ${button.primary ? 'btn-primary' : 'btn-secondary'}`}
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
