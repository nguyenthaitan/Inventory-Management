import React, { useState } from "react";
import { Filter, Download, Eye, Edit2 } from "lucide-react";

export interface InventoryTransaction {
  id: string;
  date: string;
  type: "RECEIPT" | "USAGE" | "ADJUSTMENT";
  itemCode: string;
  itemName: string;
  quantity: number;
  location: string;
  status: string;
}

interface Props {
  title?: string;
}

const InventoryTransactionList: React.FC<Props> = ({ title }) => {
  const [search, setSearch] = useState("");
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // TODO: replace with real API call
        const resp = await fetch("/api/inventory-transactions");
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data: InventoryTransaction[] = await resp.json();
        setTransactions(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Lỗi khi tải dữ liệu");
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = transactions.filter(
    (t) =>
      t.id.includes(search) ||
      t.itemCode.toLowerCase().includes(search.toLowerCase()) ||
      t.itemName.toLowerCase().includes(search.toLowerCase()),
  );

  function renderBody() {
    if (loading) {
      return (
        <tr>
          <td colSpan={9} className="p-16 text-center text-gray-400">
            Đang tải...
          </td>
        </tr>
      );
    }
    if (error) {
      return (
        <tr>
          <td colSpan={9} className="p-16 text-center text-red-500">
            {error}
          </td>
        </tr>
      );
    }
    if (filtered.length === 0) {
      return (
        <tr>
          <td colSpan={9} className="p-16 text-center text-gray-300">
            Không có giao dịch nào
          </td>
        </tr>
      );
    }
    return filtered.map((t) => (
      <tr
        key={t.id}
        className="border-t border-gray-50 hover:bg-blue-50/30 transition-colors"
      >
        <td className="px-5 py-4 font-bold text-gray-900">{t.id}</td>
        <td className="px-5 py-4">{t.date}</td>
        <td className="px-5 py-4">
          <span
            className={`font-bold ${
              t.type === "RECEIPT"
                ? "text-blue-600"
                : t.type === "USAGE"
                  ? "text-red-600"
                  : "text-yellow-600"
            }`}
          >
            {t.type}
          </span>
        </td>
        <td className="px-5 py-4">{t.itemCode}</td>
        <td className="px-5 py-4">{t.itemName}</td>
        <td className="px-5 py-4">{t.quantity}</td>
        <td className="px-5 py-4">{t.location}</td>
        <td className="px-5 py-4">
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
            {t.status}
          </span>
        </td>
        <td className="px-5 py-4 flex gap-2">
          <button className="text-blue-600 hover:text-blue-800">
            <Eye size={16} />
          </button>
          <button className="text-green-600 hover:text-green-800">
            <Edit2 size={16} />
          </button>
        </td>
      </tr>
    ));
  }

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          {title || "Danh sách giao dịch"}
        </h1>
      </div>

      {/* search and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm theo mã hoặc tên..."
          className="w-full sm:w-1/2 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all">
            <Filter size={16} />
            Bộ lọc
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all">
            <Download size={16} />
            Xuất Excel
          </button>
        </div>
      </div>

      {/* table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {[
                "Mã giao dịch",
                "Ngày",
                "Loại",
                "Mã hàng",
                "Tên hàng",
                "Số lượng",
                "Vị trí",
                "Trạng thái",
                "Thao tác",
              ].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-xs font-black text-gray-400 uppercase tracking-widest"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{renderBody()}</tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTransactionList;
