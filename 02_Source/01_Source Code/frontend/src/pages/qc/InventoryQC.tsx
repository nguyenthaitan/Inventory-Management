import { useState, useEffect, useCallback } from 'react';
import { getInventoryLots, submitRetest, bulkQuarantine } from '../../services/qcServices';
import type { InventoryLot } from '../../types/qc';

type Tab = 'alert' | 'quarantine';

function getDaysUntilExpiry(expirationDate?: string): number | null {
  if (!expirationDate) return null;
  return Math.ceil(
    (new Date(expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
}

const STATUS_BADGE: Record<string, string> = {
  Quarantine: 'bg-yellow-100 text-yellow-700',
  Accepted: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
  Hold: 'bg-orange-100 text-orange-700',
  Depleted: 'bg-gray-100 text-gray-500',
};

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm flex items-center gap-3 ${
      type === 'success' ? 'bg-green-600' : 'bg-red-600'
    }`}>
      <span>{type === 'success' ? '✓' : '✕'}</span>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">×</button>
    </div>
  );
}

export default function InventoryQC() {
  const [activeTab, setActiveTab] = useState<Tab>('alert');
  const [lots, setLots] = useState<InventoryLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [retestLot, setRetestLot] = useState<InventoryLot | null>(null);
  const [retestAction, setRetestAction] = useState<'extend' | 'discard' | null>(null);
  const [newExpiryDate, setNewExpiryDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadLots = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getInventoryLots();
      setLots(data);
    } catch {
      setToast({ message: 'Không thể tải dữ liệu kho', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLots();
  }, [loadLots]);

  // Filter lots expiring within 30 days
  const alertLots = lots.filter((lot) => {
    const days = getDaysUntilExpiry(lot.expiration_date);
    return days !== null && days <= 30 && days >= 0;
  });

  // All non-quarantine lots available for bulk quarantine (Accepted, Hold, etc.)
  const quarantinableLots = lots.filter((l) => l.status !== 'Quarantine' && l.status !== 'Depleted');

  function openRetestModal(lot: InventoryLot) {
    setRetestLot(lot);
    setRetestAction(null);
    setNewExpiryDate('');
  }

  function closeRetestModal() {
    setRetestLot(null);
    setRetestAction(null);
    setNewExpiryDate('');
  }

  async function handleRetest() {
    if (!retestLot || !retestAction) return;
    if (retestAction === 'extend' && !newExpiryDate) {
      setToast({ message: 'Vui lòng nhập ngày hạn sử dụng mới', type: 'error' });
      return;
    }
    setSubmitting(true);
    try {
      await submitRetest(retestLot.lot_id, {
        action: retestAction,
        performed_by: 'qc_user',
        new_expiry_date: retestAction === 'extend' ? newExpiryDate : undefined,
      });
      setToast({
        message: retestAction === 'extend' ? `Đã gia hạn lô ${retestLot.lot_id}` : `Đã hủy lô ${retestLot.lot_id}`,
        type: 'success',
      });
      closeRetestModal();
      void loadLots();
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Lỗi xử lý re-test', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  }

  function toggleSelect(lotId: string) {
    setSelectedItems((prev) =>
      prev.includes(lotId) ? prev.filter((id) => id !== lotId) : [...prev, lotId],
    );
  }

  async function handleBulkQuarantine() {
    if (selectedItems.length === 0) {
      setToast({ message: 'Vui lòng chọn ít nhất một lô hàng', type: 'error' });
      return;
    }
    setSubmitting(true);
    try {
      const result = await bulkQuarantine(selectedItems);
      setToast({ message: `Đã cách ly ${result.updated} lô hàng thành công`, type: 'success' });
      setSelectedItems([]);
      void loadLots();
    } catch {
      setToast({ message: 'Không thể thực hiện cách ly', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Kiểm soát kho QC</h1>
        <p className="text-sm text-gray-500 mt-1">Re-test hàng sắp hết hạn & quản lý cách ly</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('alert')}
          className={`px-5 py-2 rounded-md text-sm font-medium transition ${
            activeTab === 'alert' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          ⚠️ Cảnh báo chất lượng
          {alertLots.length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
              {alertLots.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('quarantine')}
          className={`px-5 py-2 rounded-md text-sm font-medium transition ${
            activeTab === 'quarantine' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🔒 Cách ly hàng hóa
        </button>
      </div>

      {/* Alert Tab */}
      {activeTab === 'alert' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : alertLots.length === 0 ? (
            <p className="p-10 text-center text-gray-400">Không có lô hàng nào sắp hết hạn trong 30 ngày tới.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-5 py-3 text-left">Mã lô</th>
                    <th className="px-5 py-3 text-left">Tên sản phẩm</th>
                    <th className="px-5 py-3 text-left">Vị trí</th>
                    <th className="px-5 py-3 text-left">Hạn sử dụng</th>
                    <th className="px-5 py-3 text-left">Cảnh báo</th>
                    <th className="px-5 py-3 text-left">Trạng thái</th>
                    <th className="px-5 py-3 text-left">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {alertLots.map((lot) => {
                    const days = getDaysUntilExpiry(lot.expiration_date);
                    const isNearExpiry = days !== null && days <= 7;
                    return (
                      <tr key={lot.lot_id} className="hover:bg-gray-50">
                        <td className="px-5 py-3 font-mono font-medium text-gray-800">{lot.lot_id}</td>
                        <td className="px-5 py-3 text-gray-700">{lot.product_name}</td>
                        <td className="px-5 py-3 text-gray-500">{lot.location ?? '—'}</td>
                        <td className="px-5 py-3 text-gray-700">
                          {lot.expiration_date ? new Date(lot.expiration_date).toLocaleDateString('vi-VN') : '—'}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                            isNearExpiry ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {isNearExpiry ? `Near Expiry (${days ?? 0}d)` : `Retest Due (${days ?? 0}d)`}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_BADGE[lot.status] ?? 'bg-gray-100 text-gray-600'}`}>
                            {lot.status}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <button
                            onClick={() => openRetestModal(lot)}
                            className="px-3 py-1.5 bg-orange-500 text-white text-xs rounded-lg hover:bg-orange-600"
                          >
                            Thực hiện Re-test
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Quarantine Tab */}
      {activeTab === 'quarantine' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Chọn lô hàng cần chuyển sang trạng thái <span className="font-medium text-yellow-700">Quarantine</span>
            </p>
            <button
              onClick={() => void handleBulkQuarantine()}
              disabled={submitting || selectedItems.length === 0}
              className="px-4 py-2 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600 disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              )}
              🔒 Cách ly hàng loạt ({selectedItems.length})
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {loading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : quarantinableLots.length === 0 ? (
              <p className="p-10 text-center text-gray-400">Không có lô hàng nào có thể cách ly.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-5 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedItems.length === quarantinableLots.length && quarantinableLots.length > 0}
                          onChange={(e) =>
                            setSelectedItems(e.target.checked ? quarantinableLots.map((l) => l.lot_id) : [])
                          }
                          className="rounded"
                        />
                      </th>
                      <th className="px-5 py-3 text-left">Mã lô</th>
                      <th className="px-5 py-3 text-left">Tên sản phẩm</th>
                      <th className="px-5 py-3 text-left">Nhà cung cấp</th>
                      <th className="px-5 py-3 text-left">Vị trí</th>
                      <th className="px-5 py-3 text-left">Trạng thái hiện tại</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {quarantinableLots.map((lot) => (
                      <tr key={lot.lot_id} className={`hover:bg-gray-50 ${selectedItems.includes(lot.lot_id) ? 'bg-yellow-50' : ''}`}>
                        <td className="px-5 py-3">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(lot.lot_id)}
                            onChange={() => toggleSelect(lot.lot_id)}
                            className="rounded"
                          />
                        </td>
                        <td className="px-5 py-3 font-mono font-medium text-gray-800">{lot.lot_id}</td>
                        <td className="px-5 py-3 text-gray-700">{lot.product_name}</td>
                        <td className="px-5 py-3 text-gray-500">{lot.supplier_name}</td>
                        <td className="px-5 py-3 text-gray-500">{lot.location ?? '—'}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_BADGE[lot.status] ?? 'bg-gray-100 text-gray-600'}`}>
                            {lot.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Re-test Modal */}
      {retestLot && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Re-test lô hàng</h2>
                <p className="text-sm text-gray-500">{retestLot.lot_id} — {retestLot.product_name}</p>
              </div>
              <button onClick={closeRetestModal} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-700">
                HSD: {retestLot.expiration_date ? new Date(retestLot.expiration_date).toLocaleDateString('vi-VN') : '—'}
                {getDaysUntilExpiry(retestLot.expiration_date) !== null &&
                  ` (còn ${getDaysUntilExpiry(retestLot.expiration_date)} ngày)`}
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Chọn hành động</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setRetestAction('extend')}
                    className={`p-3 rounded-lg border text-sm font-medium transition ${
                      retestAction === 'extend'
                        ? 'bg-green-600 text-white border-green-600'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    ✓ GIA HẠN (Extend)
                  </button>
                  <button
                    onClick={() => setRetestAction('discard')}
                    className={`p-3 rounded-lg border text-sm font-medium transition ${
                      retestAction === 'discard'
                        ? 'bg-red-600 text-white border-red-600'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    ✕ HỦY LÔ (Discard)
                  </button>
                </div>
              </div>

              {retestAction === 'extend' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Ngày hạn sử dụng mới *</label>
                  <input
                    type="date"
                    value={newExpiryDate}
                    onChange={(e) => setNewExpiryDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              )}

              {retestAction === 'discard' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  ⚠️ Thao tác này sẽ đặt lô sang trạng thái <strong>Depleted</strong>. Không thể hoàn tác.
                </div>
              )}
            </div>

            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button
                onClick={closeRetestModal}
                disabled={submitting}
                className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={() => void handleRetest()}
                disabled={submitting || !retestAction || (retestAction === 'extend' && !newExpiryDate)}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting && (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                )}
                {submitting ? 'Đang xử lý...' : 'XÁC NHẬN'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
