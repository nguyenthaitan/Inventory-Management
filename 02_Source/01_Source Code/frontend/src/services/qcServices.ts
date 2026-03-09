import type {
  DashboardKPI,
  InventoryLot,
  QCTest,
  SupplierPerformance,
  CreateQCTestDto,
  LotDecisionDto,
  RetestDto,
} from '../types/qc';

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000';

type RawDecimal = { $numberDecimal: string };

function toNumber(val: number | string | RawDecimal | undefined | null): number {
  if (val == null) return 0;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') return parseFloat(val);
  return parseFloat(val.$numberDecimal);
}

function normalizeLot(lot: InventoryLot): InventoryLot {
  return { ...lot, quantity: toNumber(lot.quantity as number | string | RawDecimal) };
}

async function handleApiError(res: Response): Promise<void> {
  if (!res.ok) {
    let message = `API error: ${res.status}`;
    try {
      const body = (await res.json()) as { message?: string | string[] };
      if (body.message) {
        message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
      }
    } catch {
      // keep default message
    }
    throw new Error(message);
  }
}

export async function getDashboardKPI(): Promise<DashboardKPI> {
  const res = await fetch(`${BASE_URL}/qc-tests/dashboard`);
  await handleApiError(res);
  return res.json() as Promise<DashboardKPI>;
}

export async function getInventoryLots(status?: string): Promise<InventoryLot[]> {
  // Backend now returns paginated { data, total } — use /status/:status for filtered queries
  const url = status
    ? `${BASE_URL}/inventory-lots/status/${encodeURIComponent(status)}?limit=9999`
    : `${BASE_URL}/inventory-lots?limit=9999`;
  const res = await fetch(url);
  await handleApiError(res);
  const body = await (res.json() as Promise<{ data: InventoryLot[] } | InventoryLot[]>);
  const lots = Array.isArray(body) ? body : body.data;
  return lots.map(normalizeLot);
}

export async function getQCTestsByLot(lot_id: string): Promise<QCTest[]> {
  const res = await fetch(`${BASE_URL}/qc-tests/lot/${encodeURIComponent(lot_id)}`);
  await handleApiError(res);
  return res.json() as Promise<QCTest[]>;
}

export async function getAllQCTests(filters?: {
  result_status?: string;
  test_type?: string;
}): Promise<QCTest[]> {
  const params = new URLSearchParams();
  if (filters?.result_status) params.set('result_status', filters.result_status);
  if (filters?.test_type) params.set('test_type', filters.test_type);
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${BASE_URL}/qc-tests${query}`);
  await handleApiError(res);
  return res.json() as Promise<QCTest[]>;
}

export async function createQCTest(dto: CreateQCTestDto): Promise<QCTest> {
  const res = await fetch(`${BASE_URL}/qc-tests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
  await handleApiError(res);
  return res.json() as Promise<QCTest>;
}

export async function updateQCTest(
  test_id: string,
  dto: Partial<CreateQCTestDto>,
): Promise<QCTest> {
  const res = await fetch(`${BASE_URL}/qc-tests/${encodeURIComponent(test_id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
  await handleApiError(res);
  return res.json() as Promise<QCTest>;
}

export async function deleteQCTest(test_id: string): Promise<{ deleted: boolean }> {
  const res = await fetch(`${BASE_URL}/qc-tests/${encodeURIComponent(test_id)}`, {
    method: 'DELETE',
  });
  await handleApiError(res);
  return res.json() as Promise<{ deleted: boolean }>;
}

export async function submitLotDecision(
  lot_id: string,
  dto: LotDecisionDto,
): Promise<{ lot: InventoryLot; tests: QCTest[] }> {
  const res = await fetch(`${BASE_URL}/qc-tests/lot/${encodeURIComponent(lot_id)}/decision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
  await handleApiError(res);
  const result = await (res.json() as Promise<{ lot: InventoryLot; tests: QCTest[] }>);
  return { ...result, lot: normalizeLot(result.lot) };
}

export async function submitRetest(lot_id: string, dto: RetestDto): Promise<InventoryLot> {
  const res = await fetch(`${BASE_URL}/qc-tests/lot/${encodeURIComponent(lot_id)}/retest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
  await handleApiError(res);
  const lot = await (res.json() as Promise<InventoryLot>);
  return normalizeLot(lot);
}

export async function bulkQuarantine(lot_ids: string[]): Promise<{ updated: number }> {
  const res = await fetch(`${BASE_URL}/inventory-lots/bulk-quarantine`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lot_ids }),
  });
  await handleApiError(res);
  return res.json() as Promise<{ updated: number }>;
}

export async function getSupplierPerformance(
  from?: string,
  to?: string,
): Promise<SupplierPerformance[]> {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${BASE_URL}/qc-tests/supplier-performance${query}`);
  await handleApiError(res);
  return res.json() as Promise<SupplierPerformance[]>;
}
