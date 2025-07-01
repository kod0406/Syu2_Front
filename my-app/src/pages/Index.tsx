import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function IndexPage() {
  const navigate = useNavigate();

  const handleGuest = (): void => {
    const target = sessionStorage.getItem('qr-redirect-url') || '/';
    navigate(target);
  };

  const handleLogin = (): void => {
    navigate('/customer/login');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6">
      <h1 className="text-2xl font-bold">접속 유형 선택</h1>
      <button
        onClick={handleGuest}
        className="w-60 py-3 bg-gray-400 text-white rounded"
      >
        비회원 이용
      </button>
      <button
        onClick={handleLogin}
        className="w-60 py-3 bg-blue-500 text-white rounded"
      >
        회원 로그인
      </button>
    </div>
  );
}
