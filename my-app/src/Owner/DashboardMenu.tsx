import React from 'react';

type Props = {
  onAddMenuClick: () => void;
  onSalesClick: () => void;
  onOrdersClick: () => void;
  onCouponClick: () => void;
};

const DashboardMenu: React.FC<Props> = ({
  onAddMenuClick,
  onSalesClick,
  onOrdersClick,
  onCouponClick,
}) => {
  return (
    <div className="flex space-x-2 p-2">
      <button onClick={onAddMenuClick} className="px-4 py-2 bg-green-400 text-white rounded">
        메뉴 추가
      </button>
      <button onClick={onSalesClick} className="px-4 py-2 bg-blue-500 text-white rounded">
        매출 통계
      </button>
      <button onClick={onOrdersClick} className="px-4 py-2 bg-purple-500 text-white rounded">
        주문 현황
      </button>
      <button onClick={onCouponClick} className="px-4 py-2 bg-pink-500 text-white rounded">
        쿠폰 관리
      </button>
    </div>
  );
};

export default DashboardMenu;
