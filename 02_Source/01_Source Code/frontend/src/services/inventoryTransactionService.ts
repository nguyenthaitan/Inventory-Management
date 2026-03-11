import { type InventoryTransaction } from "../types/inventoryTransaction";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

function normalize(t: any): InventoryTransaction {
  return {
    ...t,
    transaction_id: t.transaction_id || t._id,
    _id: t._id || t.transaction_id,
    transaction_date: t.transaction_date
      ? new Date(t.transaction_date).toISOString()
      : new Date().toISOString(),
    created_date: t.created_date
      ? new Date(t.created_date).toISOString()
      : new Date().toISOString(),
    modified_date: t.modified_date
      ? new Date(t.modified_date).toISOString()
      : new Date().toISOString(),
  };
}

export async function fetchTransactions(
  params: Record<string, any> = {},
): Promise<InventoryTransaction[]> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(
    ([k, v]) => v !== undefined && query.append(k, String(v)),
  );
  const res = await fetch(`${API_BASE}/transactions?${query.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch transactions");
  const data = await res.json();
  return Array.isArray(data) ? data.map(normalize) : [];
}

export async function fetchTransaction(
  id: string,
): Promise<InventoryTransaction> {
  const res = await fetch(`${API_BASE}/transactions/${id}`);
  if (!res.ok) throw new Error("Failed to fetch transaction");
  return normalize(await res.json());
}

export async function createTransaction(
  payload: Partial<InventoryTransaction>,
) {
  const res = await fetch(`${API_BASE}/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create transaction");
  return normalize(await res.json());
}

export async function createTransactionsBulk(
  payloads: Partial<InventoryTransaction>[],
) {
  const res = await fetch(`${API_BASE}/transactions/bulk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payloads),
  });
  if (!res.ok) throw new Error("Failed to bulk create transactions");
  const data = await res.json();
  return Array.isArray(data) ? data.map(normalize) : [];
}

export async function updateTransaction(
  id: string,
  payload: Partial<InventoryTransaction>,
) {
  const res = await fetch(`${API_BASE}/transactions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update transaction");
  return normalize(await res.json());
}

export async function removeTransaction(id: string) {
  const res = await fetch(`${API_BASE}/transactions/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete transaction");
  return await res.json();
}

export default {
  fetchTransactions,
  fetchTransaction,
  createTransaction,
  createTransactionsBulk,
  updateTransaction,
  removeTransaction,
};
