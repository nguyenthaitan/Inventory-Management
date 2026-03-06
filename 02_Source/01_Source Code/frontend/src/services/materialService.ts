import { type Material } from '../types/Material'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function normalize(m: any): Material {
  return {
    ...m,
    material_id: m.material_id || m._id,
    _id: m._id || m.material_id,
    created_date: m.created_date ? new Date(m.created_date).toISOString() : new Date().toISOString(),
  }
}

export async function fetchMaterials(): Promise<Material[]> {
  const res = await fetch(`${API_BASE}/materials`)
  if (!res.ok) throw new Error('Failed to fetch materials')
  const data = await res.json()
  return Array.isArray(data) ? data.map(normalize) : []
}

export async function fetchMaterial(id: string): Promise<Material> {
  const res = await fetch(`${API_BASE}/materials/${id}`)
  if (!res.ok) throw new Error('Failed to fetch material')
  const data = await res.json()
  return normalize(data)
}

export async function createMaterial(payload: Partial<Material>) {
  const res = await fetch(`${API_BASE}/materials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to create material')
  return normalize(await res.json())
}

export async function updateMaterial(id: string, payload: Partial<Material>) {
  const res = await fetch(`${API_BASE}/materials/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to update material')
  return normalize(await res.json())
}

export async function removeMaterial(id: string) {
  const res = await fetch(`${API_BASE}/materials/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete material')
  return await res.json()
}

export default {
  fetchMaterials,
  fetchMaterial,
  createMaterial,
  updateMaterial,
  removeMaterial,
}
