import React from "react";
import { CustomerCoupon } from "../types/coupon";

interface Props {
  coupons: CustomerCoupon[];
  onSelect: (coupon: CustomerCoupon) => void;
  onClose: () => void;
  currentOrderAmount: number;
}

export default function CouponPopup({
  coupons,
  onSelect,
  onClose,
  currentOrderAmount,
}: Props) {
  const getDiscountText = (coupon: CustomerCoupon) => {
    if (coupon.discountType === "PERCENTAGE") {
      return `${coupon.discountValue}% 할인`;
    }
    return `${coupon.discountValue.toLocaleString()}원 할인`;
  };

  const isCouponUsable = (coupon: CustomerCoupon) => {
    return currentOrderAmount >= (coupon.minimumOrderAmount || 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-xl w-[90%] max-w-md">
        <h2 className="text-base md:text-xl font-bold mb-4">쿠폰 선택</h2>
        <ul className="space-y-3 max-h-80 overflow-y-auto">
          {coupons.length > 0 ? (
            coupons.map((coupon) => {
              const usable = isCouponUsable(coupon);
              return (
                <li
                  key={coupon.id}
                  onClick={() => usable && onSelect(coupon)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all text-sm ${
                    usable
                      ? "hover:bg-gray-100 hover:border-blue-500"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <div className="font-semibold text-sm md:text-base">
                    {coupon.couponName}
                  </div>
                  <div className="text-red-500 font-bold text-lg md:text-xl">
                    {getDiscountText(coupon)}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {new Date(coupon.expiresAt).toLocaleDateString()}까지
                  </div>
                  {coupon.minimumOrderAmount && (
                    <div className="text-xs text-gray-500">
                      {coupon.minimumOrderAmount.toLocaleString()}원 이상 주문
                      시
                    </div>
                  )}
                  {!usable && (
                    <div className="text-xs text-red-600 font-bold mt-1">
                      최소 주문 금액 미달
                    </div>
                  )}
                </li>
              );
            })
          ) : (
            <p className="text-sm text-center text-gray-500">
              사용 가능한 쿠폰이 없습니다.
            </p>
          )}
        </ul>
        <button
          onClick={onClose}
          className="mt-6 w-full bg-gray-300 text-black py-2 rounded-lg hover:bg-gray-400 text-sm"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
