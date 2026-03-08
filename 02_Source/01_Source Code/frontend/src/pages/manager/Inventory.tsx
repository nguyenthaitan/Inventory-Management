import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Eye,
  Edit,
  Download,
  Printer,
  X,
  Save,
  AlertCircle,
  Loader,
} from "lucide-react";
import {
  InventoryLotAPI,
  type InventoryLot,
} from "../../services/inventory-lot.service";
import { handleApiError, logApiError } from "../../utils/error-handler";

interface Product {
  id: string;
  name: string;
  code: string;
  category: string;
  quantity: number;
  location: string;
  importDate: string;
  expiryDate: string;
  status: "normal" | "warning" | "expired";
}

export default function ManagerInventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // --- Logic mới cho Chỉnh sửa ---
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  // Loading and Error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to determine status based on expiration date
  const getExpireStatus = (
    expiryDate: string,
  ): "normal" | "warning" | "expired" => {
    const today = new Date();
    const expireDate = new Date(expiryDate);
    const daysUntilExpiry = Math.floor(
      (expireDate.getTime() - today.getTime()) / (1000 * 3600 * 24),
    );

    if (daysUntilExpiry < 0) return "expired";
    if (daysUntilExpiry < 30) return "warning";
    return "normal";
  };

  // Fetch data on component mount
  useEffect(() => {
    const fetchInventoryLots = async () => {
      setLoading(true);
      setError(null);

      const { lots, error: apiError } = await InventoryLotAPI.getAll(1, 50);
      console.log("Fetched inventory lots:", lots, "API error:", apiError);

      if (apiError) {
        const errorMsg = "Không thể tải dữ liệu hàng hóa";
        setError(errorMsg);
        handleApiError(apiError);
        logApiError(apiError, "fetch_inventory_lots");
        return;
      }

      // Map InventoryLot to Product interface
      const mappedProducts = lots.map(
        (lot: InventoryLot): Product => ({
          id: lot.lot_id,
          name: lot.material_name || `Lot ${lot.lot_id}`,
          code: lot.lot_id,
          category: lot.manufacturer_name,
          quantity: parseInt(String(lot.quantity), 10) || 0,
          location: lot.storage_location,
          importDate: new Date(lot.received_date).toLocaleDateString("vi-VN"),
          expiryDate: new Date(lot.expiration_date).toLocaleDateString("vi-VN"),
          status: getExpireStatus(lot.expiration_date),
        }),
      );

      setProducts(mappedProducts);
      setLoading(false);
    };

    fetchInventoryLots();
  }, []);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "bg-green-100 text-green-700";
      case "warning":
        return "bg-yellow-100 text-yellow-700";
      case "expired":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "normal":
        return "Bình thường";
      case "warning":
        return "Sắp hết hạn";
      case "expired":
        return "Hết hạn";
      default:
        return "Không xác định";
    }
  };

  const handleViewDetail = (product: Product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  // --- Hàm xử lý Chỉnh sửa ---
  const handleEditClick = (product: Product) => {
    setEditFormData({ ...product });
    setShowEditModal(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (editFormData) {
      setEditFormData({ ...editFormData, [name]: value });
    }
  };

  const handleUpdateProduct = () => {
    if (editFormData) {
      setProducts(
        products.map((p) => (p.id === editFormData.id ? editFormData : p)),
      );
      setShowEditModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center p-8 bg-white rounded-xl border border-gray-100">
          <Loader className="animate-spin text-blue-500 mr-2" size={24} />
          <span className="text-gray-600">Đang tải dữ liệu...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="text-red-600" size={20} />
          <div className="flex-1">
            <p className="text-red-800 font-medium">{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                const fetchInventoryLots = async () => {
                  const { lots, error: apiError } =
                    await InventoryLotAPI.getAll(1, 50);
                  if (apiError) {
                    setError("Không thể tải dữ liệu hàng hóa");
                    return;
                  }
                  const mappedProducts = lots.map(
                    (lot: InventoryLot): Product => ({
                      id: lot.lot_id,
                      name: lot.material_name || `Lot ${lot.lot_id}`,
                      code: lot.lot_id,
                      category: lot.manufacturer_name,
                      quantity: parseInt(String(lot.quantity), 10) || 0,
                      location: lot.storage_location,
                      importDate: new Date(
                        lot.received_date,
                      ).toLocaleDateString("vi-VN"),
                      expiryDate: new Date(
                        lot.expiration_date,
                      ).toLocaleDateString("vi-VN"),
                      status: getExpireStatus(lot.expiration_date),
                    }),
                  );
                  setProducts(mappedProducts);
                  setError(null);
                  setLoading(false);
                };
                fetchInventoryLots();
              }}
              className="text-red-600 hover:text-red-700 font-medium underline"
            >
              Thử lại
            </button>
          </div>
        </div>
      )}

      {/* Search and Filters - hiển thị khi không loading */}
      {!loading && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc mã hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center space-x-2 transition">
              <Filter size={20} />
              <span>Bộ lọc</span>
            </button>
            <button className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center space-x-2 transition">
              <Download size={20} />
              <span>Xuất Excel</span>
            </button>
          </div>
        </div>
      )}
      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Mã hàng
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Tên hàng
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Loại
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Số lượng
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Vị trí
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {product.code}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {product.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {product.location}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(product.status)}`}
                      >
                        {getStatusText(product.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDetail(product)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEditClick(product)}
                          className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition"
                          title="Chỉnh sửa"
                        >
                          <Edit size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Không tìm thấy dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- POPUP CHỈNH SỬA (MỚI) --- */}
      {showEditModal && editFormData && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4"
          style={{
            backdropFilter: "blur(8px)",
            backgroundColor: "rgba(255, 255, 255, 0.4)",
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-gray-200 animate-in zoom-in-95">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Edit size={20} className="text-green-600" /> Chỉnh sửa hàng hóa
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Tên hàng
                </label>
                <input
                  name="name"
                  value={editFormData.name}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Mã hàng
                </label>
                <input
                  name="code"
                  value={editFormData.code}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Loại
                </label>
                <input
                  name="category"
                  value={editFormData.category}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Số lượng
                </label>
                <input
                  name="quantity"
                  type="number"
                  value={editFormData.quantity}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Trạng thái
                </label>
                <select
                  name="status"
                  value={editFormData.status}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="normal">Bình thường</option>
                  <option value="warning">Sắp hết hạn</option>
                  <option value="expired">Hết hạn</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex gap-3 rounded-b-2xl">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-2 bg-white border border-gray-300 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateProduct}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-green-700 transition"
              >
                <Save size={18} /> Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL XEM CHI TIẾT (GIỮ NGUYÊN) --- */}
      {showDetailModal && selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 animate-in fade-in"
          style={{
            backdropFilter: "blur(8px)",
            backgroundColor: "rgba(255, 255, 255, 0.3)",
          }}
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 transform transition-all duration-300 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <h2 className="text-xl font-bold text-gray-800">
                Thông tin chi tiết thuốc
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                {[
                  {
                    label: "Mã hàng",
                    value: selectedProduct.code,
                  },
                  {
                    label: "Tên hàng",
                    value: selectedProduct.name,
                    highlight: true,
                  },
                  {
                    label: "Loại hàng",
                    value: selectedProduct.category,
                  },
                  {
                    label: "Số lượng tồn kho",
                    value: `${selectedProduct.quantity} hộp`,
                  },
                  {
                    label: "Vị trí lưu trữ",
                    value: selectedProduct.location,
                  },
                  {
                    label: "Ngày nhập",
                    value: selectedProduct.importDate,
                  },
                  {
                    label: "Hạn sử dụng",
                    value: selectedProduct.expiryDate,
                  },
                ].map((item, index) => (
                  <div key={index}>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {item.label}
                    </label>
                    <p
                      className={`mt-1 text-gray-900 font-medium ${item.highlight ? "text-lg text-blue-600" : ""}`}
                    >
                      {item.value}
                    </p>
                  </div>
                ))}
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Trạng thái
                  </label>
                  <div className="mt-1">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(selectedProduct.status)}`}
                    >
                      {getStatusText(selectedProduct.status)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleEditClick(selectedProduct);
                  }}
                  className="flex-1 min-w-30 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition shadow-lg shadow-blue-100"
                >
                  <Edit size={18} /> <span>Sửa thông tin</span>
                </button>
                <button className="flex-1 min-w-30 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold flex items-center justify-center gap-2 transition">
                  <Printer size={18} /> <span>In tem nhãn</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
