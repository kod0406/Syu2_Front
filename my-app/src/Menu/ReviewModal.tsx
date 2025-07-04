import React from "react";

interface Review {
  rating: number;
  comment: string;
  imageUrl?: string;
  reviewDate: string;
}

interface ReviewModalProps {
  open: boolean;
  menuName: string;
  reviews: Review[];
  onClose: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  open,
  menuName,
  reviews,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white w-full max-w-md p-4 md:p-6 rounded shadow-lg max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base md:text-lg font-bold">{menuName} 리뷰</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-xl"
          >
            ×
          </button>
        </div>

        {reviews.length > 0 ? (
          <ul className="space-y-4">
            {reviews.map((review, i) => (
              <li
                key={i}
                className="border rounded p-3 md:p-4 text-sm space-y-2"
              >
                <p className="text-yellow-500 font-semibold">
                  ⭐ {review.rating.toFixed(1)} / 5
                </p>
                <p className="text-gray-700 whitespace-pre-wrap break-words">
                  {review.comment}
                </p>

                {review.imageUrl &&
                  review.imageUrl.trim().toUpperCase() !== "NULL" &&
                  review.imageUrl.trim() !== "" && (
                    <img
                      src={review.imageUrl}
                      alt="리뷰 이미지"
                      className="w-full max-h-48 object-contain rounded border"
                    />
                  )}

                <p className="text-right text-xs text-gray-500">
                  작성일:{" "}
                  {new Date(review.reviewDate).toLocaleDateString("ko-KR")}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm text-center">
            아직 등록된 리뷰가 없습니다.
          </p>
        )}
      </div>
    </div>
  );
};

export default ReviewModal;
