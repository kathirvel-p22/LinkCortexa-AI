import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('lc_token');
      localStorage.removeItem('lc_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
