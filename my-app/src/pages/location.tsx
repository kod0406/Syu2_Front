// src/pages/LocationPage.tsx
import React from "react";
import LocationSender from "../Location/locationSender";

const LocationPage: React.FC = () => {
  return (
    <main className="p-6 text-center">
      <button
        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
        disabled
      >
        📍 근처 매장 찾기
      </button>

      <div className="mt-6">
        <LocationSender />
      </div>
    </main>
  );
};

export default LocationPage;
