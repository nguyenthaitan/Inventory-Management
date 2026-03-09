import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import Toast from '../../components/Toast';
import { getQCTestsByLot, getSupplierPerformance } from '../../services/qcServices';
import type { QCTest, SupplierPerformance } from '../../types/qc';

type Tab = 'history' | 'supplier';

const RESULT_BADGE: Record<string, string> = {
  Pass: 'bg-green-100 text-green-700',
  Fail: 'bg-red-100 text-red-700',
  Pending: 'bg-amber-100 text-amber-700',
};

export default function ReportTraceability() {
  const [activeTab, setActiveTab] = useState<Tab>('history');

  // History tab
  const [searchInput, setSearchInput] = useState('');
  const [qcHistory, setQcHistory] = useState<QCTest[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null);

  // Supplier tab
  const [suppliers, setSuppliers] = useState<SupplierPerformance[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadSuppliers = useCallback(async () => {
    setLoadingSuppliers(true);
    try {
      const data = await getSupplierPerformance(dateFrom || undefined, dateTo || undefined);
      setSuppliers(data);
    } catch {
      setToast({ message: 'Không thể tải báo cáo nhà cung cấp', type: 'error' });
    } finally {
      setLoadingSuppliers(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    void loadSuppliers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);  // intentionally run once on mount; user triggers re-fetch via "Áp dụng" button

  async function handleSearch() {
    const lotId = searchInput.trim();
    if (!lotId) return;
    setSearching(true);
    try {
      const tests = await getQCTestsByLot(lotId);
      setQcHistory(tests);
      setSelectedLotId(lotId);
    } catch {
      setToast({ message: 'Không tìm thấy lô hàng hoặc không có lịch sử QC', type: 'error' });
      setQcHistory([]);
      setSelectedLotId(null);
    } finally {
      setSearching(false);
    }
  }

  // Derived supplier KPIs
  const bestSupplier = [...suppliers].sort((a, b) => b.quality_rate - a.quality_rate)[0];
  const worstSupplier = [...suppliers].sort((a, b) => a.quality_rate - b.quality_rate)[0];
  const totalBatches = suppliers.reduce((sum, s) => sum + s.total_batches, 0);

  function exportCSV() {
    if (suppliers.length === 0) return;
    const header = 'Nhà cung cấp,Tổng lô,Đạt,Từ chối,Tỷ lệ đạt (%)';
    const rows = suppliers.map(
      (s) => `${s.supplier_name},${s.total_batches},${s.approved},${s.rejected},${s.quality_rate.toFixed(2)}`,
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supplier_performance_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none uppercase">Truy vết & Báo cáo</h1>
        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1">Lịch sử QC theo lô và hiệu suất nhà cung cấp</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('history')}
          className={`m-2 px-5 py-3 text-sm font-semibold transition border-b-2 -mb-px ${
            activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Lịch sử QC
        </button>
        <button
          onClick={() => setActiveTab('supplier')}
          className={`m-2 px-5 py-3 text-sm font-semibold transition border-b-2 -mb-px ${
            activeTab === 'supplier' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Hiệu suất Nhà CC
        </button>
      </div>

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-5">
          {/* Search bar */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') void handleSearch(); }}
                placeholder="Nhập mã lô hàng (VD: LOT-001)..."
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
            <button
              onClick={() => void handleSearch()}
              disabled={searching || !searchInput.trim()}
              className="px-6 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {searching && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              )}
              {searching ? 'Đang tìm...' : 'Tìm kiếm'}
            </button>
          </div>

          {/* Results */}
          {selectedLotId && (
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-gray-900">Lịch sử QC — Lô: <span className="font-mono text-blue-600">{selectedLotId}</span></h2>
                  <p className="text-xs text-gray-400 mt-0.5">{qcHistory.length} bản ghi kiểm nghiệm</p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 border border-gray-200 text-gray-600 text-xs rounded-lg hover:bg-gray-50"
                >
                  🖨️ Xuất COA
                </button>
              </div>

              {qcHistory.length === 0 ? (
                <p className="p-8 text-center text-gray-400">Không có bản ghi QC nào cho lô này.</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {qcHistory.map((test, idx) => (
                    <div key={test.test_id} className="px-5 py-4 flex gap-4">
                      {/* Timeline dot */}
                      <div className="flex flex-col items-center pt-1">
                        <div className={`w-3 h-3 rounded-full shrink-0 ${
                          test.result_status === 'Pass' ? 'bg-green-500' :
                          test.result_status === 'Fail' ? 'bg-red-500' : 'bg-yellow-400'
                        }`} />
                        {idx < qcHistory.length - 1 && (
                          <div className="w-0.5 flex-1 bg-gray-200 mt-1 min-h-4" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-gray-800 text-sm">{test.test_type}</span>
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${RESULT_BADGE[test.result_status] ?? 'bg-gray-100 text-gray-600'}`}>
                                {test.result_status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{test.test_result}</p>
                            {test.acceptance_criteria && (
                              <p className="text-xs text-gray-400 mt-0.5">Tiêu chuẩn: {test.acceptance_criteria}</p>
                            )}
                            {test.reject_reason && (
                              <p className="text-xs text-red-500 mt-0.5">Lý do: {test.reject_reason}</p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs text-gray-400">{new Date(test.test_date).toLocaleDateString('vi-VN')}</p>
                            <p className="text-xs text-gray-500 mt-0.5">By: {test.performed_by}</p>
                            {test.verified_by && (
                              <p className="text-xs text-gray-400">✓ {test.verified_by}</p>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Phương pháp: {test.test_method}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!selectedLotId && (
            <div className="p-12 bg-white border border-dashed border-gray-200 rounded-xl text-center text-gray-400">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-sm">Nhập mã lô hàng để xem lịch sử kiểm nghiệm</p>
            </div>
          )}
        </div>
      )}

      {/* Supplier Tab */}
      {activeTab === 'supplier' && (
        <div className="space-y-5">
          {/* Date range filter */}
          <div className="flex gap-3 items-end flex-wrap">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Từ ngày</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Đến ngày</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <button
              onClick={() => void loadSuppliers()}
              disabled={loadingSuppliers}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loadingSuppliers && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              )}
              Áp dụng
            </button>
            <button
              onClick={exportCSV}
              disabled={suppliers.length === 0}
              className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              ⬇ Xuất CSV
            </button>
          </div>

          {/* KPI summary cards */}
          {suppliers.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-xs font-medium text-blue-500 uppercase">Tổng lô đã kiểm</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">{totalBatches}</p>
                <p className="text-xs text-blue-400 mt-0.5">{suppliers.length} nhà cung cấp</p>
              </div>
              {bestSupplier && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-xs font-medium text-green-500 uppercase">Tốt nhất</p>
                  <p className="text-base font-bold text-green-700 mt-1 truncate">{bestSupplier.supplier_name}</p>
                  <p className="text-xs text-green-600">{bestSupplier.quality_rate.toFixed(1)}% đạt chuẩn</p>
                </div>
              )}
              {worstSupplier && worstSupplier.supplier_name !== bestSupplier?.supplier_name && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-xs font-medium text-red-500 uppercase">Cần cải thiện</p>
                  <p className="text-base font-bold text-red-700 mt-1 truncate">{worstSupplier.supplier_name}</p>
                  <p className="text-xs text-red-600">{worstSupplier.quality_rate.toFixed(1)}% đạt chuẩn</p>
                </div>
              )}
            </div>
          )}

          {/* Supplier table */}
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
            {loadingSuppliers ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : suppliers.length === 0 ? (
              <p className="p-10 text-center text-gray-400">Không có dữ liệu nhà cung cấp trong khoảng thời gian này.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-6 py-4 text-left font-bold tracking-wider">Nhà cung cấp</th>
                      <th className="px-6 py-4 text-right font-bold tracking-wider">Tổng lô</th>
                      <th className="px-6 py-4 text-right font-bold tracking-wider">Đạt</th>
                      <th className="px-6 py-4 text-right font-bold tracking-wider">Từ chối</th>
                      <th className="px-6 py-4 text-left font-bold tracking-wider">Chỉ số chất lượng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {suppliers.map((s) => (
                      <tr key={s.supplier_name} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-semibold text-gray-800">{s.supplier_name}</td>
                        <td className="px-6 py-4 text-right text-gray-700">{s.total_batches}</td>
                        <td className="px-6 py-4 text-right text-green-600 font-medium">{s.approved}</td>
                        <td className="px-6 py-4 text-right text-red-600 font-medium">{s.rejected}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 max-w-32 bg-gray-100 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  s.quality_rate >= 90 ? 'bg-green-500' :
                                  s.quality_rate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(s.quality_rate, 100)}%` }}
                              />
                            </div>
                            <span className={`text-xs font-semibold min-w-10 ${
                              s.quality_rate >= 90 ? 'text-green-600' :
                              s.quality_rate >= 70 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {s.quality_rate.toFixed(1)}%
                            </span>
                          </div>
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

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
