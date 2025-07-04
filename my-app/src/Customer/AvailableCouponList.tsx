import React from "react";

export interface AvailableCoupon {
  id: number;
  couponName: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  discountLimit?: number | null;
  minimumOrderAmount: number;
  expiryType: "ABSOLUTE" | "RELATIVE";
  expiryDate?: string | null;
  expiryDays?: number | null;
  storeName: string;
  issuedQuantity: number;
  totalQuantity: number;
}

interface Props {
  coupons: AvailableCoupon[];
  onIssue: (couponId: number) => void;
  issuedCouponIds: Set<number>;
}

const AvailableCouponList: React.FC<Props> = ({
  coupons,
  onIssue,
  issuedCouponIds,
}) => {
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("ko-KR");
  };

  return (
    <div className="space-y-4">
      {coupons.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          발급 가능한 쿠폰이 없습니다.
        </p>
      ) : (
        coupons.map((coupon) => {
          const isIssued = issuedCouponIds.has(coupon.id);
          const isSoldOut = coupon.issuedQuantity >= coupon.totalQuantity;
          const canIssue = !isIssued && !isSoldOut;

          return (
            <div
              key={coupon.id}
              className={`p-4 rounded-lg shadow-md border-l-4 ${
                canIssue ? "border-green-500" : "border-gray-300"
              } ${!canIssue ? "bg-gray-50" : "bg-white"} animate-fade-in`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-lg">{coupon.couponName}</p>
                  <p className="text-sm text-gray-700 font-semibold">
                    {coupon.storeName}
                  </p>
                </div>
                <button
                  onClick={() => onIssue(coupon.id)}
                  disabled={!canIssue}
                  className="px-4 py-2 text-sm font-semibold text-white rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed bg-green-500 hover:bg-green-600"
                >
                  {isIssued ? "발급완료" : isSoldOut ? "소진됨" : "쿠폰받기"}
                </button>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 text-sm">
                <p className="text-green-700 font-semibold">
                  {coupon.discountType === "PERCENTAGE"
                    ? `${coupon.discountValue}% 할인`
                    : `${coupon.discountValue.toLocaleString()}원 할인`}
                  {coupon.discountLimit &&
                    ` (최대 ${coupon.discountLimit.toLocaleString()}원)`}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {coupon.minimumOrderAmount.toLocaleString()}원 이상 주문 시
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  만료:{" "}
                  {coupon.expiryType === "ABSOLUTE"
                    ? formatDate(coupon.expiryDate)
                    : `발급 후 ${coupon.expiryDays}일`}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  남은 수량: {coupon.totalQuantity - coupon.issuedQuantity} /{" "}
                  {coupon.totalQuantity}
                </p>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default AvailableCouponList;
