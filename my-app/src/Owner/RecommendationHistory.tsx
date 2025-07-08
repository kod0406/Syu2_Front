import React, { useState, useEffect } from 'react';
import api from '../API/TokenConfig';

interface RecommendationHistoryItem {
  id: number;
  storeId: number;
  storeName: string;
  aiAdvice: string;  // 처리된 HTML 텍스트
  rawAiAdvice?: string;  // 원본 텍스트 (옵션)
  weatherCondition: string;
  season: string;
  createdAt: string;
}

interface Props {
  storeId: number;
}

const RecommendationHistory: React.FC<Props> = ({ storeId }) => {
  const [history, setHistory] = useState<RecommendationHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState(7);
  const [selectedItem, setSelectedItem] = useState<RecommendationHistoryItem | null>(null);

  const fetchHistory = React.useCallback(async (days: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/stores/${storeId}/recommendations/history?days=${days}`);
      setHistory(response.data);
    } catch (err) {
      setError('추천 히스토리를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    if (storeId) {
      fetchHistory(selectedDays);
    }
  }, [storeId, selectedDays, fetchHistory]);

  // 상세보기 모달이 열릴 때 데이터 확인
  useEffect(() => {
    if (selectedItem) {
      console.log('RecommendationHistory 상세보기 - 선택된 아이템:', selectedItem);
      console.log('aiAdvice 내용:', selectedItem.aiAdvice);
    }
  }, [selectedItem]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getWeatherIcon = (weatherCondition: string) => {
    switch (weatherCondition) {
      case 'SUNNY':
        return '☀️';
      case 'CLOUDY':
        return '☁️';
      case 'RAINY':
        return '🌧️';
      case 'SNOWY':
        return '❄️';
      default:
        return '🌤️';
    }
  };

  const getSeasonIcon = (season: string) => {
    switch (season) {
      case 'SPRING':
        return '🌸';
      case 'SUMMER':
        return '🌞';
      case 'AUTUMN':
        return '🍂';
      case 'WINTER':
        return '❄️';
      default:
        return '🌤️';
    }
  };

  const daysOptions = [
    { value: 7, label: '최근 7일' },
    { value: 30, label: '최근 30일' },
    { value: 90, label: '최근 90일' }
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-blue-600">추천 히스토리를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.098 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <span className="text-red-700">{error}</span>
          </div>
          <button
            onClick={() => fetchHistory(selectedDays)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          추천 히스토리
        </h2>
        <div className="flex items-center space-x-2">
          <select
            value={selectedDays}
            onChange={(e) => setSelectedDays(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {daysOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => fetchHistory(selectedDays)}
            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            새로고침
          </button>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-8">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <p className="text-gray-500">추천 히스토리가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getWeatherIcon(item.weatherCondition)}</span>
                  <span className="text-2xl">{getSeasonIcon(item.season)}</span>
                  <div>
                    <div className="font-medium text-gray-800">
                      {item.weatherCondition} · {item.season}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(item.createdAt)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedItem(item)}
                  className="px-3 py-1 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition duration-200 text-sm"
                >
                  상세보기
                </button>
              </div>

              {item.aiAdvice && (
                <div className="bg-indigo-50 border-l-4 border-indigo-400 p-3 rounded-r-lg">
                  <div
                    className="text-gray-700 text-sm line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: item.aiAdvice }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 상세보기 모달 */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">추천 상세 정보</h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl">{getWeatherIcon(selectedItem.weatherCondition)}</span>
                <span className="text-2xl">{getSeasonIcon(selectedItem.season)}</span>
                <div>
                  <div className="font-medium text-gray-800">
                    {selectedItem.weatherCondition} · {selectedItem.season}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(selectedItem.createdAt)}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">상세 추천 내용</h4>
                <div
                  className="text-sm text-gray-700 whitespace-pre-wrap prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedItem.aiAdvice }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationHistory;
