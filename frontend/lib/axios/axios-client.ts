'use client';

import axios from 'axios';
import { SuccessAuth } from '@/types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('No  API URL provided.');
}

export const clientAxios = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

clientAxios.interceptors.request.use(
  async (config) => {
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('access_token');
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

clientAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status == 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh_res = await axios.post<SuccessAuth>(
          `${API_URL}/auth/refresh/`,
          null,
          {
            withCredentials: true,
          },
        );

        const newAccessToken = refresh_res.data.access_token;

        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', newAccessToken);
        }
        clientAxios.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

        console.log('✅Success refresh token');
        return await clientAxios(originalRequest);
      } catch {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          console.warn('🔅Failed to refreh token');
          window.location.href = '/sign-in';
        }
      }
    }
    return Promise.reject(error);
  },
);
