import axios from 'axios';

//TODO: 백엔드 URL 설정
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: `${API_URL}`,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// --- 인터셉터 로직 ---
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(); // 성공 시, 쿠키에 설정된 새 토큰으로 재시도하도록 resolve
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
    response => {
      console.log('✅ API 요청 성공:', response.config.method, response.config.url);
      return response;
    },
    async error => {
      const originalRequest = error.config;
      console.log('❌ API 요청 실패:', error.config.method, error.config.url, error.response?.status);

      if (error.response && (error.response.status === 401 || error.response.status === 403) && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
              .then(() => {
                return api(originalRequest);
              })
              .catch(err => {
                return Promise.reject(err);
              });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          console.log('🔄 토큰 갱신 시도 중...');
          await api.post('/api/auth/refresh-token');
          console.log('✅ 토큰 갱신 성공');
          processQueue(null);
          return api(originalRequest);
        } catch (refreshError) {
          console.error('❌ 토큰 갱신 실패:', refreshError);
          processQueue(refreshError);
          console.error('Unable to refresh token:', refreshError);
          if (typeof window !== 'undefined') {
            window.location.href = '/Error'; // 에러 페이지로 리다이렉트
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
      return Promise.reject(error);
    }
);
// --- 인터셉터 로직 끝 ---

export default api;
