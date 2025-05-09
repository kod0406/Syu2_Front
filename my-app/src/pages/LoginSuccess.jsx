import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function LoginSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      localStorage.setItem('authToken', token);
      navigate('/owner/dashboard'); // 로그인 후 이동할 페이지
    } else {
      navigate('/login-fail'); // 실패 시 처리
    }
  }, [location, navigate]);

  return (
    <div className="p-4">
      <h1 className="text-2xl">로그인 처리 중...</h1>
    </div>
  );
}
