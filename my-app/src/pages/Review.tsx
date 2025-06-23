'use client';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ReviewItem {
  statisticsId: number;
  storeName: string;
  orderDetails: string[] | string;
  orderPrice: number;
  date: string;
}

export default function ReviewListPage() {
  const [reviewList, setReviewList] = useState<ReviewItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8080/review/ListShow', {
      method: 'GET',
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => setReviewList(data))
      .catch(err => console.error('❌ 리뷰 목록 불러오기 실패:', err));
  }, []);

  const handleWriteReview = (statisticsId: number) => {
    navigate(`/review/write?statId=${statisticsId}`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">주문 내역</h2>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          메뉴로 돌아가기
        </button>
      </div>

      {reviewList.length === 0 ? (
        <p className="text-gray-500">불러올 주문 내역이 없습니다.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {reviewList.map((item, index) => (
            <li
              key={index}
              className="border p-4 rounded shadow bg-white flex flex-col justify-between w-full"
            >
              <div className="space-y-1">
                <p><strong>가게 이름:</strong> {item.storeName}</p>
                <p className="break-words whitespace-pre-wrap">
                  <strong>메뉴:</strong>{' '}
                  {Array.isArray(item.orderDetails)
                    ? item.orderDetails.join(', ')
                    : item.orderDetails}
                </p>
                <p><strong>가격:</strong> ₩{item.orderPrice.toLocaleString()}</p>
                <p><strong>날짜:</strong> {new Date(item.date).toLocaleDateString('ko-KR')}</p>
              </div>
              <div className="mt-4 self-end">
                <button
                  onClick={() => handleWriteReview(item.statisticsId)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 whitespace-nowrap"
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
