import React, { useState, useEffect } from "react";
import api from "../API/TokenConfig";
import { ReviewSummary, ReviewsResponse } from "../types/review";
import Modal from "../pages/Modal";

interface ReviewDashboardProps {
  storeId: number;
}

const ReviewDashboard: React.FC<ReviewDashboardProps> = ({ storeId }) => {
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [reviews, setReviews] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    loadSummary();
  }, [storeId]);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/stores/${storeId}/reviews/summary`);
      console.log("[리뷰 대시보드] 요약 API 응답:", response.data);
      setSummary(response.data);
    } catch (error) {
      console.error("❌ 리뷰 요약 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllReviews = async (page: number = 1) => {
    setLoading(true);
    try {
      const response = await api.get(`/api/stores/${storeId}/reviews`, {
        params: { page, size: 10 }
      });
      console.log("[리뷰 대시보드] 전체 리뷰 API 응답:", response.data);
      setReviews(response.data);
      setCurrentPage(page);
      setShowAllReviews(true);
      console.log("[리뷰 대시보드] setReviews 값:", response.data);
    } catch (error) {
      console.error("❌ 전체 리뷰 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStarRating = (rating: number) => {
    return "⭐".repeat(rating) + "☆".repeat(5 - rating);
  };

  const renderRatingDistribution = () => {
    if (!summary || !summary.scoreDistribution) return null;

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = summary.scoreDistribution![star] || 0;
          const totalReviews = summary.totalReviews || 0;
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

          return (
            <div key={star} className="flex items-center gap-2">
              <span className="w-8 text-sm">{star}점</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-12 text-sm text-gray-600">{count}개</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading && !summary) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">리뷰 관리</h2>
          <button
            onClick={() => loadAllReviews(1)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            disabled={loading}
          >
            {loading ? "로딩중..." : "전체 리뷰 보기"}
          </button>
        </div>

        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* 전체 통계 */}
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{summary.totalReviews || 0}</div>
              <div className="text-sm text-gray-600">총 리뷰 수</div>
            </div>

            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                ⭐ {summary.averageScore != null ? summary.averageScore.toFixed(1) : "-"}
              </div>
              <div className="text-sm text-gray-600">평균 평점</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{summary.recentThirtyDaysCount || 0}</div>
              <div className="text-sm text-gray-600">최근 30일</div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {summary.highRatingPercentage != null ? summary.highRatingPercentage.toFixed(1) : "-"}%
              </div>
              <div className="text-sm text-gray-600">고평점 비율 (4점↑)</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {/* 메뉴별 리뷰 수 */}
          {summary && summary.menuReviewCounts && summary.menuReviewCounts.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-4">메뉴별 리뷰 수</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {summary.menuReviewCounts.map((menu) => (
                  <div key={menu.menuId} className="flex justify-between items-center">
                    <span className="text-sm">{menu.menuName}</span>
                    <span className="text-sm font-medium bg-blue-100 px-2 py-1 rounded">
                      {menu.reviewCount}개
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 전체 리뷰 모달 */}
      {showAllReviews && reviews && (
        <Modal
          title={`전체 리뷰 (${reviews.totalCount}개)`}
          message={
            <div className="max-h-96 overflow-y-auto">
              {reviews.reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-medium">{review.customerName || '익명'}</span>
                          <span className="text-sm text-blue-600 ml-2">({review.menuName || '메뉴'})</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-yellow-500">{renderStarRating(review.score)}</span>
                          <span className="ml-2 text-sm text-gray-500">
                            {new Date(review.reviewDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-gray-700 mb-2">{review.reviewDetails}</div>
                      {review.imageUrl && (
                        <img
                          src={review.imageUrl}
                          alt="리뷰 이미지"
                          className="max-w-32 h-32 object-cover rounded"
                        />
                      )}
                    </div>
                  ))}

                  {/* 페이지네이션 */}
                  {reviews.totalPages && reviews.totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                      <button
                        onClick={() => loadAllReviews(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                      >
                        이전
                      </button>
                      <span className="px-3 py-1">
                        {currentPage} / {reviews.totalPages}
                      </span>
                      <button
                        onClick={() => loadAllReviews(currentPage + 1)}
                        disabled={currentPage >= reviews.totalPages}
                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                      >
                        다음
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8">아직 리뷰가 없습니다.</div>
              )}
            </div>
          }
          onClose={() => {
            setShowAllReviews(false);
            setReviews(null);
          }}
          confirmText="닫기"
        />
      )}
    </>
  );
};

export default ReviewDashboard;