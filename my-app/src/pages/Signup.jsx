import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [storeNumber, setStoreNumber] = useState('');
  const [storeName, setStoreName] = useState('');

  const handleSignup = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    // TODO: 백엔드에 회원가입 POST 요청
    console.log('회원가입 요청:', {
      email,
      password,
      storeNumber,
      storeName,
    });

    // 회원가입 후 로그인 페이지로 이동
    navigate('/login');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-green-100">
      <div className="w-full max-w-sm bg-white p-6 rounded shadow space-y-4">
        <h1 className="text-2xl font-bold text-center">회원가입</h1>

        <form onSubmit={handleSignup} className="space-y-3">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          />

          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          />

          <input
            type="password"
            placeholder="비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          />

          <input
            type="text"
            placeholder="가게 번호"
            value={storeNumber}
            onChange={(e) => setStoreNumber(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          />

          <input
            type="text"
            placeholder="가게 이름"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          />

          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
          >
            회원가입
          </button>
        </form>
      </div>
    </div>
  );
}
