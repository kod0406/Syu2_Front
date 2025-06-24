'use client';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CategorySidebar from '../Menu/CategorySidebar';
import MenuCard from '../Menu/MenuCard';
import OrderSummary from '../Menu/OrderSummary';
import PointPopup from '../Menu/PointPopup';
import ReviewModal from '../Menu/ReviewModal';
import api from '../API/TokenConfig';

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
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [showPointPopup, setShowPointPopup] = useState<boolean>(false);
  const [availablePoints, setAvailablePoints] = useState<number>(0);
  const [usedPoints, setUsedPoints] = useState<number>(0);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const numericStoreId = Number(storeId);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedMenuName, setSelectedMenuName] = useState('');
  const [selectedReviews, setSelectedReviews] = useState([]);

  const handleViewReviews = async (menuId: number, menuName: string) => {
    try {
      const res = await api.get(`/review/show?menuId=${menuId}`);
      if (res.status !== 200) throw new Error('리뷰 불러오기 실패');
      const data = res.data;
      setSelectedMenuName(menuName);
      setSelectedReviews(data);
      setReviewModalOpen(true);
    } catch (err) {
      console.error('❌ 리뷰 보기 실패:', err);
      alert('리뷰를 불러오는 데 실패했습니다.');
    }
  };

  useEffect(() => {
    const hasRedirected = sessionStorage.getItem('hasRedirected');
    if (!hasRedirected) {
      const currentUrl = window.location.pathname + window.location.search;
      sessionStorage.setItem('qr-redirect-url', currentUrl);
      sessionStorage.setItem('hasRedirected', 'true');
      navigate('/index');
    }
  }, [navigate]);

  useEffect(() => {
    api
      .get('/auth/me')
      .then(res => {
        setIsLoggedIn(!!res.data.data);
      })
      .catch(() => setIsLoggedIn(false));

    api
      .get(`/api/Store/Menu?StoreNumber=${numericStoreId}`)
      .then(res => {
        const availableMenus = res.data.filter((menu: MenuItem) => menu.available);
        setMenus(availableMenus);
      })
      .catch(err => console.error('❌ 메뉴 불러오기 실패:', err.message));

    api
      .post('/pointCheck')
      .then(res => {
        if (res.status !== 200) throw new Error('포인트 요청 실패');
        return res.data;
      })
      .then(data => setAvailablePoints(data.point))
      .catch(err => console.error('❌ 포인트 불러오기 실패:', err.message));
  }, [numericStoreId]);

  const categories = ['전체', ...Array.from(new Set(menus.map(item => item.category).filter(Boolean)))];
  const filteredMenus = selectedCategory === '전체' ? menus : menus.filter(item => item.category === selectedCategory);

  const handleAddToOrder = (item: MenuItem) => {
    setOrderItems((prev) => {
      const existing = prev.find((i) => i.menuName === item.menuName);
      if (existing) {
        return prev.map((i) => i.menuName === item.menuName ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
        return [...prev, { ...item, quantity: 1 }];
      }
    });
  };

  const handleRemoveFromOrder = (indexToRemove: number) => {
    setOrderItems((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleIncrease = (index: number) => {
    setOrderItems((prev) => prev.map((item, i) => i === index ? { ...item, quantity: item.quantity + 1 } : item));
  };

  const handleDecrease = (index: number) => {
    setOrderItems((prev) =>
      prev.map((item, i) => i === index ? { ...item, quantity: item.quantity - 1 } : item).filter(item => item.quantity > 0)
    );
  };

  const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmitOrder = async () => {
    if (orderItems.length === 0) {
      alert('주문할 메뉴가 없습니다.');
      return;
    }

    const payload = [...orderItems.map(item => ({
      menuName: item.menuName,
      menuAmount: item.quantity,
      menuPrice: item.price,
      reviewed : false,
      active : false
    }))];
    if (usedPoints > 0) {
      payload.push({
        menuName: 'UserPointUsedOrNotUsed',
        menuAmount: 1,
        menuPrice: usedPoints,
        reviewed: false,
        active: false
      });
    }
    try {
      const redirectUrl = sessionStorage.getItem('qr-redirect-url') || '/';
      const res = await api.post(
        `/api/v1/kakao-pay/ready?storeId=${numericStoreId}&redirectUrl=${encodeURIComponent(
          redirectUrl
        )}`,
        payload
      );

      if (res.status !== 200) throw new Error('주문 실패');

      const data = res.data;
      if (data.next_redirect_pc_url) {
        window.location.href = data.next_redirect_pc_url;
      } else {
        alert('결제 페이지 이동에 실패했습니다.');
      }

      setOrderItems([]);
      setUsedPoints(0);
    } catch (err) {
      console.error('❌ 주문 실패:', err);
      alert('주문에 실패했습니다.');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <CategorySidebar
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onNavigateMyPage={() => navigate('/review')}
      />

      <main className="w-3/6 p-6 overflow-y-auto h-full">
        <h2 className="text-lg font-semibold mb-4">{selectedCategory} 메뉴</h2>
        <div className="space-y-6">
          {filteredMenus.length > 0 ? (
            filteredMenus.map((item, index) => (
              <MenuCard key={index} item={item} onAdd={() => handleAddToOrder(item)}
              onViewReviews={handleViewReviews} />
            ))
          ) : (
            <p className="text-gray-400">해당 카테고리 메뉴가 없습니다.</p>
          )}
        </div>
      </main>

      <OrderSummary
        orderItems={orderItems}
        isLoggedIn={isLoggedIn}
        usedPoints={usedPoints}
        availablePoints={availablePoints}
        onRemove={handleRemoveFromOrder}
        onIncrease={handleIncrease}
        onDecrease={handleDecrease}
        onSubmitOrder={handleSubmitOrder}
        onUsePoint={() => setShowPointPopup(true)}
        totalAmount={totalAmount}
      />

      {showPointPopup && (
        <PointPopup
          availablePoints={availablePoints}
          usedPoints={usedPoints}
          setUsedPoints={setUsedPoints}
          onClose={() => setShowPointPopup(false)}
        />
      )}

      <ReviewModal
  open={reviewModalOpen}
  menuName={selectedMenuName}
  reviews={selectedReviews}
  onClose={() => setReviewModalOpen(false)}
/>
    </div>
  );
}
