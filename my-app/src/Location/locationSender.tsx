import React, { useEffect, useState } from "react";
import { useGeolocation } from "../hooks/useGeolocation";
import api from "../API/TokenConfig";
import MenuCard from "../Menu/MenuCard";
import ReviewModal from "../Menu/ReviewModal"; // Import ReviewModal

interface Store {
  storeId: number;
  storeName: string;
  storeAddress: string;
  latitude: number;
  longitude: number;
}

interface MenuItem {
  menuId: number;
  menuName: string;
  price: number;
  category: string;
  description: string;
  imageUrl: string;
  rating: number;
  available: boolean;
}

const LocationSender: React.FC = () => {
  const { location, error } = useGeolocation();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedMenuName, setSelectedMenuName] = useState("");
  const [selectedReviews, setSelectedReviews] = useState([]);

  useEffect(() => {
    const sendLocation = async () => {
      try {
        if (!location) return;

        const response = await api.get("/api/location", {
          params: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
        });
        setStores(response.data);
        console.log("✅ 주변 가게 목록:", response.data);
      } catch (err: any) {
        console.error("❌ 위치 전송 실패:", err.message);
      }
    };

    sendLocation();
  }, [location]);

  const handleStoreClick = async (store: Store) => {
    try {
      const response = await api.get(
        `/api/Store/Menu?StoreNumber=${store.storeId}`
      );
      const availableMenus = response.data.filter(
        (menu: MenuItem) => menu.available
      );
      setMenu(availableMenus);
      setSelectedStore(store);
      setIsMenuModalOpen(true);
    } catch (err: any) {
      console.error("❌ 메뉴 불러오기 실패:", err.message);
    }
  };

  const handleCloseModal = () => {
    setIsMenuModalOpen(false);
    setMenu([]);
    setSelectedStore(null);
  };

  // Function to handle viewing reviews
  const handleViewReviews = async (menuId: number, menuName: string) => {
    try {
      const res = await api.get(`api/review/show?menuId=${menuId}`);
      if (res.status !== 200) throw new Error("리뷰 불러오기 실패");
      const data = res.data;
      setSelectedMenuName(menuName);
      setSelectedReviews(data);
      setReviewModalOpen(true);
    } catch (err) {
      console.error("❌ 리뷰 보기 실패:", err);
      // You can add user-facing error handling here if needed
    }
  };

  return (
    <div className="p-4">
      {error && <p className="text-red-500">❌ 위치 에러: {error}</p>}
      {!location && !error && <p>📡 위치를 가져오는 중...</p>}
      {stores.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">주변 가게 목록</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stores.map((store) => (
              <div
                key={store.storeId}
                className="p-4 border rounded-lg cursor-pointer hover:bg-gray-100"
                onClick={() => handleStoreClick(store)}
              >
                <h3 className="text-lg font-semibold">{store.storeName}</h3>
                <p className="text-gray-600">{store.storeAddress}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {isMenuModalOpen && selectedStore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl h-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{selectedStore.storeName}</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-800 bg-gray-200 px-4 py-2 rounded-lg"
              >
                닫기
              </button>
            </div>
            <div className="space-y-6">
              {menu.length > 0 ? (
                menu.map((item) => (
                  <MenuCard
                    key={item.menuId}
                    item={{
                      ...item,
                      category: item.category, // 카테고리 필드 전달
                    }}
                    onAdd={() => {}} // No action
                    onViewReviews={handleViewReviews} // Connect the review function
                    showAddButton={false} // Hide add button
                  />
                ))
              ) : (
                <p className="text-gray-400">메뉴가 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal Component */}
      <ReviewModal
        open={reviewModalOpen}
        menuName={selectedMenuName}
        reviews={selectedReviews}
        onClose={() => setReviewModalOpen(false)}
      />
    </div>
  );
};

export default LocationSender;

