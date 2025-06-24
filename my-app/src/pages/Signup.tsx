import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../API/TokenConfig'; // api 인스턴스 임포트

interface SignupResponse {
  error?: string;
}

export default function Signup() {
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [storeName, setStoreName] = useState<string>('');

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const response = await api.post('/api/stores/register', {
        ownerEmail: email,
        password,
        storeName,
      });

      const data: SignupResponse = response.data;

      if (response.status !== 200) {
        alert(`회원가입 실패: ${data.error || '알 수 없는 오류'}`);
        return;
      }

      alert('회원가입 성공! 로그인 페이지로 이동합니다.');
      navigate('/owner/login');
    } catch (err: any) {
      alert('회원가입 중 오류 발생: ' + err.message);
    }
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
            required
          />

          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />

          <input
            type="password"
            placeholder="비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />

          <input
            type="text"
            placeholder="가게 이름"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            required
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
