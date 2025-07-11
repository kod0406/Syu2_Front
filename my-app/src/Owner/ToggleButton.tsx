import React, { useState } from "react";
import api from "../API/TokenConfig";
import { MenuReviewsResponse } from "../types/review";
import Modal from "../pages/Modal";

interface ToggleButtonProps {
  storeId: number;
  menuId: number;
  isAvailable: boolean;
  onToggled: () => Promise<void>;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({
  storeId,
  menuId,
  isAvailable,
  onToggled,
}) => {
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [onConfirm, setOnConfirm] = useState<(() => void) | null>(null);
  const [showMenuReviews, setShowMenuReviews] = useState(false);
  const [menuReviews, setMenuReviews] = useState<MenuReviewsResponse | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      await api.patch(`/api/store/${storeId}/menus/${menuId}/availability`);
      await onToggled();
    } catch (err) {
      console.error("❌ 상태 토글 실패:", err);
      setAlertMessage("❌ 상태 변경 중 오류 발생");
      setOnConfirm(null);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReviews = async () => {
    setReviewsLoading(true);
    try {
      const response = await api.get(`/api/stores/${storeId}/reviews/menus/${menuId}`);
      console.log("[ToggleButton] 메뉴 리뷰 API 응답:", response.data);
      setMenuReviews(response.data);
      setShowMenuReviews(true);
      console.log("[ToggleButton] setMenuReviews 값:", response.data);
    } catch (err) {
      console.error("❌ 리뷰 조회 실패:", err);
      setAlertMessage("❌ 리뷰 조회 중 오류 발생");
    } finally {
      setReviewsLoading(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`px-3 py-1 rounded text-sm transition ${
            isAvailable ? "bg-green-500 text-white" : "bg-gray-300 text-black"
          }`}
        >
          {loading ? "..." : isAvailable ? "ON" : "OFF"}
        </button>
        <button
          onClick={handleViewReviews}
          disabled={reviewsLoading}
          className="px-3 py-1 rounded text-sm bg-blue-500 text-white hover:bg-blue-600 transition"
        >
          {reviewsLoading ? "..." : "리뷰"}
        </button>
      </div>

      {alertMessage && (
        <Modal
          title="알림"
          message={alertMessage}
          onClose={() => {
            setAlertMessage(null);
            setOnConfirm(null);
          }}
          onConfirm={onConfirm ?? undefined}
          confirmText="확인"
        />
      )}

      {showMenuReviews && menuReviews && (
        <Modal
          title={`${menuReviews.menuName || '메뉴'} 리뷰 (${menuReviews.totalCount}개)`}
          message={
            <div className="max-h-96 overflow-y-auto">
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <div className="text-lg font-semibold">평균 평점: ⭐ {menuReviews.averageScore != null ? menuReviews.averageScore.toFixed(1) : "-"}</div>
              </div>
              {menuReviews.reviews.length > 0 ? (
                <div className="space-y-3">
                  {menuReviews.reviews.map((review) => (
                    <div key={review.id} className="border-b pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">{review.customerName || '익명'}</span>
                        <div className="flex items-center">
                          <span className="text-yellow-500">{"⭐".repeat(review.score)}</span>
                          <span className="ml-1 text-sm text-gray-500">
                            {new Date(review.reviewDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-gray-700">{review.reviewDetails}</div>
                      {review.imageUrl && (
                        <img
                          src={review.imageUrl}
                          alt="리뷰 이미지"
                          className="mt-2 max-w-32 h-32 object-cover rounded"
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">아직 리뷰가 없습니다.</div>
              )}
            </div>
          }
          onClose={() => {
            setShowMenuReviews(false);
            setMenuReviews(null);
          }}
          confirmText="닫기"
        />
      )}
    </>
  );
};

export default ToggleButton;
