import type { InventoryLot } from '../types/inventory';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function fetchInventoryLots(): Promise<InventoryLot[]> {
  const res = await fetch(`${API_BASE}/inventory-lots`);
  if (!res.ok) throw new Error('Failed to fetch inventory lots');
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function createInventoryLot(payload: Partial<InventoryLot>): Promise<InventoryLot> {
  const res = await fetch(`${API_BASE}/inventory-lots`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).message || 'Failed to create inventory lot');
  }
  return res.json();
}
