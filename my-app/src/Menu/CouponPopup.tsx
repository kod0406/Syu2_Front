import React from "react";
import { CustomerCoupon } from "../types/coupon";

interface Props {
  coupons: CustomerCoupon[];
  onSelect: (coupon: CustomerCoupon) => void;
  onClose: () => void;
  currentOrderAmount: number;
  orderItems?: Array<{ category: string; price: number; quantity: number }>;
}

export default function CouponPopup({
  coupons,
  onSelect,
  onClose,
  currentOrderAmount,
  orderItems = [],
}: Props) {
  const getDiscountText = (coupon: CustomerCoupon) => {
    if (coupon.discountType === "PERCENTAGE") {
      return `${coupon.discountValue}% 할인`;
    }
    return `${coupon.discountValue.toLocaleString()}원 할인`;
  };

  const getApplicableAmount = (coupon: CustomerCoupon) => {
    const applicableItems = coupon.applicableCategories?.length
      ? orderItems.filter(item => coupon.applicableCategories?.includes(item.category))
      : orderItems;

    return applicableItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getActualDiscount = (coupon: CustomerCoupon) => {
    const applicableAmount = getApplicableAmount(coupon);

    if (coupon.discountType === "PERCENTAGE") {
      let discount = applicableAmount * (coupon.discountValue / 100);
      if (coupon.discountLimit) {
        discount = Math.min(discount, coupon.discountLimit);
      }
      return Math.max(0, Math.floor(discount)); // 마이너스 방지
    } else {
      // 정액 할인: 적용 가능한 금액을 초과할 수 없음 (마이너스 방지)
      return Math.max(0, Math.min(coupon.discountValue, applicableAmount));
    }
  };

  const isCouponUsable = (coupon: CustomerCoupon) => {
    // 카테고리별 적용 가능 여부 확인
    const categoryApplicable = !coupon.applicableCategories?.length ||
      orderItems.some(item => coupon.applicableCategories?.includes(item.category));

    if (!categoryApplicable) {
      return false;
    }

    // 적용 가능한 메뉴들의 금액으로 최소 주문 금액 확인
    const applicableAmount = getApplicableAmount(coupon);
    const meetsMinimumOrder = applicableAmount >= (coupon.minimumOrderAmount || 0);

    // 실제 할인 금액이 0보다 큰지 확인 (정액 할인 시 적용 가능 금액 부족 방지)
    const actualDiscount = getActualDiscount(coupon);

    return meetsMinimumOrder && actualDiscount > 0;
  };

  const getCouponAvailabilityText = (coupon: CustomerCoupon) => {
    const categoryApplicable = !coupon.applicableCategories?.length ||
      orderItems.some(item => coupon.applicableCategories?.includes(item.category));

    if (!categoryApplicable) {
      return "적용 가능한 카테고리 없음";
    }

    const applicableAmount = getApplicableAmount(coupon);
    const meetsMinimumOrder = applicableAmount >= (coupon.minimumOrderAmount || 0);

    if (!meetsMinimumOrder) {
      return "쿠폰 적용 가능한 메뉴의 최소 주문 금액 미달";
    }

    const actualDiscount = getActualDiscount(coupon);
    if (actualDiscount <= 0) {
      return "할인 적용 불가 (적용 가능 금액 부족)";
    }

    return "";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-xl w-[90%] max-w-md">
        <h2 className="text-base md:text-xl font-bold mb-4">쿠폰 선택</h2>
        <ul className="space-y-3 max-h-80 overflow-y-auto">
          {coupons.length > 0 ? (
            coupons.map((coupon) => {
              const usable = isCouponUsable(coupon);
              const availabilityText = getCouponAvailabilityText(coupon);
              const actualDiscount = getActualDiscount(coupon);

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
                  {actualDiscount !== coupon.discountValue && coupon.discountType === "FIXED_AMOUNT" && (
                    <div className="text-orange-600 text-xs font-medium">
                      실제 할인: {actualDiscount.toLocaleString()}원
                    </div>
                  )}
                  <div className="text-xs text-gray-600 mt-1">
                    {new Date(coupon.expiresAt).toLocaleDateString()}까지
                  </div>
                  {coupon.minimumOrderAmount && (
                    <div className="text-xs text-gray-500">
                      {coupon.minimumOrderAmount.toLocaleString()}원 이상 주문 시
                    </div>
                  )}
                  {coupon.applicableCategories?.length && (
                    <div className="text-xs text-blue-600 mt-1">
                      적용 카테고리: {coupon.applicableCategories.join(", ")}
                    </div>
                  )}
                  {!usable && (
                    <div className="text-xs text-red-600 font-bold mt-1">
                      {availabilityText}
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
