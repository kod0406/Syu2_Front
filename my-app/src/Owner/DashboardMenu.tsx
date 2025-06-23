// src/Owner/DashboardMenu.tsx

import React from 'react';

type DashboardMenuProps = {
  onAddMenuClick: () => void;
  onSalesClick: () => void;
  onOrdersClick: () => void;
  onCouponClick: () => void;
};

export default function DashboardMenu({
  onAddMenuClick,
  onSalesClick,
  onOrdersClick,
  onCouponClick,
}: DashboardMenuProps) {
  return (
    <div className="mb-4 flex gap-3">
      <button
        onClick={onAddMenuClick}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        메뉴 추가
      </button>
      <button
        onClick={onSalesClick}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        매출 보기
      </button>
      <button
        onClick={onOrdersClick}
        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
      >
        주문 보기
      </button>
      <button
        onClick={onCouponClick}
        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
      >
        쿠폰 관리
      </button>
    </div>
  );
}
