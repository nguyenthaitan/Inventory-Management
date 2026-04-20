import { Injectable, Logger } from '@nestjs/common';
// Schema imports chỉ để biểu diễn kiểu và giúp hiểu domain
import { InventoryTransaction } from '../schemas/inventory-transaction.schema';
import { InventoryLot } from '../schemas/inventory-lot.schema';
import { WarehouseSlip } from '../schemas/warehouse-slip.schema';
// Repository: encapsulate truy vấn DB, không dùng Model trực tiếp
import { InventoryLotRepository } from '../inventory-lot/inventory-lot.repository';
import { InventoryTransactionRepository } from '../inventory-transaction/inventory-transaction.repository';
import { WarehouseSlipRepository } from '../warehouse-slip/warehouse-slip.repository';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);
  /**
   * DashboardService dùng các Repository để tách trách nhiệm DB ra khỏi logic báo cáo.
   * - `txRepo`  : thao tác trên collection `inventory_transactions`.
   * - `lotRepo` : thao tác trên collection `inventory_lots`.
   * - `slipRepo`: thao tác trên collection `warehouse_slips`.
   *
   * Lợi ích:
   * - Dễ mock khi viết unit test.
   * - Tái sử dụng các phương thức truy vấn chung.
   */
  constructor(
    private readonly txRepo: InventoryTransactionRepository,
    private readonly lotRepo: InventoryLotRepository,
    private readonly slipRepo: WarehouseSlipRepository,
  ) {}

  // Minimal summary: totals and top materials
  /**
   * Lấy summary tổng quan cho dashboard.
   * Mô tả ngắn (hiện tại):
   * 1) Lấy tất cả `inventory_lots` (có thể filter theo `warehouse_id`).
   * 2) Với mỗi lô, lookup tất cả `warehouse_slips.lines` có `lot_id` tương ứng và tính tổng
   *    `line_value_sum = SUM(lines.quantity * lines.unit_price)` cho lô đó.
   * 3) Dùng `lot_value = line_value_sum` (nếu không có dòng có unit_price thì `lot_value = 0`),
   *    sau đó nhóm theo `material_id` để tính `total_value` và `total_quantity`.
   *
   * Ghi chú vận hành:
   * - Cách này cộng tất cả dòng có giá để tính giá trị lô (khác với lấy "latest unit_price").
   * - Vẫn có thể bổ sung fallback (ví dụ: nếu không có line value thì dùng `lot.quantity * fallback_price`).
   * - Về hiệu năng: pipeline này thực hiện lookup + group per-lot; nếu dữ liệu lớn có thể cần pre-aggregate hoặc cache.
   */
  async getSummary(
    filters: { warehouseId?: string; from?: string; to?: string } = {},
  ) {
    // Simple implementation: fetch relevant lots and slips via repository helpers,
    // then compute aggregation in memory. This is easier to read but may be
    // inefficient for very large datasets — consider pre-aggregation if needed.

    // 1) Fetch lots for the warehouse (unpaginated by using a large limit)
    const lotRes = await this.lotRepo.findOptions({
      warehouse_id: filters.warehouseId,
    });
    const lots: InventoryLot[] = (lotRes.data || []) as InventoryLot[];

    if (lots.length === 0) {
      return { total_quantity: 0, total_value: 0, top_materials: [] };
    }

    const lotById = new Map<string, any>();
    for (const l of lots) {
      const lid = (l as any).lot_id;
      if (typeof lid !== 'string') continue;
      lotById.set(lid, l);
    }

    // 2) Fetch confirmed slips in the date range for the warehouse
    const slipFilters: any = { status: 'CONFIRMED' };
    if (filters.warehouseId) slipFilters.warehouse_id = filters.warehouseId;
    if (filters.from) slipFilters.from = new Date(filters.from);
    if (filters.to) slipFilters.to = new Date(filters.to);
    const slipRes = await this.slipRepo.findAll(slipFilters);
    const slips: WarehouseSlip[] = (slipRes.items || []) as WarehouseSlip[];

    // 3) Accumulate lot values from slip.lines (unit_price * qty)
    const lotValues = new Map<string, { value: number; qty: number }>();
    for (const slip of slips) {
      for (const line of slip.lines || []) {
        if (!line.unit_price) continue;
        const lid = line.lot_id;
        if (typeof lid !== 'string') continue;
        if (!lotById.has(lid)) continue; // only care about lots in scope
        const cur = lotValues.get(lid) ?? { value: 0, qty: 0 };
        cur.value += (line.quantity || 0) * (line.unit_price || 0);
        cur.qty += line.quantity || 0;
        lotValues.set(lid, cur);
      }
    }

    // Fetch transactions in the date range (if provided). We will use
    // transactions to determine which lots are "in-scope" when a date
    // range is provided because transactions are time-based and align with
    // reporting expectations.
    const txFilters: any = {};
    if (filters.from) txFilters.from = new Date(filters.from);
    if (filters.to) txFilters.to = new Date(filters.to);
    const txRes = await this.txRepo.findAll(txFilters);
    const txs: InventoryTransaction[] = (txRes.items ||
      []) as InventoryTransaction[];

    // Determine which lots are in-scope for this summary.
    // If a date range was provided, include lots that appear in transactions
    // within that range; otherwise include all fetched lots (full snapshot).
    const includedLotIds = new Set<string>();
    if (filters.from || filters.to) {
      for (const t of txs) {
        const lid = t.lot_id;
        if (typeof lid === 'string' && lotById.has(lid))
          includedLotIds.add(lid);
      }
    } else {
      for (const lid of lotById.keys()) includedLotIds.add(lid);
    }

    // Compute total_value per material from lotValues (slip lines), only for included lots
    const materialValueAgg = new Map<string, number>();
    for (const lot of lots) {
      const lid = (lot as any).lot_id;
      if (typeof lid !== 'string') continue;
      if (!includedLotIds.has(lid)) continue;
      const lv = lotValues.get(lid) ?? { value: 0, qty: 0 };
      const mid = lot.material_id as string;
      materialValueAgg.set(
        mid,
        (materialValueAgg.get(mid) || 0) + (lv.value || 0),
      );
    }

    // Compute transaction-based totals per material (for top_materials)
    const materialTxAgg = new Map<string, number>();
    for (const t of txs) {
      const lid = t.lot_id;
      if (typeof lid !== 'string') continue;
      if (!includedLotIds.has(lid)) continue; // only consider lots in current scope
      const lot = lotById.get(lid);
      const mid = lot.material_id as string;
      materialTxAgg.set(mid, (materialTxAgg.get(mid) || 0) + (t.quantity || 0));
    }

    const top_materials = Array.from(materialTxAgg.entries())
      .map(([material_id, total_quantity]) => ({
        material_id,
        material_name: material_id,
        total_quantity,
        total_value: materialValueAgg.get(material_id) || 0,
      }))
      .sort((a, b) => b.total_quantity - a.total_quantity)
      .slice(0, 10);

    const total_quantity = Array.from(lots).reduce((s, lot) => {
      const lid = (lot as any).lot_id;
      if (typeof lid !== 'string') return s;
      if (!includedLotIds.has(lid)) return s;
      return s + (lot.quantity || 0);
    }, 0);

    const total_value = Array.from(materialValueAgg.values()).reduce(
      (s, v) => s + v,
      0,
    );

    this.logger.debug(
      `getSummary filters=${JSON.stringify(filters)} lots=${lots.length} slips=${slips.length} txs=${txs.length} included=${includedLotIds.size} total_quantity=${total_quantity} total_value=${total_value}`,
    );
    return { total_quantity, total_value, top_materials };
  }

  // trends: time-series of in/out quantities
  async getTrends(params: {
    metric: 'in' | 'out';
    from?: string;
    to?: string;
    interval?: 'day' | 'week' | 'month';
    warehouseId?: string;
  }) {
    /**
     * Mục đích:
     * - Sinh dữ liệu dạng chuỗi thời gian (time-series) cho biểu đồ: lượng nhập/xuất theo khoảng thời gian.
     * Dành cho ai:
     * - Người tạo báo cáo hoặc biểu đồ trên giao diện muốn xem biến động theo ngày/tuần/tháng.
     * Tham số:
     * - `metric`: 'in' = nhập hàng, 'out' = xuất/hủy
     * - `from` / `to`: khoảng thời gian lọc
     * - `interval`: mức gộp chu kỳ ('day'/'week'/'month')
     * - `warehouseId` (tuỳ chọn): nếu chỉ muốn xem cho một kho
     * Trả về:
     * - Mảng các mục { period: 'YYYY-MM-DD'|'YYYY-WW'|'YYYY-MM', total_quantity: number }
     *   - `period`: tên chu kỳ (dùng để vẽ trục thời gian)
     *   - `total_quantity`: tổng lượng trong chu kỳ đó
     */
    const { metric, from, to, interval = 'day', warehouseId } = params;

    // 1) Fetch transactions matching metric + date range (unpaginated with large limit)
    const txFilters: any = {};
    if (metric === 'in') txFilters.transaction_type = 'Receipt';
    else txFilters.transaction_type = undefined; // we'll filter out 'in'/'out' by transaction_type below
    if (from) txFilters.from = new Date(from);
    if (to) txFilters.to = new Date(to);

    const txRes = await this.txRepo.findAll(txFilters);
    let txs: InventoryTransaction[] = (txRes.items ||
      []) as InventoryTransaction[];

    // If metric === 'out', keep Usage and Disposal
    if (metric === 'out') {
      txs = txs.filter((t) =>
        ['Usage', 'Disposal'].includes(t.transaction_type),
      );
    } else {
      txs = txs.filter((t) => t.transaction_type === 'Receipt');
    }

    // If warehouseId filter is requested, load lots for txs and filter
    if (warehouseId) {
      const lotIds = Array.from(
        new Set(
          txs
            .map((t) => t.lot_id)
            .filter((id): id is string => typeof id === 'string'),
        ),
      ) as string[];
      const lots = await this.lotRepo.findByLotIds(lotIds);
      const lotWarehouse = new Map(
        lots.map((l: any) => [l.lot_id, l.warehouse_id]),
      );
      txs = txs.filter((t) => {
        const lid = t.lot_id;
        if (!lid) return false;
        return lotWarehouse.get(lid) === warehouseId;
      });
    }

    // Helper: compute period key from Date
    const toPeriod = (d: Date) => {
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      if (interval === 'month') return `${y}-${m}`;
      if (interval === 'week') {
        // ISO week number approximation
        const tmp = new Date(
          Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
        );
        const dayNum = tmp.getUTCDay() || 7;
        tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil(
          ((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
        );
        return `${tmp.getUTCFullYear()}-${String(weekNo).padStart(2, '0')}`;
      }
      return `${y}-${m}-${day}`;
    };

    // Group in JS
    const agg = new Map<string, number>();
    for (const t of txs) {
      const pd = toPeriod(new Date(t.transaction_date));
      agg.set(pd, (agg.get(pd) || 0) + (t.quantity || 0));
    }

    const rows = Array.from(agg.entries())
      .map(([period, total_quantity]) => ({ period, total_quantity }))
      .sort((a, b) => (a.period < b.period ? -1 : 1));

    return rows;
  }

  // drilldown: paginated transactions or slips
  async getDrilldown(params: {
    metric?: 'in' | 'out';
    page?: number;
    limit?: number;
    materialId?: string;
    from?: string;
    to?: string;
    warehouseId?: string;
  }) {
    /**
     * Mục đích:
     * - Trả về danh sách chi tiết (drilldown) các giao dịch/lô theo điều kiện, hỗ trợ phân trang.
     * Dành cho ai:
     * - Nhân viên kiểm kho hoặc người phân tích muốn xem chi tiết từng giao dịch (gồm mã lô, số lượng, ngày).
     * Tham số:
     * - `materialId`: (tuỳ chọn) lọc theo mã vật liệu
     * - `warehouseId`: (tuỳ chọn) lọc theo kho
     * - `from` / `to`: phạm vi ngày
     * - `page` / `limit`: phân trang
     * Trả về:
     * - `items`: mảng giao dịch hiện tại (mỗi item chứa `transaction_id`, `lot_id`, `quantity`, `transaction_date`, ...)
     * - `total`: tổng số kết quả phù hợp (dùng để hiển thị số trang)
     * - `page`, `limit`: echo các tham số phân trang
     */
    // Simple implementation: fetch transactions in date range (large limit),
    // optionally filter by materialId / warehouseId in memory, then paginate.
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 20;

    // Fetch transactions matching date range and metric roughly
    const txFilters: any = {};
    if (params.from) txFilters.from = new Date(params.from);
    if (params.to) txFilters.to = new Date(params.to);
    // We'll filter metric specifics after fetching
    const txRes = await this.txRepo.findAll(txFilters);
    let items: InventoryTransaction[] = (txRes.items ||
      []) as InventoryTransaction[];

    // Apply metric filter
    if (params.metric === 'in')
      items = items.filter((t) => t.transaction_type === 'Receipt');
    else if (params.metric === 'out')
      items = items.filter((t) =>
        ['Usage', 'Disposal'].includes(t.transaction_type),
      );

    // If materialId or warehouseId provided, filter by resolving lot info
    if (params.materialId || params.warehouseId) {
      const lotIds = Array.from(
        new Set(
          items
            .map((t) => t.lot_id)
            .filter((id): id is string => typeof id === 'string'),
        ),
      ) as string[];
      const lots = await this.lotRepo.findByLotIds(lotIds);
      const lotMap = new Map(lots.map((l: any) => [l.lot_id, l]));

      items = items.filter((t) => {
        const lid = t.lot_id;
        if (!lid) return false;
        const lot = lotMap.get(lid);
        if (!lot) return false;
        if (params.materialId && lot.material_id !== params.materialId)
          return false;
        if (params.warehouseId && lot.warehouse_id !== params.warehouseId)
          return false;
        return true;
      });
    }

    // Sort by transaction_date desc, paginate in memory
    items.sort(
      (a, b) =>
        new Date(b.transaction_date).getTime() -
        new Date(a.transaction_date).getTime(),
    );
    const total = items.length;
    const start = (page - 1) * limit;
    const pageItems = items.slice(start, start + limit);

    return { items: pageItems, total, page, limit };
  }
}
