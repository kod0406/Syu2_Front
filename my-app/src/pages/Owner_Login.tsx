import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../API/TokenConfig';

interface StoreLoginResponse {
  storeId: number;
  error?: string;
}

export default function CustomerLogin() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  useEffect(() => {
    api
      .get('/auth/store')
      .then(res => {
        if (res.data?.data?.storeId) {
          navigate(`/owner/dashboard/${res.data.data.storeId}`);
        }
      })
      .catch(err => {
        console.log('자동 로그인 체크 실패:', err);
      });
  }, [navigate]);

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const response = await api.post('/api/stores/login', {
        ownerEmail: email,
        password: password,
      });

      const data: StoreLoginResponse = response.data;

      if (response.status !== 200) {
        alert(`로그인 실패: ${data.error || '알 수 없는 오류'}`);
        return;
      }

      alert('로그인 성공!');
      navigate(`/owner/dashboard/${data.storeId}`);
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || '로그인 중 오류 발생';
      alert(message);
    }
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-100">
      <div className="w-full max-w-sm space-y-6 bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold text-center">로그인</h1>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
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

        </div>
      </div>
  );
}
