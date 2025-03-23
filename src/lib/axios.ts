import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const createAuthenticatedAxios = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: '/api',
  });
  
  // Add request interceptor to automatically add token
  instance.interceptors.request.use(
    (config: any): any => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      // Add token to headers if it exists
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  return instance;
};

export const api = createAuthenticatedAxios(); 