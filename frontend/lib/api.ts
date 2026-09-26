/**
 * Core API Client with automatic JSON parsing and error handling
 */
import { DisasterPlatformError } from '../utils/errors';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const ML_API_BASE_URL = process.env.NEXT_PUBLIC_ML_API_URL || 'http://localhost:8000';

interface RequestOptions extends RequestInit {
  useMlEngine?: boolean;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { useMlEngine, headers, ...customConfig } = options;
  const baseUrl = useMlEngine ? ML_API_BASE_URL : API_BASE_URL;
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
