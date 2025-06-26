import React from 'react';
import { CustomerCoupon } from '../types/coupon';

interface OrderItem {
  menuName: string;
  quantity: number;
  price: number;
}

interface Props {
  orderItems: OrderItem[];
  isLoggedIn: boolean;
  usedPoints: number;
  onRemove: (index: number) => void;
  onIncrease: (index: number) => void;
  onDecrease: (index: number) => void;
  onSubmitOrder: () => void;
  onUsePoint: () => void;
  totalAmount: number;
  subtotal: number;
  couponDiscount: number;
  selectedCoupon: CustomerCoupon | null;
  onUseCoupon: () => void;
  onCancelCoupon: () => void;
}

export default function OrderSummary({
                                       orderItems,
                                       isLoggedIn,
                                       usedPoints,
                                       onRemove,
                                       onIncrease,
                                       onDecrease,
                                       onSubmitOrder,
                                       onUsePoint,
                                       totalAmount,
                                       subtotal,
                                       couponDiscount,
                                       selectedCoupon,
                                       onUseCoupon,
                                       onCancelCoupon,
                                     }: Props) {

  // 쿠폰/포인트 사용 내역을 더 보기 좋게 렌더링하는 함수f

  const renderOrderItem = (item: OrderItem, index: number) => {
    // 쿠폰 사용 내역 처리
    if (item.menuName.startsWith('CouponUsed:')) {
      const couponName = selectedCoupon?.couponName || '쿠폰 할인';
      return (
          <li key={index} className="flex justify-between items-center text-sm bg-green-50 p-2 rounded">
            <div className="flex flex-col">
            <span className="text-green-700 font-medium">
              🎫 {couponName}
            </span>
              <span className="text-green-600 text-xs">
              할인 적용
            </span>
            </div>
            <div className="text-green-700 font-medium">
              -₩{Math.abs(item.price * item.quantity).toLocaleString()}
            </div>
          </li>
      );
    }

    // 포인트 사용 내역 처리
    if (item.menuName.startsWith('UserPointUsedOrNotUsed')) {
      return (
          <li key={index} className="flex justify-between items-center text-sm bg-blue-50 p-2 rounded">
            <div className="flex flex-col">
            <span className="text-blue-700 font-medium">
              💰 포인트 사용
            </span>
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

    // 일반 메뉴 아이템
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
      <aside className="w-full h-full bg-white border-l p-4 flex flex-col justify-between">
        <div className="flex-1 overflow-y-auto">
          <h3 className="text-lg font-bold mb-2">주문서</h3>
          {orderItems.length === 0 ? (
              <p className="text-gray-400">메뉴를 선택해 주세요.</p>
          ) : (
              <>
                <ul className="space-y-2">
                  {orderItems.map((item, index) => renderOrderItem(item, index))}
                </ul>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between text-sm font-medium">
                    <p>주문 금액</p>
                    <p>₩{subtotal.toLocaleString()}</p>
                  </div>
                  {couponDiscount > 0 && (
                      <div className="flex justify-between text-sm text-red-600">
                        <p>쿠폰 할인</p>
                        <p>-₩{couponDiscount.toLocaleString()}</p>
                      </div>
                  )}
                  {usedPoints > 0 && (
                      <div className="flex justify-between text-sm text-blue-600">
                        <p>포인트 사용</p>
                        <p>-₩{usedPoints.toLocaleString()}</p>
                      </div>
                  )}
                </div>
              </>
          )}
        </div>
        <div>
          {isLoggedIn && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {selectedCoupon ? (
                    <div className="p-2 border rounded-lg bg-green-50 text-center flex flex-col justify-center items-center">
                      <p className="text-sm font-semibold truncate w-full">
                        {selectedCoupon.couponName}
                      </p>
                      <button onClick={onCancelCoupon} className="text-xs text-gray-500 hover:text-red-500">
                        (적용 취소)
                      </button>
                    </div>
                ) : (
                    <button
                        className="text-sm px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
                        onClick={onUseCoupon}
                        disabled={orderItems.length === 0}
                    >
                      쿠폰 사용
                    </button>
                )}
                <button
                    className="text-sm px-3 py-2 bg-yellow-400 rounded text-black hover:bg-yellow-500 disabled:bg-gray-300"
                    onClick={onUsePoint}
                    disabled={orderItems.length === 0}
                >
                  포인트 사용
                </button>
              </div>
          )}
          <div className="flex justify-between items-center mb-2 pt-4 border-t-2">
            <p className="text-xl font-bold">총 결제금액</p>
            <p className="text-xl font-bold text-red-600">
              ₩{totalAmount.toLocaleString()}
            </p>
          </div>
          <button className="w-full mb-2 px-4 py-2 bg-gray-300 rounded text-gray-600">
            주문내역 보기
          </button>
          <button
              className="w-full px-4 py-3 bg-red-500 text-white rounded font-bold text-lg hover:bg-red-600 disabled:bg-red-300"
              onClick={onSubmitOrder}
              disabled={orderItems.length === 0}
          >
            주문하기
          </button>
        </div>
      </aside>
  );
}
