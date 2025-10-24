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
  response => {
    // 如果是blob响应，直接返回
    if (response.config.responseType === 'blob') {
      return response;
    }
    
    const res = response.data;
    console.log('响应拦截器收到数据:', res);
    // 检查是否有code字段且不是成功状态
    if (res.code !== undefined && res.code !== 200) {
      console.log('检测到错误响应，code:', res.code, 'message:', res.message);
      // 抛出错误，包含完整响应信息
      const error = new Error(res.message || '请求失败');
      error.response = { data: res };
      return Promise.reject(error);
    }
    console.log('响应成功，返回数据');
    return res;
  },
  error => {
    console.log('响应拦截器出错:', error);
    return Promise.reject(error);
  }
);

export default service;
