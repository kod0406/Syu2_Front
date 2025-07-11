import React, { useState, useEffect } from 'react';
import api from '../API/TokenConfig';

interface WeatherInfo {
  temp: number;
  feels_like: number;
  humidity: number;
  description: string;
  main: string;
  icon: string;
  pressure: number;
  visibility: number;
}

interface LocationInfo {
  latitude: number;
  longitude: number;
  city: string;
  district: string;
  fullAddress: string;
  weatherRegionCode: string;
}

interface StoreInfo {
  storeId: number;
  storeName: string;
  storeAddress: string;
}

interface StoreWeatherInfo {
  store: StoreInfo;
  location: LocationInfo;
  weather: WeatherInfo;
  weatherType: string;
  season: string;
}

interface Props {
  storeId: number;
}

const WeatherDashboard: React.FC<Props> = ({ storeId }) => {
  const [weatherInfo, setWeatherInfo] = useState<StoreWeatherInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      // console.log('[WeatherDashboard] 요청 URL:', `/api/stores/${storeId}/recommendations/weather`);
      const response = await api.get(`/api/stores/${storeId}/recommendations/weather`);
      console.log('[WeatherDashboard] 응답 데이터:', response.data);
      const data = response.data;
      const weatherData = data.weather;
      if (!weatherData || !weatherData.main || !weatherData.weather || !Array.isArray(weatherData.weather) || !weatherData.weather[0]) {
        setError('날씨 데이터가 올바르지 않습니다.');
        setWeatherInfo(null);
        return;
      }
      const weather: WeatherInfo = {
        temp: weatherData.main.temp,
        feels_like: weatherData.main.feels_like,
        humidity: weatherData.main.humidity,
        description: weatherData.weather[0].description || '',
        main: weatherData.weather[0].main || '',
        icon: weatherData.weather[0].icon || '',
        pressure: weatherData.main.pressure,
        visibility: weatherData.visibility,
      };
      const location: LocationInfo = {
        latitude: data.weather?.coord?.lat || 0,
        longitude: data.weather?.coord?.lon || 0,
        city: data.city || '',
        district: data.district || '',
        fullAddress: data.locationSummary || '',
        weatherRegionCode: '',
      };
      const store: StoreInfo = {
        storeId: data.storeId || storeId,
        storeName: data.storeName || '',
        storeAddress: data.locationSummary || '',
      };
      const weatherType = data.weatherType || 'CLOUDY';
      const season = data.season || 'SPRING';
      setWeatherInfo({ store, location, weather, weatherType, season });
    } catch (err) {
      // console.error('[WeatherDashboard] 에러:', err);
      setError('날씨 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (storeId) {
      fetchWeatherInfo();
    }
  }, [storeId]);

  // 모달이 열릴 때 body 스크롤 방지
  useEffect(() => {
    // WeatherDashboard가 마운트될 때 스크롤 방지
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-blue-600">날씨 정보를 불러오는 중...</span>
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
            onClick={fetchWeatherInfo}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!weatherInfo) {
    return null;
  }

  const { store, location, weather, weatherType, season } = weatherInfo;

  const getWeatherIcon = (weatherType: string) => {
    switch (weatherType) {
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

  return (
    <div className="bg-gradient-to-br from-blue-50 to-sky-100 rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path>
          </svg>
          날씨 정보
        </h2>
        <button
          onClick={fetchWeatherInfo}
          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 text-sm flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          새로고침
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 메인 날씨 정보 */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-4xl font-bold text-gray-800 flex items-center">
                {weather.temp}°C
                <span className="text-2xl ml-2">{getWeatherIcon(weatherType)}</span>
              </div>
              <div className="text-lg text-gray-600 mt-1">
                {weather.description}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl mb-1">{getSeasonIcon(season)}</div>
              <div className="text-sm text-gray-500">{season}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-sm text-gray-600">체감온도</div>
              <div className="text-lg font-semibold text-blue-600">
                {weather.feels_like}°C
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-sm text-gray-600">습도</div>
              <div className="text-lg font-semibold text-green-600">
                {weather.humidity}%
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="text-sm text-gray-600">기압</div>
              <div className="text-lg font-semibold text-purple-600">
                {weather.pressure} hPa
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3">
              <div className="text-sm text-gray-600">가시거리</div>
              <div className="text-lg font-semibold text-yellow-600">
                {weather.visibility / 1000} km
              </div>
            </div>
          </div>
        </div>

        {/* 매장 위치 정보 */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            매장 정보
          </h3>

          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-600">매장명</div>
              <div className="font-medium text-gray-800">{store.storeName}</div>
            </div>

            <div>
              <div className="text-sm text-gray-600">주소</div>
              <div className="font-medium text-gray-800">{location.fullAddress}</div>
            </div>

            <div>
              <div className="text-sm text-gray-600">도시/구</div>
              <div className="font-medium text-gray-800">{location.city} {location.district}</div>
            </div>

            {/* 유용한 정보: 날씨 요약 */}
            <div>
              <div className="text-sm text-gray-600">날씨 요약</div>
              <div className="font-medium text-blue-700">{weather.description}, {weather.temp}°C (체감 {weather.feels_like}°C)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherDashboard;
