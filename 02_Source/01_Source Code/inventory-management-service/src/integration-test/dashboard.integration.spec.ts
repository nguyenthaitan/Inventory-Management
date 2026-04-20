/**
 * Integration tests for DashboardService
 * - Sử dụng mongodb-memory-server để tạo MongoDB tạm thời cho integration tests
 * - Kiểm tra các hàm: getSummary, getTrends, getDrilldown
 *
 * Ghi chú: các test này tương tác thật với Mongoose models và repository,
 * nên phải làm sạch dữ liệu giữa các test để tránh phụ thuộc chéo.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Model } from 'mongoose';

import { DashboardService } from '../dashboard/dashboard.service';
import {
  InventoryLot,
  InventoryLotSchema,
} from '../schemas/inventory-lot.schema';
import {
  InventoryTransaction,
  InventoryTransactionSchema,
} from '../schemas/inventory-transaction.schema';
import {
  WarehouseSlip,
  WarehouseSlipSchema,
} from '../schemas/warehouse-slip.schema';
import { Material, MaterialSchema } from '../schemas/material.schema';
import { Warehouse, WarehouseSchema } from '../schemas/warehouse.schema';

import { InventoryLotRepository } from '../inventory-lot/inventory-lot.repository';
import { InventoryTransactionRepository } from '../inventory-transaction/inventory-transaction.repository';
import { WarehouseSlipRepository } from '../warehouse-slip/warehouse-slip.repository';
import { MaterialRepository } from '../material/material.repository';

// Tăng timeout cho Jest vì tạo MongoMemoryServer và thao tác DB có thể tốn thời gian
jest.setTimeout(120_000);

let mongod: MongoMemoryServer;
let testModule: TestingModule;
let dashboardService: DashboardService;
let lotRepo: InventoryLotRepository;
let txRepo: InventoryTransactionRepository;
let slipRepo: WarehouseSlipRepository;
let materialRepo: MaterialRepository;

/**
 * beforeAll:
 * - Khởi tạo MongoMemoryServer (MongoDB in-memory)
 * - Thiết lập Test Module của NestJS với các schema và provider cần thiết
 * - Lấy instance của service và repository để dùng trong test
 */
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  testModule = await Test.createTestingModule({
    imports: [
      // Kết nối tới MongoDB in-memory
      MongooseModule.forRoot(uri),
      // Đăng ký các schema cần thiết cho test
      MongooseModule.forFeature([
        { name: InventoryLot.name, schema: InventoryLotSchema },
        { name: InventoryTransaction.name, schema: InventoryTransactionSchema },
        { name: WarehouseSlip.name, schema: WarehouseSlipSchema },
        { name: Material.name, schema: MaterialSchema },
        { name: Warehouse.name, schema: WarehouseSchema },
      ]),
    ],
    providers: [
      // Service và repository thật (không mock) để chạy integration test
      DashboardService,
      InventoryLotRepository,
      InventoryTransactionRepository,
      WarehouseSlipRepository,
      MaterialRepository,
    ],
  }).compile();

  // Lấy các instance từ TestModule để sử dụng trong các test case
  dashboardService = testModule.get<DashboardService>(DashboardService);
  lotRepo = testModule.get<InventoryLotRepository>(InventoryLotRepository);
  txRepo = testModule.get<InventoryTransactionRepository>(
    InventoryTransactionRepository,
  );
  slipRepo = testModule.get<WarehouseSlipRepository>(WarehouseSlipRepository);
  materialRepo = testModule.get<MaterialRepository>(MaterialRepository);
});

/**
 * afterAll:
 * - Đóng TestModule và dừng MongoMemoryServer để giải phóng resource
 */
afterAll(async () => {
  await testModule.close();
  await mongod.stop();
});

/**
 * afterEach:
 * - Xóa sạch các collection dùng trong test (material, lot, transaction, slip)
 * - Đảm bảo mỗi test chạy trên trạng thái DB rỗng, tránh phụ thuộc lẫn nhau
 */
afterEach(async () => {
  const materialModel = testModule.get<Model<Material>>(
    getModelToken(Material.name),
  );
  const lotModel = testModule.get<Model<InventoryLot>>(
    getModelToken(InventoryLot.name),
  );
  const txModel = testModule.get<Model<InventoryTransaction>>(
    getModelToken(InventoryTransaction.name),
  );
  const slipModel = testModule.get<Model<WarehouseSlip>>(
    getModelToken(WarehouseSlip.name),
  );
  await Promise.all([
    materialModel.deleteMany({}),
    lotModel.deleteMany({}),
    txModel.deleteMany({}),
    slipModel.deleteMany({}),
  ]);
});

describe('DashboardService (integration)', () => {
  it('getSummary computes totals and top materials', async () => {
    // Tạo 2 material mẫu để test aggregation theo material
    await materialRepo.create({
      material_id: 'MAT-001',
      part_number: 'P-001',
      material_name: 'Material A',
      material_type: 'API',
    } as any);
    await materialRepo.create({
      material_id: 'MAT-002',
      part_number: 'P-002',
      material_name: 'Material B',
      material_type: 'Excipient',
    } as any);

    // Tạo 2 lot tương ứng với 2 material (sử dụng quantity ban đầu cho tính tổng tồn kho)
    await lotRepo.create({
      lot_id: 'LOT-1',
      material_id: 'MAT-001',
      manufacturer_name: 'Maker',
      manufacturer_lot: 'ML1',
      received_date: new Date('2025-01-01'),
      expiration_date: new Date('2027-01-01'),
      quantity: 100,
      unit_of_measure: 'kg',
      status: 'Quarantine',
      warehouse_id: 'WH-1',
    } as any);

    await lotRepo.create({
      lot_id: 'LOT-2',
      material_id: 'MAT-002',
      manufacturer_name: 'Maker',
      manufacturer_lot: 'ML2',
      received_date: new Date('2025-01-01'),
      expiration_date: new Date('2027-01-01'),
      quantity: 50,
      unit_of_measure: 'kg',
      status: 'Quarantine',
      warehouse_id: 'WH-1',
    } as any);

    // Tạo warehouse slips đã được CONFIRMED, mỗi slip.line có unit_price
    // Dùng để test tính tổng giá trị hàng tồn (total_value) dựa trên unit_price của lines
    await slipRepo.create({
      slip_id: 'SLIP-ID-1',
      slip_number: 'SLIP-1',
      type: 'IN',
      warehouse_id: 'WH-1',
      status: 'CONFIRMED',
      confirmed_at: new Date(),
      lines: [
        {
          material_id: 'MAT-001',
          lot_id: 'LOT-1',
          quantity: 100,
          unit_price: 10,
        },
      ],
    } as any);

    await slipRepo.create({
      slip_id: 'SLIP-ID-2',
      slip_number: 'SLIP-2',
      type: 'IN',
      warehouse_id: 'WH-1',
      status: 'CONFIRMED',
      confirmed_at: new Date(),
      lines: [
        {
          material_id: 'MAT-002',
          lot_id: 'LOT-2',
          quantity: 50,
          unit_price: 20,
        },
      ],
    } as any);

    // Tạo các transaction để test phần "top materials" (tổng quantity theo material trong transactions)
    await txRepo.create({
      transaction_id: 'TX-1',
      lot_id: 'LOT-1',
      transaction_type: 'Receipt',
      quantity: 80,
      unit_of_measure: 'kg',
      transaction_date: new Date(),
      performed_by: 'tester',
    } as any);

    await txRepo.create({
      transaction_id: 'TX-2',
      lot_id: 'LOT-2',
      transaction_type: 'Receipt',
      quantity: 40,
      unit_of_measure: 'kg',
      transaction_date: new Date(),
      performed_by: 'tester',
    } as any);

    // Gọi service để lấy summary
    const summary = await dashboardService.getSummary({});

    // Kiểm tra tổng quantity (dựa trên quantity của lots đã tạo)
    expect(summary.total_quantity).toBe(150); // 100 + 50

    // Kiểm tra tổng giá trị (dựa trên unit_price * quantity trong confirmed slips)
    expect(summary.total_value).toBe(2000); // LOT-1:100*10 + LOT-2:50*20

    // Kiểm tra danh sách top_materials dựa trên các transaction đã tạo
    expect(summary.top_materials).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ material_id: 'MAT-001', total_quantity: 80 }),
        expect.objectContaining({ material_id: 'MAT-002', total_quantity: 40 }),
      ]),
    );
  });

  it('getTrends aggregates transactions by day', async () => {
    // Tạo hai transaction cùng ngày để kiểm tra aggregation theo ngày
    const d = new Date('2026-04-20T00:00:00Z');

    await txRepo.create({
      transaction_id: 'T-IN-1',
      lot_id: 'LOT-1',
      transaction_type: 'Receipt',
      quantity: 10,
      unit_of_measure: 'kg',
      transaction_date: d,
      performed_by: 'tester',
    } as any);

    await txRepo.create({
      transaction_id: 'T-IN-2',
      lot_id: 'LOT-1',
      transaction_type: 'Receipt',
      quantity: 15,
      unit_of_measure: 'kg',
      transaction_date: d,
      performed_by: 'tester',
    } as any);

    // Gọi getTrends với metric 'in' và khoảng thời gian bao gồm ngày 2026-04-20
    const rows = await dashboardService.getTrends({
      metric: 'in',
      from: '2026-04-19',
      to: '2026-04-21',
      interval: 'day',
    });

    // Mong đợi có một period cho '2026-04-20' và tổng lượng là 25 (10+15)
    expect(rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ period: '2026-04-20', total_quantity: 25 }),
      ]),
    );
  });

  it('getDrilldown filters by materialId and paginates', async () => {
    // Tạo 1 lot cho material 'MAT-DL'
    await lotRepo.create({
      lot_id: 'DL-LOT-1',
      material_id: 'MAT-DL',
      manufacturer_name: 'X',
      manufacturer_lot: 'DL1',
      received_date: new Date('2025-01-01'),
      expiration_date: new Date('2027-01-01'),
      quantity: 20,
      unit_of_measure: 'kg',
      status: 'Quarantine',
    } as any);

    // Tạo 3 transaction liên quan tới lot trên để test tính năng drilldown và phân trang
    await txRepo.create({
      transaction_id: 'DL-TX-1',
      lot_id: 'DL-LOT-1',
      transaction_type: 'Receipt',
      quantity: 1,
      unit_of_measure: 'kg',
      transaction_date: new Date(),
      performed_by: 'u',
    } as any);
    await txRepo.create({
      transaction_id: 'DL-TX-2',
      lot_id: 'DL-LOT-1',
      transaction_type: 'Receipt',
      quantity: 2,
      unit_of_measure: 'kg',
      transaction_date: new Date(),
      performed_by: 'u',
    } as any);
    await txRepo.create({
      transaction_id: 'DL-TX-3',
      lot_id: 'DL-LOT-1',
      transaction_type: 'Receipt',
      quantity: 3,
      unit_of_measure: 'kg',
      transaction_date: new Date(),
      performed_by: 'u',
    } as any);

    // Gọi getDrilldown lọc theo materialId và trang 1, limit 10
    const res = await dashboardService.getDrilldown({
      materialId: 'MAT-DL',
      page: 1,
      limit: 10,
    });

    // Kiểm tra rằng tổng số bản ghi >= 3 và items chứa >= 3 phần tử
    expect(res.total).toBeGreaterThanOrEqual(3);
    expect(res.items.length).toBeGreaterThanOrEqual(3);
  });

  it('getSummary returns different results for different warehouseId and date range', async () => {
    await materialRepo.create({
      material_id: 'MAT-X',
      material_name: 'Mat X',
      part_number: 'PX',
      material_type: 'API',
    } as any);
    await lotRepo.create({
      lot_id: 'L1',
      material_id: 'MAT-X',
      quantity: 10,
      warehouse_id: 'WH-1',
      manufacturer_name: 'Test Maker',
      manufacturer_lot: 'ML-L1',
      received_date: new Date(),
      expiration_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      unit_of_measure: 'kg',
      status: 'Quarantine',
    } as any);
    await lotRepo.create({
      lot_id: 'L2',
      material_id: 'MAT-X',
      quantity: 20,
      warehouse_id: 'WH-2',
      manufacturer_name: 'Test Maker',
      manufacturer_lot: 'ML-L2',
      received_date: new Date(),
      expiration_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      unit_of_measure: 'kg',
      status: 'Quarantine',
    } as any);
    const now = new Date();
    const old = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30);
    await slipRepo.create({
      slip_id: 'S1',
      warehouse_id: 'WH-1',
      status: 'CONFIRMED',
      confirmed_at: now,
      lines: [
        { lot_id: 'L1', material_id: 'MAT-X', quantity: 10, unit_price: 5 },
      ],
    } as any);
    await slipRepo.create({
      slip_id: 'S2',
      warehouse_id: 'WH-2',
      status: 'CONFIRMED',
      confirmed_at: old,
      lines: [
        { lot_id: 'L2', material_id: 'MAT-X', quantity: 20, unit_price: 10 },
      ],
    } as any);
    await txRepo.create({
      transaction_id: 'T1',
      lot_id: 'L1',
      transaction_type: 'Receipt',
      quantity: 10,
      unit_of_measure: 'kg',
      transaction_date: now,
      performed_by: 'u',
    } as any);
    await txRepo.create({
      transaction_id: 'T2',
      lot_id: 'L2',
      transaction_type: 'Receipt',
      quantity: 20,
      unit_of_measure: 'kg',
      transaction_date: old,
      performed_by: 'u',
    } as any);

    const all = await dashboardService.getSummary({});
    const wh1 = await dashboardService.getSummary({ warehouseId: 'WH-1' });
    const wh2 = await dashboardService.getSummary({ warehouseId: 'WH-2' });
    const fromRecent = await dashboardService.getSummary({
      from: now.toISOString(),
    });

    expect(all.total_quantity).toBe(30);
    expect(all.total_value).toBe(10 * 5 + 20 * 10);
    expect(wh1.total_quantity).toBe(10);
    expect(wh2.total_quantity).toBe(20);
    expect(fromRecent.total_quantity).toBe(10);
    expect(fromRecent.total_value).toBe(50);
  });

  it('getTrends returns different results for different interval and date range', async () => {
    const d1 = new Date('2026-04-01T00:00:00Z');
    const d2 = new Date('2026-04-10T00:00:00Z');
    const d3 = new Date('2026-05-01T00:00:00Z');
    await txRepo.create({
      transaction_id: 'T1',
      lot_id: 'L1',
      transaction_type: 'Receipt',
      quantity: 5,
      unit_of_measure: 'kg',
      transaction_date: d1,
      performed_by: 'u',
    } as any);
    await txRepo.create({
      transaction_id: 'T2',
      lot_id: 'L1',
      transaction_type: 'Receipt',
      quantity: 10,
      unit_of_measure: 'kg',
      transaction_date: d2,
      performed_by: 'u',
    } as any);
    await txRepo.create({
      transaction_id: 'T3',
      lot_id: 'L1',
      transaction_type: 'Receipt',
      quantity: 20,
      unit_of_measure: 'kg',
      transaction_date: d3,
      performed_by: 'u',
    } as any);

    const byDay = await dashboardService.getTrends({
      metric: 'in',
      from: '2026-04-01',
      to: '2026-05-02',
      interval: 'day',
    });
    const byMonth = await dashboardService.getTrends({
      metric: 'in',
      from: '2026-04-01',
      to: '2026-05-02',
      interval: 'month',
    });
    const byWeek = await dashboardService.getTrends({
      metric: 'in',
      from: '2026-04-01',
      to: '2026-05-02',
      interval: 'week',
    });

    expect(byDay.length).toBeGreaterThan(2);
    expect(byMonth.length).toBeGreaterThan(1);
    expect(byWeek.length).toBeGreaterThan(1);

    const shortRange = await dashboardService.getTrends({
      metric: 'in',
      from: '2026-05-01',
      to: '2026-05-02',
      interval: 'day',
    });
    expect(shortRange.length).toBe(1);
    expect(shortRange[0].total_quantity).toBe(20);
  });

  it('getDrilldown returns different results for different date range and warehouseId', async () => {
    await lotRepo.create({
      lot_id: 'L1',
      material_id: 'MAT-Y',
      warehouse_id: 'WH-1',
      quantity: 1,
      manufacturer_name: 'Test Maker',
      manufacturer_lot: 'ML-Y1',
      received_date: new Date(),
      expiration_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      unit_of_measure: 'kg',
      status: 'Quarantine',
    } as any);
    await lotRepo.create({
      lot_id: 'L2',
      material_id: 'MAT-Y',
      warehouse_id: 'WH-2',
      quantity: 1,
      manufacturer_name: 'Test Maker',
      manufacturer_lot: 'ML-Y2',
      received_date: new Date(),
      expiration_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      unit_of_measure: 'kg',
      status: 'Quarantine',
    } as any);
    const now = new Date();
    const old = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30);
    await txRepo.create({
      transaction_id: 'T1',
      lot_id: 'L1',
      transaction_type: 'Receipt',
      quantity: 1,
      transaction_date: now,
      performed_by: 'u',
    } as any);
    await txRepo.create({
      transaction_id: 'T2',
      lot_id: 'L2',
      transaction_type: 'Receipt',
      quantity: 1,
      transaction_date: old,
      performed_by: 'u',
    } as any);

    const all = await dashboardService.getDrilldown({ materialId: 'MAT-Y' });
    const wh1 = await dashboardService.getDrilldown({
      materialId: 'MAT-Y',
      warehouseId: 'WH-1',
    });
    const wh2 = await dashboardService.getDrilldown({
      materialId: 'MAT-Y',
      warehouseId: 'WH-2',
    });
    const recent = await dashboardService.getDrilldown({
      materialId: 'MAT-Y',
      from: now.toISOString(),
    });

    expect(all.total).toBeGreaterThanOrEqual(2);
    expect(wh1.items.every((i) => i.lot_id === 'L1')).toBe(true);
    expect(wh2.items.every((i) => i.lot_id === 'L2')).toBe(true);
    expect(recent.items.every((i) => i.lot_id === 'L1')).toBe(true);
  });
});
