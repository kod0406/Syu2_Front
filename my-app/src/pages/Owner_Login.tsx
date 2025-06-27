import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../API/TokenConfig';

interface StoreLoginResponse {
  storeId: number;
  error?: string;
  errorCode?: string;
  message?: string;
}

export default function CustomerLogin() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showEmailVerificationAlert, setShowEmailVerificationAlert] = useState<boolean>(false);
  const [verificationEmail, setVerificationEmail] = useState<string>('');
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

  const handleSocialLogin = (provider: 'kakao' | 'naver') => {
    let redirectUrl = '';
    switch (provider) {
      case 'kakao':
        redirectUrl = `${API_BASE_URL}/api/oauth2/kakao/login`;
        break;
      case 'naver':
        redirectUrl = `${API_BASE_URL}/api/oauth2/naver/login`;
        break;
    }
    window.location.href = redirectUrl;
  };

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
      const errorData = err.response?.data;
      const errorCode = errorData?.errorCode;
      const message = errorData?.message || err.message || '로그인 중 오류 발생';

      // 이메일 인증 미완료 오류 처리
      if (errorCode === 'AUTH001') {
        setVerificationEmail(email);
        setShowEmailVerificationAlert(true);
      } else {
        alert(message);
      }
    }
  };

  const handleResendVerification = async () => {
    try {
      const response = await api.post('/api/stores/resend-verification', {
        email: verificationEmail
      });

      if (response.status === 200) {
        alert('인증 메일을 재발송했습니다. 메일함을 확인해주세요.');
        setShowEmailVerificationAlert(false);
      }
    } catch (err: any) {
      const errorData = err.response?.data;
      alert(errorData?.message || '인증 메일 재발송 중 오류가 발생했습니다.');
    }
  };

  const handleGoToResendPage = () => {
    navigate('/email-resend');
  };

  const handleCloseAlert = () => {
    setShowEmailVerificationAlert(false);
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          {/* 헤더 영역 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">로그인</h1>
            <p className="text-gray-500 text-sm">계정에 로그인하여 서비스를 이용하세요</p>
          </div>

          {/* 로그인 폼 */}
          <form onSubmit={handleEmailLogin} className="space-y-5 mb-6">
            <div>
              <input
                  type="email"
                  placeholder="이메일 주소"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400"
                  required
                  autoComplete="username"
              />
            </div>

            <div>
              <input
                  type="password"
                  placeholder="비밀번호"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400"
                  required
                  autoComplete="current-password"
              />
            </div>

            <button
                type="submit"
                className="w-full bg-blue-600 text-white font-semibold py-4 rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              로그인
            </button>
          </form>

          {/* 보조 액션 영역 */}
          <div className="space-y-4">
            {/* 주요 보조 액션 */}
            <div className="flex items-center justify-between text-sm px-4">
              <button
                  onClick={handleSignUp}
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                  type="button"
              >
                회원가입
              </button>

              <button
                  onClick={() => navigate('/forgot-password')}
                  className="text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
                  type="button"
              >
                비밀번호 찾기
              </button>
            </div>

            {/* 구분선 */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-gray-400">또는</span>
              </div>
            </div>

            {/* 부차적 액션 */}
            <div className="text-center">
              <button
                  onClick={handleGoToResendPage}
                  className="text-sm text-gray-500 hover:text-blue-600 underline underline-offset-2 transition-colors duration-200"
                  type="button"
              >
                이메일 재인증이 필요하신가요?
              </button>
            </div>
          </div>

          {/* 이메일 인증 미완료 알림 모달 */}
          {showEmailVerificationAlert && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                  <div className="text-center">
                    <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">이메일 인증 필요</h3>
                    <p className="text-gray-600 mb-4">
                      로그인하려면 이메일 인증을 완료해주세요.<br />
                      <span className="text-sm text-gray-500">({verificationEmail})</span>
                    </p>
                    <div className="space-y-3">
                      <button
                          onClick={handleResendVerification}
                          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
                      >
                        인증 메일 재발송
                      </button>
                      <button
                          onClick={handleGoToResendPage}
                          className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition duration-200"
                      >
                        인증 페이지로 이동
                      </button>
                      <button
                          onClick={handleCloseAlert}
                          className="w-full text-gray-600 py-2 px-4 border border-gray-300 rounded hover:bg-gray-50 transition duration-200"
                      >
                        닫기
                      </button>
                    </div>
                  </div>
                </div>
              </div>
          )}
        </div>
      </div>
  );
}