# QC Integration — Services Cần Cập Nhật

> **Ngày:** 2026-03-13  
> **Từ:** Phase 1 & Phase 2 QC Integration (Migration từ Mock sang Real Services)
> **Trạng thái:** Action Items

---

## 1. InventoryLotService — Cần Cập Nhật

### 1.1 Thêm Method: `updatePartial()` hoặc `partialUpdate()`

**Vị trí:** `backend/src/inventory-lot/inventory-lot.service.ts`

**Lý do:** Khi QCTest submitRetestDecision (extend action), cần cập nhật:
- `status` → ACCEPTED
- `expiration_date` → new date (từ new_expiry_date)

Hiện tại `update()` method yêu cầu toàn bộ UpdateInventoryLotDto (bao gồm material_id, manufacturer_name, v.v.), nhưng QC chỉ cần cập nhật 2 field trên.

**Giải pháp:**
```typescript
// Option 1: Add new method
async updatePartial(
  lot_id: string,
  updates: Partial<UpdateInventoryLotDto>,
): Promise<InventoryLotResponseDto> {
  // Fetch existing lot
  const existingLot = await this.inventoryLotRepository.findById(lot_id);
  if (!existingLot) {
    throw new NotFoundException(`Inventory lot ${lot_id} not found`);
  }
  
  // Merge updates with existing data
  const fullUpdate: UpdateInventoryLotDto = {
    material_id: updates.material_id ?? existingLot.material_id,
    manufacturer_name: updates.manufacturer_name ?? existingLot.manufacturer_name,
    manufacturer_lot: updates.manufacturer_lot ?? existingLot.manufacturer_lot,
    received_date: updates.received_date ?? existingLot.received_date,
    expiration_date: updates.expiration_date ?? existingLot.expiration_date,
    status: updates.status ?? existingLot.status,
    // ... other fields
  };
  
  return this.update(lot_id, fullUpdate);
}

// Usage in QC:
await this.inventoryLotService.updatePartial(lot_id, {
  status: InventoryLotStatus.ACCEPTED,
  expiration_date: new Date(dto.new_expiry_date),
});
```

**Hoặc Option 2:** Tách riêng phương thức update status + expiration:
```typescript
async updateStatusAndExpiry(
  lot_id: string,
  status: string,
  expirationDate: Date,
): Promise<InventoryLotResponseDto> {
  const existingLot = await this.inventoryLotRepository.findById(lot_id);
  // ... merge logic ... 
}
```

**Location trong QC code:**  
[qc-test.service.ts](qc-test.service.ts#L169) — Line 169, submitRetestDecision method

---

### 1.2 Thêm Method: `findByIds()` để Optimize Batch Queries

**Vị trí:** `backend/src/inventory-lot/inventory-lot.service.ts`

**Lý do:** QCTest.getSupplierPerformance() cần lấy danh sách lots theo IDs. Hiện tại không có method này nên phải gọi findById() lần lượt (N+1 queries).

**Giải pháp:**
```typescript
async findByIds(lot_ids: string[]): Promise<InventoryLotResponseDto[]> {
  // Use MongoDB $in operator: { lot_id: { $in: lot_ids } }
  const lots = await this.inventoryLotRepository.findByIds(lot_ids);
  return lots.map((lot) => this.convertToResponse(lot));
}

// Repository method:
async findByIds(lot_ids: string[]): Promise<InventoryLot[]> {
  return this.model.find({ lot_id: { $in: lot_ids } }).exec();
}
```

**Location trong QC code:**  
[qc-test.service.ts](qc-test.service.ts#L259) — Line 259, getSupplierPerformance method  
Comment: `TODO [InventoryLotService]: Add findByIds(lot_ids: string[]) method`

**Performance Note:** Giảm từ N queries → 1 query khi lấy supplier performance

---

## 2. ProductionBatchService — Cần Cập Nhật (Phase 3)

### 2.1 Thêm Method: `completeBatch()` hoặc tích hợp vào batch status update

**Vị trí:** `backend/src/production-batch/production-batch.service.ts`

**Mục tiêu (Phase 3 - Tương lai):** Khi production batch hoàn thành (status = Complete), tự động:
1. Gọi `QCTestService.createLotFromProdBatch(batch_id)`
2. Tạo InventoryLot với dữ liệu từ batch

**Giải pháp:**
```typescript
@Injectable()
export class ProductionBatchService {
  constructor(
    private readonly repository: ProductionBatchRepository,
    private readonly qcTestService: QCTestService, // NEW: Inject QCTestService
  ) {}
  
  async updateBatchStatus(
    batch_id: string,
    newStatus: string,
    performed_by: string,
  ): Promise<ProductionBatchResponseDto> {
    // ... existing validation ...
    
    const updated = await this.repository.updateById(batch_id, {
      status: newStatus,
      // ... other fields ...
    });
    
    // NEW: Auto-create InventoryLot when batch is Complete
    if (newStatus === BatchStatus.Complete) {
      try {
        await this.qcTestService.createLotFromProdBatch(batch_id);
        this.logger.log(`Inventory lot auto-created from batch ${batch_id}`);
      } catch (error) {
        this.logger.warn(
          `Failed to auto-create inventory lot: ${error.message}`,
        );
        // Don't throw — batch completion is independent of inventory lot creation
      }
    }
    
    return this.convertToResponse(updated);
  }
}
```

**Module Import (ProductionBatchModule):**
```typescript
@Module({
  imports: [
    MongooseModule.forFeature([...]),
    QCTestModule, // NEW: Import để inject QCTestService
  ],
  // ... providers, controllers ...
})
export class ProductionBatchModule {}
```

**⚠️ Circular Dependency Note:**  
- QCTestModule imports InventoryLotModule
- ProductionBatchModule imports QCTestModule
- QCTestService có thể inject ProductionBatchService (Future - Phase 3)

**Giải pháp nếu có circular dep:**
```typescript
// product-batch.module.ts
imports: [
  QCTestModule.forwardRef(), // Use forwardRef if needed
]

// product-batch.service.ts
constructor(
  @Inject(forwardRef(() => QCTestService))
  private qcTestService: QCTestService,
) {}
```

---

## 3. QCTestService — Method Cần Implement (Phase 3)

### 3.1 Method: `createLotFromProdBatch(batch_id)`

**Vị trí:** `backend/src/qc-test/qc-test.service.ts`

**Status:** ⏳ Chưa implement, để sau Phase 2

**Pseudocode:**
```typescript
async createLotFromProdBatch(batch_id: string): Promise<InventoryLotDocument> {
  // 1. Fetch production batch
  const batch = await this.productionBatchService.findById(batch_id);
  
  // 2. Validate batch status is Complete
  if (batch.status !== BatchStatus.Complete) {
    throw new BadRequestException('Batch must be Complete...');
  }
  
  // 3. Create InventoryLot from batch data
  const createLotDto: CreateInventoryLotDto = {
    lot_id: uuidv4(),
    material_id: batch.product_id,
    manufacturer_name: 'Internal Production',
    manufacturer_lot: batch.batch_number,
    quantity: batch.batch_size,
    unit_of_measure: batch.unit_of_measure,
    received_date: new Date(),
    expiration_date: batch.expiration_date,
    is_sample: false,
    status: InventoryLotStatus.QUARANTINE,
  };
  
  return this.inventoryLotService.create(createLotDto);
}
```

---

## 4. Testing Checklist

- [ ] Run unit tests: `npm run test`
- [ ] Verify QCTestService methods all pass (no more mock functions)
- [ ] Manual test: POST /qc-tests → should validate lot exists via InventoryLotService
- [ ] Manual test: PATCH /qc-tests/:test_id/decision → should update lot status
- [ ] After InventoryLotService updates: Run integration tests
- [ ] After ProductionBatchService updates: Test batch → lot auto-creation flow

---

## 5. Summary of Changes Made (Phase 1 & 2)

### QCTestModule
- ✅ Import InventoryLotModule
- ✅ Export QCTestService for use by other modules

### QCTestService
- ✅ Inject InventoryLotService
- ✅ Remove all mock functions (_mockLot, mockGetLotById, etc.)
- ✅ Update getTestsByLotId() → use InventoryLotService.findById()
- ✅ Update createTest() → validate lot via InventoryLotService
- ✅ Update submitDecision() → use updateStatus()
- ✅ Update submitRetestDecision() → use updateStatus() + comment for updatePartial need
- ✅ Update getDashboardKPI() → use findByStatus()
- ✅ Update getSupplierPerformance() → loop findById() with comment for findByIds optimization

---

## 6. Reference Links

- [integration-qc-plan.md](integration-qc-plan.md) — Full integration plan
- [qc-test.service.ts](../../02_Source/01_Source%20Code/backend/src/qc-test/qc-test.service.ts) — Updated service
- [inventory-lot.service.ts](../../02_Source/01_Source%20Code/backend/src/inventory-lot/inventory-lot.service.ts) — InventoryLot service (needs updates above)
- [production-batch.service.ts](../../02_Source/01_Source%20Code/backend/src/production-batch/production-batch.service.ts) — ProductionBatch service (Phase 3)

---

**Prepared by:** Agent  
**Status:** Ready for InventoryLotService & ProductionBatchService updates
