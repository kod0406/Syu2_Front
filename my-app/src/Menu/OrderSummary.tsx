import React from 'react';

interface OrderItem {
  menuName: string;
  quantity: number;
  price: number;
}

interface Props {
  orderItems: OrderItem[];
  isLoggedIn: boolean;
  usedPoints: number;
  availablePoints: number;
  onRemove: (index: number) => void;
  onIncrease: (index: number) => void;
  onDecrease: (index: number) => void;
  onSubmitOrder: () => void;
  onUsePoint: () => void;
  totalAmount: number;
}

export default function OrderSummary({
  orderItems,
  isLoggedIn,
  usedPoints,
  availablePoints,
  onRemove,
  onIncrease,
  onDecrease,
  onSubmitOrder,
  onUsePoint,
  totalAmount,
}: Props) {
  return (
    <aside className="w-2/6 bg-white border-l p-4 flex flex-col justify-between h-full">
      <div className="flex-1 overflow-y-auto">
        <h3 className="text-lg font-bold mb-2">주문서</h3>
        {orderItems.length === 0 ? (
          <p className="text-gray-400">메뉴를 선택해 주세요.</p>
        ) : (
          <ul className="space-y-2">
            {orderItems.map((item, index) => (
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
            ))}
          </ul>
        )}
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          {isLoggedIn && (
            <div className="flex items-center gap-2">
              <button
                className="text-sm px-3 py-1 bg-yellow-300 rounded text-black"
                onClick={onUsePoint}
              >
                포인트 사용
              </button>
              {usedPoints > 0 && (
                <span className="text-sm text-blue-600">
                  -₩{usedPoints.toLocaleString()}
                </span>
              )}
            </div>
          )}
          <p className="text-right font-bold">합계 ₩{totalAmount.toLocaleString()}</p>
        </div>
        <button className="w-full mb-2 px-4 py-2 bg-gray-300 rounded text-gray-600">
          주문내역 보기
        </button>
        <button
          className="w-full px-4 py-2 bg-red-500 text-white rounded"
          onClick={onSubmitOrder}
        >
          주문하기
        </button>
      </div>
    </aside>
  );
}
