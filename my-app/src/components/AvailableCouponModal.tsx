import React from 'react';

interface Coupon {
  couponName: string;
  discountValue: number;
  discountType: 'PERCENTAGE' | 'AMOUNT';
  // Add other coupon properties as needed
}

interface StoreWithCoupons {
  storeId: number;
  storeName: string;
  coupons: Coupon[];
}

interface AvailableCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  storesWithCoupons: StoreWithCoupons[];
}

const AvailableCouponModal: React.FC<AvailableCouponModalProps> = ({ isOpen, onClose, storesWithCoupons }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl h-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">주변 가게 사용 가능 쿠폰</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 bg-gray-200 px-4 py-2 rounded-lg">
            닫기
          </button>
        </div>
        <div className="space-y-4">
          {storesWithCoupons.length > 0 ? (
            storesWithCoupons.map((store) => (
              <div key={store.storeId} className="p-4 border rounded-lg">
                <h3 className="text-lg font-semibold mb-2">{store.storeName}</h3>
                <ul className="space-y-2">
                  {store.coupons.map((coupon, index) => (
                    <li key={index} className="p-2 bg-gray-100 rounded-md">
                      <p className="font-medium">{coupon.couponName}</p>
                      <p className="text-sm text-red-600">
                        {coupon.discountType === 'PERCENTAGE'
                          ? `${coupon.discountValue}% 할인`
                          : `${coupon.discountValue.toLocaleString()}원 할인`}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <p className="text-gray-500">주변에 사용 가능한 쿠폰이 있는 가게가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailableCouponModal;
