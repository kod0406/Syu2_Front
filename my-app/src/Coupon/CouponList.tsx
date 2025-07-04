import React from "react";

export interface Coupon {
  id: number;
  couponName: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  discountLimit?: number | null;
  minimumOrderAmount: number;
  expiryType: "ABSOLUTE" | "RELATIVE";
  expiryDate?: string | null;
  expiryDays?: number | null;
  issueStartTime: string;
  totalQuantity: number;
  issuedQuantity: number;
  applicableCategories: string[];
  status: "ACTIVE" | "INACTIVE" | "RECALLED";
}

interface Props {
  coupons: Coupon[];
  onEdit: (coupon: Coupon) => void;
  onDelete: (couponId: number) => void;
  onStatusChange: (couponId: number, status: Coupon["status"]) => void;
}

const CouponList: React.FC<Props> = ({
  coupons,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const getStatusColor = (status: Coupon["status"]) => {
    switch (status) {
      case "ACTIVE":
        return "text-green-600";
      case "INACTIVE":
        return "text-gray-500";
      case "RECALLED":
        return "text-red-600";
      default:
        return "text-black";
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("ko-KR");
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4">생성된 쿠폰 목록</h2>
      {coupons.length === 0 ? (
        <p className="text-gray-500">생성된 쿠폰이 없습니다.</p>
      ) : (
        <div className="space-y-4">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="bg-white p-4 rounded shadow-md border"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold">{coupon.couponName}</h3>
                  <p
                    className={`font-semibold ${getStatusColor(coupon.status)}`}
                  >
                    상태: {coupon.status}
                  </p>
                  <p className="text-sm text-gray-600">
                    {coupon.discountType === "PERCENTAGE"
                      ? `${coupon.discountValue}% 할인${
                          coupon.discountLimit
                            ? ` (최대 ${coupon.discountLimit.toLocaleString()}원)`
                            : ""
                        }`
                      : `${coupon.discountValue.toLocaleString()}원 할인`}
                  </p>
                  <p className="text-sm text-gray-500">
                    {coupon.minimumOrderAmount.toLocaleString()}원 이상 주문 시
                    사용 가능
                  </p>
                  <p className="text-sm text-gray-500">
                    발급 시작: {formatDate(coupon.issueStartTime)}
                  </p>
                  <p className="text-sm text-gray-500">
                    만료:{" "}
                    {coupon.expiryType === "ABSOLUTE"
                      ? formatDate(coupon.expiryDate)
                      : `발급 후 ${coupon.expiryDays}일`}
                  </p>
                  <p className="text-sm text-gray-500">
                    발급/총 수량: {coupon.issuedQuantity} /{" "}
                    {coupon.totalQuantity}
                  </p>
                  <p className="text-sm text-gray-500">
                    적용 카테고리:{" "}
                    {coupon.applicableCategories.join(", ") || "전체"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(coupon)}
                      className="px-3 py-1 bg-yellow-400 text-white rounded text-sm"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => onDelete(coupon.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm disabled:opacity-50"
                      disabled={coupon.issuedQuantity > 0}
                      title={
                        coupon.issuedQuantity > 0
                          ? "발급된 쿠폰은 삭제할 수 없습니다"
                          : ""
                      }
                    >
                      삭제
                    </button>
                  </div>
                  <select
                    value={coupon.status}
                    onChange={(e) =>
                      onStatusChange(
                        coupon.id,
                        e.target.value as Coupon["status"]
                      )
                    }
                    className="p-1 border rounded text-sm"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="RECALLED">RECALLED</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CouponList;
