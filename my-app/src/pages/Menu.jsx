'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function CustomerMenuPage() {
  const [menus, setMenus] = useState([]);
  const [orderItems, setOrderItems] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8080/api/Store/Menu?StoreNumber=2')
      .then((res) => {
        console.log('메뉴 응답:', res.data);
        setMenus(res.data);
      })
      .catch((err) => console.error('메뉴 불러오기 실패:', err));
  }, []);

  const handleAddToOrder = (item) => {
    setOrderItems((prev) => [...prev, item]);
  };

  const handleRemoveFromOrder = (indexToRemove) => {
    setOrderItems((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const totalAmount = orderItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 중앙 메뉴 영역 */}
      <main className="w-3/4 p-6 overflow-y-auto h-full">
        <h2 className="text-lg font-semibold mb-4">전체 메뉴</h2>
        <div className="space-y-6">
          {menus.length > 0 ? (
            menus.map((item, index) => (
              <div key={index} className="flex gap-4 bg-white rounded shadow p-4">
                <img src={item.imageUrl} alt={item.name} className="w-40 h-28 object-cover rounded" />
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
            <p className="text-gray-400">메뉴가 없습니다.</p>
          )}
        </div>
      </main>

      {/* 오른쪽 주문서 */}
      <aside className="w-1/4 bg-white border-l p-4 flex flex-col justify-between h-full">
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
