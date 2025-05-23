import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function OwnerDashboard() {
  const storeId = useStoreIdFromQuery();
  const [storeInfo, setStoreInfo] = useState(null);

  useEffect(() => {
    if (storeId) {
      fetch(`http://localhost:8080/api/stores/${storeId}`)
        .then(res => res.json())
        .then(data => {
          setStoreInfo(data);
        })
        .catch(err => {
          console.error('가게 정보 불러오기 실패:', err);
        });
    }
  }, [storeId]);

  return (
    <div className="p-4">
      <DashboardHeader />
      {storeInfo && (
        <div className="text-sm text-gray-600 mb-2">
          📍 가게 이름: <b>{storeInfo.storeName}</b> (ID: {storeId})
        </div>
      )}
      <DashboardMenu />
    </div>
  );
}

// 쿼리스트링에서 storeId 추출
function useStoreIdFromQuery() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  return params.get('storeId');
}

function DashboardHeader() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'long',
  });
  const formattedTime = currentTime.toLocaleTimeString('ko-KR');

  return (
    <div className="flex justify-center p-2 bg-gray-800 text-white">
      <div>
        영업일자: {formattedDate} | 포스번호: 01 | 시간: {formattedTime}
      </div>
    </div>
  );
}

function DashboardMenu() {
  const menus = ['매출 통계', '메뉴 추가', '메뉴 수정', '메뉴 삭제'];

  return (
    <div className="flex space-x-2 p-2">
      {menus.map(menu => (
        <button key={menu} className="px-4 py-2 bg-gray-200 rounded">
          {menu}
        </button>
      ))}
    </div>
  );
}
