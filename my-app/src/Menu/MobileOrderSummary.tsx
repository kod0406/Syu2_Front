import React, { useState } from "react";
import { CustomerCoupon } from "../types/coupon";

interface OrderItem {
  menuName: string;
  quantity: number;
  price: number;
}

interface Props {
  orderItems: OrderItem[];
  isLoggedIn: boolean;
  usedPoints: number;
  totalAmount: number;
  subtotal: number;
  couponDiscount: number;
  selectedCoupon: CustomerCoupon | null;
  onSubmitOrder: () => void;
  onUsePoint: () => void;
  onUseCoupon: () => void;
  onCancelCoupon: () => void;
  disabled: boolean;
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  onIncrease: (index: number) => void;
  onDecrease: (index: number) => void;
  onRemove: (index: number) => void;
}

export default function MobileOrderSummary({
  orderItems,
  isLoggedIn,
  usedPoints,
  totalAmount,
  subtotal,
  couponDiscount,
  selectedCoupon,
  onSubmitOrder,
  onUsePoint,
  onUseCoupon,
  onCancelCoupon,
  disabled,
  showModal,
  setShowModal,
  onIncrease,
  onDecrease,
  onRemove,
}: Props) {
  const renderOrderItem = (item: OrderItem, index: number) => {
    if (item.menuName.startsWith("CouponUsed:")) {
      const couponName = selectedCoupon?.couponName || "쿠폰 할인";
      return (
        <li
          key={index}
          className="flex justify-between items-center text-sm bg-green-50 p-2 rounded"
        >
          <div className="flex flex-col">
            <span className="text-green-700 font-medium">🎫 {couponName}</span>
            <span className="text-green-600 text-xs">할인 적용</span>
          </div>
          <div className="text-green-700 font-medium">
            -₩{Math.abs(item.price * item.quantity).toLocaleString()}
          </div>
        </li>
      );
    }

    if (item.menuName.startsWith("UserPointUsedOrNotUsed")) {
      return (
        <li
          key={index}
          className="flex justify-between items-center text-sm bg-blue-50 p-2 rounded"
        >
          <div className="flex flex-col">
            <span className="text-blue-700 font-medium">💰 포인트 사용</span>
            <span className="text-blue-600 text-xs">
              {Math.abs(item.price * item.quantity).toLocaleString()}P 사용
            </span>
          </div>
          <div className="text-blue-700 font-medium">
            -₩{Math.abs(item.price * item.quantity).toLocaleString()}
          </div>
        </li>
      );
    }

    return (
      <li key={index} className="flex justify-between items-center text-sm">
        <div className="flex flex-col">
          <span>
            {item.menuName} x{item.quantity}
          </span>
          <span className="text-gray-500 text-xs">
            ₩{(item.price * item.quantity).toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onDecrease(index)}
            className="px-2 bg-gray-200 rounded"
          >
            -
          </button>
          <button
            onClick={() => onIncrease(index)}
            className="px-2 bg-gray-200 rounded"
          >
            +
          </button>
          <button
            onClick={() => onRemove(index)}
            className="text-red-500 hover:text-red-700 ml-2"
          >
            X
          </button>
        </div>
      </li>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white shadow-md p-4 md:hidden z-50">
      <div className="flex justify-between items-center mb-2">
        <p className="text-lg font-bold">총 결제금액</p>
        <p className="text-lg font-bold text-red-600">
          ₩{totalAmount.toLocaleString()}
        </p>
      </div>

      {isLoggedIn && (
        <div className="flex justify-between gap-2 mb-3">
          {selectedCoupon ? (
            <div className="flex-1 p-2 border rounded-lg bg-green-50 text-center">
              <p className="text-sm font-semibold truncate">
                {selectedCoupon.couponName}
              </p>
              <button
                onClick={onCancelCoupon}
                className="text-xs text-gray-500 hover:text-red-500"
              >
                (적용 취소)
              </button>
            </div>
          ) : (
            <button
              className="flex-1 text-sm px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
              onClick={onUseCoupon}
              disabled={orderItems.length === 0}
            >
              쿠폰 사용
            </button>
          )}

          <button
            className="flex-1 text-sm px-3 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-500 disabled:bg-gray-300"
            onClick={onUsePoint}
            disabled={orderItems.length === 0}
          >
            포인트 사용
          </button>
        </div>
      )}

      <button
        className="w-full mb-2 px-4 py-2 bg-gray-300 rounded text-gray-600"
        onClick={() => setShowModal(true)}
        disabled={orderItems.length === 0}
      >
        주문내역 보기
      </button>

      <button
        className="w-full px-4 py-3 bg-red-500 text-white rounded font-bold text-lg hover:bg-red-600 disabled:bg-red-300"
        onClick={onSubmitOrder}
        disabled={disabled}
      >
        주문하기
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white w-11/12 max-h-[80vh] overflow-y-auto rounded p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">주문 내역</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-red-500"
              >
                닫기
              </button>
            </div>
            <ul className="space-y-2">
              {orderItems.map((item, index) => renderOrderItem(item, index))}
            </ul>
            <div className="mt-4 pt-4 border-t text-sm">
              <div className="flex justify-between mb-1">
                <p>주문 금액</p>
                <p>₩{subtotal.toLocaleString()}</p>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-red-600 mb-1">
                  <p>쿠폰 할인</p>
                  <p>-₩{couponDiscount.toLocaleString()}</p>
                </div>
              )}
              {usedPoints > 0 && (
                <div className="flex justify-between text-blue-600">
                  <p>포인트 사용</p>
                  <p>-₩{usedPoints.toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
