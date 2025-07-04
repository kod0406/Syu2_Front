import React from "react";

export interface MyCoupon {
  id: string; // DTO에서 UUID는 문자열로 전달됩니다.
  couponId: number;
  couponName: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  minimumOrderAmount: number;
  issuedAt: string;
  expiresAt: string;
  isUsed: boolean;
  storeName: string;
  discountLimit?: number | null;
}

interface Props {
  coupons: MyCoupon[];
}

const MyCouponList: React.FC<Props> = ({ coupons }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ko-KR");
  };

  return (
    <div className="space-y-4">
      {coupons.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          보유한 쿠폰이 없습니다.
        </p>
      ) : (
        coupons.map((coupon) => (
          <div
            key={coupon.id}
            className={`p-4 rounded-lg shadow-md border-l-4 ${
              coupon.isUsed
                ? "bg-gray-200 border-gray-400 text-gray-500"
                : "bg-white border-blue-500"
            } animate-fade-in`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p
                  className={`font-bold text-lg ${
                    coupon.isUsed ? "text-gray-600" : "text-black"
                  }`}
                >
                  {coupon.couponName}
                </p>
                <p className="text-sm">{coupon.storeName}</p>
              </div>
              {coupon.isUsed && (
                <span className="px-3 py-1 text-sm font-semibold text-white bg-gray-500 rounded-full">
                  사용 완료
                </span>
              )}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p
                className={`${
                  coupon.isUsed ? "text-gray-500" : "text-blue-600"
                } font-semibold`}
              >
                {coupon.discountType === "PERCENTAGE"
                  ? `${coupon.discountValue || 0}% 할인` +
                    (coupon.discountLimit
                      ? ` (최대 ${coupon.discountLimit.toLocaleString()}원)`
                      : "")
                  : `${(coupon.discountValue || 0).toLocaleString()}원 할인`}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {coupon.minimumOrderAmount != null
                  ? `${coupon.minimumOrderAmount.toLocaleString()}원 이상 주문 시`
                  : ""}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                만료일: {formatDate(coupon.expiresAt)}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MyCouponList;
