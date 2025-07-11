"use client";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import CategorySidebar from "../Menu/CategorySidebar";
import MenuCard from "../Menu/MenuCard";
import OrderSummary from "../Menu/OrderSummary";
import PointPopup from "../Menu/PointPopup";
import ReviewModal from "../Menu/ReviewModal";
import CouponPopup from "../Menu/CouponPopup";
import api from "../API/TokenConfig";
import { CustomerCoupon } from "../types/coupon";
import MobileOrderSummary from "../Menu/MobileOrderSummary";
import Modal from "../pages/Modal";
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

interface OrderItem extends MenuItem {
  quantity: number;
}

export default function CustomerMenuPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [showPointPopup, setShowPointPopup] = useState<boolean>(false);
  const [availablePoints, setAvailablePoints] = useState<number>(0);
  const [usedPoints, setUsedPoints] = useState<number>(0);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [selectedCoupon, setSelectedCoupon] = useState<CustomerCoupon | null>(
    null
  );
  const [availableCoupons, setAvailableCoupons] = useState<CustomerCoupon[]>(
    []
  );
  const [showCouponPopup, setShowCouponPopup] = useState<boolean>(false);
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const numericStoreId = Number(storeId);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedMenuName, setSelectedMenuName] = useState("");
  const [selectedReviews, setSelectedReviews] = useState([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [onConfirm, setOnConfirm] = useState<(() => void) | null>(null);
  const [storeName, setStoreName] = useState<string>(""); // 상점 이름 상태 추가

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
      setAlertMessage("리뷰를 불러오는 데 실패했습니다.");
      setOnConfirm(null);
    }
  };

  useEffect(() => {
    const hasRedirected = sessionStorage.getItem("hasRedirected");
    if (!hasRedirected) {
      const currentUrl = window.location.pathname + window.location.search;
      sessionStorage.setItem("qr-redirect-url", currentUrl);
      sessionStorage.setItem("hasRedirected", "true");
      navigate("/index");
    }
  }, [navigate]);

  useEffect(() => {
    // 상점 정보 가져오기
    const fetchStoreInfo = async () => {
      try {
        const storeResponse = await api.get(
          `/api/stores/${numericStoreId}/info`
        );
        setStoreName(storeResponse.data.storeName || "매장");
      } catch (error) {
        console.error("❌ 상점 정보 불러오기 실패:", error);
        setStoreName("매장"); // 기본값 설정
      }
    };

    fetchStoreInfo();

    api
      .get("/auth/me")
      .then((res) => {
        setIsLoggedIn(!!res.data.data);
        if (!!res.data.data) {
          api
            .get(`/api/customer/my-coupons/store/${numericStoreId}`)
            .then((res) => {
              setAvailableCoupons(res.data);
            })
            .catch((err) =>
              console.error("❌ 사용 가능한 쿠폰 불러오기 실패:", err.message)
            );
        }
      })
      .catch(() => setIsLoggedIn(false));

    api
      .get(`/api/Store/Menu?StoreNumber=${numericStoreId}`)
      .then((res) => {
        const availableMenus = res.data.filter(
          (menu: MenuItem) => menu.available
        );
        setMenus(availableMenus);
      })
      .catch((err) => console.error("❌ 메뉴 불러오기 실패:", err.message));

    api
      .post("/api/pointCheck")
      .then((res) => {
        if (res.status !== 200) throw new Error("포인트 요청 실패");
        return res.data;
      })
      .then((data) => setAvailablePoints(data.point))
      .catch((err) => console.error("❌ 포인트 불러오기 실패:", err.message));
  }, [numericStoreId]);

  const categories = [
    "전체",
    ...Array.from(new Set(menus.map((item) => item.category).filter(Boolean))),
  ];
  const filteredMenus =
    selectedCategory === "전체"
      ? menus
      : menus.filter((item) => item.category === selectedCategory);

  const handleAddToOrder = (item: MenuItem) => {
    setOrderItems((prev) => {
      const existing = prev.find((i) => i.menuName === item.menuName);
      if (existing) {
        return prev.map((i) =>
          i.menuName === item.menuName ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        return [...prev, { ...item, quantity: 1 }];
      }
    });
  };

  const handleRemoveFromOrder = (indexToRemove: number) => {
    setOrderItems((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleIncrease = (index: number) => {
    setOrderItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleDecrease = (index: number) => {
    setOrderItems((prev) =>
      prev
        .map((item, i) =>
          i === index ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const couponDiscount = React.useMemo(() => {
    if (!selectedCoupon) return 0;

    const applicableItems = selectedCoupon.applicableCategories?.length
      ? orderItems.filter((item) =>
          selectedCoupon.applicableCategories?.includes(item.category)
        )
      : orderItems;

    const applicableAmount = applicableItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    let discount = 0;
    if (selectedCoupon.discountType === "PERCENTAGE") {
      discount = applicableAmount * (selectedCoupon.discountValue / 100);
      if (selectedCoupon.discountLimit) {
        discount = Math.min(discount, selectedCoupon.discountLimit);
      }
    } else {
      // 정액 할인: 적용 가능한 금액을 초과할 수 없음 (마이너스 방지)
      discount = Math.min(selectedCoupon.discountValue, applicableAmount);
    }

    // 최종 할인 금액이 음수가 되지 않도록 보장
    return Math.max(0, Math.floor(discount));
  }, [orderItems, selectedCoupon]);

  // 총 금액 계산 시 마이너스 방지
  const totalAmount = Math.max(0, subtotal - couponDiscount - usedPoints);

  const handleSelectCoupon = (coupon: CustomerCoupon) => {
    // 카테고리별 적용 가능 여부 확인
    if (coupon.applicableCategories?.length) {
      const hasApplicableCategory = orderItems.some((item) =>
        coupon.applicableCategories?.includes(item.category)
      );

      if (!hasApplicableCategory) {
        setAlertMessage(
          `이 쿠폰은 ${coupon.applicableCategories.join(
            ", "
          )} 카테고리에만 적용 가능합니다.`
        );
        setOnConfirm(null);
        return;
      }
    }

    // 적용 가능한 메뉴들의 금액으로 최소 주문 금액 확인
    const applicableItems = coupon.applicableCategories?.length
      ? orderItems.filter((item) =>
          coupon.applicableCategories?.includes(item.category)
        )
      : orderItems;

    const applicableAmount = applicableItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    if (applicableAmount < (coupon.minimumOrderAmount || 0)) {
      setAlertMessage("쿠폰 적용 가능한 메뉴의 최소 주문 금액을 충족하지 않습니다.");
      setOnConfirm(null);
      return;
    }

    // 실제 할인 금액이 0보다 큰지 확인 (정액 할인 시 적용 가능 금액 부족 방지)
    let actualDiscount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      actualDiscount = applicableAmount * (coupon.discountValue / 100);
      if (coupon.discountLimit) {
        actualDiscount = Math.min(actualDiscount, coupon.discountLimit);
      }
    } else {
      actualDiscount = Math.min(coupon.discountValue, applicableAmount);
    }

    if (actualDiscount <= 0) {
      setAlertMessage("할인 적용이 불가능합니다 (적용 가능 금액 부족).");
      setOnConfirm(null);
      return;
    }

    setSelectedCoupon(coupon);
    setShowCouponPopup(false);
  };

  const handleSubmitOrder = async () => {
    if (orderItems.length === 0) {
      setAlertMessage("주문할 메뉴가 없습니다.");
      setOnConfirm(null);
      return;
    }

    const payload = [
      ...orderItems.map((item) => ({
        menuName: item.menuName,
        menuAmount: item.quantity,
        menuPrice: item.price,
        reviewed: false,
        active: false,
      })),
    ];

    if (selectedCoupon) {
      payload.push({
        menuName: `CouponUsed:${selectedCoupon.id}`,
        menuAmount: 1, // or coupon ID
        menuPrice: couponDiscount, // discount amount
        reviewed: false,
        active: false,
      });
    }

    if (usedPoints > 0) {
      payload.push({
        menuName: "UserPointUsedOrNotUsed",
        menuAmount: 1,
        menuPrice: usedPoints,
        reviewed: false,
        active: false,
      });
    }
    try {
      const redirectUrl = sessionStorage.getItem("qr-redirect-url") || "/";
      const res = await api.post(
        `/api/v1/kakao-pay/ready?storeId=${numericStoreId}&redirectUrl=${encodeURIComponent(
          redirectUrl
        )}`,
        payload,
        {
          headers: { "User-Agent": navigator.userAgent }, // 👈 꼭 포함
        }
      );

      if (res.status !== 200) throw new Error("주문 실패");

      //const data = res.data;
      const redirectUrlFromServer = res.data.redirectUrl;
      if (redirectUrlFromServer) {
        window.location.href = redirectUrlFromServer;
      } else {
        setAlertMessage("결제 페이지 이동에 실패했습니다.");
        setOnConfirm(null);
      }

      setOrderItems([]);
      setUsedPoints(0);
      setSelectedCoupon(null);
    } catch (err) {
      console.error("❌ 주문 실패:", err);
      setAlertMessage("주문에 실패했습니다.");
      setOnConfirm(null);
    }
  };

  // 선택된 쿠폰의 유효성을 검사하는 effect 추가
  useEffect(() => {
    if (selectedCoupon && orderItems.length > 0) {
      // 카테고리별 적용 가능 여부 확인 - 일부만 적용 가능해도 OK
      if (selectedCoupon.applicableCategories?.length) {
        const hasApplicableCategory = orderItems.some((item) =>
          selectedCoupon.applicableCategories?.includes(item.category)
        );

        // 적용 가능한 메뉴가 하나도 없을 때만 해제
        if (!hasApplicableCategory) {
          setSelectedCoupon(null);
          setAlertMessage(
            `선택하신 쿠폰은 ${selectedCoupon.applicableCategories.join(
              ", "
            )} 카테고리에만 적용 가능하여 자동으로 해제되었습니다.`
          );
          setOnConfirm(null);
          return;
        }
      }

      // 최소 주문 금액 확인 - 적용 가능한 메뉴들의 합계로 계산
      const applicableItems = selectedCoupon.applicableCategories?.length
        ? orderItems.filter((item) =>
            selectedCoupon.applicableCategories?.includes(item.category)
          )
        : orderItems;

      const applicableAmount = applicableItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      if (applicableAmount < (selectedCoupon.minimumOrderAmount || 0)) {
        setSelectedCoupon(null);
        setAlertMessage("쿠폰 적용 가능한 메뉴의 최소 주문 금액 미달로 쿠폰이 자동 해제되었습니다.");
        setOnConfirm(null);
        return;
      }

      // 실제 할인 금액이 0인지 확인 (정액 할인 시 적용 가능 금액 부족 방지)
      let actualDiscount = 0;
      if (selectedCoupon.discountType === "PERCENTAGE") {
        actualDiscount = applicableAmount * (selectedCoupon.discountValue / 100);
        if (selectedCoupon.discountLimit) {
          actualDiscount = Math.min(actualDiscount, selectedCoupon.discountLimit);
        }
      } else {
        actualDiscount = Math.min(selectedCoupon.discountValue, applicableAmount);
      }

      if (actualDiscount <= 0) {
        setSelectedCoupon(null);
        setAlertMessage("적용 가능 금액 부족으로 쿠폰이 자동 해제되었습니다.");
        setOnConfirm(null);
      }
    }
  }, [orderItems, selectedCoupon]);

  return (
    <div className="md:flex h-screen bg-gray-50 relative">
      <Helmet>
        <title>{storeName ? `${storeName}에서 뭐 먹지? 주문은 와따잇(WTE)!`: "오늘 뭐 먹지? 주문은 와따잇(WTE)!"}</title>
      </Helmet>
      <CategorySidebar
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onNavigateMyPage={() => navigate("/review")}
        onNavigateCouponPage={() => navigate("/my-coupons")} // 여기에서 경로 지정
        isLoggedIn={isLoggedIn}
      />

      <main className="w-full md:w-3/6 p-4 md:p-6 overflow-y-auto h-full pb-24">
        <h2 className="text-lg font-semibold mb-4">{selectedCategory} 메뉴</h2>
        <div className="space-y-6">
          {filteredMenus.length > 0 ? (
            filteredMenus.map((item, index) => (
              <MenuCard
                key={index}
                item={item}
                onAdd={() => handleAddToOrder(item)}
                onViewReviews={handleViewReviews}
              />
            ))
          ) : (
            <p className="text-gray-400">해당 카테고리 메뉴가 없습니다.</p>
          )}
        </div>
        {/* ✅ 여기를 추가! */}
        <div className="block md:hidden h-[120px]" />
      </main>

      <div className="hidden md:flex w-2/6 h-screen">
        <OrderSummary
          orderItems={orderItems}
          isLoggedIn={isLoggedIn}
          usedPoints={usedPoints}
          onRemove={handleRemoveFromOrder}
          onIncrease={handleIncrease}
          onDecrease={handleDecrease}
          onSubmitOrder={handleSubmitOrder}
          onUsePoint={() => setShowPointPopup(true)}
          totalAmount={totalAmount}
          subtotal={subtotal}
          couponDiscount={couponDiscount}
          selectedCoupon={selectedCoupon}
          onUseCoupon={() => setShowCouponPopup(true)}
          onCancelCoupon={() => setSelectedCoupon(null)}
        />
      </div>

      <MobileOrderSummary
        orderItems={orderItems}
        isLoggedIn={isLoggedIn}
        usedPoints={usedPoints}
        totalAmount={totalAmount}
        subtotal={subtotal}
        couponDiscount={couponDiscount}
        onSubmitOrder={handleSubmitOrder}
        onUsePoint={() => setShowPointPopup(true)}
        onUseCoupon={() => setShowCouponPopup(true)}
        onCancelCoupon={() => setSelectedCoupon(null)}
        selectedCoupon={selectedCoupon}
        disabled={orderItems.length === 0}
        showModal={showOrderModal}
        setShowModal={setShowOrderModal}
        onIncrease={handleIncrease} // ✅ 추가
        onDecrease={handleDecrease} // ✅ 추가
        onRemove={handleRemoveFromOrder} // ✅ 추가
      />

      {showPointPopup && (
        <PointPopup
          availablePoints={availablePoints}
          usedPoints={usedPoints}
          setUsedPoints={setUsedPoints}
          onClose={() => setShowPointPopup(false)}
        />
      )}

      {showCouponPopup && (
        <CouponPopup
          coupons={availableCoupons}
          onSelect={handleSelectCoupon}
          onClose={() => setShowCouponPopup(false)}
          currentOrderAmount={subtotal}
          orderItems={orderItems}
        />
      )}

      <ReviewModal
        open={reviewModalOpen}
        menuName={selectedMenuName}
        reviews={selectedReviews}
        onClose={() => setReviewModalOpen(false)}
      />
      {alertMessage && (
        <Modal
          message={alertMessage}
          onClose={() => {
            setAlertMessage(null);
            setOnConfirm(null);
          }}
          onConfirm={onConfirm ?? undefined}
          confirmText="확인"
        />
      )}
    </div>
  );
}
