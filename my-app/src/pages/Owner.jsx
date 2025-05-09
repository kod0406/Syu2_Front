import React, { useState, useEffect } from 'react';
export default function OwnerDashboard() {
  return (
    <div className="p-4">
      <DashboardHeader />
      <DashboardMenu />
      <TableGrid />
    </div>
  );
}

function DashboardHeader() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer); // 컴포넌트 언마운트 시 clear
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
  const menus = ['매출 통계'];
  return (
    <div className="flex space-x-2 p-2">
      {menus.map(menu => (
        <button key={menu} className="px-4 py-2 bg-gray-200 rounded">{menu}</button>
      ))}
    </div>
  );
}

function TableGrid() {
  const tables = Array.from({ length: 12 }, (_, i) => i + 1);
  return (
    <div className="grid grid-cols-4 gap-4 p-4">
      {tables.map(num => (
        <div key={num} className="border h-24 flex flex-col items-center justify-center bg-white shadow">
          <div>{num.toString().padStart(2, '0')}</div>
          <button className="text-2xl">+</button>
        </div>
      ))}
    </div>
  );
}
