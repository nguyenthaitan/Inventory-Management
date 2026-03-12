/**
 * LabelTemplate API Service
 * Handles all HTTP requests related to Label Templates
 */

import axios from "axios";
import type { AxiosInstance } from "axios";
import type {
  LabelTemplate,
  CreateLabelTemplateRequest,
  UpdateLabelTemplateRequest,
  GenerateLabelRequest,
  GenerateLabelResponse,
  PaginatedLabelTemplateResponse,
  LabelType,
} from "../types/label";
import { apiConfig, API_ENDPOINTS } from "../config/api.config";

class LabelService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create(apiConfig);

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error("[LabelService] Error:", {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
        });
        return Promise.reject(error);
      },
    );
  }

  async findAll(
    page = 1,
    limit = 20,
  ): Promise<PaginatedLabelTemplateResponse> {
    const response =
      await this.axiosInstance.get<PaginatedLabelTemplateResponse>(
        API_ENDPOINTS.LABEL_TEMPLATES,
        { params: { page, limit } },
      );
    return response.data;
  }

  async findById(id: string): Promise<LabelTemplate> {
    const response = await this.axiosInstance.get<LabelTemplate>(
      API_ENDPOINTS.LABEL_TEMPLATES_DETAIL(id),
    );
    return response.data;
  }

  async search(
    query: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedLabelTemplateResponse> {
    const response =
      await this.axiosInstance.get<PaginatedLabelTemplateResponse>(
        API_ENDPOINTS.LABEL_TEMPLATES_SEARCH,
        { params: { q: query, page, limit } },
      );
    return response.data;
  }

  async filterByType(
    type: LabelType,
    page = 1,
    limit = 20,
  ): Promise<PaginatedLabelTemplateResponse> {
    const response =
      await this.axiosInstance.get<PaginatedLabelTemplateResponse>(
        API_ENDPOINTS.LABEL_TEMPLATES_FILTER_TYPE(type),
        { params: { page, limit } },
      );
    return response.data;
  }

  async create(dto: CreateLabelTemplateRequest): Promise<LabelTemplate> {
    const response = await this.axiosInstance.post<LabelTemplate>(
      API_ENDPOINTS.LABEL_TEMPLATES,
      dto,
    );
    return response.data;
  }

  async update(
    id: string,
    dto: UpdateLabelTemplateRequest,
  ): Promise<LabelTemplate> {
    const response = await this.axiosInstance.put<LabelTemplate>(
      API_ENDPOINTS.LABEL_TEMPLATES_UPDATE(id),
      dto,
    );
    return response.data;
  }

  async delete(id: string): Promise<{ message: string }> {
    const response = await this.axiosInstance.delete<{ message: string }>(
      API_ENDPOINTS.LABEL_TEMPLATES_DELETE(id),
    );
    return response.data;
  }

  async generateLabel(dto: GenerateLabelRequest): Promise<GenerateLabelResponse> {
    const response = await this.axiosInstance.post<GenerateLabelResponse>(
      API_ENDPOINTS.LABEL_TEMPLATES_GENERATE,
      dto,
    );
    return response.data;
  }
}

export const labelService = new LabelService();
