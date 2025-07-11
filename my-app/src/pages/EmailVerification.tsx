import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../API/TokenConfig";
import React from "react";
import { Helmet } from "react-helmet";

export default function EmailVerification() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState<string>("");
  const [errorCode, setErrorCode] = useState<string>("");
  const hasVerified = useRef(false); // 중복 호출 방지를 위한 ref

  useEffect(() => {
    // 이미 인증 요청을 보냈다면 return
    if (hasVerified.current) return;

    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("유효하지 않은 인증 링크입니다.");
      return;
    }

    hasVerified.current = true; // 인증 요청 플래그 설정
    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await api.get(`/api/stores/verify-email?token=${token}`);

      // 응답 상태 코드로 성공 여부 판단
      if (response.status === 200) {
        setStatus("success");
        setMessage("이메일 인증이 성공적으로 완료되었습니다!");
      } else {
        setStatus("error");
        setMessage("인증 처리 중 오류가 발생했습니다.");
      }
    } catch (err: any) {
      setStatus("error");
      const errorData = err.response?.data;

      // 에러 상태 코드별 처리
      if (err.response?.status === 400) {
        setMessage(errorData?.message || "유효하지 않은 인증 토큰입니다.");
        setErrorCode(errorData?.errorCode || "");
      } else if (err.response?.status === 410) {
        setMessage(
          "인증 링크가 만료되었습니다. 새로운 인증 메일을 요청해주세요."
        );
        setErrorCode("AUTH003");
      } else {
        setMessage(errorData?.message || "인증 처리 중 오류가 발생했습니다.");
        setErrorCode(errorData?.errorCode || "");
      }
    }
  };

  const handleGoToLogin = () => {
    navigate("/owner/login");
  };

  const handleResendEmail = () => {
    navigate("/email-resend");
  };

  return (
    <>
      <Helmet>
        <title>이메일 인증은 와따잇(WTE)에서!</title>
      </Helmet>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-2xl">
          {status === "loading" && (
            <div className="text-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-500 mx-auto mb-6"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-500"
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
              <h1 className="text-2xl font-semibold text-gray-800 mb-3">
                이메일 인증 처리 중...
              </h1>
              <p className="text-gray-600">
                잠시만 기다려주세요. 인증을 완료하고 있습니다.
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center">
              <div className="relative mb-6">
                <div className="bg-gradient-to-r from-green-100 to-green-200 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                  <svg
                    className="w-10 h-10 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-green-600 mb-3">
                🎉 인증 완료!
              </h1>
              <p className="text-lg text-gray-700 mb-2 font-medium">
                이메일 인증이 성공적으로 완료되었습니다!
              </p>
              <p className="text-gray-600 mb-8">
                이제 IGO 매장 관리 시스템의 모든 기능을 이용하실 수 있습니다.
              </p>

              <div className="bg-blue-50 p-6 rounded-xl mb-8">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">
                  🚀 이제 다음 기능들을 사용할 수 있어요!
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm text-blue-700">
                  <div className="flex items-center">
                    <span className="text-blue-500 mr-2">✓</span>
                    매장 대시보드 접속
                  </div>
                  <div className="flex items-center">
                    <span className="text-blue-500 mr-2">✓</span>
                    메뉴 등록 및 관리
                  </div>
                  <div className="flex items-center">
                    <span className="text-blue-500 mr-2">✓</span>
                    주문 관리 시스템
                  </div>
                  <div className="flex items-center">
                    <span className="text-blue-500 mr-2">✓</span>
                    매출 통계 확인
                  </div>
                  <div className="flex items-center">
                    <span className="text-blue-500 mr-2">✓</span>
                    QR코드 생성
                  </div>
                  <div className="flex items-center">
                    <span className="text-blue-500 mr-2">✓</span>
                    쿠폰 발행 관리
                  </div>
                </div>
              </div>

              <button
                onClick={handleGoToLogin}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transition duration-300 font-semibold text-lg shadow-lg transform hover:scale-105"
              >
                🔐 지금 로그인하기
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="text-center">
              <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-red-600 mb-3">
                ❌ 인증 실패
              </h1>
              <p className="text-gray-700 mb-6">{message}</p>

              <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                <h3 className="text-yellow-800 font-medium mb-2">💡 해결 방법</h3>
                <ul className="text-sm text-yellow-700 text-left space-y-1">
                  <li>• 인증 링크가 만료되었을 수 있습니다 (24시간 유효)</li>
                  <li>• 이미 인증이 완료된 계정일 수 있습니다</li>
                  <li>• 새로운 인증 메일을 요청해보세요</li>
                </ul>
              </div>

              <div className="space-y-3">
                {(errorCode === "AUTH003" || errorCode === "AUTH002") && (
                  <button
                    onClick={handleResendEmail}
                    className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition duration-200 font-medium"
                  >
                    📧 인증 메일 재발송
                  </button>
                )}
                <button
                  onClick={handleGoToLogin}
                  className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition duration-200 font-medium"
                >
                  🏠 로그인 페이지로 이동
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
