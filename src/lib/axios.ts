import axios, { AxiosInstance, AxiosError } from 'axios';

interface ErrorResponse {
  message?: string;
  success?: boolean;
  error?: string;
}

const createAuthenticatedAxios = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: '/api',
    withCredentials: true, // Enable sending cookies with requests
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  // Add response interceptor for better error handling
  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ErrorResponse>) => {
      // Log detailed error information
      console.error('API Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.response?.data?.message || error.message,
        path: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        data: error.response?.data,
        error: error
      });
      
      // If it's a 401 error, redirect to login
      if (error.response?.status === 401) {
        console.log('Unauthorized access, redirecting to login page');
        // Use window.location for client-side redirect
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      
      return Promise.reject(error);
    }
  );
  
  return instance;
};

export default createAuthenticatedAxios; 