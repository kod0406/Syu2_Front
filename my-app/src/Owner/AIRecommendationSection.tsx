import React, { useState, useEffect } from 'react';
import api from '../API/TokenConfig';

interface WeatherInfo {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: {
    main: string;
    description: string;
    icon: string;
  }[];
  name?: string;
}

interface MenuAnalysis {
  menuName: string;
  averageRating: number;
  reviewCount: number;
}

interface AIRecommendation {
  storeId: number;
  weatherInfo: {
    weather: WeatherInfo;
    weatherType: string;
    season: string;
  };
  menuAnalysis: MenuAnalysis[];
  suggestedCategories: string[];
  aiAdvice: string;
  generatedAt: string;
  fromCache: boolean;
}

interface Props {
  storeId: number;
}

const AIRecommendationSection: React.FC<Props> = ({ storeId }) => {
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendation = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(`[인기 메뉴 분석] API 요청 시작: GET /api/stores/${storeId}/recommendations`);
      const response = await api.get(`/api/stores/${storeId}/recommendations`);
      console.log('[인기 메뉴 분석] 전체 API 응답:', response.data);
      console.log('[인기 메뉴 분석] menuAnalysis 데이터:', response.data?.menuAnalysis);

      if (response.data?.menuAnalysis) {
        console.log('[인기 메뉴 분석] menuAnalysis 배열 길이:', response.data.menuAnalysis.length);
        response.data.menuAnalysis.forEach((menu: MenuAnalysis, index: number) => {
          console.log(`[인기 메뉴 분석] 메뉴 ${index + 1}:`, {
            menuName: menu.menuName,
            averageRating: menu.averageRating,
            reviewCount: menu.reviewCount
          });
        });
      } else {
        console.log('[인기 메뉴 분석] ⚠️ menuAnalysis 데이터가 없습니다');
      }

      setRecommendation(response.data);
    } catch (err) {
      setError('AI 추천 정보를 불러오는데 실패했습니다.');
      console.error('[인기 메뉴 분석] ❌ API 에러:', err);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  const refreshRecommendation = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/api/stores/${storeId}/recommendations/refresh`);
      setRecommendation(response.data);
    } catch (err) {
      setError('AI 추천 갱신에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (storeId) {
      fetchRecommendation();
    }
  }, [storeId, fetchRecommendation]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-blue-600">AI 추천 정보를 불러오는 중...</span>
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
            onClick={fetchRecommendation}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!recommendation) {
    return null;
  }

  const { weatherInfo, menuAnalysis, suggestedCategories, aiAdvice, fromCache } = recommendation;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
          </svg>
          AI 메뉴 추천
        </h2>
        <div className="flex items-center space-x-2">
          {fromCache && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              캐시됨
            </span>
          )}
          <button
            onClick={refreshRecommendation}
            className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 text-sm flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            갱신
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 날씨 정보 카드 */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
            현재 날씨
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-800">
                {weatherInfo.weather.main.temp}°C
              </div>
              <div className="text-sm text-gray-600">
                체감 {weatherInfo.weather.main.feels_like}°C
              </div>
              <div className="text-sm text-gray-600">
                습도 {weatherInfo.weather.main.humidity}%
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-medium text-gray-700">
                {weatherInfo.weather.weather && weatherInfo.weather.weather[0]?.description}
              </div>
              {/* 필요시 도시명 등 추가 표시 가능 */}
              <div className="text-sm text-gray-500">
                {weatherInfo.weather.name}
              </div>
            </div>
          </div>
        </div>

        {/* 추천 카테고리 */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
            </svg>
            추천 카테고리
          </h3>
          <div className="flex flex-wrap gap-2">
            {suggestedCategories.map((category, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 인기 메뉴 분석 */}
      <div className="bg-white rounded-lg p-4 shadow-sm mt-4">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          인기 메뉴 분석
        </h3>
        {menuAnalysis && menuAnalysis.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {menuAnalysis.map((menu, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="font-medium text-gray-800">{menu.menuName}</div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                    <span className="text-sm font-medium">{menu.averageRating?.toFixed(1) || "-"}</span>
                  </div>
                  <span className="text-xs text-gray-500">리뷰 {menu.reviewCount || 0}개</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            <div className="text-sm">아직 분석할 메뉴 데이터가 충분하지 않습니다.</div>
            <div className="text-xs text-gray-400 mt-1">리뷰가 더 많이 쌓이면 인기 메뉴 분석을 제공합니다.</div>
          </div>
        )}
      </div>

      {/* AI 조언 */}
      <div className="bg-white rounded-lg p-4 shadow-sm mt-4">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
          AI 조언
        </h3>
        <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded-r-lg">
          <div
            className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: aiAdvice }}
          />
        </div>
      </div>
    </div>
  );
};

export default AIRecommendationSection;