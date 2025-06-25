'use client';
import React from 'react';

export default function CustomerLogin() {
  const handleSocialLogin = (provider: 'kakao' | 'naver') => {
    const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';
    const redirectUrl = `${API_BASE}/api/oauth2/${provider}/login`; // ✅ redirect_uri 제거
    window.location.href = redirectUrl;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-100">
      <div className="w-full max-w-sm space-y-6 bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold text-center">로그인</h1>

        <div className="space-y-2">
          <button
            onClick={() => handleSocialLogin('kakao')}
            className="w-full flex items-center justify-center bg-yellow-400 text-black py-3 rounded shadow"
          >
            Kakao로 시작하기
          </button>
          <button
            onClick={() => handleSocialLogin('naver')}
            className="w-full flex items-center justify-center bg-green-500 text-white py-3 rounded shadow"
          >
            Naver로 시작하기
          </button>
        </div>
      </div>
    </div>
  );
}
