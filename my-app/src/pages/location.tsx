import React, { useState } from "react";
import LocationSender from "../Location/locationSender";
import AvailableCouponModal from "../components/AvailableCouponModal";
import api from "../API/TokenConfig";
import { useGeolocation } from "../hooks/useGeolocation";

interface Coupon {
  couponName: string;
  discountValue: number;
  discountType: "PERCENTAGE" | "AMOUNT";
}

interface StoreWithCoupons {
  storeId: number;
  storeName: string;
  coupons: Coupon[];
}

const LocationPage: React.FC = () => {
  const { location } = useGeolocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [storesWithCoupons, setStoresWithCoupons] = useState<
    StoreWithCoupons[]
  >([]);

  const handleFetchAvailableCoupons = async () => {
    if (!location) {
      alert("위치 정보를 가져올 수 없습니다.");
      return;
    }

    try {
      const response = await api.get("/api/location/coupon", {
        params: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
      });

      const rawCoupons = response.data;

      // storeId 기준으로 쿠폰을 그룹화
      const groupedMap = new Map<number, StoreWithCoupons>();

      rawCoupons.forEach((c: any) => {
        if (!groupedMap.has(c.storeId)) {
          groupedMap.set(c.storeId, {
            storeId: c.storeId,
            storeName: c.storeName,
            coupons: [],
          });
        }

        groupedMap.get(c.storeId)!.coupons.push({
          couponName: c.couponName,
          discountValue: c.discountValue,
          discountType: c.discountType,
        });
      });

      const transformed = Array.from(groupedMap.values());

      setStoresWithCoupons(transformed);
      setIsModalOpen(true);
    } catch (error) {
      console.error("사용 가능 쿠폰 조회 실패:", error);
      alert("사용 가능한 쿠폰을 불러오는 데 실패했습니다.");
    }
  };

  return (
    <main className="p-6 text-center">
      <button
        className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition"
        onClick={handleFetchAvailableCoupons}
        disabled={!location}
      >
        🎟️ 사용 가능 쿠폰 보기
      </button>

      <div className="mt-6">
        <LocationSender />
      </div>

      <AvailableCouponModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        storesWithCoupons={storesWithCoupons}
      />
    </main>
  );
};

export default LocationPage;
