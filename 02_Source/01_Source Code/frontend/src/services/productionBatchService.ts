import { apiClient } from './apiClient';
import type {
  ProductionBatch,
  BatchComponent,
  PaginatedProductionBatch,
} from '../types/production';

// ─── Production Batch ─────────────────────────────────────────────────────────

export async function fetchProductionBatches(
  page = 1,
  limit = 20,
): Promise<PaginatedProductionBatch> {
  const { data, error } = await apiClient.get<PaginatedProductionBatch>(
    '/production-batches',
    { params: { page, limit } }
  );
  if (error) throw error;
  return data!;
}

export async function fetchProductionBatchesByStatus(
  status: string,
  page = 1,
  limit = 20,
): Promise<PaginatedProductionBatch> {
  const { data, error } = await apiClient.get<PaginatedProductionBatch>(
    `/production-batches/status/${encodeURIComponent(status)}`,
    { params: { page, limit } }
  );
  if (error) throw error;
  return data!;
}

export async function fetchProductionBatch(id: string): Promise<ProductionBatch> {
  const { data, error } = await apiClient.get<ProductionBatch>(
    `/production-batches/${id}`
  );
  if (error) throw error;
  return data!;
}

export async function createProductionBatch(
  payload: Partial<ProductionBatch>,
): Promise<ProductionBatch> {
  const { data, error } = await apiClient.post<ProductionBatch>(
    '/production-batches',
    payload
  );
  if (error) throw error;
  return data!;
}

export async function updateProductionBatch(
  id: string,
  payload: Partial<ProductionBatch>,
): Promise<ProductionBatch> {
  const { data, error } = await apiClient.put<ProductionBatch>(
    `/production-batches/${id}`,
    payload
  );
  if (error) throw error;
  return data!;
}

export async function deleteProductionBatch(id: string): Promise<void> {
  const { error } = await apiClient.delete(
    `/production-batches/${id}`
  );
  if (error) throw error;
}

// ─── Batch Components ─────────────────────────────────────────────────────────

export async function fetchBatchComponents(
  batchId: string,
): Promise<BatchComponent[]> {
  const { data, error } = await apiClient.get<BatchComponent[]>(
    `/production-batches/${batchId}/components`
  );
  if (error) throw error;
  return data!;
}

export async function createBatchComponent(
  batchId: string,
  payload: Partial<BatchComponent>,
): Promise<BatchComponent> {
  const { data, error } = await apiClient.post<BatchComponent>(
    `/production-batches/${batchId}/components`,
    payload
  );
  if (error) throw error;
  return data!;
}

export async function updateBatchComponent(
  batchId: string,
  componentId: string,
  payload: Partial<BatchComponent>,
): Promise<BatchComponent> {
  const { data, error } = await apiClient.put<BatchComponent>(
    `/production-batches/${batchId}/components/${componentId}`,
    payload
  );
  if (error) throw error;
  return data!;
}

export async function deleteBatchComponent(
  batchId: string,
  componentId: string,
): Promise<void> {
  const { error } = await apiClient.delete(
    `/production-batches/${batchId}/components/${componentId}`
  );
  if (error) throw error;
}
