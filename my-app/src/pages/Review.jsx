'use client';
import React, { useEffect, useState } from 'react';

export default function ReviewListPage() {
  const [reviewList, setReviewList] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8080/review/ListShow', {
      method: 'GET',
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => setReviewList(data))
      .catch(err => console.error('❌ 리뷰 목록 불러오기 실패:', err));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">주문 내역</h2>
      {reviewList.length === 0 ? (
        <p className="text-gray-500">불러올 주문 내역이 없습니다.</p>
      ) : (
        <ul className="space-y-4">
          {reviewList.map((item, index) => (
            <li key={index} className="border p-4 rounded shadow bg-white">
              <p><strong>가게 이름:</strong> {item.storeName}</p>
              <p><strong>메뉴:</strong> {item.orderDetails}</p>
              <p><strong>가격:</strong> ₩{item.orderPrice.toLocaleString()}</p>
              <p><strong>날짜:</strong> {item.date}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
