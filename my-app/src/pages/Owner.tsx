import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardHeader from "../Owner/DashboardHeader";
import DashboardMenu from "../Owner/DashboardMenu";
import MenuList from "../Owner/MenuList";
import AddMenuModal from "../Owner/MenuAddModal";
import EditMenuModal from "../Owner/MenuEditModal";
import SalesModal from "../Owner/SalesModal";
import OrdersModal from "../Owner/OrdersModal";
import StoreProfileModal from "../Owner/StoreProfileModal";
import QRModal from "../Owner/QrModal";
import AIRecommendationSection from "../Owner/AIRecommendationSection";
import WeatherDashboard from "../Owner/WeatherDashboard";
import RecommendationHistory from "../Owner/RecommendationHistory";
import ReviewDashboard from "../Owner/ReviewDashboard";
import api from "../API/TokenConfig";
import GlobalModal from "../pages/Modal";

interface Menu {
  menuId: number;
  menuName: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  available: boolean;
}

export default function OwnerDashboard() {
  const { storeId: storeIdFromURL } = useParams();
  const [storeId, setStoreId] = useState<number | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [showStoreProfileModal, setShowStoreProfileModal] = useState(false);
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [onConfirm, setOnConfirm] = useState<(() => void) | null>(null);
  const [showWeatherDashboard, setShowWeatherDashboard] = useState(false);
  const [showRecommendationHistory, setShowRecommendationHistory] = useState(false);
  const [showReviewDashboard, setShowReviewDashboard] = useState(false);

  const navigate = useNavigate();

  const fetchMenus = useCallback(async () => {
    if (!storeId) return;
    const res = await api.get(`/api/Store/Menu?StoreNumber=${storeId}`);
    const data = res.data;
    setMenus(data);
  }, [storeId]);

  const handleQrDownload = () => {
    if (storeId) {
      const downloadUrl = `${api.defaults.baseURL}/api/stores/${storeId}/qrcode/download`;
      window.location.href = downloadUrl;
    }
  };

  const handleQrView = async () => {
    if (storeId) {
      try {
        const res = await api.get(`/api/stores/${storeId}/qrcode/json`);
        const base64 = res.data.qrCodeBase64;
        setQrCodeBase64(base64);
        setShowQRModal(true);
      } catch (err) {
        setAlertMessage("QR 코드 조회에 실패했습니다."); // ✅ alert → modal
        setOnConfirm(null);
      }
    }
  };

  const handleMenuAdded = async () => {
    await fetchMenus();
    setShowAddModal(false);
  };

  useEffect(() => {
    api
      .get("/auth/store")
      .then((res) => {
        if (!res.data.data) {
          setAlertMessage("로그인이 필요합니다."); // ✅ alert → modal
          setOnConfirm(() => () => navigate("/owner/login"));
          return;
        }
        const storeData = res.data.data;
        setStoreId(storeData.id);
      })
      .catch(() => {
        setAlertMessage("로그인이 필요합니다."); // ✅ alert → modal
        setOnConfirm(() => () => navigate("/owner/login"));
      });
  }, [storeIdFromURL, navigate]);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  const onCouponClick = () => {
    navigate(`/owner/${storeId}/coupon`);
  };

  const onStoreProfileClick = () => {
    setShowStoreProfileModal(true);
  };

  return (
    <div className="p-4">
      <DashboardHeader />
      <DashboardMenu
        onAddMenuClick={() => setShowAddModal(true)}
        onSalesClick={() => setShowSalesModal(true)}
        onOrdersClick={() => setShowOrdersModal(true)}
        onCouponClick={onCouponClick}
        onQrDownloadClick={handleQrDownload}
        onQrViewClick={handleQrView}
        onStoreProfileClick={onStoreProfileClick}
        onWeatherClick={() => setShowWeatherDashboard(true)} // ✅ 추가
        onHistoryClick={() => setShowRecommendationHistory(true)} // ✅ 추가
        onReviewClick={() => setShowReviewDashboard(true)} // 리뷰 대시보드 추가
      />

      {/* ✅ 날씨 대시보드 */}
      {showWeatherDashboard && storeId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">날씨 정보</h2>
              <button
                onClick={() => setShowWeatherDashboard(false)}
                className="text-gray-500 hover:text-gray-700"
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
                  ></path>
                </svg>
              </button>
            </div>
            <WeatherDashboard storeId={storeId} />
          </div>
        </div>
      )}

      {/* ✅ 추천 히스토리 */}
      {showRecommendationHistory && storeId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                추천 히스토리
              </h2>
              <button
                onClick={() => setShowRecommendationHistory(false)}
                className="text-gray-500 hover:text-gray-700"
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
                  ></path>
                </svg>
              </button>
            </div>
            <RecommendationHistory storeId={storeId} />
          </div>
        </div>
      )}

      {/* ✅ 리뷰 대시보드 */}
      {showReviewDashboard && storeId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">리뷰 대시보드</h2>
              <button
                onClick={() => setShowReviewDashboard(false)}
                className="text-gray-500 hover:text-gray-700"
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
                  ></path>
                </svg>
              </button>
            </div>
            <ReviewDashboard storeId={storeId} />
          </div>
        </div>
      )}

      {/* ✅ AI 추천 섹션 */}
      {storeId && <AIRecommendationSection storeId={storeId} />}

      {storeId && (
        <MenuList
          menus={menus}
          storeId={storeId}
          setMenus={setMenus}
          onEdit={setEditingMenu}
        />
      )}

      {/* ...existing modals... */}
      {showAddModal && storeId && (
        <AddMenuModal
          storeId={storeId}
          onClose={() => setShowAddModal(false)}
          onAdded={handleMenuAdded}
        />
      )}
      {editingMenu && storeId && (
        <EditMenuModal
          storeId={storeId}
          menu={editingMenu}
          onClose={() => setEditingMenu(null)}
          onUpdated={(updatedMenus) => {
            setMenus(updatedMenus);
            setEditingMenu(null);
          }}
        />
      )}
      {showSalesModal && (
        <SalesModal onClose={() => setShowSalesModal(false)} />
      )}
      {showOrdersModal && storeId && (
        <OrdersModal
          storeId={storeId}
          onClose={() => setShowOrdersModal(false)}
        />
      )}
      {showQRModal && qrCodeBase64 && (
        <QRModal base64={qrCodeBase64} onClose={() => setShowQRModal(false)} />
      )}
      {showStoreProfileModal && (
        <StoreProfileModal onClose={() => setShowStoreProfileModal(false)} />
      )}

      {/* ✅ 글로벌 모달 */}
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
  );
}
