import { useState, FormEvent, useEffect } from "react";
import api from "../API/TokenConfig";
import AddressSearch from "../components/AddressSearch";
import KakaoMapScript from "../components/KakaoMapScript";

interface StoreProfileModalProps {
  onClose: () => void;
}

interface StoreProfile {
  storeId: number;
  storeName: string;
  ownerEmail: string;
  emailVerified: boolean;
  address?: string;
  addressX?: number | null;
  addressY?: number | null;
  addressPlaceName?: string;
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

  // 회원탈퇴 관련 상태
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawStep, setWithdrawStep] = useState<"confirm" | "input">(
    "confirm"
  );
  const [withdrawInput, setWithdrawInput] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // 주소 수정 관련 상태
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [address, setAddress] = useState("");
  const [addressX, setAddressX] = useState<number | null>(null);
  const [addressY, setAddressY] = useState<number | null>(null);
  const [addressPlaceName, setAddressPlaceName] = useState("");
  const [addressChecked, setAddressChecked] = useState(false);

  // 탭 상태 추가
  const [activeTab, setActiveTab] = useState<"basic" | "password" | "address">(
    "basic"
  );

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

  // 모달이 열릴 때 body 스크롤 방지
  useEffect(() => {
    // 컴포넌트 마운트 시 스크롤 막기
    document.body.style.overflow = 'hidden';

    // 컴포넌트 언마운트 시 스크롤 복구
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // 프로필 가져오기
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const profileRes = await api.get("/api/stores/profile");
        const profileData = profileRes.data;
        setProfile(profileData);
        setFormData((prev) => ({
          ...prev,
          storeName: profileData.storeName,
        }));

        if (profileData.storeId) {
          const addressRes = await api.get(
            `/api/stores/address/${profileData.storeId}`
          );
          const addressData = addressRes.data;
          setAddress(addressData.fullAddress || "");
          setAddressX(addressData.longitude || null);
          setAddressY(addressData.latitude || null);
          setAddressPlaceName(addressData.placeName || "");
        } else {
          setAddress("");
          setAddressX(null);
          setAddressY(null);
          setAddressPlaceName("");
        }
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

  // 주소 저장 함수
  const handleSaveAddress = async () => {
    if (!addressChecked || !address) {
      setMessageType("error");
      setMessage("주소를 정확히 선택(체크)해 주세요.");
      return;
    }
    setIsLoading(true);
    try {
      let city = "";
      let district = "";
      if (address) {
        const parts = address.split(" ");
        if (parts.length >= 2) {
          city = parts[0];
          district = parts[1];
        }
      }
      const res = await api.post("/api/stores/address", null, {
        params: {
          storeId: profile?.storeId,
          fullAddress: address,
          city,
          district,
          latitude: addressY,
          longitude: addressX,
        },
      });
      if (res.status === 200) {
        setMessageType("success");
        setMessage("주소가 저장되었습니다.");
        setIsEditingAddress(false);
        setProfile((prev) =>
          prev
            ? { ...prev, address, addressX, addressY, addressPlaceName }
            : prev
        );
      }
    } catch (err: any) {
      setMessageType("error");
      setMessage(
        err.response?.data?.message || "주소 저장 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 로딩 상태
  if (isLoadingProfile) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 animate-slideUp">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin"></div>
              <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
            </div>
            <span className="mt-4 text-gray-700 font-medium">
              프로필 정보를 불러오는 중...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 프로필 정보가 없을 때
  if (!profile) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 animate-slideUp">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">매장 설정</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="닫기"
            >
              <svg
                className="w-6 h-6 text-gray-500"
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
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
            <p className="text-red-600 font-medium mb-4">
              프로필 정보를 불러올 수 없습니다.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden animate-slideUp">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
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
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">매장 설정</h2>
                <p className="text-blue-100 text-sm">{profile.storeName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label="닫기"
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
        </div>

        {/* 메시지 */}
        {message && (
          <div
            className={`mx-6 mt-6 p-4 rounded-xl border-l-4 animate-slideDown ${
              messageType === "success"
                ? "bg-green-50 border-green-400 text-green-800"
                : "bg-red-50 border-red-400 text-red-800"
            }`}
          >
            <div className="flex items-center">
              <svg
                className={`w-5 h-5 mr-2 ${
                  messageType === "success" ? "text-green-600" : "text-red-600"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {messageType === "success" ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                )}
              </svg>
              <span className="font-medium">{message}</span>
            </div>
          </div>
        )}

        {/* 탭 네비게이션 */}
        <div className="flex border-b border-gray-200 bg-gray-50 mx-6 mt-6 rounded-lg p-1">
          {[
            { key: "basic", label: "기본 정보", icon: "👤" },
            { key: "password", label: "비밀번호", icon: "🔒" },
            { key: "address", label: "주소", icon: "📍" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-3 px-4 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center space-x-2 ${
                activeTab === tab.key
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* 콘텐츠 */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 기본 정보 탭 */}
            {activeTab === "basic" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-2 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      매장명
                    </span>
                  </label>
                  <input
                    name="storeName"
                    type="text"
                    value={formData.storeName}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    required
                    disabled={isLoading}
                    placeholder="매장명을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-2 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                        />
                      </svg>
                      이메일
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={profile.ownerEmail}
                      disabled
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-500 cursor-not-allowed"
                      placeholder="이메일은 변경할 수 없습니다"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    이메일은 보안상 변경할 수 없습니다.
                  </p>
                </div>
              </div>
            )}

            {/* 비밀번호 탭 */}
            {activeTab === "password" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-blue-600 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm text-blue-800 font-medium">
                      비밀번호 변경은 선택사항입니다
                    </span>
                  </div>
                </div>

                {[
                  {
                    name: "currentPassword",
                    label: "현재 비밀번호",
                    key: "current",
                  },
                  { name: "newPassword", label: "새 비밀번호", key: "new" },
                  {
                    name: "confirmPassword",
                    label: "새 비밀번호 확인",
                    key: "confirm",
                  },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      {field.label}
                    </label>
                    <div className="relative">
                      <input
                        name={field.name}
                        type={
                          showPassword[field.key as keyof typeof showPassword]
                            ? "text"
                            : "password"
                        }
                        value={formData[field.name as keyof typeof formData]}
                        onChange={handleInputChange}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                        disabled={isLoading}
                        placeholder={
                          field.name === "currentPassword"
                            ? "비밀번호 변경 시에만 입력"
                            : `${field.label}를 입력하세요`
                        }
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => togglePassword(field.key as any)}
                      >
                        {showPassword[
                          field.key as keyof typeof showPassword
                        ] ? (
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
                ))}
              </div>
            )}

            {/* 주소 탭 */}
            {activeTab === "address" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-2 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      매장 주소
                    </span>
                  </label>
                  <KakaoMapScript />
                  {!isEditingAddress ? (
                    <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-gray-800 font-medium">
                            {address || "주소 정보 없음"}
                          </p>
                          {!address && (
                            <p className="text-sm text-gray-500 mt-1">
                              매장 주소를 등록해주세요
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          onClick={() => setIsEditingAddress(true)}
                          disabled={isLoading}
                        >
                          {address ? "수정" : "등록"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="border-2 border-blue-200 rounded-xl p-4 bg-blue-50">
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
                          className="w-full p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400 bg-white"
                          name="storeAddress"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
                          onClick={handleSaveAddress}
                          disabled={isLoading}
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          저장
                        </button>
                        <button
                          type="button"
                          className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                          onClick={() => setIsEditingAddress(false)}
                          disabled={isLoading}
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* 하단 버튼 */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-gray-600 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            disabled={isLoading}
          >
            취소
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                저장 중...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                저장
              </>
            )}
          </button>
        </div>

        {/* 회원탈퇴 섹션 */}
        <div className="px-6 py-4 bg-red-50 border-t border-red-200">
          <div className="text-center">
            <h3 className="text-sm font-semibold text-red-900 mb-2">
              ⚠️ 위험 구역
            </h3>
            <p className="text-xs text-red-700 mb-4">
              회원탈퇴 시 모든 데이터가 영구적으로 삭제되며, 이 작업은 되돌릴 수
              없습니다.
            </p>
            <button
              type="button"
              className="px-4 py-2 text-red-600 border-2 border-red-300 bg-white hover:bg-red-50 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
              onClick={handleWithdrawClick}
            >
              회원탈퇴
            </button>
          </div>
        </div>
      </div>

      {/* 회원탈퇴 확인 모달 */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 animate-slideUp">
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

                <div className="bg-red-50 rounded-xl p-4 mb-6">
                  <ul className="text-sm text-gray-700 space-y-3">
                    {[
                      "매장 정보 및 설정",
                      "등록된 모든 메뉴",
                      "주문 내역 및 매출 데이터",
                      "발행된 쿠폰 및 QR코드",
                    ].map((item, index) => (
                      <li key={index} className="flex items-center">
                        <svg
                          className="w-4 h-4 text-red-500 mr-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0"
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
                    className="w-full bg-red-600 text-white font-medium py-3 rounded-xl hover:bg-red-700 transition-colors"
                  >
                    이해했습니다. 계속 진행
                  </button>
                  <button
                    onClick={handleWithdrawCancel}
                    className="w-full bg-gray-100 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-200 transition-colors"
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
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                    className="w-full bg-red-600 text-white font-medium py-3 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="w-full bg-gray-100 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    취소
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
                .animate-slideUp { animation: slideUp 0.4s ease-out; }
                .animate-slideDown { animation: slideDown 0.3s ease-out; }
`}</style>
    </div>
  );
}
