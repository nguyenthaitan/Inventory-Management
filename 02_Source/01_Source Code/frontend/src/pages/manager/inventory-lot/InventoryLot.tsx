import { useState, useEffect } from "react";
import {
  InventoryLotAPI,
  type InventoryLot,
} from "../../../services/inventory-lot.service";
import { handleApiError, logApiError } from "../../../utils/error-handler";
import {
  SearchAndFilters,
  InventoryLotTable,
  DetailModal,
  EditModal,
  LoadingAndError,
} from "./components";
import { type EditFormValues } from "./utils/types";

async function fetchInventoryLotsData() {
  const { inventoryLots, error: apiError } = await InventoryLotAPI.getAll(
    1,
    50,
  );
  return { inventoryLots, apiError };
}

export default function InventoryLot() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInventoryLot, setSelectedInventoryLot] =
    useState<InventoryLot | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [inventoryLots, setInventoryLots] = useState<InventoryLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchInventoryLots = async () => {
      setLoading(true);
      setError(null);

      const { inventoryLots, apiError } = await fetchInventoryLotsData();

      if (apiError) {
        const errorMsg = "Không thể tải dữ liệu hàng hóa";
        setError(errorMsg);
        handleApiError(apiError);
        logApiError(apiError, "fetch_inventory_lots");
        return;
      }

      setInventoryLots(inventoryLots);
      setLoading(false);
    };

    fetchInventoryLots();
  }, []);

  const fetchInventoryLots = async () => {
    setLoading(true);
    setError(null);

    const { inventoryLots, apiError } = await fetchInventoryLotsData();

    if (apiError) {
      const errorMsg = "Không thể tải dữ liệu hàng hóa";
      setError(errorMsg);
      handleApiError(apiError);
      logApiError(apiError, "fetch_inventory_lots");
      return;
    }

    setInventoryLots(inventoryLots);
    setLoading(false);
  };

  const filteredInventoryLots = inventoryLots.filter(
    (inventoryLot) =>
      inventoryLot.lot_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inventoryLot.manufacturer_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  const handleViewDetail = (inventoryLot: InventoryLot) => {
    setSelectedInventoryLot(inventoryLot);
    setShowDetailModal(true);
  };

  const handleEditClick = (lot: InventoryLot) => {
    setSubmitError(null);
    setSelectedInventoryLot(lot);
    setShowEditModal(true);
  };

  const handleSubmit = async (values: EditFormValues) => {
    setSubmitError(null);
    const updated: InventoryLot = {
      ...values,
      quantity: values.quantity,
      in_use_expiration_date: values.in_use_expiration_date || undefined,
      parent_lot_id: values.parent_lot_id || undefined,
      notes: values.notes || undefined,
    };
    const { error: apiErr } = await InventoryLotAPI.update(
      values.lot_id,
      updated,
    );
    if (apiErr) {
      setSubmitError("Lưu thất bại. Vui lòng thử lại.");
      return;
    }
    setInventoryLots((prev) =>
      prev.map((lot) => (lot.lot_id === updated.lot_id ? updated : lot)),
    );
    setShowEditModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Loading & Error States */}
      <LoadingAndError
        isLoading={loading}
        error={error}
        onRetry={fetchInventoryLots}
      />

      {/* Search and Filters */}
      {!loading && (
        <SearchAndFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      )}

      {/* Inventory Lots Table */}
      <InventoryLotTable
        lots={filteredInventoryLots}
        onViewDetail={handleViewDetail}
        onEdit={handleEditClick}
      />

      {/* Modals */}
      <DetailModal
        isOpen={showDetailModal}
        selectedLot={selectedInventoryLot}
        onClose={() => setShowDetailModal(false)}
        onEdit={handleEditClick}
      />

      <EditModal
        isOpen={showEditModal}
        selectedLot={selectedInventoryLot}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleSubmit}
        submitError={submitError}
      />
    </div>
  );
}
