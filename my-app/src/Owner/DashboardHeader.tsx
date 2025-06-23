import React, { useState, useEffect } from 'react';

const DashboardHeader: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
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
      <div>영업일자: {formattedDate} {formattedTime}</div>
    </div>
  );
};

export default DashboardHeader;
