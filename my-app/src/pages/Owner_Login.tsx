import { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api from "../API/TokenConfig";
import GlobalModal from "../pages/Modal";

interface StoreLoginResponse {
  storeId: number;
  error?: string;
  errorCode?: string;
  message?: string;
}

export default function CustomerLogin() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showEmailVerificationAlert, setShowEmailVerificationAlert] =
    useState<boolean>(false);
  const [verificationEmail, setVerificationEmail] = useState<string>("");
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [onConfirm, setOnConfirm] = useState<(() => void) | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/auth/store")
      .then((res) => {
        if (res.data?.data?.storeId) {
          navigate(`/owner/dashboard/${res.data.data.storeId}`);
        }
      })
      .catch((err) => {
        console.log("자동 로그인 체크 실패:", err);
      });
  }, [navigate]);

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const response = await api.post("/api/stores/login", {
        ownerEmail: email,
        password: password,
      });

      const data: StoreLoginResponse = response.data;

      if (response.status !== 200) {
        setAlertMessage(`로그인 실패: ${data.error || "알 수 없는 오류"}`);
        return;
      }

      setAlertMessage("로그인 성공!");
      setOnConfirm(() => () => {
        setTimeout(() => {
          navigate(`/owner/dashboard/${data.storeId}`);
        }, 200); // 200ms 딜레이 후 페이지 이동
      });
    } catch (err: any) {
      const errorData = err.response?.data;
      const errorCode = errorData?.errorCode;
      const message =
        errorData?.message || err.message || "로그인 중 오류 발생";

      if (errorCode === "AUTH001") {
        setVerificationEmail(email);
        setShowEmailVerificationAlert(true);
      } else {
        setAlertMessage(message);
      }
    }
  };

  const handleResendVerification = async () => {
    try {
      const response = await api.post("/api/stores/resend-verification", {
        email: verificationEmail,
      });

      if (response.status === 200) {
        setAlertMessage("인증 메일을 재발송했습니다. 메일함을 확인해주세요.");
        setShowEmailVerificationAlert(false);
      }
    } catch (err: any) {
      const errorData = err.response?.data;
      setAlertMessage(
        errorData?.message || "인증 메일 재발송 중 오류가 발생했습니다."
      );
    }
  };

  const handleGoToResendPage = () => {
    navigate("/email-resend");
  };

  const handleCloseAlert = () => {
    setShowEmailVerificationAlert(false);
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">로그인</h1>
          <p className="text-gray-500 text-sm">
            계정에 로그인하여 서비스를 이용하세요
          </p>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-5 mb-6">
          <input
            type="email"
            placeholder="이메일 주소"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500"
            required
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500"
            required
            autoComplete="current-password"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700"
          >
            로그인
          </button>
        </form>

        <div className="space-y-4">
          <div className="flex justify-between text-sm px-4">
            <button onClick={handleSignUp} className="text-blue-600">
              회원가입
            </button>
            <button
              onClick={() => navigate("/forgot-password")}
              className="text-gray-600"
            >
              비밀번호 찾기
            </button>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-gray-400">또는</span>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleGoToResendPage}
              className="text-sm text-gray-500 underline"
            >
              이메일 재인증이 필요하신가요?
            </button>
          </div>
        </div>

        {showEmailVerificationAlert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="text-center">
                <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    ></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  이메일 인증 필요
                </h3>
                <p className="text-gray-600 mb-4">
                  로그인하려면 이메일 인증을 완료해주세요.
                  <br />
                  <span className="text-sm text-gray-500">
                    ({verificationEmail})
                  </span>
                </p>
                <div className="space-y-3">
                  <button
                    onClick={handleResendVerification}
                    className="w-full bg-blue-500 text-white py-2 rounded"
                  >
                    인증 메일 재발송
                  </button>
                  <button
                    onClick={handleGoToResendPage}
                    className="w-full bg-gray-500 text-white py-2 rounded"
                  >
                    인증 페이지로 이동
                  </button>
                  <button
                    onClick={handleCloseAlert}
                    className="w-full border py-2 rounded text-gray-700"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {alertMessage && (
          <GlobalModal
            message={alertMessage}
            onClose={() => {
              setAlertMessage(null);
              setOnConfirm(null);
            }}
            onConfirm={onConfirm ?? undefined}
            confirmText="확인"
          />
        )}
      </div>
    </div>
  );
}
