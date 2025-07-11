import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api from "../API/TokenConfig"; // api 인스턴스 임포트
import Modal from "../pages/Modal";
import KakaoMapScript from "../components/KakaoMapScript";
import AddressSearch from "../components/AddressSearch";
import React from "react";
import { Helmet } from "react-helmet";

interface SignupResponse {
  error?: string;
  message?: string;
  storeId?: number;
  email?: string;
}

export default function Signup() {
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [storeName, setStoreName] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [addressX, setAddressX] = useState<number | null>(null);
  const [addressY, setAddressY] = useState<number | null>(null);
  const [addressPlaceName, setAddressPlaceName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [registeredEmail, setRegisteredEmail] = useState<string>("");
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [onConfirm, setOnConfirm] = useState<(() => void) | null>(null);
  const [addressChecked, setAddressChecked] = useState(false);

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setAlertMessage("❌ 비밀번호가 일치하지 않습니다.");
      setOnConfirm(null); // 빈 함수 대신 null로 변경
      return;
    }
    if (!addressChecked) {
      setAlertMessage("❌ 주소를 정확히 선택(체크)해 주세요.");
      setOnConfirm(null); // 빈 함수 대신 null로 변경
      return;
    }

    setIsLoading(true);

    try {
      // 1. 회원가입 요청 (주소 정보 제외)
      const response = await api.post("/api/stores/register", {
        ownerEmail: email,
        password,
        storeName,
      });

      const data: SignupResponse = response.data;

      if (response.status === 200) {
        // 2. 주소 정보 별도 전송
        try {
          // address에서 city, district 파싱 (예: '서울특별시 강남구 ...')
          let city = "";
          let district = "";
          if (address) {
            const parts = address.split(" ");
            if (parts.length >= 2) {
              city = parts[0];
              district = parts[1];
            }
          }
          await api.post("/api/stores/address", null, {
            params: {
              storeId: data.storeId, // 회원가입 응답에서 받은 storeId
              fullAddress: address,
              city,
              district,
              latitude: addressY,
              longitude: addressX,
            },
          });
        } catch (addressError: any) {
          setAlertMessage(
            "⚠️ 회원가입은 완료되었으나, 주소 저장에 실패했습니다.\n관리자에게 문의해주세요."
          );
          setOnConfirm(() => handleGoToLogin);
        }
        setRegisteredEmail(data.email || email);
        setShowSuccessModal(true);
      } else {
        setAlertMessage(`❌ 회원가입 실패: ${data.error || "알 수 없는 오류"}`);
        setOnConfirm(null); // 빈 함수 대신 null로 변경
      }
    } catch (err: any) {
      const errorData = err.response?.data;
      setAlertMessage(
        "❌ 회원가입 중 오류 발생: " + (errorData?.message || err.message)
      );
      setOnConfirm(null); // 빈 함수 대신 null로 변경
    } finally {
      setIsLoading(false);
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
        <title>와따잇과 함께 시작해요! 회원가입 - WTE</title>
      </Helmet>
      <div className="flex items-center justify-center min-h-screen bg-green-100">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          {/* 헤더 영역 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">회원가입</h1>
            <p className="text-gray-500 text-sm">
              새로운 계정을 만들어 와따잇! 의 맛있는 여정을 함께해요!
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            {/* 이메일 입력 */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 block">
                이메일 주소
              </label>
              <input
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-500"
                required
                disabled={isLoading}
              />
            </div>

            {/* 비밀번호 입력 */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 block">
                비밀번호
              </label>
              <input
                type="password"
                placeholder="비밀번호를 입력해주세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-500"
                required
                disabled={isLoading}
                minLength={8}
              />
            </div>

            {/* 비밀번호 확인 */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 block">
                비밀번호 확인
              </label>
              <input
                type="password"
                placeholder="비밀번호를 다시 입력해주세요"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-500"
                required
                disabled={isLoading}
              />
            </div>

            {/* 가게 이름 입력 */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 block">
                가게 이름
              </label>
              <input
                type="text"
                placeholder="가게 이름을 입력해주세요"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-500"
                required
                disabled={isLoading}
              />
            </div>

            {/* 주소 입력 */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 block">
                가게 주소
              </label>
              <KakaoMapScript />
              <AddressSearch
                onAddressSelect={(addr, x, y, placeName) => {
                  setAddress(addr);
                  setAddressX(x);
                  setAddressY(y);
                  setAddressChecked(!!addr);
                  setAddressPlaceName(placeName || "");
                }}
                placeholder="도로명, 지번, 건물명 등으로 검색"
                defaultValue={address}
                className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-500"
                name="storeAddress"
                disabled={isLoading}
              />
            </div>

            {/* 회원가입 버튼 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 text-white font-semibold py-4 rounded-xl hover:bg-green-700 active:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center mt-8"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                  계정 생성 중...
                </>
              ) : (
                "계정 만들기"
              )}
            </button>
          </form>

          {/* 로그인 링크 */}
          <div className="text-center mt-6 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{" "}
              <button
                onClick={() => navigate("/owner/login")}
                className="text-green-600 hover:text-green-700 font-medium transition-colors duration-200"
                type="button"
              >
                로그인하기
              </button>
            </p>
          </div>
        </div>

        {/* 회원가입 성공 모달 */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-500"
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
                <h3 className="text-xl font-bold text-green-600 mb-2">
                  회원가입 완료!
                </h3>
                <p className="text-gray-700 mb-4">
                  가입이 완료되었습니다.
                  <br />
                  <span className="font-medium">{registeredEmail}</span>로<br />
                  인증 메일을 발송했습니다.
                </p>

                <div className="bg-blue-50 p-4 rounded-lg mb-6">
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
                        <li>이메일함에서 인증 메일을 확인하세요</li>
                        <li>인증 링크를 클릭하여 계정을 활성화하세요</li>
                        <li>인증 완료 후 로그인하세요</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleGoToLogin}
                    className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition duration-200"
                  >
                    로그인 페이지로 이동
                  </button>
                  <button
                    onClick={handleResendEmail}
                    className="w-full text-gray-600 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200"
                  >
                    인증 메일을 받지 못했나요?
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {alertMessage && (
        <Modal
          message={alertMessage}
          onClose={() => {
            setAlertMessage(null);
            setOnConfirm(null);
          }}
          onConfirm={onConfirm ?? undefined}
          confirmText="확인"
        />
      )}
    </>
  );
}
