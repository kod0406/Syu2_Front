import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../API/TokenConfig';

const DashboardHeader: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/api/stores/logout');
      alert('로그아웃되었습니다.');
      navigate('/owner/login');
    } catch (err: any) {
      console.error('로그아웃 오류:', err);
    }
  };

  const formattedDate = currentTime.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'long',
  });

  const formattedTime = currentTime.toLocaleTimeString('ko-KR');

  return (
    <div className="flex justify-between items-center p-2 bg-gray-800 text-white">
      <div className="flex-1"></div>
      <div className="flex-1 text-center">
        영업일자: {formattedDate} {formattedTime}
      </div>
      <div className="flex-1 flex justify-end">
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition duration-200 flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          로그아웃
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;
