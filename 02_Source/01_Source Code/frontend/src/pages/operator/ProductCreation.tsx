import React, { useEffect, useState, useCallback } from 'react';
import {
  FlaskConical,
  Plus,
  Trash2,
  Printer,
  Search,
  CheckCircle2,
  ArrowRight,
  Package,
  X,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { Material } from '../../types/Material';
import type { InventoryLot } from '../../types/inventory';
import type { ProductionBatch } from '../../types/production';
import { fetchMaterials } from '../../services/materialService';
import { fetchInventoryLots, createInventoryLot } from '../../services/inventoryLotService';
import {
  createProductionBatch,
  createBatchComponent,
  fetchProductionBatches,
} from '../../services/productionBatchService';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ComponentRow {
  rowId: string;
  materialId: string;
  lotId: string;
  quantity: string;
  unit: string;
}

// ─── Modal: Khai báo InventoryLot thành phẩm ─────────────────────────────────
function KhaiBaoLotModal({
  batch,
  materials,
  onClose,
  onSaved,
}: {
  batch: ProductionBatch;
  materials: Material[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const mat = materials.find((m) => m.material_id === batch.product_id);
  const today = new Date().toISOString().slice(0, 10);
  const twoYears = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const [form, setForm] = useState({
    lot_code: `LOT-FIN-${batch.batch_number}`,
    mfr_name: 'Internal',
    mfr_lot: batch.batch_number,
    expiration_date: twoYears,
    created_by: 'operator',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErr('');
    try {
      await createInventoryLot({
        material_id: batch.product_id,
        lot_code: form.lot_code,
        mfr_name: form.mfr_name,
        mfr_lot: form.mfr_lot,
        status: 'Quarantine',
        quantity: parseFloat(batch.batch_size as any) || 0,
        uom: batch.unit_of_measure,
        expiration_date: form.expiration_date,
        is_sample: false,
        created_by: form.created_by,
        created_at: today,
        updated_at: today,
      } as any);
      onSaved();
      onClose();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-black text-gray-900">Khai báo InventoryLot</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Thành phẩm từ batch{' '}
              <span className="font-mono font-bold text-blue-600">{batch.batch_number}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {mat && (
          <div className="mb-4 p-3 bg-blue-50 rounded-xl text-sm font-bold text-blue-700">
            {mat.material_name}
            <span className="ml-2 text-xs font-normal text-blue-500">
              {batch.batch_size} {batch.unit_of_measure}
            </span>
          </div>
        )}

        {err && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm font-bold">
            {err}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1">
                Lot Code *
              </label>
              <input
                required
                value={form.lot_code}
                onChange={(e) => setForm({ ...form, lot_code: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1">
                Nhà sản xuất *
              </label>
              <input
                required
                value={form.mfr_name}
                onChange={(e) => setForm({ ...form, mfr_name: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1">
                Ngày hết hạn *
              </label>
              <input
                required
                type="date"
                value={form.expiration_date}
                onChange={(e) => setForm({ ...form, expiration_date: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1">
                Người tạo
              </label>
              <input
                value={form.created_by}
                onChange={(e) => setForm({ ...form, created_by: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : 'Xác nhận khai báo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Tab 1: Báo cáo hoàn thành ────────────────────────────────────────────────
function TabBaoCao({
  materials,
  lots,
  onDone,
}: {
  materials: Material[];
  lots: InventoryLot[];
  onDone: () => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const twoYears = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const [batchNumber, setBatchNumber] = useState('');
  const [productId, setProductId] = useState('');
  const [batchSize, setBatchSize] = useState('');
  const [rows, setRows] = useState<ComponentRow[]>([
    { rowId: uuidv4(), materialId: '', lotId: '', quantity: '', unit: '' },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const acceptedLots = lots.filter((l) => l.status === 'Accepted');

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { rowId: uuidv4(), materialId: '', lotId: '', quantity: '', unit: '' },
    ]);
  };

  const removeRow = (rowId: string) => {
    setRows((prev) => prev.filter((r) => r.rowId !== rowId));
  };

  const updateRow = (rowId: string, key: keyof ComponentRow, value: string) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.rowId !== rowId) return r;
        if (key === 'materialId') {
          return { ...r, materialId: value, lotId: '', unit: '' };
        }
        if (key === 'lotId') {
          const lot = acceptedLots.find((l) => l._id === value || l.lot_code === value);
          return { ...r, lotId: value, unit: lot?.uom ?? r.unit };
        }
        return { ...r, [key]: value };
      }),
    );
  };

  const lotsForRow = (row: ComponentRow) =>
    row.materialId
      ? acceptedLots.filter((l) => l.material_id === row.materialId)
      : acceptedLots;

  const selectedProduct = materials.find((m) => m.material_id === productId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rows.some((r) => !r.lotId || !r.quantity)) {
      setError('Vui lòng điền đầy đủ thông tin nguyên liệu.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const batchId = uuidv4();
      const uom =
        rows[0]
          ? (acceptedLots.find(
              (l) => l._id === rows[0].lotId || l.lot_code === rows[0].lotId,
            )?.uom ?? 'units')
          : 'units';

      await createProductionBatch({
        batch_id: batchId,
        product_id: productId,
        batch_number: batchNumber,
        unit_of_measure: uom,
        manufacture_date: today,
        expiration_date: twoYears,
        status: 'Complete',
        batch_size: parseFloat(batchSize) as any,
      });

      for (const row of rows) {
        const lot = acceptedLots.find((l) => l._id === row.lotId || l.lot_code === row.lotId);
        await createBatchComponent(batchId, {
          component_id: uuidv4(),
          batch_id: batchId,
          lot_id: row.lotId,
          planned_quantity: row.quantity as any,
          actual_quantity: row.quantity as any,
          unit_of_measure: lot?.uom ?? row.unit,
          addition_date: today,
        });
      }

      setSuccess(`Batch ${batchNumber} đã được tạo thành công!`);
      setBatchNumber('');
      setProductId('');
      setBatchSize('');
      setRows([{ rowId: uuidv4(), materialId: '', lotId: '', quantity: '', unit: '' }]);
      onDone();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Dark banner */}
      <div className="bg-gray-900 rounded-2xl p-6 flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <FlaskConical size={24} className="text-white" />
        </div>
        <div>
          <h3 className="text-white font-black text-lg tracking-tight">
            KHỞI TẠO PRODUCTION BATCH
          </h3>
          <p className="text-gray-400 text-xs mt-0.5 font-medium tracking-wider uppercase">
            Khai báo thành phẩm &amp; sử dụng nguyên liệu
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm font-bold text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm font-bold text-green-700 flex items-center gap-2">
          <CheckCircle2 size={16} /> {success}
        </div>
      )}

      {/* Main fields */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
              ≡ Mã lô sản xuất
            </label>
            <input
              required
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              placeholder="VD: PB-2026-XXX"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
              Sản phẩm hoàn thành
            </label>
            <select
              required
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            >
              <option value="">-- Chọn sản phẩm --</option>
              {materials.map((m) => (
                <option key={m.material_id} value={m.material_id}>
                  {m.material_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
              Số lượng thu được
            </label>
            <div className="relative">
              <input
                required
                type="number"
                min="0.001"
                step="any"
                value={batchSize}
                onChange={(e) => setBatchSize(e.target.value)}
                placeholder="0.000"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              />
              {selectedProduct && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">
                  units
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Components section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <span className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <Package size={14} className="text-blue-600" />
            Nguyên liệu sử dụng (bắt buộc)
          </span>
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-black text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Plus size={13} /> Thêm nguyên liệu
          </button>
        </div>

        <div className="p-4 space-y-3">
          {rows.map((row) => {
            const rowLots = lotsForRow(row);
            const selectedLot = acceptedLots.find(
              (l) => l._id === row.lotId || l.lot_code === row.lotId,
            );
            return (
              <div key={row.rowId} className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                {/* Material select */}
                <select
                  value={row.materialId}
                  onChange={(e) => updateRow(row.rowId, 'materialId', e.target.value)}
                  className="flex-1 min-w-[160px] px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                >
                  <option value="">-- Chọn nguyên liệu --</option>
                  {materials.map((m) => (
                    <option key={m.material_id} value={m.material_id}>
                      {m.material_name}
                    </option>
                  ))}
                </select>

                {/* Lot select */}
                <select
                  required
                  value={row.lotId}
                  onChange={(e) => updateRow(row.rowId, 'lotId', e.target.value)}
                  className="flex-1 min-w-[160px] px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                >
                  <option value="">-- Chọn Inventory Lot --</option>
                  {rowLots.map((l) => (
                    <option key={l._id} value={l._id}>
                      {l.lot_code} ({l.quantity} {l.uom})
                    </option>
                  ))}
                </select>

                {/* Quantity */}
                <input
                  required
                  type="number"
                  min="0.001"
                  step="any"
                  value={row.quantity}
                  onChange={(e) => updateRow(row.rowId, 'quantity', e.target.value)}
                  placeholder="Số lượng..."
                  className="w-28 px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                />

                {/* Unit */}
                <span className="text-xs font-black text-gray-500 w-8 text-center uppercase">
                  {selectedLot?.uom ?? row.unit ?? '—'}
                </span>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => removeRow(row.rowId)}
                  disabled={rows.length === 1}
                  className="p-2 hover:bg-red-50 text-red-400 rounded-lg transition-colors disabled:opacity-30"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-3 py-4 bg-blue-600 text-white rounded-2xl text-base font-black hover:bg-blue-700 disabled:opacity-50 shadow-xl shadow-blue-200 active:scale-[0.99] transition-all"
      >
        {submitting ? (
          'Đang xử lý...'
        ) : (
          <>
            Xác nhận hoàn tất &amp; trừ kho nguyên liệu
            <ArrowRight size={20} />
          </>
        )}
      </button>
    </form>
  );
}

// ─── Tab 2: Lô thành phẩm (QC) ───────────────────────────────────────────────
function TabLoThanhPham({
  materials,
  refresh,
}: {
  materials: Material[];
  refresh: number;
}) {
  const [batches, setBatches] = useState<ProductionBatch[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [khaiBaoBatch, setKhaiBaoBatch] = useState<ProductionBatch | null>(null);
  const [savedLot, setSavedLot] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchProductionBatches(1, 100);
      setBatches(result.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refresh]);

  const filtered = batches.filter(
    (b) =>
      b.batch_number.toLowerCase().includes(search.toLowerCase()) ||
      b.product_id.toLowerCase().includes(search.toLowerCase()),
  );

  const qcLabel = (status: string) => {
    if (status === 'Complete') return { label: 'PASSED', cls: 'bg-green-100 text-green-700' };
    if (status === 'Cancelled') return { label: 'REJECTED', cls: 'bg-red-100 text-red-700' };
    if (status === 'On Hold') return { label: 'ON HOLD', cls: 'bg-yellow-100 text-yellow-700' };
    return { label: 'IN PROGRESS', cls: 'bg-blue-100 text-blue-700' };
  };

  return (
    <div className="space-y-4">
      {khaiBaoBatch && (
        <KhaiBaoLotModal
          batch={khaiBaoBatch}
          materials={materials}
          onClose={() => setKhaiBaoBatch(null)}
          onSaved={() => {
            setSavedLot(khaiBaoBatch.batch_number);
            setTimeout(() => setSavedLot(''), 4000);
          }}
        />
      )}

      {savedLot && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm font-bold text-green-700 flex items-center gap-2">
          <CheckCircle2 size={16} />
          Đã khai báo InventoryLot cho batch {savedLot} thành công!
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo Batch ID..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {error && (
          <div className="m-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm font-bold">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-16 text-center text-gray-400 text-sm font-bold animate-pulse">
            Đang tải...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-gray-300">
            <FlaskConical size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm font-bold">Chưa có lô thành phẩm nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    'Mã lô SP (Batch ID)',
                    'Tên sản phẩm',
                    'Số lượng hoàn tất',
                    'Trạng thái QC',
                    'Hành động',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => {
                  const mat = materials.find((m) => m.material_id === b.product_id);
                  const qc = qcLabel(b.status);
                  return (
                    <tr
                      key={b.batch_id}
                      className="border-t border-gray-50 hover:bg-blue-50/20 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <span className="text-blue-600 font-black text-sm">
                          {b.batch_number}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-gray-800">
                          {mat?.material_name ?? b.product_id}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                          {b.product_id}
                        </div>
                      </td>
                      <td className="px-5 py-4 font-bold text-gray-700">
                        {Number(b.batch_size).toLocaleString('vi-VN')}{' '}
                        <span className="text-gray-400 font-normal text-xs">
                          {b.unit_of_measure}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${qc.cls}`}
                        >
                          {qc.label === 'PASSED' && <CheckCircle2 size={11} />}
                          {qc.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setKhaiBaoBatch(b)}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[11px] font-black hover:bg-blue-700 transition-colors"
                          >
                            Khai báo InventoryLot
                          </button>
                          <button
                            title="In nhãn"
                            className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors"
                          >
                            <Printer size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProductCreation() {
  const [tab, setTab] = useState<'create' | 'list'>('create');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [lots, setLots] = useState<InventoryLot[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    Promise.all([fetchMaterials(), fetchInventoryLots()])
      .then(([mats, ls]) => {
        setMaterials(mats);
        setLots(ls);
      })
      .finally(() => setLoadingData(false));
  }, []);

  const handleBatchCreated = () => {
    setRefreshCounter((n) => n + 1);
    setTab('list');
  };

  if (loadingData) {
    return (
      <div className="p-16 text-center text-gray-400 text-sm font-bold animate-pulse">
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
            Quản lý thành phẩm
          </h1>
          <p className="text-xs text-gray-400 mt-1 font-medium">
            Hệ thống quản lý dược phẩm › Nhân viên kho
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-black text-green-600">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
          SERVER STATUS: ONLINE
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('create')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${
            tab === 'create'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
              : 'bg-white border border-gray-200 text-gray-500 hover:border-blue-200 hover:text-blue-600'
          }`}
        >
          <FlaskConical size={15} />
          Báo cáo hoàn thành
        </button>
        <button
          onClick={() => setTab('list')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${
            tab === 'list'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
              : 'bg-white border border-gray-200 text-gray-500 hover:border-blue-200 hover:text-blue-600'
          }`}
        >
          <Package size={15} />
          Lô thành phẩm (QC)
        </button>
      </div>

      {/* Tab content */}
      {tab === 'create' ? (
        <TabBaoCao materials={materials} lots={lots} onDone={handleBatchCreated} />
      ) : (
        <TabLoThanhPham materials={materials} refresh={refreshCounter} />
      )}
    </div>
  );
}

