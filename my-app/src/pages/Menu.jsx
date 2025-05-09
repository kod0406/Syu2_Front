'use client';
import React, { useState } from 'react';

export default function CustomerMenuPage() {
  const categories = ['BEST', '메인요리', 'NEW', '튀김요리', '사이드', '주류, 음료'];

  const menuItems = [
    { id: 1, category: 'BEST', name: '스페셜 메뉴', price: 38000, description: '랍스터 테일, 부채살, 새우', image: '/images/special.jpg' },
    { id: 2, category: 'BEST', name: '참치타다끼', price: 25000, description: '살짝 익힌 참치', image: '/images/tuna.jpg' },
    { id: 3, category: '메인요리', name: '스테이크', price: 30000, description: '육즙 가득 스테이크', image: '/images/steak.jpg' },
    { id: 4, category: '튀김요리', name: '새우튀김', price: 15000, description: '바삭한 새우튀김', image: '/images/shrimp.jpg' },
  ];

  const [selectedCategory, setSelectedCategory] = useState('BEST');
  const [orderItems, setOrderItems] = useState([]);

  const filteredMenu = menuItems.filter((item) => item.category === selectedCategory);

  const handleAddToOrder = (item) => {
    setOrderItems((prev) => [...prev, item]);
  };

  const handleRemoveFromOrder = (indexToRemove) => {
    setOrderItems((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const totalAmount = orderItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 왼쪽 카테고리 */}
      <aside className="w-1/6 bg-white border-r p-4 flex flex-col h-full">
        <h1 className="text-xl font-bold mb-4">menu.it</h1>
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
      </aside>

      {/* 중앙 메뉴 리스트 */}
      <main className="w-3/6 p-6 overflow-y-auto h-full">
        <h2 className="text-lg font-semibold mb-2">{selectedCategory} 메뉴</h2>
        <div className="space-y-6">
          {filteredMenu.length > 0 ? (
            filteredMenu.map((item) => (
              <div key={item.id} className="flex gap-4 bg-white rounded shadow p-4">
                <img src={item.image} alt={item.name} className="w-40 h-28 object-cover rounded" />
                <div className="flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="text-lg font-bold">{item.name}</h3>
                    <p className="text-red-600 font-semibold">₩{item.price.toLocaleString()}</p>
                    <p className="text-gray-500 text-sm">{item.description}</p>
                  </div>
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

      {/* 오른쪽 주문서 */}
      <aside className="w-2/6 bg-white border-l p-4 flex flex-col justify-between h-full">
        <div className="flex-1 overflow-y-auto">
          <h3 className="text-lg font-bold mb-2">주문서</h3>
          {orderItems.length === 0 ? (
            <p className="text-gray-400">메뉴를 선택해 주세요.</p>
          ) : (
            <ul className="space-y-2">
              {orderItems.map((item, index) => (
                <li key={index} className="flex justify-between items-center text-sm">
                  <div>
                    <span>{item.name}</span>
                    <span className="ml-2 text-gray-500">₩{item.price.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveFromOrder(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    X
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <p className="text-right font-bold mb-2">합계 ₩{totalAmount.toLocaleString()}</p>
          <button className="w-full mb-2 px-4 py-2 bg-gray-300 rounded text-gray-600">주문내역 보기</button>
          <button className="w-full px-4 py-2 bg-red-500 text-white rounded">주문하기</button>
        </div>
      </aside>
    </div>
  );
}
