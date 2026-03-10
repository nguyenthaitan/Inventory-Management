/**
 * Material API Service
 * Handles all HTTP requests related to materials
 */

import axios from 'axios';
import type {
  Material,
  CreateMaterialRequest,
  UpdateMaterialRequest,
  MaterialQueryParams,
  MaterialQueryResult,
  MaterialStatistics,
} from '../types/material';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const MATERIALS_ENDPOINT = `${API_BASE_URL}/materials`;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const materialService = {
  /**
   * Get all materials with filtering and pagination
   */
  async getAllMaterials(params?: MaterialQueryParams): Promise<MaterialQueryResult> {
    const response = await apiClient.get<MaterialQueryResult>(MATERIALS_ENDPOINT, {
      params,
    });
    return response.data;
  },

  /**
   * Get material by ID
   */
  async getMaterialById(id: string): Promise<Material> {
    const response = await apiClient.get<Material>(`${MATERIALS_ENDPOINT}/${id}`);
    return response.data;
  },

  /**
   * Get material by part number
   */
  async getMaterialByPartNumber(partNumber: string): Promise<Material> {
    const response = await apiClient.get<Material>(
      `${MATERIALS_ENDPOINT}/part-number/${partNumber}`
    );
    return response.data;
  },

  /**
   * Get material by material_id
   */
  async getMaterialByMaterialId(materialId: string): Promise<Material> {
    const response = await apiClient.get<Material>(
      `${MATERIALS_ENDPOINT}/material-id/${materialId}`
    );
    return response.data;
  },

  /**
   * Create new material
   */
  async createMaterial(data: CreateMaterialRequest): Promise<Material> {
    const response = await apiClient.post<Material>(MATERIALS_ENDPOINT, data);
    return response.data;
  },

  /**
   * Update material
   */
  async updateMaterial(id: string, data: UpdateMaterialRequest): Promise<Material> {
    const response = await apiClient.patch<Material>(
      `${MATERIALS_ENDPOINT}/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete material (soft delete)
   */
  async deleteMaterial(id: string): Promise<void> {
    await apiClient.delete(`${MATERIALS_ENDPOINT}/${id}`);
  },

  /**
   * Get material statistics
   */
  async getStatistics(): Promise<MaterialStatistics> {
    const response = await apiClient.get<MaterialStatistics>(
      `${MATERIALS_ENDPOINT}/statistics`
    );
    return response.data;
  },

  /**
   * Bulk create materials
   */
  async bulkCreateMaterials(
    materials: CreateMaterialRequest[]
  ): Promise<{ created: number; errors: any[] }> {
    const response = await apiClient.post<{ created: number; errors: any[] }>(
      `${MATERIALS_ENDPOINT}/bulk`,
      materials
    );
    return response.data;
  },

  /**
   * Export materials to CSV (returns blob)
   */
  async exportToCSV(params?: MaterialQueryParams): Promise<Blob> {
    const response = await apiClient.get(`${MATERIALS_ENDPOINT}/export`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};

export default materialService;
