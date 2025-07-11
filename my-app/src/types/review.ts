export interface Review {
  id: number;
  menuId?: number;
  menuName?: string;
  customerName?: string;
  score: number; // rating → score로 변경
  reviewDetails: string; // comment → reviewDetails로 변경
  reviewDate: string; // createdAt → reviewDate로 변경
  imageUrl?: string;
}

export interface ReviewSummary {
  totalReviews?: number;
  averageScore?: number; // averageRating → averageScore로 변경
  scoreDistribution?: { // ratingDistribution → scoreDistribution로 변경
    [key: number]: number;
  };
  menuReviewCounts?: { // 백엔드에서 안 오는 경우 대비해 optional로 변경
    menuId: number;
    menuName: string;
    reviewCount: number;
  }[];
  recentThirtyDaysCount?: number;
  highRatingPercentage?: number;
}

export interface ReviewsResponse {
  reviews: Review[];
  totalCount: number;
  currentPage?: number;
  totalPages?: number;
}

export interface MenuReviewsResponse {
  menuId?: number;
  menuName?: string;
  reviews: Review[];
  totalCount: number;
  averageScore: number; // averageRating → averageScore로 변경
  scoreDistribution?: {
    [key: number]: number;
  };
}
