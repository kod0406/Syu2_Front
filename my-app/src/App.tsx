import { Routes, Route } from 'react-router-dom';
import { useSessionNotification } from './hooks/useSessionNotification';
import SessionNotificationModal from './components/SessionNotificationModal';
import SessionNotificationToast from './components/SessionNotificationToast';
import Login from './pages/Login';
import Menu from './pages/Menu';
import OwnerDashboard from './pages/Owner';
import SignUp from './pages/Signup';
import OwnerLogin from './pages/Owner_Login';
import Review from './pages/Review';
import ReviewWrite from './pages/Review_write';
import Index from './pages/Index';
import Home from './pages/Home';
import Coupon from './pages/Coupon';
import CustomerCouponPage from './pages/CustomerCouponPage';
import EmailVerification from './pages/EmailVerification';
import EmailResend from './pages/EmailResend';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  console.log('✅ ENV:', process.env.REACT_APP_API_URL);

  // 세션 알림 훅 사용
  const {
    notification,
    clearNotification,
    clearSessionAndRedirect
  } = useSessionNotification();

  // 로그인 페이지로 리다이렉트
  const handleLoginRedirect = () => {
    clearNotification();

    // 현재 페이지 경로를 확인하여 적절한 로그인 페이지로 리다이렉트
    const currentPath = window.location.pathname;
    if (currentPath.includes('/owner/') || currentPath.includes('/dashboard/')) {
      // 점주 관련 페이지에서 세션 만료된 경우
      window.location.href = '/owner/login';
    } else {
      // 그 외의 경우 (고객 관련 페이지)
      window.location.href = '/customer/login';
    }
  };

  // 세션 정리 및 리다이렉트
  const handleClearSession = () => {
    clearNotification();
    clearSessionAndRedirect();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/menu/:storeId" element={<Menu />} />
        <Route path="/customer/login" element={<Login />} />
        <Route path="/owner/login" element={<OwnerLogin />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/owner/dashboard/:storeId" element={<OwnerDashboard />} />
        <Route path="/review" element={<Review />} />
        <Route path="/review/write/:statisticsId" element={<ReviewWrite />} />
        <Route path="/index" element={<Index />} />
        <Route path="/" element={<Home />} />
        <Route path="/owner/:storeId/coupon" element={<Coupon />} />
        <Route path="/my-coupons" element={<CustomerCouponPage />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/email-resend" element={<EmailResend />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>

      {/* 세션 알림 모달 - 세션 무효화 및 강제 로그아웃용 */}
      {notification && (notification.type === 'SESSION_INVALIDATED' || notification.type === 'FORCE_LOGOUT') && (
        <SessionNotificationModal
          notification={notification}
          onClose={clearNotification}
          onLoginRedirect={handleLoginRedirect}
          onClearSession={handleClearSession}
        />
      )}

      {/* 세션 알림 토스트 - 새 기기 로그인 감지용 */}
      {notification && notification.type === 'NEW_DEVICE_LOGIN' && notification.deviceInfo && (
        <SessionNotificationToast
          notification={{
            type: 'NEW_DEVICE_LOGIN',
            message: notification.message,
            deviceInfo: notification.deviceInfo,
            timestamp: notification.timestamp
          }}
          onClose={clearNotification}
          duration={8000}
        />
      )}
    </div>
  );
}

export default App;
