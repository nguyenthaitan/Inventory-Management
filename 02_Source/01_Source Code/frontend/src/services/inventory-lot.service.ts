/**
 * Inventory Lot Service
 * API calls để quản lý Inventory Lots từ backend
 */

import { apiClient } from "./api";

export interface InventoryLot {
  lot_id: string;
  material_id: string;
  material_name?: string;
  manufacturer_name: string;
  manufacturer_lot: string;
  supplier_name: string;
  received_date: string;
  expiration_date: string;
  in_use_expiration_date?: string;
  status: "Quarantine" | "Accepted" | "Rejected" | "Depleted";
  quantity: string | number;
  unit_of_measure: string;
  storage_location: string;
  is_sample: boolean;
  parent_lot_id?: string;
  notes?: string;
  created_date?: string;
  modified_date?: string;
}

export interface GetInventoryLotsResponse {
  data: InventoryLot[];
  total: number;
  page: number;
  limit: number;
}

export class InventoryLotAPI {
  /**
   * Get all inventory lots with pagination
   */
  static async getAll(page = 1, limit = 10) {
    // apiClient.get<T> returns response.data.data — for the inventory-lots
    // endpoint the backend returns { data: [...], total, page, limit }, so
    // response.data.data is already the lots array.
    const { data, error } = await apiClient.get<InventoryLot[]>(
      "/inventory-lots",
      {
        params: { page, limit },
      },
    );

    if (error) {
      console.error(
        "[InventoryLotAPI] Failed to fetch inventory lots:",
        error.message,
      );
      return { lots: [], total: 0, page, limit, error };
    }

    const lots = Array.isArray(data) ? data : [];
    return {
      lots,
      total: lots.length,
      page,
      limit,
      error: null,
    };
  }

  /**
   * Get inventory lot by ID
   */
  static async getById(id: string) {
    const { data, error } = await apiClient.get<InventoryLot>(
      `/inventory-lots/${id}`,
    );

    if (error) {
      console.error(
        `[InventoryLotAPI] Failed to fetch lot ${id}:`,
        error.message,
      );
      return { lot: null, error };
    }

    return { lot: data, error: null };
  }

  /**
   * Get lots by material ID
   */
  static async getByMaterialId(materialId: string, page = 1, limit = 10) {
    const { data, error } = await apiClient.get<GetInventoryLotsResponse>(
      `/inventory-lots/material/${materialId}`,
      {
        params: { page, limit },
      },
    );

    if (error) {
      console.error(
        `[InventoryLotAPI] Failed to fetch lots for material ${materialId}:`,
        error.message,
      );
      return { lots: [], error };
    }

    return { lots: Array.isArray(data) ? data : [], error: null };
  }

  /**
   * Get lots by status
   */
  static async getByStatus(
    status: "Quarantine" | "Accepted" | "Rejected" | "Depleted",
    page = 1,
    limit = 10,
  ) {
    const { data, error } = await apiClient.get<GetInventoryLotsResponse>(
      `/inventory-lots/status/${status}`,
      {
        params: { page, limit },
      },
    );

    if (error) {
      console.error(
        `[InventoryLotAPI] Failed to fetch lots with status ${status}:`,
        error.message,
      );
      return { lots: [], error };
    }

    return { lots: Array.isArray(data) ? data : [], error: null };
  }

  /**
   * Search inventory lots
   */
  static async search(query: string, page = 1, limit = 10) {
    const { data, error } = await apiClient.get<GetInventoryLotsResponse>(
      "/inventory-lots/search",
      {
        params: { q: query, page, limit },
      },
    );

    if (error) {
      console.error("[InventoryLotAPI] Search failed:", error.message);
      return { results: [], error };
    }

    return { results: Array.isArray(data) ? data : [], error: null };
  }

  /**
   * Create new inventory lot
   */
  static async create(payload: Partial<InventoryLot>) {
    const { data, error } = await apiClient.post<InventoryLot>(
      "/inventory-lots",
      payload,
    );

    if (error) {
      console.error("[InventoryLotAPI] Failed to create lot:", error.message);
      return { lot: null, error };
    }

    return { lot: data, error: null };
  }

  /**
   * Update inventory lot
   */
  static async update(id: string, payload: Partial<InventoryLot>) {
    const { data, error } = await apiClient.put<InventoryLot>(
      `/inventory-lots/${id}`,
      payload,
    );

    if (error) {
      console.error(
        `[InventoryLotAPI] Failed to update lot ${id}:`,
        error.message,
      );
      return { lot: null, error };
    }

    return { lot: data, error: null };
  }

  /**
   * Update lot status
   */
  static async updateStatus(
    id: string,
    status: "Quarantine" | "Accepted" | "Rejected" | "Depleted",
  ) {
    const { data, error } = await apiClient.put<InventoryLot>(
      `/inventory-lots/${id}/status`,
      { status },
    );

    if (error) {
      console.error(
        `[InventoryLotAPI] Failed to update lot ${id} status:`,
        error.message,
      );
      return { lot: null, error };
    }

    return { lot: data, error: null };
  }

  /**
   * Delete inventory lot
   */
  static async delete(id: string) {
    const { error } = await apiClient.delete(`/inventory-lots/${id}`);

    if (error) {
      console.error(
        `[InventoryLotAPI] Failed to delete lot ${id}:`,
        error.message,
      );
      return { success: false, error };
    }

    return { success: true, error: null };
  }

  /**
   * Get expiring lots (expiration soon)
   */
  static async getExpiringSoon(days = 30) {
    const { data, error } = await apiClient.get<InventoryLot[]>(
      "/inventory-lots/expiring-soon",
      {
        params: { days },
      },
    );

    if (error) {
      console.error(
        "[InventoryLotAPI] Failed to fetch expiring lots:",
        error.message,
      );
      return { lots: [], error };
    }

    return { lots: data || [], error: null };
  }

  /**
   * Get expired lots
   */
  static async getExpired() {
    const { data, error } = await apiClient.get<InventoryLot[]>(
      "/inventory-lots/expired",
    );

    if (error) {
      console.error(
        "[InventoryLotAPI] Failed to fetch expired lots:",
        error.message,
      );
      return { lots: [], error };
    }

    return { lots: data || [], error: null };
  }

  /**
   * Get statistics
   */
  static async getStatistics() {
    const { data, error } = await apiClient.get("/inventory-lots/statistics");

    if (error) {
      console.error(
        "[InventoryLotAPI] Failed to fetch statistics:",
        error.message,
      );
      return { statistics: null, error };
    }

    return { statistics: data, error: null };
  }
}
