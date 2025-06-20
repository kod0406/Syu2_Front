'use client';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';


export default function CustomerMenuPage() {
  const [menus, setMenus] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [showPointPopup, setShowPointPopup] = useState(false);
  const [availablePoints, setAvailablePoints] = useState(0);
  const [usedPoints, setUsedPoints] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { storeId } = useParams(); 
  const navigate = useNavigate();
  const numericStoreId = Number(storeId);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedMenuName, setSelectedMenuName] = useState('');
  const [selectedReviews, setSelectedReviews] = useState([]);



useEffect(() => {
  const hasRedirected = sessionStorage.getItem('hasRedirected');
  if (!hasRedirected) {
    const currentUrl = window.location.pathname + window.location.search;
    sessionStorage.setItem('qr-redirect-url', currentUrl);
    sessionStorage.setItem('hasRedirected', 'true'); // ✅ 루프 방지
    navigate('/index');
  }
}, [navigate]);



  useEffect(() => {
    fetch('http://localhost:8080/auth/me', {
      method: 'GET',
      credentials: 'include'
    },)
      .then(res => res.json())
      .then(data => {
        if (data.data) setIsLoggedIn(true);
        else setIsLoggedIn(false);
      })
      .catch(() => setIsLoggedIn(false));

    fetch(`http://localhost:8080/api/Store/Menu?StoreNumber=${numericStoreId}`, {
      method: 'GET',
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        const availableMenus = data.filter(menu => menu.available); // ✅ 여기서 필터링
        setMenus(availableMenus);
      })
      .catch(err => console.error('❌ 메뉴 불러오기 실패:', err.message));


    fetch('http://localhost:8080/pointCheck', {
      method: 'POST',
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) throw new Error('포인트 요청 실패');
        return res.json();
      })
      .then(data => setAvailablePoints(data.point))
      .catch(err => console.error('❌ 포인트 불러오기 실패:', err.message));
  }, [numericStoreId]);

  const categories = ['전체', ...Array.from(new Set(menus.map(item => item.category).filter(Boolean)))];
  const filteredMenus = selectedCategory === '전체' ? menus : menus.filter(item => item.category === selectedCategory);

  const handleAddToOrder = (item) => {
    setOrderItems((prev) => {
      const existing = prev.find((i) => i.menuName === item.menuName);
      if (existing) {
        return prev.map((i) => i.menuName === item.menuName ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
        return [...prev, { ...item, quantity: 1 }];
      }
    });
  };

  const handleRemoveFromOrder = (indexToRemove) => {
    setOrderItems((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleIncrease = (index) => {
    setOrderItems((prev) => prev.map((item, i) => i === index ? { ...item, quantity: item.quantity + 1 } : item));
  };

  const handleDecrease = (index) => {
    setOrderItems((prev) =>
      prev.map((item, i) => i === index ? { ...item, quantity: item.quantity - 1 } : item).filter(item => item.quantity > 0)
    );
  };

  const handleViewReviews = async (menuId, menuName) => {
    try {
      const res = await fetch(`http://localhost:8080/review/show?menuId=${menuId}`, {
        method: 'GET',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('리뷰 불러오기 실패');
      const data = await res.json();
      setSelectedReviews(data);
      setSelectedMenuName(menuName);
      setReviewModalOpen(true);
    } catch (err) {
      console.error('❌ 리뷰 보기 실패:', err.message);
      alert('리뷰를 불러오는 데 실패했습니다.');
    }
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
        menuPrice: usedPoints
      });
    }

    try {
      const redirectUrl = sessionStorage.getItem('qr-redirect-url') || '/';
      const res = await fetch(`http://localhost:8080/api/v1/kakao-pay/ready?storeId=${numericStoreId}&redirectUrl=${encodeURIComponent(redirectUrl)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });


      if (!res.ok) throw new Error('주문 실패');

      const data = await res.json();
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
      <aside className="w-1/6 bg-white border-r p-4 flex flex-col h-full justify-between">
        <div>
          <h1 className="text-xl font-bold mb-4">menu</h1>
          <nav className="space-y-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`block text-left px-2 py-1 rounded ${selectedCategory === cat ? 'bg-red-500 text-white' : 'text-red-500 hover:font-semibold'}`}
              >
                {cat}
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-4 p-2">
          <button
            onClick={() => navigate('/review')}  // ✅ 페이지 이동
            className="w-full h-24 border-2 border-red-500 text-red-500 rounded"
          >
            마이페이지
          </button>
        </div>
      </aside>

{reviewModalOpen && (
  <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded shadow-lg w-[500px] max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">{selectedMenuName} 리뷰</h2>
        <button onClick={() => setReviewModalOpen(false)} className="text-gray-500 hover:text-black text-xl">×</button>
      </div>
      {selectedReviews.length > 0 ? (
        <ul className="space-y-4">
          {selectedReviews.map((review, i) => (
            <li key={i} className="border rounded p-4 text-sm space-y-2">
              <p className="text-yellow-500 font-semibold">⭐ {review.rating.toFixed(1)} / 5</p>
              <p className="text-gray-700">{review.comment}</p>
              {review.imageUrl &&
                review.imageUrl.trim().toUpperCase() !== 'NULL' &&
                review.imageUrl.trim() !== '' && (
                  <img
                    src={review.imageUrl}
                    alt="리뷰 이미지"
                    className="w-full h-40 object-cover rounded border"
                  />
              )}

              <p className="text-right text-xs text-gray-500">
                작성일: {new Date(review.reviewDate).toLocaleDateString('ko-KR')}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">아직 등록된 리뷰가 없습니다.</p>
      )}
    </div>
  </div>
)}


<main className="w-3/6 p-6 overflow-y-auto h-full">
  <h2 className="text-lg font-semibold mb-4">{selectedCategory} 메뉴</h2>
  <div className="space-y-6">
    {filteredMenus.length > 0 ? (
      filteredMenus.map((item, index) => (
        <div key={index} className="relative flex gap-4 bg-white rounded shadow p-4">
          {/* 리뷰 보기 버튼 - 이미지 우측 상단 */}
          <button
            onClick={() => handleViewReviews(item.menuId, item.menuName)}
            className="absolute top-2 right-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
          >
            리뷰 보기
          </button>

          {/* 메뉴 이미지 */}
          <img
            src={item.imageUrl}
            alt={item.menuName}
            className="w-40 h-28 object-cover rounded"
          />

          {/* 메뉴 정보 */}
          <div className="flex flex-col justify-between flex-1">
            <div>
              {/* 메뉴 이름 + 별점 */}
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">{item.menuName}</h3>
                <span className="text-yellow-500 font-medium text-sm">
                  ⭐ {item.rating.toFixed(1)} / 5
                </span>
              </div>

              <p className="text-red-600 font-semibold">
                ₩{item.price.toLocaleString()}
              </p>
              <p className="text-gray-500 text-sm">{item.description}</p>
            </div>

            {/* 담기 버튼 */}
            <button
              onClick={() => handleAddToOrder(item)}
              className="mt-2 px-3 py-1 bg-orange-500 text-white rounded"
            >
              담기
            </button>
          </div>
        </div>
      ))
    ) : (
      <p className="text-gray-400">해당 카테고리 메뉴가 없습니다.</p>
    )}
  </div>
</main>


      <aside className="w-2/6 bg-white border-l p-4 flex flex-col justify-between h-full">
        <div className="flex-1 overflow-y-auto">
          <h3 className="text-lg font-bold mb-2">주문서</h3>
          {orderItems.length === 0 ? (
            <p className="text-gray-400">메뉴를 선택해 주세요.</p>
          ) : (
            <ul className="space-y-2">
              {orderItems.map((item, index) => (
                <li key={index} className="flex justify-between items-center text-sm">
                  <div className="flex flex-col">
                    <span>{item.menuName} x{item.quantity}</span>
                    <span className="text-gray-500 text-xs">₩{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleDecrease(index)} className="px-2 bg-gray-200 rounded">-</button>
                    <button onClick={() => handleIncrease(index)} className="px-2 bg-gray-200 rounded">+</button>
                    <button onClick={() => handleRemoveFromOrder(index)} className="text-red-500 hover:text-red-700 ml-2">X</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            {isLoggedIn && (
              <div className="flex items-center gap-2">
                <button className="text-sm px-3 py-1 bg-yellow-300 rounded text-black" onClick={() => setShowPointPopup(true)}>
                  포인트 사용
                </button>
                {usedPoints > 0 && <span className="text-sm text-blue-600">-₩{usedPoints.toLocaleString()}</span>}
              </div>
            )}
            <p className="text-right font-bold">합계 ₩{totalAmount.toLocaleString()}</p>
          </div>
          <button className="w-full mb-2 px-4 py-2 bg-gray-300 rounded text-gray-600">주문내역 보기</button>
          <button className="w-full px-4 py-2 bg-red-500 text-white rounded" onClick={handleSubmitOrder}>주문하기</button>
        </div>

        {showPointPopup && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-md w-80">
              <h2 className="text-lg font-bold mb-2">포인트 사용</h2>
              <p className="mb-2">보유 포인트: <strong>{availablePoints.toLocaleString()}</strong>원</p>
              <input
                type="number"
                min="0"
                max={availablePoints}
                value={usedPoints === 0 ? '' : usedPoints} // 0일 때는 빈 문자열로
                onChange={(e) => setUsedPoints(Math.min(availablePoints, Number(e.target.value)))}
                className="w-full mb-4 p-2 border rounded"
              />

              <div className="flex justify-end gap-2">
                <button onClick={() => setShowPointPopup(false)} className="px-4 py-2 bg-gray-200 rounded">취소</button>
                <button
                  onClick={() => setShowPointPopup(false)}
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  사용하기
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
