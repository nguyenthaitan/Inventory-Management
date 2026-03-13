# QC Integration Plan — Mock to Real Services

> **Mục tiêu:** Chuyển QCTestService từ mock functions sang các service chính thức đã triển khai.
> **Phạm vi:** QC Service, InventoryLot Service, Production Batch Service
> **Ngày:** 2026-03-13
> **Trạng thái:** Planning

---

## 1. Tóm Tắt Hiện Trạng

### 1.1 Mock Functions Cần Thay Thế

Trong `backend/src/qc-test/qc-test.service.ts`, các mock functions sau cần được thay bằng các service chính thức:

| Mock Function | Vị trí | Tác vụ | Service Thay Thế |
|---|---|---|---|
| `mockGetLotById(lot_id)` | Line 50-54 | Kiểm tra lot tồn tại | `InventoryLotService.findById()` |
| `mockGetLotsByStatus(status)` | Line 56-63 | Lấy danh sách lot theo status | `InventoryLotService.findByStatus()` |
| `mockGetLotsByIds(lot_ids)` | Line 65-69 | Lấy danh sách lot theo IDs | `InventoryLotService.findByIds()` |
| `mockUpdateLotStatus(lot_id, status)` | Line 71-76 | Cập nhật status lot | `InventoryLotService.updateLotStatus()` |
| `mockUpdateLot(lot_id, data)` | Line 78-83 | Cập nhật lot (partial) | `InventoryLotService.update()` |

### 1.2 Vị Trí Sử Dụng Mock Functions

Các phương thức trong QCTestService đang gọi mock functions:

| QC Method | Mock Calls | Dòng |
|---|---|---|
| `getTestsByLotId()` | `mockGetLotById()` | ~99 |
| `createTest()` | `mockGetLotById()` | ~113 |
| `submitDecision()` | `mockGetLotById()`, `mockUpdateLotStatus()` | ~148, ~168 |
| `submitRetestDecision()` | `mockGetLotById()`, `mockUpdateLot()`, `mockUpdateLotStatus()` | ~184, ~196, ~211 |
| `getDashboardKPI()` | `mockGetLotsByStatus()` | ~237 |

### 1.3 Services Đã Triển Khai & Ready

✅ **InventoryLotService** — Hoàn chỉnh
- Location: `backend/src/inventory-lot/inventory-lot.service.ts`
- Các method disponible:
  - `findById(lot_id)` — ✅ Có
  - `findAll(page, limit)` — ✅ Có
  - `findByMaterialId(material_id)` — ✅ Có
  - `findByStatus(status)` — ⚠️ Cần verify
  - `update(lot_id, updateDto)` — ✅ Có
  - `updateLotStatus(lot_id, status)` — ⚠️ Cần verify

✅ **ProductionBatchService** — Hoàn chỉnh
- Location: `backend/src/production-batch/production-batch.service.ts`
- Các method disponible:
  - `create(createDto)` — ✅ Có
  - `findById(batch_id)` — ✅ Có với validate status transitions

✅ **MaterialService** — Hoàn chỉnh
- Location: `backend/src/material/material.service.ts`
- Các method disponible:
  - `findMaterialById(material_id)` — ✅ Có

---

## 2. Integration Roadmap

### Phase 1: Dependency Injection (Week 1)

**Mục tiêu:** Inject InventoryLotService vào QCTestService

```typescript
// backend/src/qc-test/qc-test.service.ts

@Injectable()
export class QCTestService {
  constructor(
    private readonly repository: QCTestRepository,
    private readonly inventoryLotService: InventoryLotService, // ← NEW
  ) {}
```

**Module thay đổi:**
```typescript
// backend/src/qc-test/qc-test.module.ts
@Module({
  imports: [
    MongooseModule.forFeature([{ name: QCTest.name, schema: QCTestSchema }]),
    InventoryLotModule, // ← NEW: Để có thể inject InventoryLotService
  ],
  controllers: [QCTestController],
  providers: [QCTestService, QCTestRepository],
  exports: [QCTestService], // ← Để module khác có thể inject QCTestService
})
export class QCTestModule {}
```

**Checklist:**
- [ ] Import InventoryLotModule trong QCTestModule
- [ ] Inject InventoryLotService vào QCTestService constructor
- [ ] Verify QCTestModule exports QCTestService
- [ ] Verify AppModule imports QCTestModule

---

### Phase 2: Replace Mock Functions (Week 1-2)

**Mục tiêu:** Thay thế tất cả mock functions bằng InventoryLotService calls

#### 2.1 Remove Mock Functions

**Xóa các hàm bên dưới từ QCTestService (line 50-83):**
```typescript
private _mockLot() { ... }
private mockGetLotById() { ... }
private mockGetLotsByStatus() { ... }
private mockGetLotsByIds() { ... }
private mockUpdateLotStatus() { ... }
private mockUpdateLot() { ... }
```

#### 2.2 Update Method: `getTestsByLotId()`

**Trước:**
```typescript
async getTestsByLotId(lot_id: string): Promise<QCTestDocument[]> {
  await this.mockGetLotById(lot_id); // ← Mock
  return this.repository.findByLotId(lot_id);
}
```

**Sau:**
```typescript
async getTestsByLotId(lot_id: string): Promise<QCTestDocument[]> {
  // Validate lot exists via InventoryLotService
  await this.inventoryLotService.findById(lot_id); // ← Real call
  return this.repository.findByLotId(lot_id);
}
```

**Error handling:**
- `InventoryLotService.findById()` throws `NotFoundException` nếu lot không tồn tại → Propagate lên controller

#### 2.3 Update Method: `createTest()`

**Trước:**
```typescript
async createTest(dto: CreateQCTestDto): Promise<QCTestDocument> {
  await this.mockGetLotById(dto.lot_id); // ← Mock
  const data: Partial<QCTest> = { ...dto, test_id: uuidv4(), ... };
  return this.repository.create(data);
}
```

**Sau:**
```typescript
async createTest(dto: CreateQCTestDto): Promise<QCTestDocument> {
  // Validate lot exists
  const lot = await this.inventoryLotService.findById(dto.lot_id);
  
  // (Optional) Validate material exists
  if (lot.material_id) {
    await this.materialService.findById(lot.material_id); // ← Từ MaterialService (nếu inject)
  }
  
  const data: Partial<QCTest> = { 
    ...dto, 
    test_id: uuidv4(), 
    test_date: new Date(dto.test_date),
    result_status: dto.result_status ?? 'Pending',
  };
  return this.repository.create(data);
}
```

#### 2.4 Update Method: `submitDecision()`

**Trước:**
```typescript
async submitDecision(lot_id: string, dto: QCDecisionDto) {
  await this.mockGetLotById(lot_id); // ← Mock
  // ... validate reject_reason ...
  const tests = await this.repository.updateManyByLotId(...);
  const lot = await this.mockUpdateLotStatus(lot_id, lotStatus); // ← Mock
  return { lot, tests };
}
```

**Sau:**
```typescript
async submitDecision(lot_id: string, dto: QCDecisionDto) {
  // Validate lot exists
  const existingLot = await this.inventoryLotService.findById(lot_id);
  
  // Validate reject reason if Rejected
  if (dto.decision === 'Rejected' && !dto.reject_reason?.trim()) {
    throw new BadRequestException(
      'Lý do từ chối là bắt buộc khi quyết định là Rejected',
    );
  }
  
  // Determine test result status
  const testResultStatus =
    dto.decision === 'Accepted' ? 'Pass'
    : dto.decision === 'Rejected' ? 'Fail'
    : 'Pending';
  
  // Update all Pending tests for this lot
  const updateData: Partial<QCTest> = {
    result_status: testResultStatus,
    verified_by: dto.verified_by,
    ...(dto.reject_reason && { reject_reason: dto.reject_reason }),
    ...(dto.label_id && { label_id: dto.label_id }),
  };
  const tests = await this.repository.updateManyByLotId(
    lot_id,
    { result_status: 'Pending' },
    updateData,
  );
  
  // Determine lot status
  const lotStatus: InventoryLotStatus =
    dto.decision === 'Accepted' ? InventoryLotStatus.ACCEPTED
    : dto.decision === 'Rejected' ? InventoryLotStatus.REJECTED
    : InventoryLotStatus.QUARANTINE;
  
  // Update lot status via InventoryLotService
  const updatedLot = await this.inventoryLotService.updateLotStatus(
    lot_id,
    lotStatus,
  );
  
  return { lot: updatedLot, tests };
}
```

#### 2.5 Update Method: `submitRetestDecision()`

**Trước:**
```typescript
async submitRetestDecision(lot_id, action, dto) {
  await this.mockGetLotById(lot_id);
  if (action === 'extend') {
    const lot = await this.mockUpdateLot(lot_id, { ... });
    // ...
  } else {
    const lot = await this.mockUpdateLotStatus(lot_id, InventoryLotStatus.DEPLETED);
    // ...
  }
}
```

**Sau:**
```typescript
async submitRetestDecision(
  lot_id: string,
  action: 'extend' | 'discard',
  dto: { new_expiry_date?: string; performed_by: string },
): Promise<InventoryLotDocument> {
  // Validate lot exists
  await this.inventoryLotService.findById(lot_id);
  
  if (action === 'extend') {
    if (!dto.new_expiry_date) {
      throw new BadRequestException(
        'new_expiry_date là bắt buộc khi action = extend',
      );
    }
    
    // Update lot status & expiration date
    const updatedLot = await this.inventoryLotService.update(
      lot_id,
      {
        status: InventoryLotStatus.ACCEPTED,
        expiration_date: new Date(dto.new_expiry_date),
      },
    );
    
    // Create re-test record
    await this.repository.create({
      test_id: uuidv4(),
      lot_id,
      test_type: 'Physical',
      test_method: 'Re-test',
      test_date: new Date(),
      test_result: 'Re-test after expiry extension',
      result_status: 'Pass',
      performed_by: dto.performed_by,
    });
    
    return updatedLot;
  } else {
    // Discard action
    const updatedLot = await this.inventoryLotService.updateLotStatus(
      lot_id,
      InventoryLotStatus.DEPLETED,
    );
    
    await this.repository.create({
      test_id: uuidv4(),
      lot_id,
      test_type: 'Physical',
      test_method: 'Re-test - Discard',
      test_date: new Date(),
      test_result: 'Discarded after re-test',
      result_status: 'Fail',
      performed_by: dto.performed_by,
    });
    
    return updatedLot;
  }
}
```

#### 2.6 Update Method: `getDashboardKPI()`

**Trước:**
```typescript
async getDashboardKPI() {
  const quarantineLots = await this.mockGetLotsByStatus('Quarantine');
  // ...
}
```

**Sau:**
```typescript
async getDashboardKPI(): Promise<{
  pending_count: number;
  approved_count: number;
  rejected_count: number;
  error_rate: number;
}> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Get lots by status via InventoryLotService
  const quarantineLots = await this.inventoryLotService.findByStatus('Quarantine');
  
  const [approved_count, rejected_count] = await Promise.all([
    this.repository.countByResultStatus('Pass', startOfMonth, now),
    this.repository.countByResultStatus('Fail', startOfMonth, now),
  ]);
  
  const total = approved_count + rejected_count;
  const error_rate = total > 0 ? (rejected_count / total) * 100 : 0;
  
  return {
    pending_count: quarantineLots.length,
    approved_count,
    rejected_count,
    error_rate: Math.round(error_rate * 100) / 100,
  };
}
```

**Checklist Phase 2:**
- [ ] Remove tất cả mock functions (lines 50-83)
- [ ] Update `getTestsByLotId()` to call `inventoryLotService.findById()`
- [ ] Update `createTest()` with InventoryLot validation
- [ ] Update `submitDecision()` with `inventoryLotService.updateLotStatus()`
- [ ] Update `submitRetestDecision()` with `inventoryLotService.update()` and `updateLotStatus()`
- [ ] Update `getDashboardKPI()` with `inventoryLotService.findByStatus()`
- [ ] Remove TODO comments tại các dòng được sửa

---

### Phase 3: Production Batch Integration (Week 2-3)

**Mục tiêu:** Inject ProductionBatchService và tự động tạo InventoryLot sau QC Complete

#### 3.1 Inject ProductionBatchService

```typescript
// backend/src/qc-test/qc-test.service.ts

@Injectable()
export class QCTestService {
  constructor(
    private readonly repository: QCTestRepository,
    private readonly inventoryLotService: InventoryLotService,
    private readonly productionBatchService: ProductionBatchService, // ← NEW
  ) {}
```

**Module thay đổi:**
```typescript
// backend/src/qc-test/qc-test.module.ts
@Module({
  imports: [
    MongooseModule.forFeature([{ name: QCTest.name, schema: QCTestSchema }]),
    InventoryLotModule,
    ProductionBatchModule, // ← NEW
  ],
  controllers: [QCTestController],
  providers: [QCTestService, QCTestRepository],
  exports: [QCTestService],
})
export class QCTestModule {}
```

#### 3.2 Auto-Create InventoryLot After Batch QC

**Thêm method mới vào QCTestService:**

```typescript
/**
 * Called from ProductionBatchService after batch QC is complete.
 * Creates an InventoryLot with data from the production batch.
 */
async createLotFromProdBatch(
  batch_id: string,
): Promise<InventoryLotDocument> {
  // 1. Fetch production batch
  const batch = await this.productionBatchService.findById(batch_id);
  if (!batch) {
    throw new NotFoundException(`Production batch '${batch_id}' not found`);
  }
  
  // 2. Validate batch status is Complete
  if (batch.status !== BatchStatus.Complete) {
    throw new BadRequestException(
      `Batch must be Complete to create inventory lot. Current status: ${batch.status}`,
    );
  }
  
  // 3. Create InventoryLot with batch data
  const createLotDto: CreateInventoryLotDto = {
    lot_id: uuidv4(),
    material_id: batch.product_id,
    manufacturer_name: 'Internal Production',
    manufacturer_lot: batch.batch_number,
    quantity: batch.batch_size, // Decimal128 → number conversion handled by Mongoose
    unit_of_measure: batch.unit_of_measure,
    received_date: new Date(),
    expiration_date: new Date(batch.expiration_date),
    is_sample: false,
    parent_lot_id: null,
    status: InventoryLotStatus.QUARANTINE, // Default: under QC
  };
  
  const createdLot = await this.inventoryLotService.create(createLotDto);
  
  this.logger.log(
    `Inventory lot '${createdLot.lot_id}' created from production batch '${batch_id}'`,
  );
  
  return createdLot;
}
```

#### 3.3 Update ProductionBatchService to Call QC

**Thêm code sau batch status change to Complete:**

```typescript
// backend/src/production-batch/production-batch.service.ts

async completeBatch(batch_id: string, performed_by: string): Promise<ProductionBatchResponseDto> {
  const batch = await this.repository.findById(batch_id);
  if (!batch) {
    throw new NotFoundException(`Batch '${batch_id}' not found`);
  }
  
  if (batch.status !== BatchStatus.InProgress) {
    throw new BadRequestException(`Batch must be In Progress to complete`);
  }
  
  const updated = await this.repository.updateById(batch_id, {
    status: BatchStatus.Complete,
    completed_date: new Date(),
    completed_by: performed_by,
  });
  
  // ← NEW: Trigger QC auto-creation of InventoryLot
  try {
    await this.qcTestService.createLotFromProdBatch(batch_id);
  } catch (error) {
    this.logger.warn(
      `Failed to auto-create inventory lot for batch '${batch_id}': ${error.message}`,
    );
    // Don't throw — batch completion is independent of inventory lot creation
  }
  
  return this.convertToResponse(updated);
}
```

**Module thay đổi:**
```typescript
// backend/src/production-batch/production-batch.module.ts
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductionBatch.name, schema: ProductionBatchSchema },
      { name: BatchComponent.name, schema: BatchComponentSchema },
      { name: Material.name, schema: MaterialSchema },
    ]),
    QCTestModule, // ← NEW: Để có thể inject QCTestService
  ],
  controllers: [ProductionBatchController],
  providers: [ProductionBatchService, ProductionBatchRepository],
})
export class ProductionBatchModule {}
```

**Checklist Phase 3:**
- [ ] Inject ProductionBatchService vào QCTestService
- [ ] Inject QCTestService vào ProductionBatchService (circular dependency: thêm vào module imports)
- [ ] Implement `createLotFromProdBatch(batch_id)` method
- [ ] Implement `completeBatch(batch_id, performed_by)` method hoặc update existing
- [ ] Add `.createLotFromProdBatch()` call vào ProductionBatchService completion flow
- [ ] Verify không có circular module dependencies (nếu có, dùng forwardRef)

---

## 3. Services Cần Thêm (Supplementary)

### 3.1 MaterialService Integration (Optional)

**Dùng để:** Validate material_id khi tạo test

**Thêm:**
```typescript
// backend/src/qc-test/qc-test.service.ts — createTest()
if (lot.material_id) {
  await this.materialService.findById(lot.material_id);
}
```

**Module:**
```typescript
// backend/src/qc-test/qc-test.module.ts
imports: [
  MongooseModule.forFeature([...]),
  InventoryLotModule,
  ProductionBatchModule,
  MaterialModule, // ← Add MaterialModule
]
```

### 3.2 UserService (For Audit Trail)

**Dùng để:** Validate performed_by, verified_by users

**Tính năng:**
- Verify user exists khi tạo test
- Validate user permissions (QC Technician, Manager, etc.)

**Để sau — bây giờ chưa yêu cầu**

### 3.3 QCReportService (For Advanced Reporting)

**Dùng để:** Generate QC reports, trend analysis

**Tính năng:**
- Supplier performance dashboard
- Batch rejection trends
- Material quality metrics

**Để sau — bây giờ focus vào integration cơ bản**

---

## 4. Testing Strategy

### 4.1 Unit Tests (QCTestService methods)

**File:** `backend/src/qc-test/qc-test.service.spec.ts`

Update existing tests:

```typescript
describe('QCTestService', () => {
  let service: QCTestService;
  let repository: QCTestRepository;
  let inventoryLotService: InventoryLotService;
  let productionBatchService: ProductionBatchService;
  
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        QCTestService,
        {
          provide: QCTestRepository,
          useValue: { /* mock methods */ },
        },
        {
          provide: InventoryLotService,
          useValue: { /* mock methods */ },
        },
        {
          provide: ProductionBatchService,
          useValue: { /* mock methods */ },
        },
      ],
    }).compile();
    
    service = module.get(QCTestService);
    repository = module.get(QCTestRepository);
    inventoryLotService = module.get(InventoryLotService);
    productionBatchService = module.get(ProductionBatchService);
  });
  
  describe('getTestsByLotId', () => {
    it('should throw NotFoundException if lot does not exist', async () => {
      inventoryLotService.findById = jest
        .fn()
        .mockRejectedValue(new NotFoundException());
      
      await expect(service.getTestsByLotId('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
    
    it('should return tests for valid lot', async () => {
      const mockLot = { lot_id: 'lot-1', material_id: 'mat-1' };
      const mockTests = [{ test_id: 'test-1', lot_id: 'lot-1' }];
      
      inventoryLotService.findById = jest.fn().mockResolvedValue(mockLot);
      repository.findByLotId = jest.fn().mockResolvedValue(mockTests);
      
      const result = await service.getTestsByLotId('lot-1');
      expect(result).toEqual(mockTests);
    });
  });
  
  describe('createTest', () => {
    it('should create test with valid lot', async () => {
      const dto = { lot_id: 'lot-1', test_type: 'Physical', ... };
      const mockLot = { lot_id: 'lot-1', material_id: 'mat-1' };
      
      inventoryLotService.findById = jest.fn().mockResolvedValue(mockLot);
      repository.create = jest.fn().mockResolvedValue({ test_id: 'test-1', ...dto });
      
      const result = await service.createTest(dto);
      expect(result.test_id).toBeDefined();
    });
  });
  
  describe('submitDecision', () => {
    it('should reject decision without reason', async () => {
      const mockLot = { lot_id: 'lot-1' };
      const dto = { decision: 'Rejected', reject_reason: null };
      
      inventoryLotService.findById = jest.fn().mockResolvedValue(mockLot);
      
      await expect(service.submitDecision('lot-1', dto)).rejects.toThrow(
        BadRequestException,
      );
    });
    
    it('should update lot status to ACCEPTED', async () => {
      const mockLot = { lot_id: 'lot-1' };
      const updatedLot = { ...mockLot, status: 'Accepted' };
      const dto = { decision: 'Accepted', verified_by: 'user-1' };
      
      inventoryLotService.findById = jest.fn().mockResolvedValue(mockLot);
      inventoryLotService.updateLotStatus = jest.fn().mockResolvedValue(updatedLot);
      repository.updateManyByLotId = jest.fn().mockResolvedValue([]);
      
      const result = await service.submitDecision('lot-1', dto);
      expect(result.lot.status).toBe('Accepted');
    });
  });
});
```

### 4.2 Integration Tests

**File:** `test/qc-test.e2e-spec.ts`

```typescript
describe('QCTest Integration (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  
  before(async () => {
    // ... setup app, database ...
    // ... login để lấy token ...
  });
  
  describe('POST /qc-tests', () => {
    it('should create test for existing lot', async () => {
      // 1. Create material
      // 2. Create inventory lot
      // 3. Create QC test
      // 4. Assert test_id != null
    });
  });
  
  describe('PATCH /qc-tests/:test_id/decision', () => {
    it('should reject if lot not found', async () => {
      const dto = { decision: 'Accepted', verified_by: 'user-1' };
      // POST /qc-tests/invalid-lot-id/decision → 404
    });
    
    it('should update lot status after decision', async () => {
      // Create lot → Post decision → Assert lot.status = 'Accepted'
    });
  });
});
```

---

## 5. Dependency Diagram

```
┌─────────────────────────────────────────────────┐
│  AppModule                                      │
│  ┌─────────────────────────────────────────┐  │
│  │ imports:                                │  │
│  │ - DatabaseModule                        │  │
│  │ - ConfigModule                          │  │
│  │ - MaterialModule        ✅              │  │
│  │ - InventoryLotModule    ✅  ← READY   │  │
│  │ - ProductionBatchModule ✅  ← READY   │  │
│  │ - QCTestModule          🔶  ← NEEDS UPDATE
│  └─────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                        ↓
        ┌───────────────┬─────────────────┐
        │               │                 │
        ↓               ↓                 ↓
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ QCTestModule │ │InventoryLotM │ │ProdBatchM    │
├──────────────┤ ├──────────────┤ ├──────────────┤
│ Service      │ │ Service      │ │ Service      │
│ Controller   │ │ Controller   │ │ Controller   │
│ Repository   │ │ Repository   │ │ Repository   │
└──────────────┘ └──────────────┘ └──────────────┘
        ↓ (inject)     ↑               ↓ (inject)
        └──────────────┴───────────────┘
        
QCTestService depends on:
- QCTestRepository (own repo)
- InventoryLotService (from InventoryLotModule) ← Phase 1
- ProductionBatchService (from ProductionBatchModule) ← Phase 3
- MaterialService (optional, from MaterialModule) ← Phase 3+
```

---

## 6. Migration Checklist

### Pre-Integration Validation
- [ ] Verify InventoryLotService has all required methods
  - [ ] `findById(lot_id)`
  - [ ] `findByStatus(status)`
  - [ ] `update(lot_id, updateDto)`
  - [ ] `updateLotStatus(lot_id, status)`
- [ ] Verify ProductionBatchService has `findById(batch_id)` and status enum
- [ ] Review QC DTO types in `create-qc-test.dto.ts`, `qc-decision.dto.ts`

### Phase 1: InventoryLot Integration
- [ ] Update QCTestModule to import InventoryLotModule
- [ ] Inject InventoryLotService into QCTestService constructor
- [ ] Verify no compilation errors
- [ ] Unit test: `getTestsByLotId()` calls `inventoryLotService.findById()`

### Phase 2: Replace Mock Functions
- [ ] Remove all mock function definitions (lines 50-83)
- [ ] Update `getTestsByLotId()` → call InventoryLotService
- [ ] Update `createTest()` → validate lot exists
- [ ] Update `submitDecision()` → call updateLotStatus()
- [ ] Update `submitRetestDecision()` → call update() & updateLotStatus()
- [ ] Update `getDashboardKPI()` → call findByStatus()
- [ ] Run unit tests for each method
- [ ] Remove all TODO comments about mock functions

### Phase 3: Production Batch Integration
- [ ] Update QCTestModule to import ProductionBatchModule
- [ ] Update ProductionBatchModule to import QCTestModule (watch circular deps)
- [ ] Inject ProductionBatchService into QCTestService
- [ ] Inject QCTestService into ProductionBatchService
- [ ] Implement `createLotFromProdBatch(batch_id)` in QCTestService
- [ ] Implement/Update `completeBatch()` in ProductionBatchService
- [ ] Add call to `qcTestService.createLotFromProdBatch()` in batch completion
- [ ] Handle circular dependency if needed (use forwardRef)
- [ ] Run integration tests for batch → lot creation flow

### Post-Integration Testing
- [ ] Run full test suite: `npm run test`
- [ ] Run e2e tests: `npm run test:e2e`
- [ ] Manual smoke test:
  - [ ] Create material
  - [ ] Create production batch
  - [ ] Complete batch → verify lot auto-created
  - [ ] Create QC test for lot
  - [ ] Submit QC decision → verify lot status updated
- [ ] Check logs for warnings/errors during startup

### Documentation & Cleanup
- [ ] Update `be_infor.md` — remove TODO notes about QC mocks
- [ ] Update `be_coding_step_for_QCTest.md` — mark completed steps
- [ ] Update README.md with integration summary
- [ ] Commit changes to git with message: "feat: replace mock services in QC with real implementations"

---

## 7. Potential Issues & Mitigations

| Issue | Root Cause | Mitigation |
|---|---|---|
| Circular dependency error | QCTestModule ↔ ProductionBatchModule | Use `forwardRef()` in imports |
| InventoryLotService method not found | InventoryLot skeleton incomplete | Check actual method names in InventoryLotService |
| ProductionBatchService.findById() not exists | Service incomplete | Implement `findById()` or adjust integration |
| Decimal128 → number conversion fails | Mongoose Decimal128 type mismatch | Configure Mongoose to auto-convert in schema.toJSON() |
| Lot already exists error in batch completion | Idempotency issue | Track if lot already created, skip re-creation |

---

## 8. References

- `be_infor.md` — Backend architecture & conventions
- `be_coding_step_for_QCTest.md` — Step-by-step implementation guide
- `QC_details.md` — QC domain logic & business rules
- `backend/src/qc-test/qc-test.service.ts` — Current implementation
- `backend/src/inventory-lot/inventory-lot.service.ts` — InventoryLot service
- `backend/src/production-batch/production-batch.service.ts` — ProductionBatch service

---

**Người soạn:** Agent  
**Ngày cập nhật lần cuối:** 2026-03-13  
**Trạng thái:** Ready for Phase 1
