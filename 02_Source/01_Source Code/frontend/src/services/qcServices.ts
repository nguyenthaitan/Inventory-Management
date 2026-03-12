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

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000';

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

// TODO: restore real fetch — GET /qc-tests/dashboard
export async function getDashboardKPI(): Promise<DashboardKPI> {
  return _mockDelay(_MOCK_KPI);
}

// TODO: restore real fetch — GET /inventory-lots/status/:status or /inventory-lots
export async function getInventoryLots(_status?: string): Promise<InventoryLot[]> {
  const lots = _status ? _MOCK_LOTS.filter((l) => l.status === _status) : _MOCK_LOTS;
  return _mockDelay(lots);
}

// TODO: restore real fetch — GET /qc-tests/lot/:lot_id
export async function getQCTestsByLot(lot_id: string): Promise<QCTest[]> {
  const tests = _MOCK_QC_TESTS.filter((t) => t.lot_id === lot_id);
  return _mockDelay(tests);
}

// TODO: restore real fetch — GET /qc-tests
export async function getAllQCTests(filters?: {
  result_status?: string;
  test_type?: string;
}): Promise<QCTest[]> {
  let tests = [..._MOCK_QC_TESTS];
  if (filters?.result_status) tests = tests.filter((t) => t.result_status === filters.result_status);
  if (filters?.test_type) tests = tests.filter((t) => t.test_type === filters.test_type);
  return _mockDelay(tests);
}

// TODO: restore real fetch — POST /qc-tests
export async function createQCTest(dto: CreateQCTestDto): Promise<QCTest> {
  const newTest: QCTest = {
    ...dto,
    test_id: `TEST-MOCK-${Date.now()}`,
    created_date: new Date().toISOString(),
    modified_date: new Date().toISOString(),
  };
  return _mockDelay(newTest);
}

// TODO: restore real fetch — PATCH /qc-tests/:test_id
export async function updateQCTest(
  test_id: string,
  dto: Partial<CreateQCTestDto>,
): Promise<QCTest> {
  const existing = _MOCK_QC_TESTS.find((t) => t.test_id === test_id);
  const updated: QCTest = {
    ...(existing ?? ({ test_id, created_date: new Date().toISOString() } as QCTest)),
    ...dto,
    modified_date: new Date().toISOString(),
  };
  return _mockDelay(updated);
}

// TODO: restore real fetch — DELETE /qc-tests/:test_id
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function deleteQCTest(_test_id: string): Promise<{ deleted: boolean }> {
  return _mockDelay({ deleted: true });
}

// TODO: restore real fetch — POST /qc-tests/lot/:lot_id/decision
export async function submitLotDecision(
  lot_id: string,
  dto: LotDecisionDto,
): Promise<{ lot: InventoryLot; tests: QCTest[] }> {
  const lotStatus = dto.decision === 'Accepted' ? 'Accepted' : dto.decision === 'Rejected' ? 'Rejected' : 'Hold';
  const lot: InventoryLot = {
    lot_id,
    material_name: 'Mock Material',
    supplier_name: 'Mock Supplier',
    quantity: 0,
    status: lotStatus,
  };
  return _mockDelay({ lot, tests: [] });
}

// TODO: restore real fetch — POST /qc-tests/lot/:lot_id/retest
export async function submitRetest(lot_id: string, dto: RetestDto): Promise<InventoryLot> {
  const lot: InventoryLot = {
    lot_id,
    material_name: 'Mock Material',
    supplier_name: 'Mock Supplier',
    quantity: 0,
    status: dto.action === 'extend' ? 'Accepted' : 'Depleted',
  };
  return _mockDelay(lot);
}

// TODO: restore real fetch — POST /inventory-lots/bulk-quarantine
export async function bulkQuarantine(_lot_ids: string[]): Promise<{ updated: number }> {
  return _mockDelay({ updated: _lot_ids.length });
}

// TODO: restore real fetch — GET /qc-tests/supplier-performance
export async function getSupplierPerformance(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _from?: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _to?: string,
): Promise<SupplierPerformance[]> {
  return _mockDelay(_MOCK_SUPPLIERS);
}

// GET /ai/supplier-analysis?from=&to=
export async function analyzeAllSuppliers(
  from?: string,
  to?: string,
): Promise<SupplierAnalysisResponse> {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${BASE_URL}/ai/supplier-analysis${query}`);
  await handleApiError(res);
  return res.json() as Promise<SupplierAnalysisResponse>;
}

// GET /ai/supplier-analysis/:name?from=&to=
export async function analyzeOneSupplier(
  supplierName: string,
  from?: string,
  to?: string,
): Promise<SupplierAnalysisResponse> {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const query = params.toString() ? `?${params.toString()}` : '';
  const encodedName = encodeURIComponent(supplierName);
  const res = await fetch(`${BASE_URL}/ai/supplier-analysis/${encodedName}${query}`);
  await handleApiError(res);
  return res.json() as Promise<SupplierAnalysisResponse>;
}
