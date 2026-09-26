import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ENV } from '../../config/environment';
import { TokenManager } from '../../security/token-manager';

export const apiClient: AxiosInstance = axios.create({
  baseURL: ENV.API_URL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const mlApiClient: AxiosInstance = axios.create({
  baseURL: ENV.ML_API_URL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const tokens = await TokenManager.getTokens();
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});
