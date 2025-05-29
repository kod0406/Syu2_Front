'use client';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ 추가

export default function ReviewListPage() {
  const [reviewList, setReviewList] = useState([]);
  const navigate = useNavigate(); // ✅ 추가

  useEffect(() => {
    fetch('http://localhost:8080/review/ListShow', {
      method: 'GET',
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => setReviewList(data))
      .catch(err => console.error('❌ 리뷰 목록 불러오기 실패:', err));
  }, []);

  const handleWriteReview = (statisticsId) => {
  navigate(`/review/write?statId=${statisticsId}`); // 쿼리 파라미터로 넘김
};

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">주문 내역</h2>
      {reviewList.length === 0 ? (
        <p className="text-gray-500">불러올 주문 내역이 없습니다.</p>
      ) : (
        <ul className="space-y-4 max-w-2xl">
          {reviewList.map((item, index) => (
            <li
              key={index}
              className="flex justify-between items-start border p-4 rounded shadow bg-white"
            >
              <div className="space-y-1">
                <p><strong>가게 이름:</strong> {item.storeName}</p>
                <p><strong>메뉴:</strong> {Array.isArray(item.orderDetails) ? item.orderDetails.join(', ') : item.orderDetails}</p>
                <p><strong>가격:</strong> ₩{item.orderPrice.toLocaleString()}</p>
                <p><strong>날짜:</strong> {new Date(item.date).toLocaleDateString('ko-KR')}</p>
              </div>
              <div>
                <button
                  onClick={() => handleWriteReview(item.statisticsId)} // ✅ 여기가 핵심
                  className="ml-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 whitespace-nowrap"
                >
                  리뷰 쓰기
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
