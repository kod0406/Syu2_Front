import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import api from "../API/TokenConfig";

export default function ForgotPassword() {
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [isEmailSent, setIsEmailSent] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await api.post("/api/stores/forgot-password", {
        email: email,
      });

      if (response.status === 200) {
        setMessageType("success");
        setMessage("비밀번호 재설정 링크를 이메일로 발송했습니다.");
        setIsEmailSent(true);
      }
    } catch (err: any) {
      setMessageType("error");
      const errorData = err.response?.data;
      setMessage(
        errorData?.message || "비밀번호 재설정 요청 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigate("/owner/login");
  };

  const handleResendEmail = () => {
    setIsEmailSent(false);
    setMessage("");
    setMessageType("");
  };

  return (
    <>
      <Helmet>
        <title>비밀번호 찾기 - Syu2</title>
      </Helmet>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl">
          <div className="text-center mb-8">
            <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                ></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-3">
              비밀번호 재설정
            </h1>
            <p className="text-gray-600">
              {!isEmailSent
                ? "가입 시 사용한 이메일 주소를 입력하시면\n비밀번호 재설정 링크를 보내드립니다."
                : "이메일을 확인하여 비밀번호를 재설정해주세요."}
            </p>
          </div>

          {!isEmailSent ? (
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  이메일 주소
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    placeholder="가입 시 사용한 이메일을 입력하세요"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-4 pl-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                    required
                    disabled={isLoading}
                  />
                  <svg
                    className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    ></path>
                  </svg>
                </div>
              </div>

              {message && (
                <div
                  className={`p-4 rounded-lg ${
                    messageType === "success"
                      ? "bg-green-50 border border-green-200 text-green-700"
                      : "bg-red-50 border border-red-200 text-red-700"
                  }`}
                >
                  <div className="flex items-center">
                    {messageType === "success" ? (
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5 mr-2"
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
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    발송 중...
                  </>
                ) : (
                  "🔑 비밀번호 재설정 링크 발송"
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  이메일 발송 완료!
                </h3>
                <p className="text-green-700 mb-2">
                  <span className="font-medium">{email}</span>로
                  <br />
                  비밀번호 재설정 링크를 발송했습니다.
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 text-blue-600 mt-0.5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">다음 단계</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>이메일함에서 재설정 링크를 확인하세요</li>
                      <li>스팸 메일함도 확인해보세요</li>
                      <li>
                        <strong>1시간</strong>안에 설정을 완료해 주세요.
                      </li>
                      <li>링크를 클릭하여 새 비밀번호를 설정하세요</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleResendEmail}
                  className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition duration-200 font-medium"
                >
                  📧 다른 이메일로 다시 발송
                </button>
                <button
                  onClick={handleGoToLogin}
                  className="w-full text-blue-600 py-3 px-4 border border-blue-300 rounded-lg hover:bg-blue-50 transition duration-200 font-medium"
                >
                  🏠 로그인 페이지로 돌아가기
                </button>
              </div>
            </div>
          )}

          {!isEmailSent && (
            <div className="mt-8 text-center">
              <button
                onClick={handleGoToLogin}
                className="text-gray-600 hover:text-gray-800 text-sm underline transition duration-200"
              >
                로그인 페이지로 돌아가기
              </button>
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">💡 도움말</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>
                • 등록된 이메일 주소가 기억나지 않는 경우 고객센터에 문의하세요
              </li>
              <li>• 이메일이 오지 않으면 잠시 후 다시 시도해주세요</li>
              <li>• 계정 보안을 위해 주기적으로 비밀번호를 변경하세요</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
