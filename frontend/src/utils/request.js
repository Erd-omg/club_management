import axios from 'axios';
import store from '@/store';

const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API || '/api',
  timeout: 15000
});

service.interceptors.request.use(config => {
  const token = store.state.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

service.interceptors.response.use(
  response => response.data,
  error => {
    return Promise.reject(error);
  }
);

export default service;
