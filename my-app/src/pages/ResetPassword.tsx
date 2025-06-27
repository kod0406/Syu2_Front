import { useState, useEffect, FormEvent } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../API/TokenConfig';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [token, setToken] = useState<string>('');
  const [isTokenValid, setIsTokenValid] = useState<boolean>(true);
  const [isPasswordReset, setIsPasswordReset] = useState<boolean>(false);

  useEffect(() => {
    const resetToken = searchParams.get('token');
    if (!resetToken) {
      setIsTokenValid(false);
      setMessage('유효하지 않은 재설정 링크입니다.');
      setMessageType('error');
    } else {
      setToken(resetToken);
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setMessageType('error');
      setMessage('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessageType('error');
      setMessage('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await api.post('/api/stores/reset-password', {
        token: token,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });

      if (response.status === 200) {
        setMessageType('success');
        setMessage('비밀번호가 성공적으로 재설정되었습니다!');
        setIsPasswordReset(true);
      }
    } catch (err: any) {
      setMessageType('error');
      const errorData = err.response?.data;

      if (err.response?.status === 400) {
        setMessage(errorData?.message || '재설정 링크가 유효하지 않거나 만료되었습니다.');
      } else if (err.response?.status === 410) {
        setMessage('재설정 링크가 만료되었습니다. 새로운 재설정 링크를 요청해주세요.');
      } else {
        setMessage(errorData?.message || '비밀번호 재설정 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigate('/owner/login');
  };

  const handleGoToForgotPassword = () => {
    navigate('/forgot-password');
  };

  if (!isTokenValid) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl">
          <div className="text-center">
            <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-3">유효하지 않은 링크</h1>
            <p className="text-gray-700 mb-6">{message}</p>

            <div className="space-y-3">
              <button
                onClick={handleGoToForgotPassword}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition duration-200 font-medium"
              >
                🔑 새로운 재설정 링크 요청
              </button>
              <button
                onClick={handleGoToLogin}
                className="w-full text-gray-600 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200 font-medium"
              >
                🏠 로그인 페이지로 이동
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isPasswordReset) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl">
          <div className="text-center">
            <div className="relative mb-6">
              <div className="bg-gradient-to-r from-green-100 to-green-200 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <div className="absolute inset-0 rounded-full bg-green-200 animate-ping opacity-30"></div>
            </div>

            <h1 className="text-3xl font-bold text-green-600 mb-3">🎉 비밀번호 재설정 완료!</h1>
            <p className="text-lg text-gray-700 mb-2 font-medium">새로운 비밀번호로 설정되었습니다!</p>
            <p className="text-gray-600 mb-8">이제 새로운 비밀번호로 로그인하실 수 있습니다.</p>

            <div className="bg-blue-50 p-6 rounded-xl mb-8">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">🔐 보안 권장사항</h3>
              <div className="text-sm text-blue-700 text-left space-y-2">
                <div className="flex items-start">
                  <span className="text-blue-500 mr-2 mt-0.5">✓</span>
                  <span>정기적으로 비밀번호를 변경하세요</span>
                </div>
                <div className="flex items-start">
                  <span className="text-blue-500 mr-2 mt-0.5">✓</span>
                  <span>다른 사이트와 다른 비밀번호를 사용하세요</span>
                </div>
                <div className="flex items-start">
                  <span className="text-blue-500 mr-2 mt-0.5">✓</span>
                  <span>비밀번호를 안전한 곳에 보관하세요</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleGoToLogin}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transition duration-300 font-semibold text-lg shadow-lg transform hover:scale-105"
            >
              🔐 새 비밀번호로 로그인하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">새 비밀번호 설정</h1>
          <p className="text-gray-600">
            계정 보안을 위해 강력한 비밀번호를 설정해주세요.
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-6">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
              새 비밀번호
            </label>
            <div className="relative">
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleInputChange}
                className="w-full p-4 pl-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                placeholder="새 비밀번호를 입력하세요 (최소 6자)"
                required
                disabled={isLoading}
                minLength={6}
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              새 비밀번호 확인
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full p-4 pl-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                placeholder="새 비밀번호를 다시 입력하세요"
                required
                disabled={isLoading}
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div className="text-sm text-yellow-700">
                <p className="font-medium mb-1">비밀번호 요구사항</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>최소 6자 이상</li>
                  <li>영문, 숫자, 특수문자 조합 권장</li>
                  <li>다른 사이트와 다른 비밀번호 사용</li>
                </ul>
              </div>
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-lg ${
              messageType === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              <div className="flex items-center">
                {messageType === 'success' ? (
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                )}
                <span className="text-sm font-medium">{message}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:from-blue-300 disabled:to-blue-400 disabled:cursor-not-allowed transition duration-300 font-semibold text-lg shadow-lg transform hover:scale-105"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                재설정 중...
              </>
            ) : (
              '🔐 비밀번호 재설정 완료'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={handleGoToLogin}
            className="text-gray-600 hover:text-gray-800 text-sm underline transition duration-200"
          >
            로그인 페이지로 돌아가기
          </button>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-gray-500 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <div className="text-xs text-gray-600">
              <p className="font-medium mb-1">보안 안내</p>
              <p>재설정 링크는 10분 후 자동으로 만료됩니다. 새 비밀번호는 즉시 적용되며, 다른 기기에서 로그인된 세션은 자동으로 로그아웃됩니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
