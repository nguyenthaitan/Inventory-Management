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

type RawDecimal = { $numberDecimal: string };

const ENV_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  'http://localhost:3000';
const BASE_URL = ENV_BASE_URL.replace(/\/+$/, '');
const ROOT_API_URL = BASE_URL.endsWith('/api')
  ? BASE_URL.slice(0, -4)
  : BASE_URL;
const INVENTORY_API_BASE = `${ROOT_API_URL}/api`;

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  if (!token) return { 'Content-Type': 'application/json' };
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

function toNumber(
  val: number | string | RawDecimal | undefined | null,
): number {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const parsed = Number(val);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  if (val && typeof val === 'object' && '$numberDecimal' in val) {
    const parsed = Number(val.$numberDecimal);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

type InventoryLotApiResponse = {
  lot_id: string;
  material_id?: string;
  manufacturer_name?: string;
  supplier_name?: string;
  quantity?: number | string | RawDecimal;
  unit_of_measure?: string;
  storage_location?: string;
  expiration_date?: string;
  status?: InventoryLot['status'];
  created_date?: string;
  modified_date?: string;
};

type PaginatedLotsResponse = {
  data: InventoryLotApiResponse[];
  total: number;
  page: number;
  limit: number;
};

function normalizeLot(lot: InventoryLotApiResponse): InventoryLot {
  return {
    lot_id: lot.lot_id,
    material_name: lot.manufacturer_name ?? lot.material_id ?? 'Unknown Material',
    supplier_name: lot.supplier_name ?? 'Unknown Supplier',
    quantity: toNumber(lot.quantity),
    unit_of_measure: lot.unit_of_measure,
    storage_location: lot.storage_location,
    expiration_date: lot.expiration_date,
    status: lot.status ?? 'Quarantine',
    created_date: lot.created_date,
    modified_date: lot.modified_date,
  };
}

async function handleApiError(res: Response): Promise<void> {
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`[${res.status}] ${text}`);
  }
}

export async function getDashboardKPI(): Promise<DashboardKPI> {
  const res = await fetch(`${ROOT_API_URL}/qc-tests/dashboard`, {
    headers: getAuthHeaders(),
  });
  await handleApiError(res);
  return res.json() as Promise<DashboardKPI>;
}

export async function getInventoryLots(status?: string): Promise<InventoryLot[]> {
  const base = status
    ? `${INVENTORY_API_BASE}/inventory-lots/status/${encodeURIComponent(status)}`
    : `${INVENTORY_API_BASE}/inventory-lots`;

  const params = new URLSearchParams({ page: '1', limit: '1000' });
  const url = `${base}?${params.toString()}`;

  const res = await fetch(url, { headers: getAuthHeaders() });
  await handleApiError(res);

  const payload = (await res.json()) as PaginatedLotsResponse;
  const lots = Array.isArray(payload?.data) ? payload.data : [];
  return lots.map(normalizeLot);
}

export async function getQCTestsByLot(lot_id: string): Promise<QCTest[]> {
  const res = await fetch(
    `${ROOT_API_URL}/qc-tests/lot/${encodeURIComponent(lot_id)}`,
    {
      headers: getAuthHeaders(),
    },
  );
  await handleApiError(res);
  return res.json() as Promise<QCTest[]>;
}

export async function getAllQCTests(filters?: {
  result_status?: string;
  test_type?: string;
}): Promise<QCTest[]> {
  const params = new URLSearchParams();
  if (filters?.result_status) {
    params.set('result_status', filters.result_status);
  }
  if (filters?.test_type) {
    params.set('test_type', filters.test_type);
  }

  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${ROOT_API_URL}/qc-tests${query}`, {
    headers: getAuthHeaders(),
  });
  await handleApiError(res);
  return res.json() as Promise<QCTest[]>;
}

export async function createQCTest(dto: CreateQCTestDto): Promise<QCTest> {
  const res = await fetch(`${ROOT_API_URL}/qc-tests`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(dto),
  });
  await handleApiError(res);
  return res.json() as Promise<QCTest>;
}

export async function updateQCTest(
  test_id: string,
  dto: Partial<CreateQCTestDto>,
): Promise<QCTest> {
  const res = await fetch(`${ROOT_API_URL}/qc-tests/${encodeURIComponent(test_id)}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(dto),
  });
  await handleApiError(res);
  return res.json() as Promise<QCTest>;
}

export async function deleteQCTest(test_id: string): Promise<{ deleted: boolean }> {
  const res = await fetch(`${ROOT_API_URL}/qc-tests/${encodeURIComponent(test_id)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  await handleApiError(res);
  return res.json() as Promise<{ deleted: boolean }>;
}

export async function submitLotDecision(
  lot_id: string,
  dto: LotDecisionDto,
): Promise<{ lot: InventoryLot; tests: QCTest[] }> {
  const res = await fetch(
    `${ROOT_API_URL}/qc-tests/lot/${encodeURIComponent(lot_id)}/decision`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(dto),
    },
  );
  await handleApiError(res);

  const payload = (await res.json()) as {
    lot: InventoryLotApiResponse;
    tests: QCTest[];
  };

  return {
    lot: normalizeLot(payload.lot),
    tests: payload.tests ?? [],
  };
}

export async function submitRetest(lot_id: string, dto: RetestDto): Promise<InventoryLot> {
  const res = await fetch(
    `${ROOT_API_URL}/qc-tests/lot/${encodeURIComponent(lot_id)}/retest`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(dto),
    },
  );
  await handleApiError(res);

  const lot = (await res.json()) as InventoryLotApiResponse;
  return normalizeLot(lot);
}

export async function bulkQuarantine(lot_ids: string[]): Promise<{ updated: number }> {
  const results = await Promise.allSettled(
    lot_ids.map((lotId) =>
      fetch(
        `${INVENTORY_API_BASE}/inventory-lots/${encodeURIComponent(lotId)}/status/Quarantine`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
        },
      ).then(async (res) => {
        await handleApiError(res);
        return true;
      }),
    ),
  );

  const updated = results.filter((r) => r.status === 'fulfilled').length;

  if (updated === 0 && lot_ids.length > 0) {
    const firstRejected = results.find((r) => r.status === 'rejected') as
      | PromiseRejectedResult
      | undefined;
    throw firstRejected?.reason ?? new Error('Bulk quarantine failed');
  }

  return { updated };
}

export async function getSupplierPerformance(
  from?: string,
  to?: string,
): Promise<SupplierPerformance[]> {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const query = params.toString() ? `?${params.toString()}` : '';

  const res = await fetch(`${ROOT_API_URL}/qc-tests/supplier-performance${query}`, {
    headers: getAuthHeaders(),
  });
  await handleApiError(res);
  return res.json() as Promise<SupplierPerformance[]>;
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
  const res = await fetch(`${ROOT_API_URL}/ai/supplier-analysis${query}`, {
    headers: getAuthHeaders(),
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
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const query = params.toString() ? `?${params.toString()}` : '';
  const encodedName = encodeURIComponent(supplierName);
  const res = await fetch(
    `${ROOT_API_URL}/ai/supplier-analysis/${encodedName}${query}`,
    {
      headers: getAuthHeaders(),
    },
  );
  await handleApiError(res);
  return res.json() as Promise<SupplierAnalysisResponse>;
}
