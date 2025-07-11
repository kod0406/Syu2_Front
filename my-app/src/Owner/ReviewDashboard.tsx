import React, { useState, useEffect, useCallback } from "react";
import api from "../API/TokenConfig";
import { ReviewSummary, ReviewsResponse } from "../types/review";
import Modal from "../pages/Modal";

interface ReviewDashboardProps {
  storeId: number;
}

type SortType = 'date_asc' | 'date_desc' | 'score_asc' | 'score_desc';

const ReviewDashboard: React.FC<ReviewDashboardProps> = ({ storeId }) => {
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [reviews, setReviews] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [sortType, setSortType] = useState<SortType>('date_desc');
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);

  // ReviewDashboard 컴포넌트가 마운트될 때 body 스크롤 방지
  useEffect(() => {
    // 컴포넌트 마운트 시 스크롤 막기
    document.body.style.overflow = 'hidden';

    // 컴포넌트 언마운트 시 스크롤 복구
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const loadSummary = useCallback(async () => {
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
  }, [storeId]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const loadAllReviews = async (page: number = 1, customSort?: SortType, customMenu?: string | null) => {
    setLoading(true);
    try {
      // 매개변수로 받은 값이 있으면 사용하고, 없으면 현재 상태값 사용
      const currentSort = customSort !== undefined ? customSort : sortType;
      const currentMenu = customMenu !== undefined ? customMenu : selectedMenu;

      const response = await api.get(`/api/stores/${storeId}/reviews`, {
        params: { page, size: 10, sort: currentSort, menu: currentMenu }
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

  const handleSortChange = (newSortType: SortType) => {
    setSortType(newSortType);
    setCurrentPage(1);
    // 새로운 정렬 타입을 직접 전달
    loadAllReviews(1, newSortType, selectedMenu);
  };

  const handleMenuFilterChange = (menuId: string | null) => {
    setSelectedMenu(menuId);
    setCurrentPage(1);
    // 새로운 메뉴 필터를 직접 전달
    loadAllReviews(1, sortType, menuId);
  };

  const renderStarRating = (rating: number) => {
    return "⭐".repeat(rating) + "☆".repeat(5 - rating);
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
            <div className="w-full max-w-[1100px] mx-auto h-full flex flex-col overflow-x-hidden">
              {/* 정렬 및 필터링 컨트롤 - 고정 영역 */}
              <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4 -m-4 mb-4">
                {/* 정렬 버튼들 */}
                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-700 mb-2 block">정렬 옵션:</span>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => handleSortChange('date_desc')}
                      className={`px-4 py-2 text-sm rounded-lg transition-all ${
                        sortType === 'date_desc'
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      최신순
                    </button>
                    <button
                      onClick={() => handleSortChange('date_asc')}
                      className={`px-4 py-2 text-sm rounded-lg transition-all ${
                        sortType === 'date_asc'
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      오래된순
                    </button>
                    <button
                      onClick={() => handleSortChange('score_desc')}
                      className={`px-4 py-2 text-sm rounded-lg transition-all ${
                        sortType === 'score_desc'
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      별점 높은순
                    </button>
                    <button
                      onClick={() => handleSortChange('score_asc')}
                      className={`px-4 py-2 text-sm rounded-lg transition-all ${
                        sortType === 'score_asc'
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      별점 낮은순
                    </button>
                  </div>
                </div>

                {/* 메뉴 필터 버튼들 */}
                <div>
                  <span className="text-sm font-medium text-gray-700 mb-2 block">메뉴 필터:</span>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => handleMenuFilterChange(null)}
                      className={`px-4 py-2 text-sm rounded-lg transition-all ${
                        selectedMenu === null
                          ? 'bg-green-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      전체 메뉴
                    </button>
                    {summary?.menuReviewCounts?.map((menu) => (
                      <button
                        key={menu.menuId}
                        onClick={() => handleMenuFilterChange(menu.menuId.toString())}
                        className={`px-4 py-2 text-sm rounded-lg transition-all ${
                          selectedMenu === menu.menuId.toString()
                            ? 'bg-green-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {menu.menuName} <span className="text-xs opacity-75">({menu.reviewCount})</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 리뷰 목록 - 스크롤 가능 영역 */}
              <div className="flex-1 overflow-y-auto min-h-0">
                {reviews.reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.reviews.map((review) => (
                      <div key={review.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="font-semibold text-gray-800">{review.customerName || '익명'}</span>
                            <span className="text-sm text-blue-600 ml-2 bg-blue-50 px-2 py-1 rounded">
                              {review.menuName || '메뉴'}
                            </span>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="flex items-center mb-1">
                              <span className="text-yellow-500 text-lg">{renderStarRating(review.score)}</span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(review.reviewDate).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="text-gray-700 leading-relaxed mb-3">{review.reviewDetails}</div>
                        {review.imageUrl && (
                          <div className="mt-3">
                            <img
                              src={review.imageUrl}
                              alt="리뷰 이미지"
                              className="max-w-48 h-48 object-cover rounded-lg shadow-sm border border-gray-200"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 text-gray-500">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📝</div>
                      <div className="font-medium">
                        {selectedMenu ? '해당 메뉴의 리뷰가 없습니다.' : '아직 리뷰가 없습니다.'}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 페이지네이션 - 고정 영역 */}
              {reviews.totalPages && reviews.totalPages > 1 && (
                <div className="flex-shrink-0 flex justify-center items-center gap-2 pt-4 border-t border-gray-200 mt-4">
                  <button
                    onClick={() => loadAllReviews(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
                  >
                    이전
                  </button>
                  <div className="flex items-center gap-2">
                    {[...Array(Math.min(5, reviews.totalPages))].map((_, i) => {
                      const pageNum = Math.max(1, currentPage - 2) + i;
                      if (pageNum > (reviews.totalPages || 0)) return null;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => loadAllReviews(pageNum)}
                          className={`w-10 h-10 rounded-lg transition-colors ${
                            pageNum === currentPage
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => loadAllReviews(currentPage + 1)}
                    disabled={currentPage >= (reviews.totalPages || 0)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
                  >
                    다음
                  </button>
                </div>
              )}
            </div>
          }
          onClose={() => {
            setShowAllReviews(false);
            setReviews(null);
            setSortType('date_desc');
            setSelectedMenu(null);
          }}
          confirmText="닫기"
        />
      )}
    </>
  );
};

export default ReviewDashboard;
