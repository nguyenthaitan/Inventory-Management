/**
 * API Client
 * Wrapper tái sử dụng với error handling tổng quát
 */

import axios, { type AxiosInstance, AxiosError } from "axios";
import {
  type ApiResponse,
  type FetchOptions,
  type ApiErrorResponse,
  ErrorType,
} from "../types/api";

// API config từ environment
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const API_TIMEOUT = 30000;

/**
 * API Client class
 * Quản lý tất cả HTTP requests với error handling tổng quát
 */
class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor(baseURL = API_BASE_URL) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: API_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor - thêm token auth
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("auth_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor - xử lý error tổng quát
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        // Nếu token hết hạn, redirect to login
        if (error.response?.status === 401) {
          localStorage.removeItem("auth_token");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      },
    );
  }

  /**
   * Phân loại error type dựa vào HTTP status code
   */
  private getErrorType(statusCode?: number): ErrorType {
    switch (statusCode) {
      case 400:
        return ErrorType.VALIDATION_ERROR;
      case 401:
        return ErrorType.UNAUTHORIZED;
      case 403:
        return ErrorType.FORBIDDEN;
      case 404:
        return ErrorType.NOT_FOUND;
      case 500:
      case 502:
      case 503:
      case 504:
        return ErrorType.SERVER_ERROR;
      default:
        return ErrorType.UNKNOWN_ERROR;
    }
  }

  /**
   * Parse error response từ API hoặc network error
   */
  private parseError(error: AxiosError | Error): ApiErrorResponse {
    const axiosError = error as AxiosError<any>;

    if (axiosError.response) {
      // API returned error response
      const statusCode = axiosError.response.status;
      const responseData = axiosError.response.data;

      return {
        type: this.getErrorType(statusCode),
        statusCode,
        message:
          responseData?.message ||
          responseData?.error ||
          axiosError.message ||
          "An error occurred",
        data: responseData?.details || responseData,
        originalError: axiosError,
      };
    } else if (axiosError.request) {
      // Request made but no response
      return {
        type: ErrorType.NETWORK_ERROR,
        message:
          "No response from server. Please check your internet connection.",
        originalError: axiosError,
      };
    } else {
      // Error during request setup
      return {
        type: ErrorType.UNKNOWN_ERROR,
        message: error.message || "An unknown error occurred",
        originalError: error,
      };
    }
  }

  /**
   * GET request
   */
  async get<T = any>(
    url: string,
    options?: FetchOptions,
  ): Promise<
    { data: T; error: null } | { data: null; error: ApiErrorResponse }
  > {
    try {
      const response = await this.axiosInstance.get<ApiResponse<T>>(url, {
        params: options?.params,
        headers: options?.headers,
        timeout: options?.timeout,
      });

      return {
        data: response.data.data as T,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: this.parseError(error as Error),
      };
    }
  }

  /**
   * POST request
   */
  async post<T = any>(
    url: string,
    payload?: any,
    options?: FetchOptions,
  ): Promise<
    { data: T; error: null } | { data: null; error: ApiErrorResponse }
  > {
    try {
      const response = await this.axiosInstance.post<ApiResponse<T>>(
        url,
        payload,
        {
          params: options?.params,
          headers: options?.headers,
          timeout: options?.timeout,
        },
      );

      return {
        data: response.data.data as T,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: this.parseError(error as Error),
      };
    }
  }

  /**
   * PUT request
   */
  async put<T = any>(
    url: string,
    payload?: any,
    options?: FetchOptions,
  ): Promise<
    { data: T; error: null } | { data: null; error: ApiErrorResponse }
  > {
    try {
      const response = await this.axiosInstance.put<ApiResponse<T>>(
        url,
        payload,
        {
          params: options?.params,
          headers: options?.headers,
          timeout: options?.timeout,
        },
      );

      return {
        data: response.data.data as T,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: this.parseError(error as Error),
      };
    }
  }

  /**
   * DELETE request
   */
  async delete<T = any>(
    url: string,
    options?: FetchOptions,
  ): Promise<
    { data: T; error: null } | { data: null; error: ApiErrorResponse }
  > {
    try {
      const response = await this.axiosInstance.delete<ApiResponse<T>>(url, {
        params: options?.params,
        headers: options?.headers,
        timeout: options?.timeout,
      });

      return {
        data: response.data.data as T,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: this.parseError(error as Error),
      };
    }
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    url: string,
    payload?: any,
    options?: FetchOptions,
  ): Promise<
    { data: T; error: null } | { data: null; error: ApiErrorResponse }
  > {
    try {
      const response = await this.axiosInstance.patch<ApiResponse<T>>(
        url,
        payload,
        {
          params: options?.params,
          headers: options?.headers,
          timeout: options?.timeout,
        },
      );

      return {
        data: response.data.data as T,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: this.parseError(error as Error),
      };
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class để có thể extend hoặc custom
export default ApiClient;
