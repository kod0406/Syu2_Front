import { useState } from 'react';

export default function CustomerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSocialLogin = (provider) => {
    let redirectUrl = '';
    switch (provider) {
      case 'kakao':
        redirectUrl = `http://localhost:8080/api/oauth2/kakao/login`;
        break;
      case 'naver':
        redirectUrl = `http://localhost:8080/api/oauth2/naver/login`;
        break;
      default:
        break;
    }
    window.location.href = redirectUrl;
  };

  const handleEmailLogin = (e) => {
    e.preventDefault();
    // TODO: 이메일/비밀번호 로그인 처리 (백엔드로 POST 요청) --> 수정해야 함
    console.log('이메일 로그인 요청:', { email, password });
  };

  const handleSignUp = () => {
    // TODO: 회원가입 페이지로 이동
    window.location.href = '/signup';
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-100">
      <div className="w-full max-w-sm space-y-6 bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold text-center">로그인</h1>

        {/* 이메일 로그인 폼 */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            이메일로 로그인
          </button>
        </form>

        <div className="flex justify-between">
          <button
            onClick={handleSignUp}
            className="text-sm text-blue-600 hover:underline"
          >
            회원가입
          </button>
        </div>

        {/* 소셜 로그인 버튼 */}
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
