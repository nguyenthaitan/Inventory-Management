/**
 * Material API Service
 * Handles all HTTP requests related to Materials
 */

import axios from "axios";
import type { AxiosInstance } from "axios";
import type {
  Material,
  CreateMaterialRequest,
  UpdateMaterialRequest,
  PaginatedMaterialResponse,
  MaterialSearchParams,
  MaterialType,
} from "../types/Material";
import { apiConfig, API_ENDPOINTS } from "../config/api.config";

class MaterialService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create(apiConfig);

    // Add request interceptor for logging
    this.axiosInstance.interceptors.request.use(
      (config) => {
        console.debug("[MaterialService] Request:", {
          method: config.method?.toUpperCase(),
          url: config.url,
          data: config.data,
        });
        return config;
      },
      (error) => {
        console.error("[MaterialService] Request Error:", error);
        return Promise.reject(error);
      },
    );

    // Add response interceptor for logging and error handling
    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.debug("[MaterialService] Response:", {
          status: response.status,
          url: response.config.url,
          data: response.data,
        });
        return response;
      },
      (error) => {
        console.error("[MaterialService] Response Error:", {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          data: error.response?.data,
        });
        return Promise.reject(error);
      },
    );
  }

  /**
   * Get all materials with pagination
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 20, max: 100)
   * @returns Paginated list of materials
   */
  async findAll(
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedMaterialResponse> {
    try {
      const response = await this.axiosInstance.get<PaginatedMaterialResponse>(
        API_ENDPOINTS.MATERIALS,
        {
          params: { page, limit },
        },
      );
      return response.data;
    } catch (error) {
      console.error("[MaterialService] findAll failed:", error);
      throw error;
    }
  }

  /**
   * Get material by ID
   * @param id - Material ID (MongoDB _id)
   * @returns Single material
   */
  async findById(id: string): Promise<Material> {
    try {
      const response = await this.axiosInstance.get<Material>(
        API_ENDPOINTS.MATERIALS_DETAIL(id),
      );
      return response.data;
    } catch (error) {
      console.error("[MaterialService] findById failed:", error);
      throw error;
    }
  }

  /**
   * Search materials by name, material_id, or part_number
   * @param query - Search query (minimum 2 characters)
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 20)
   * @returns Paginated search results
   */
  async search(
    query: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedMaterialResponse> {
    try {
      const response = await this.axiosInstance.get<PaginatedMaterialResponse>(
        API_ENDPOINTS.MATERIALS_SEARCH,
        {
          params: { q: query, page, limit },
        },
      );
      return response.data;
    } catch (error) {
      console.error("[MaterialService] search failed:", error);
      throw error;
    }
  }

  /**
   * Filter materials by type
   * @param type - Material type enum
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 20)
   * @returns Paginated filtered results
   */
  async filterByType(
    type: MaterialType,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedMaterialResponse> {
    try {
      const response = await this.axiosInstance.get<PaginatedMaterialResponse>(
        API_ENDPOINTS.MATERIALS_FILTER_TYPE(type),
        {
          params: { page, limit },
        },
      );
      return response.data;
    } catch (error) {
      console.error("[MaterialService] filterByType failed:", error);
      throw error;
    }
  }

  /**
   * Create a new material
   * @param data - Material creation data
   * @returns Created material
   */
  async create(data: CreateMaterialRequest): Promise<Material> {
    try {
      const response = await this.axiosInstance.post<Material>(
        API_ENDPOINTS.MATERIALS,
        data,
        {
          validateStatus: (status) => status < 500, // Don't throw on 4xx
        },
      );

      if (response.status === 409) {
        const error = new Error(
          "Material with this ID or Part Number already exists",
        );
        (error as any).status = 409;
        throw error;
      }

      if (response.status === 400) {
        const error = new Error("Invalid material data");
        (error as any).status = 400;
        (error as any).details = response.data;
        throw error;
      }

      return response.data;
    } catch (error) {
      console.error("[MaterialService] create failed:", error);
      throw error;
    }
  }

  /**
   * Update an existing material
   * @param id - Material ID (MongoDB _id)
   * @param data - Partial material update data
   * @returns Updated material
   */
  async update(id: string, data: UpdateMaterialRequest): Promise<Material> {
    try {
      const response = await this.axiosInstance.put<Material>(
        API_ENDPOINTS.MATERIALS_UPDATE(id),
        data,
        {
          validateStatus: (status) => status < 500,
        },
      );

      if (response.status === 404) {
        const error = new Error("Material not found");
        (error as any).status = 404;
        throw error;
      }

      if (response.status === 400) {
        const error = new Error("Invalid update data");
        (error as any).status = 400;
        throw error;
      }

      return response.data;
    } catch (error) {
      console.error("[MaterialService] update failed:", error);
      throw error;
    }
  }

  /**
   * Delete a material
   * @param id - Material ID (MongoDB _id)
   * @returns Deletion confirmation message
   */
  async delete(id: string): Promise<{ message: string }> {
    try {
      const response = await this.axiosInstance.delete<{ message: string }>(
        API_ENDPOINTS.MATERIALS_DELETE(id),
        {
          validateStatus: (status) => status < 500,
        },
      );

      if (response.status === 404) {
        const error = new Error("Material not found");
        (error as any).status = 404;
        throw error;
      }

      return response.data;
    } catch (error) {
      console.error("[MaterialService] delete failed:", error);
      throw error;
    }
  }

  /**
   * Get all distinct material types available in the database
   * @returns Array of material types
   */
  async getDistinctTypes(): Promise<MaterialType[]> {
    try {
      const response = await this.axiosInstance.get<MaterialType[]>(
        API_ENDPOINTS.MATERIALS_TYPES,
      );
      return response.data;
    } catch (error) {
      console.error("[MaterialService] getDistinctTypes failed:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const materialService = new MaterialService();

// Export class for testing purposes
export default MaterialService;
