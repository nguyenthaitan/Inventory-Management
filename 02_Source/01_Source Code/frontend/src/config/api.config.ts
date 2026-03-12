/**
 * API Configuration
 * Defines base URL and defaults for API requests
 */

// Use environment variable or default to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
};

export const API_ENDPOINTS = {
  MATERIALS: "/materials",
  MATERIALS_SEARCH: "/materials/search",
  MATERIALS_TYPES: "/materials/types",
  MATERIALS_DETAIL: (id: string) => `/materials/${id}`,
  MATERIALS_UPDATE: (id: string) => `/materials/${id}`,
  MATERIALS_DELETE: (id: string) => `/materials/${id}`,
  MATERIALS_FILTER_TYPE: (type: string) => `/materials/type/${type}`,
};
