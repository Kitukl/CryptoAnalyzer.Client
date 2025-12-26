import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4200/api',
  withCredentials: true, // Обов'язково для роботи з HttpOnly Cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 1. ЗАПОБІЖНИК: Якщо запит на перевірку профілю впав — не рефрешимо і не релодимо.
    // Це зупиняє нескінченний релоад при старті додатка.
    if (originalRequest.url?.includes('/get-user')) {
      return Promise.reject(error);
    }

    // 2. Логіка 401 (Unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');

      // Якщо рефреш-токена немає в стореджі — навіть не намагаємось оновлювати
      if (!refreshToken) {
        return Promise.reject(error);
      }

      try {
        // Використовуємо чистий axios, щоб не зациклити інтерцептор
        const res = await axios.post('http://localhost:4200/api/Auth/refresh-token', 
          { refreshToken }, 
          { withCredentials: true }
        );

        if (res.status === 200) {
          localStorage.setItem('refreshToken', res.data.refreshToken);
          
          // Повторюємо оригінальний запит з новим токеном
          return api(originalRequest); 
        }
      } catch (refreshError) {
        // Якщо рефреш не вдався — чистимо сміття
        localStorage.removeItem('refreshToken');
        
        // РЕДИРЕКТ: Тільки якщо ми НЕ на сторінках входу, щоб не зациклити релоад
        if (!window.location.pathname.includes('/login') && 
            !window.location.pathname.includes('/register')) {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;