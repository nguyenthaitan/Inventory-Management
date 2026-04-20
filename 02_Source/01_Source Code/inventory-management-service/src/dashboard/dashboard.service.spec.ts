/**
 * File: dashboard.service.spec.ts
 * Mục đích: Unit tests cho DashboardService
 * Ghi chú: Các comment bằng tiếng Việt để giải thích chi tiết hành vi và mục đích của từng phần trong test.
 */

import { DashboardService } from './dashboard.service';
import { InventoryLotRepository } from '../inventory-lot/inventory-lot.repository';
import { InventoryTransactionRepository } from '../inventory-transaction/inventory-transaction.repository';
import { WarehouseSlipRepository } from '../warehouse-slip/warehouse-slip.repository';

describe('DashboardService', () => {
  // Biến chứa instance service đang test
  let service: DashboardService;

  // Mock cho repository giao dịch (chỉ cần phương thức aggregate trong tests này)
  let txRepo: jest.Mocked<Pick<InventoryTransactionRepository, 'aggregate'>>;

  // Mock cho repository lô hàng (chỉ cần phương thức aggregate)
  let lotRepo: jest.Mocked<Pick<InventoryLotRepository, 'aggregate'>>;

  // Mock cho repository phiếu kho (không cần phương thức cụ thể trong tests hiện tại)
  let slipRepo: jest.Mocked<Partial<WarehouseSlipRepository>>;

  beforeEach(() => {
    // Tạo mock đơn giản: aggregate là jest.fn() để có thể điều khiển giá trị trả về
    txRepo = { aggregate: jest.fn() } as any;
    lotRepo = { aggregate: jest.fn() } as any;
    slipRepo = {} as any;

    // Lưu ý thứ tự tham số của constructor DashboardService: (txRepo, lotRepo, slipRepo)
    // Tạo instance service với các repository đã mock
    service = new DashboardService(
      txRepo as any,
      lotRepo as any,
      slipRepo as any,
    );
  });

  it('getSummary returns aggregated totals and top materials', async () => {
    // Mock kết quả aggregate từ repository lô hàng.
    // Giả sử aggregate của lotRepo trả về tổng lượng và giá trị theo material_id
    lotRepo.aggregate.mockResolvedValueOnce([
      {
        _id: 'MAT-001',
        total_quantity: 10,
        total_value: 100,
        material_name: 'Acetone',
      },
      {
        _id: 'MAT-002',
        total_quantity: 5,
        total_value: 50,
        material_name: 'Ethanol',
      },
    ] as any);

    // Mock kết quả aggregate từ repository giao dịch.
    // Giả sử aggregate của txRepo trả về tổng lượng giao dịch (ví dụ IN) theo material_id
    txRepo.aggregate.mockResolvedValueOnce([
      { _id: 'MAT-001', total_quantity: 8, material_name: 'Acetone' },
      { _id: 'MAT-002', total_quantity: 3, material_name: 'Ethanol' },
    ] as any);

    // Gọi method getSummary của service (thường sẽ gọi các aggregate trên repo)
    const res = await service.getSummary({});

    // Kỳ vọng: tổng lượng (từ lotRepo) cộng lại = 10 + 5 = 15
    expect(res.total_quantity).toBe(15);

    // Kỳ vọng: tổng giá trị (từ lotRepo) = 100 + 50 = 150
    expect(res.total_value).toBe(150);

    // Kỳ vọng: top_materials lấy từ kết quả giao dịch (txRepo), map lại thành cấu trúc mong muốn
    expect(res.top_materials).toEqual([
      { material_id: 'MAT-001', material_name: 'Acetone', total_quantity: 8 },
      { material_id: 'MAT-002', material_name: 'Ethanol', total_quantity: 3 },
    ]);
  });

  it('getTrends maps aggregation rows to period/total_quantity', async () => {
    // Mock aggregate trả về các dòng theo ngày (period) và tổng lượng cho mỗi ngày
    txRepo.aggregate.mockResolvedValueOnce([
      { _id: '2026-04-20', total_quantity: 5 },
      { _id: '2026-04-21', total_quantity: 3 },
    ] as any);

    // Gọi getTrends với khoảng thời gian cụ thể
    const rows = await service.getTrends({
      metric: 'in',
      from: '2026-04-20',
      to: '2026-04-21',
    });

    // Kỳ vọng: service map _id -> period và giữ total_quantity
    expect(rows).toEqual([
      { period: '2026-04-20', total_quantity: 5 },
      { period: '2026-04-21', total_quantity: 3 },
    ]);
  });

  it('getDrilldown returns paginated items and total count', async () => {
    // Dữ liệu mẫu các mục giao dịch trả về (trang hiện tại)
    const items = [
      { transaction_id: 'T1', lot_id: 'L1', quantity: 5 },
      { transaction_id: 'T2', lot_id: 'L2', quantity: 7 },
    ];

    // Trong implementation của getDrilldown, txRepo.aggregate có thể được gọi hai lần:
    // 1) để lấy danh sách items (với skip/limit)
    // 2) để đếm tổng số kết quả (thông qua $count)
    // Ở đây mockImplementation sẽ kiểm tra pipeline truyền vào để trả về phù hợp.
    txRepo.aggregate.mockImplementation(async (pipeline: any[]) => {
      // Nếu pipeline chứa stage $count thì trả về object chứa total
      const hasCount = pipeline.some((p) => p && p.$count);
      if (hasCount) return [{ total: 2 }] as any;
      // Ngược lại trả về mảng items (kết quả trang)
      return items as any;
    });

    // Gọi getDrilldown với page/limit
    const resp = await service.getDrilldown({ page: 1, limit: 10 });

    // Kiểm tra items trả về khớp dữ liệu mẫu
    expect(resp.items).toEqual(items);

    // Kiểm tra tổng số (đếm) đúng như mock
    expect(resp.total).toBe(2);

    // Kiểm tra thông tin phân trang được phản hồi chính xác
    expect(resp.page).toBe(1);
    expect(resp.limit).toBe(10);
  });
});
