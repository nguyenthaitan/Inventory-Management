import type {
  ProductionBatch,
  BatchComponent,
  PaginatedProductionBatch,
} from '../types/production';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ─── Production Batch ─────────────────────────────────────────────────────────

export async function fetchProductionBatches(
  page = 1,
  limit = 20,
): Promise<PaginatedProductionBatch> {
  const res = await fetch(
    `${API_BASE}/production-batches?page=${page}&limit=${limit}`,
  );
  if (!res.ok) throw new Error('Failed to fetch production batches');
  return res.json();
}

export async function fetchProductionBatchesByStatus(
  status: string,
  page = 1,
  limit = 20,
): Promise<PaginatedProductionBatch> {
  const res = await fetch(
    `${API_BASE}/production-batches/status/${encodeURIComponent(status)}?page=${page}&limit=${limit}`,
  );
  if (!res.ok) throw new Error('Failed to fetch batches by status');
  return res.json();
}

export async function fetchProductionBatch(id: string): Promise<ProductionBatch> {
  const res = await fetch(`${API_BASE}/production-batches/${id}`);
  if (!res.ok) throw new Error('Failed to fetch production batch');
  return res.json();
}

export async function createProductionBatch(
  payload: Partial<ProductionBatch>,
): Promise<ProductionBatch> {
  const res = await fetch(`${API_BASE}/production-batches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create production batch');
  }
  return res.json();
}

export async function updateProductionBatch(
  id: string,
  payload: Partial<ProductionBatch>,
): Promise<ProductionBatch> {
  const res = await fetch(`${API_BASE}/production-batches/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to update production batch');
  }
  return res.json();
}

export async function deleteProductionBatch(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/production-batches/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to delete production batch');
  }
}

// ─── Batch Components ─────────────────────────────────────────────────────────

export async function fetchBatchComponents(
  batchId: string,
): Promise<BatchComponent[]> {
  const res = await fetch(
    `${API_BASE}/production-batches/${batchId}/components`,
  );
  if (!res.ok) throw new Error('Failed to fetch batch components');
  return res.json();
}

export async function createBatchComponent(
  batchId: string,
  payload: Partial<BatchComponent>,
): Promise<BatchComponent> {
  const res = await fetch(
    `${API_BASE}/production-batches/${batchId}/components`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create batch component');
  }
  return res.json();
}

export async function updateBatchComponent(
  batchId: string,
  componentId: string,
  payload: Partial<BatchComponent>,
): Promise<BatchComponent> {
  const res = await fetch(
    `${API_BASE}/production-batches/${batchId}/components/${componentId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to update batch component');
  }
  return res.json();
}

export async function deleteBatchComponent(
  batchId: string,
  componentId: string,
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/production-batches/${batchId}/components/${componentId}`,
    { method: 'DELETE' },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to delete batch component');
  }
}
