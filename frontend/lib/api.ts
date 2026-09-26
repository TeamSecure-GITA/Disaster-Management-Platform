/**
 * Core API Client with automatic JSON parsing and error handling
 */
import { DisasterPlatformError } from '../utils/errors';

function getApiBaseUrl(): string {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) {
    const envUrl = String((import.meta as any).env.VITE_API_URL).replace(/\/$/, '');
    return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
  }
  if (typeof window !== 'undefined') {
    return '/api';
  }
  return 'http://localhost:5000/api';
}

function getMlApiBaseUrl(): string {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_ML_API_URL) {
    return String((import.meta as any).env.VITE_ML_API_URL).replace(/\/$/, '');
  }
  // Unified proxy: Backend and Vite dev proxy handle /ml-api transparently
  if (typeof window !== 'undefined') {
    return '/ml-api';
  }
  return 'http://localhost:8000';
}

interface RequestOptions extends RequestInit {
  useMlEngine?: boolean;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { useMlEngine, headers, ...customConfig } = options;
  const baseUrl = useMlEngine ? getMlApiBaseUrl() : getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const config: RequestInit = {
    method: customConfig.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...customConfig,
  };

  try {
    const response = await fetch(`${baseUrl}${cleanEndpoint}`, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new DisasterPlatformError(
        errorData.message || `Request failed with HTTP status ${response.status}`,
        response.status
      );
    }
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof DisasterPlatformError) {
      throw error;
    }
    throw new DisasterPlatformError(
      error instanceof Error ? error.message : 'Network failure reaching command API'
    );
  }
}
