import { useState, FormEvent, useEffect } from "react";
import api from "../API/TokenConfig";

interface StoreProfileModalProps {
  onClose: () => void;
}

interface StoreProfile {
  storeId: number;
  storeName: string;
  ownerEmail: string;
  emailVerified: boolean;
}

export default function StoreProfileModal({ onClose }: StoreProfileModalProps) {
  const [profile, setProfile] = useState<StoreProfile | null>(null);
  const [formData, setFormData] = useState({
    storeName: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // 회원탈퇴 관련 상태 추가
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawStep, setWithdrawStep] = useState<"confirm" | "input">(
    "confirm"
  );
  const [withdrawInput, setWithdrawInput] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // 회원탈퇴 관련 함수들
  const handleWithdrawClick = () => {
    setShowWithdrawModal(true);
    setWithdrawStep("confirm");
    setWithdrawInput("");
  };

  const handleWithdrawConfirm = () => {
    setWithdrawStep("input");
  };

  const handleWithdrawCancel = () => {
    setShowWithdrawModal(false);
    setWithdrawStep("confirm");
    setWithdrawInput("");
  };

  const handleWithdrawSubmit = async () => {
    if (!profile) return;

    if (withdrawInput !== profile.storeName) {
      setMessage("매장명이 일치하지 않습니다.");
      setMessageType("error");
      return;
    }

    setIsWithdrawing(true);
    try {
      const response = await api.delete("/api/stores/withdraw");
      if (response.status === 200) {
        setMessage(
          "회원탈퇴가 완료되었습니다. 잠시 후 메인 페이지로 이동합니다."
        );
        setMessageType("success");
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      }
    } catch (err: any) {
      setMessage(
        err.response?.data?.message || "회원탈퇴 중 오류가 발생했습니다."
      );
      setMessageType("error");
    } finally {
      setIsWithdrawing(false);
      setShowWithdrawModal(false);
    }
  };

  // 현재 로그인된 매장 프로필 정보 가져오기
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const response = await api.get("/api/stores/profile");
        const profileData = response.data;
        setProfile(profileData);
        setFormData((prev) => ({
          ...prev,
          storeName: profileData.storeName,
        }));
      } catch (error: any) {
        console.error("프로필 조회 실패:", error);
        setMessageType("error");
        setMessage("프로필 정보를 불러오는데 실패했습니다.");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePassword = (field: "current" | "new" | "confirm") => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setMessageType("");

    // 매장명만 변경하는 경우
    if (
      formData.currentPassword === "" &&
      formData.newPassword === "" &&
      formData.confirmPassword === ""
    ) {
      try {
        const response = await api.put("/api/stores/profile", {
          storeName: formData.storeName,
        });
        if (response.status === 200) {
          setMessageType("success");
          setMessage("매장 정보가 저장되었습니다.");
          setTimeout(() => {
            onClose();
            window.location.reload();
          }, 1000);
        }
      } catch (err: any) {
        setMessageType("error");
        setMessage(
          err.response?.data?.message || "저장 중 오류가 발생했습니다."
        );
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // 비밀번호 변경 유효성 검사
    if (formData.newPassword !== formData.confirmPassword) {
      setMessageType("error");
      setMessage("새 비밀번호와 확인이 일치하지 않습니다.");
      setIsLoading(false);
      return;
    }

    // 매장명+비��번호 동시 변경 or 비밀번호만 변경
    try {
      const response = await api.put("/api/stores/profile", {
        storeName: formData.storeName,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });
      if (response.status === 200) {
        setMessageType("success");
        setMessage("저장되었습니다. 보안을 위해 재로그인 과정을 진행합니다.");
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1200);
      }
    } catch (err: any) {
      setMessageType("error");
      setMessage(err.response?.data?.message || "저장 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 프로필 로딩 중일 때
  if (isLoadingProfile) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-2 p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2">프로필 정보를 불러오는 중...</span>
          </div>
        </div>
      </div>
    );
  }

  // 프로필 정보가 없을 때
  if (!profile) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-2 p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="font-bold text-lg">매장 설정</div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="text-center py-4">
            <p className="text-red-500">프로필 정보를 불러올 수 없습니다.</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-2 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="font-bold text-lg">매장 설정</div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {message && (
          <div
            className={`mb-4 p-3 rounded-md text-sm ${
              messageType === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              매장명
            </label>
            <input
              name="storeName"
              type="text"
              value={formData.storeName}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={isLoading}
              placeholder="매장명을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <input
              type="email"
              value={profile.ownerEmail}
              disabled
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
              placeholder="이메일은 변경할 수 없습니다"
            />
            <p className="text-xs text-gray-500 mt-1">
              이메일은 보안상 변경할 수 없습니다.
            </p>
          </div>

          <div className="border-t pt-4 mt-4">
            <p className="text-sm text-gray-600 mb-3">
              비밀번호 변경 (선택사항)
            </p>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                현재 비밀번호
              </label>
              <div className="relative">
                <input
                  name="currentPassword"
                  type={showPassword.current ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                  placeholder="비밀번호 변경 시에만 입력"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  onClick={() => togglePassword("current")}
                >
                  {showPassword.current ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95m3.36-2.676A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.956 9.956 0 01-4.043 5.306M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 3l18 18"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                새 비밀번호
              </label>
              <div className="relative">
                <input
                  name="newPassword"
                  type={showPassword.new ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                  placeholder="새로운 비밀번호"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  onClick={() => togglePassword("new")}
                >
                  {showPassword.new ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95m3.36-2.676A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.956 9.956 0 01-4.043 5.306M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 3l18 18"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                새 비밀번호 확인
              </label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showPassword.confirm ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                  placeholder="새 비밀번호 확인"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  onClick={() => togglePassword("confirm")}
                >
                  {showPassword.confirm ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95m3.36-2.676A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.956 9.956 0 01-4.043 5.306M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 3l18 18"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "저장 중..." : "저장"}
            </button>
          </div>
        </form>

        {/* 회원탈퇴 버튼 - 스크롤 하단에 노출 */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center mb-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              위험 구역
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              회원탈퇴 시 모든 데이터가 영구적으로 삭제되며, 이 작업은 되돌릴 수
              없습니다.
            </p>
          </div>
          <button
            type="button"
            className="w-full text-red-600 border border-red-300 bg-white hover:bg-red-50 px-4 py-2 rounded-md text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
            onClick={handleWithdrawClick}
          >
            회원탈퇴
          </button>
        </div>
      </div>

      {/* 회원탈퇴 확인 모달 */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
            {withdrawStep === "confirm" ? (
              <>
                <div className="text-center mb-6">
                  <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    회원탈퇴 확인
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    회원탈퇴 시 다음 데이터가{" "}
                    <span className="font-semibold text-red-600">
                      영구적으로 삭제
                    </span>
                    됩니다:
                  </p>
                </div>

                <div className="bg-red-50 rounded-lg p-4 mb-6">
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-center">
                      <svg
                        className="w-4 h-4 text-red-500 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      매장 정보 및 설정
                    </li>
                    <li className="flex items-center">
                      <svg
                        className="w-4 h-4 text-red-500 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      등록된 모든 메뉴
                    </li>
                    <li className="flex items-center">
                      <svg
                        className="w-4 h-4 text-red-500 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      주문 내역 및 매출 데이터
                    </li>
                    <li className="flex items-center">
                      <svg
                        className="w-4 h-4 text-red-500 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      발행된 쿠폰 및 QR코드
                    </li>
                  </ul>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    <div className="text-sm text-amber-800">
                      <p className="font-medium mb-1">
                        이 작업은 되돌릴 수 없습니다
                      </p>
                      <p>
                        탈퇴 후 동일한 이메일로 재가입하더라도 기존 데이터는
                        복구되지 않습니다.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleWithdrawConfirm}
                    className="w-full bg-red-600 text-white font-medium py-3 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    이해했습니다. 계속 진행
                  </button>
                  <button
                    onClick={handleWithdrawCancel}
                    className="w-full bg-gray-100 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    취소
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    최종 확인
                  </h3>
                  <p className="text-gray-600 text-sm">
                    회원탈퇴를 완료하려면 매장명을 정확히 입력해주세요.
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    매장명:{" "}
                    <span className="font-bold text-gray-900">
                      {profile?.storeName}
                    </span>
                  </label>
                  <input
                    type="text"
                    value={withdrawInput}
                    onChange={(e) => setWithdrawInput(e.target.value)}
                    placeholder="매장명을 입력하세요"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    disabled={isWithdrawing}
                  />
                  {withdrawInput && withdrawInput !== profile?.storeName && (
                    <p className="text-sm text-red-600 mt-2">
                      매장명이 일치하지 않습니다.
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleWithdrawSubmit}
                    disabled={
                      withdrawInput !== profile?.storeName || isWithdrawing
                    }
                    className="w-full bg-red-600 text-white font-medium py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isWithdrawing ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        처리 중...
                      </div>
                    ) : (
                      "회원탈퇴 완료"
                    )}
                  </button>
                  <button
                    onClick={handleWithdrawCancel}
                    disabled={isWithdrawing}
                    className="w-full bg-gray-100 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    취소
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
