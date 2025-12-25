import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4200/api',
	withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');

        const res = await axios.post('http://localhost:4200/api/Auth/refresh-token', 
          { refreshToken }, 
          { withCredentials: true }
        );

        if (res.status === 200) {
          localStorage.setItem('refreshToken', res.data.refreshToken);
          return api(originalRequest); 
        }
      } catch (refreshError) {
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;