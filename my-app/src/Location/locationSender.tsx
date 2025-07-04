// src/components/LocationSender.tsx
import React, { useEffect } from "react";
import { useGeolocation } from "../hooks/useGeolocation";
import api from "../API/TokenConfig"; // axios 인스턴스

const LocationSender: React.FC = () => {
  const { location, error } = useGeolocation();

  useEffect(() => {
    const sendLocation = async () => {
      try {
        if (!location) return;

        // 👉 GET 요청으로 쿼리 파라미터에 위치 정보 전송
        const response = await api.get("/api/location", {
          params: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
        });

        console.log("✅ 위치 전송 성공:", response.data);
      } catch (err: any) {
        console.error("❌ 위치 전송 실패:", err.message);
      }
    };

    sendLocation();
  }, [location]);

  return (
    <div className="p-4">
      {error && <p className="text-red-500">❌ 위치 에러: {error}</p>}
      {!location && !error && <p>📡 위치를 가져오는 중...</p>}
      {location && (
        <p>
          ✅ 위치 전송 완료 (위도: {location.latitude}, 경도: {location.longitude})
        </p>
      )}
    </div>
  );
};

export default LocationSender;
