import type {
  DashboardKPI,
  InventoryLot,
  QCTest,
  SupplierPerformance,
  SupplierAnalysisResponse,
  CreateQCTestDto,
  LotDecisionDto,
  RetestDto,
} from '../types/qc';
import { apiClient } from './apiClient';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// TODO: restore these helpers when removing mocks:
// type RawDecimal = { $numberDecimal: string };
// function toNumber(val: number | string | RawDecimal | undefined | null): number { ... }
// function normalizeLot(lot: InventoryLot): InventoryLot { return { ...lot, quantity: toNumber(...) }; }

async function handleApiError(res: Response): Promise<void> {
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`[${res.status}] ${text}`);
  }
}

// ─── MOCK DATA ───────────────────────────────────────────────────────────────
// TODO: remove this entire section once the backend is stable.

const _MOCK_LOTS: InventoryLot[] = [
  { lot_id: 'LOT-2026-001', material_name: 'Amoxicillin 500mg', supplier_name: 'Pharma Supply Co.', quantity: 500, unit_of_measure: 'kg', storage_location: 'Kho A - Kệ 01', expiration_date: '2026-03-18', status: 'Quarantine' },
  { lot_id: 'LOT-2026-002', material_name: 'Paracetamol 500mg', supplier_name: 'MedChem Vietnam', quantity: 1200, unit_of_measure: 'kg', storage_location: 'Kho A - Kệ 03', expiration_date: '2026-04-10', status: 'Quarantine' },
  { lot_id: 'LOT-2026-003', material_name: 'Vitamin C 1000mg', supplier_name: 'BioTech Ltd', quantity: 300, unit_of_measure: 'kg', storage_location: 'Kho B - Kệ 02', expiration_date: '2026-03-15', status: 'Quarantine' },
  { lot_id: 'LOT-2026-004', material_name: 'Ibuprofen 400mg', supplier_name: 'Pharma Supply Co.', quantity: 800, unit_of_measure: 'kg', storage_location: 'Kho B - Kệ 05', expiration_date: '2026-03-20', status: 'Accepted' },
  { lot_id: 'LOT-2026-005', material_name: 'Metformin 500mg', supplier_name: 'MedChem Vietnam', quantity: 400, unit_of_measure: 'kg', storage_location: 'Kho C - Kệ 01', expiration_date: '2027-01-15', status: 'Accepted' },
  { lot_id: 'LOT-2026-006', material_name: 'Atorvastatin 20mg', supplier_name: 'BioTech Ltd', quantity: 200, unit_of_measure: 'kg', storage_location: 'Kho A - Kệ 07', expiration_date: '2026-03-19', status: 'Hold' },
  { lot_id: 'LOT-2026-007', material_name: 'Omeprazole 20mg', supplier_name: 'Pharma Supply Co.', quantity: 600, unit_of_measure: 'kg', storage_location: 'Kho C - Kệ 04', expiration_date: '2026-02-28', status: 'Rejected' },
];

const _MOCK_QC_TESTS: QCTest[] = [
  { test_id: 'TEST-001', lot_id: 'LOT-2026-001', test_type: 'Physical', test_method: 'USP Standard', test_date: '2026-03-10', test_result: 'Moisture: 4.2%, Purity: 99.1%, Appearance: White powder, uniform', result_status: 'Pass', performed_by: 'qc_user', verified_by: 'qc_manager', created_date: '2026-03-10T08:00:00Z', modified_date: '2026-03-10T09:00:00Z' },
  { test_id: 'TEST-002', lot_id: 'LOT-2026-001', test_type: 'Chemical', test_method: 'HPLC', test_date: '2026-03-10', test_result: 'Assay: 99.5%, Related substances: 0.1%', result_status: 'Pass', performed_by: 'qc_user', verified_by: 'qc_manager', created_date: '2026-03-10T10:00:00Z', modified_date: '2026-03-10T11:00:00Z' },
  { test_id: 'TEST-003', lot_id: 'LOT-2026-002', test_type: 'Microbial', test_method: 'USP <61>', test_date: '2026-03-09', test_result: 'TAMC < 100 CFU/g, TYMC < 10 CFU/g', result_status: 'Pass', performed_by: 'qc_user', created_date: '2026-03-09T08:00:00Z', modified_date: '2026-03-09T12:00:00Z' },
  { test_id: 'TEST-004', lot_id: 'LOT-2026-007', test_type: 'Chemical', test_method: 'GC-MS', test_date: '2026-03-08', test_result: 'Impurity level exceeded limit: 0.5% (max 0.1%)', result_status: 'Fail', performed_by: 'qc_user', reject_reason: 'Impurity vượt ngưỡng cho phép', created_date: '2026-03-08T08:00:00Z', modified_date: '2026-03-08T14:00:00Z' },
];

const _MOCK_SUPPLIERS: SupplierPerformance[] = [
  { supplier_name: 'Pharma Supply Co.', total_batches: 20, approved: 18, rejected: 2, quality_rate: 90.0 },
  { supplier_name: 'MedChem Vietnam', total_batches: 15, approved: 14, rejected: 1, quality_rate: 93.33 },
  { supplier_name: 'BioTech Ltd', total_batches: 12, approved: 9, rejected: 3, quality_rate: 75.0 },
];

const _MOCK_KPI: DashboardKPI = {
  pending_count: 3,
  approved_count: 12,
  rejected_count: 2,
  error_rate: 14.29,
};

function _mockDelay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// GET /qc-tests/dashboard
export async function getDashboardKPI(): Promise<DashboardKPI> {
  try {
    const { data, error } = await apiClient.get<DashboardKPI>('/qc-tests/dashboard');
    if (error) throw error;
    return data!;
  } catch (e) {
    // fallback mock
    return _mockDelay(_MOCK_KPI);
  }
}

// GET /inventory-lots?status=...
export async function getInventoryLots(_status?: string): Promise<InventoryLot[]> {
  try {
    let data, error;
    ({ data, error } = await apiClient.get<InventoryLot[] | { data: InventoryLot[] }>('/inventory-lots', {
      params: _status ? { status: _status } : undefined,
    }));
    if (error) throw error;
    if (data && typeof data === 'object' && 'data' in data) {
      return (data as { data: InventoryLot[] }).data;
    }
    return (data as InventoryLot[]);
  } catch (e) {
    return _mockDelay(_MOCK_LOTS);
  }
}

// GET /qc-tests/lot/:lot_id
export async function getQCTestsByLot(lot_id: string): Promise<QCTest[]> {
  try {
    const { data, error } = await apiClient.get<QCTest[]>(`/qc-tests/lot/${encodeURIComponent(lot_id)}`);
    if (error) throw error;
    return data!;
  } catch (e) {
    return _mockDelay(_MOCK_QC_TESTS.filter((t) => t.lot_id === lot_id));
  }
}

// GET /qc-tests
export async function getAllQCTests(): Promise<QCTest[]> {
  try {
    const { data, error } = await apiClient.get<QCTest[]>('/qc-tests');
    if (error) throw error;
    return data!;
  } catch (e) {
    return _mockDelay(_MOCK_QC_TESTS);
  }
}

// POST /qc-tests
export async function createQCTest(payload: CreateQCTestDto): Promise<QCTest> {
  try {
    const { data, error } = await apiClient.post<QCTest>('/qc-tests', payload);
    if (error) throw error;
    return data!;
  } catch (e) {
    throw new Error('Không thể tạo QC Test');
  }
}

// PATCH /qc-tests/:test_id
export async function updateQCTest(test_id: string, payload: Partial<QCTest>): Promise<QCTest> {
  try {
    const { data, error } = await apiClient.patch<QCTest>(`/qc-tests/${encodeURIComponent(test_id)}`, payload);
    if (error) throw error;
    return data!;
  } catch (e) {
    throw new Error('Không thể cập nhật QC Test');
  }
}

// DELETE /qc-tests/:test_id
export async function deleteQCTest(test_id: string): Promise<void> {
  try {
    const { error } = await apiClient.delete(`/qc-tests/${encodeURIComponent(test_id)}`);
    if (error) throw error;
  } catch (e) {
    throw new Error('Không thể xóa QC Test');
  }
}

// POST /qc-tests/lot/:lot_id/decision
export async function submitLotDecision(lot_id: string, payload: LotDecisionDto): Promise<any> {
  try {
    const { data, error } = await apiClient.post(`/qc-tests/lot/${encodeURIComponent(lot_id)}/decision`, payload);
    if (error) throw error;
    return data;
  } catch (e) {
    throw new Error('Không thể gửi quyết định lô');
  }
}

// POST /qc-tests/lot/:lot_id/retest
export async function submitRetest(lot_id: string, payload: RetestDto): Promise<any> {
  try {
    const { data, error } = await apiClient.post(`/qc-tests/lot/${encodeURIComponent(lot_id)}/retest`, payload);
    if (error) throw error;
    return data;
  } catch (e) {
    throw new Error('Không thể gửi yêu cầu kiểm lại');
  }
}

// POST /inventory-lots/bulk-quarantine
export async function bulkQuarantine(lot_ids: string[]): Promise<any> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) {
      throw new Error('Token không tồn tại. Vui lòng đăng nhập lại');
    }
    
    const res = await fetch(`${API_BASE_URL}/inventory-lots/bulk-quarantine`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ lot_ids }),
    });
    await handleApiError(res);
    return await res.json();
  } catch (e) {
    throw new Error('Không thể chuyển nhiều lô vào kiểm soát');
  }
}

// GET /qc-tests/supplier-performance
export async function getSupplierPerformance(): Promise<SupplierPerformance[]> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) {
      throw new Error('Token không tồn tại. Vui lòng đăng nhập lại');
    }
    const res = await fetch(`${API_BASE_URL}/qc-tests/supplier-performance`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    await handleApiError(res);
    return await res.json();
  } catch (e) {
    return _mockDelay(_MOCK_SUPPLIERS);
  }
}

// TODO: restore real fetch — POST /qc-tests

// TODO: restore real fetch — PATCH /qc-tests/:test_id

// TODO: restore real fetch — DELETE /qc-tests/:test_id
// eslint-disable-next-line @typescript-eslint/no-unused-vars

// TODO: restore real fetch — POST /qc-tests/lot/:lot_id/decision

// TODO: restore real fetch — POST /qc-tests/lot/:lot_id/retest

// TODO: restore real fetch — POST /inventory-lots/bulk-quarantine

// TODO: restore real fetch — GET /qc-tests/supplier-performance

// GET /ai/supplier-analysis?from=&to=
export async function analyzeAllSuppliers(
  from?: string,
  to?: string,
): Promise<SupplierAnalysisResponse> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  if (!token) {
    throw new Error('Token không tồn tại. Vui lòng đăng nhập lại');
  }
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE_URL}/ai/supplier-analysis${query}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  await handleApiError(res);
  return res.json() as Promise<SupplierAnalysisResponse>;
}

// GET /ai/supplier-analysis/:name?from=&to=
export async function analyzeOneSupplier(
  supplierName: string,
  from?: string,
  to?: string,
): Promise<SupplierAnalysisResponse> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  if (!token) {
    throw new Error('Token không tồn tại. Vui lòng đăng nhập lại');
  }
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const query = params.toString() ? `?${params.toString()}` : '';
  const encodedName = encodeURIComponent(supplierName);
  const res = await fetch(`${API_BASE_URL}/ai/supplier-analysis/${encodedName}${query}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  await handleApiError(res);
  return res.json() as Promise<SupplierAnalysisResponse>;
}
