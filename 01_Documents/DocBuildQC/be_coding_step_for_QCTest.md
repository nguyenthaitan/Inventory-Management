# Backend Coding Steps — Module QC Test

> **Dành cho agent thực thi code.** Đọc kỹ từng step trước khi bắt tay viết code.
> Tham chiếu: `be_infor.md` (cấu trúc, conventions), `01_Documents/QC_details.md` (nghiệp vụ).
>
> **Sau mỗi step, dừng lại và hỏi user:**
> ```
> ✅ Step X hoàn thành.
> 1. Continue — tiếp tục step tiếp theo
> 2. Review   — xem lại code vừa viết trước khi tiếp tục
> ```

---

## Tổng quan luồng thực thi

```
Step 1 → Verify Schemas
Step 2 → InventoryLot Integration (verify & connect — assume module đã có)
Step 3 → QCTest DTOs
Step 4 → QCTest Repository
Step 5 → QCTest Service (business logic)
Step 6 → QCTest Controller (REST endpoints)
Step 7 → QCTest Module + AppModule registration
Step 8 → ProductionBatch → InventoryLot auto-creation
Step 9 → Unit Tests (QCTestService)
Step 10 → Smoke Test toàn bộ flow
```

---

## Step 1 — Verify & Review Schemas

**Mục tiêu:** Đảm bảo hai schema cần thiết cho QC đã đúng và đầy đủ trước khi viết bất kỳ code nào.

### 1.1 Kiểm tra `backend/src/schemas/qc-test.schema.ts`

Đọc file. Đảm bảo đủ các field sau:

| Field                | Type           | Ràng buộc                                       |
| :------------------- | :------------- | :---------------------------------------------- |
| `test_id`            | String         | required, unique, maxlength: 36 (UUID)          |
| `lot_id`             | String         | required, maxlength: 36 (FK → InventoryLot)     |
| `test_type`          | String (enum)  | required; enum: `'Identity' \| 'Potency' \| 'Microbial' \| 'Growth Promotion' \| 'Physical' \| 'Chemical'` |
| `test_method`        | String         | required, maxlength: 100                        |
| `test_date`          | Date           | required                                        |
| `test_result`        | String         | required, maxlength: 100                        |
| `acceptance_criteria`| String         | optional, maxlength: 200                        |
| `result_status`      | String (enum)  | required; enum: `'Pass' \| 'Fail' \| 'Pending'`|
| `performed_by`       | String         | required, maxlength: 50                         |
| `verified_by`        | String         | optional, maxlength: 50                         |
| `reject_reason`      | String         | optional, maxlength: 500 — lý do từ chối       |
| `label_id`           | String         | optional, maxlength: 20 — nhãn được gán        |

> **Nếu thiếu field `reject_reason` và `label_id`:** Thêm vào schema trước khi tiếp tục.

Kiểm tra `timestamps: { createdAt: 'created_date', updatedAt: 'modified_date' }` đã được bật.

Kiểm tra indexes:
- `{ test_id: 1 }` unique
- `{ lot_id: 1 }` — tìm nhanh các test theo lô
- `{ result_status: 1 }` — lọc Pass/Fail/Pending
- `{ test_date: -1 }` — sort mới nhất

### 1.2 Kiểm tra `backend/src/schemas/inventory-lot.schema.ts`

Đọc file. Đảm bảo field `status` có enum đúng: `'Quarantine' | 'Accepted' | 'Rejected' | 'Depleted'`.

> **Nếu thiếu giá trị `'Hold'`** trong enum status của InventoryLot: Thêm `'Hold'` vào enum (dùng cho trường hợp QC Hold).

**Sau khi hoàn thành Step 1, báo cáo:**
- Danh sách field đã có / còn thiếu trong mỗi schema
- Bất kỳ thay đổi nào đã thực hiện

---

> **Checkpoint Step 1**
> ```
> 1. Continue
> 2. Review
> ```

---

## Step 2 — InventoryLot Integration (verify & connect)

**Mục tiêu:** Giả sử `InventoryLotModule` đã được triển khai ở nơi khác. Step này chỉ **xác minh interface** và **kết nối** để QCTestService có thể inject và sử dụng. Không tự implement lại.

> ⚠️ **Lưu ý:** Nếu tên method hoặc tên class trong InventoryLotModule thực tế khác với bên dưới, hãy ghi chú lại và điều chỉnh cho phù hợp khi code Step 5.

### 2.1 Kiểm tra `backend/src/inventory-lot/inventory-lot.service.ts`

Mở file và xác nhận các method sau **đã tồn tại** (hoặc tương đương):

| Method cần có | Dùng trong QC |
| :------------ | :------------ |
| `getLotById(lot_id: string): Promise<InventoryLot>` | Kiểm tra lot tồn tại trước khi tạo test |
| `updateLotStatus(lot_id, status): Promise<InventoryLot>` | Cập nhật status sau khi QC quyết định |
| `getLotsByStatus(status: string): Promise<InventoryLot[]>` | Dashboard — lọc lô đang Quarantine |
| `createLot(dto): Promise<InventoryLot>` | Auto-create sau Production QC (Step 8) |

> **Nếu method có tên khác:** Ghi chú vào comment `// TODO: verify method name` ngay tại chỗ gọi trong QCTestService (Step 5). Ví dụ: nếu tên thực là `findById()` thay vì `getLotById()`, sửa lại khi integrate.

### 2.2 Kiểm tra `backend/src/inventory-lot/inventory-lot.module.ts`

Đảm bảo `InventoryLotModule` đã có `exports: [InventoryLotService]`:

```typescript
@Module({
  // ...
  exports: [InventoryLotService], // ← bắt buộc để QCTestModule inject được
})
export class InventoryLotModule {}
```

> Nếu chưa có dòng `exports`, thêm vào. Đây là thay đổi duy nhất cần thực hiện ở module này.

### 2.3 Kiểm tra DTO `CreateInventoryLotDto`

File dự kiến: `backend/src/inventory-lot/dto/create-inventory-lot.dto.ts`

Nếu file **đã tồn tại**: Ghi chú lại path và tên class để dùng lại trong Step 8.

Nếu file **chưa tồn tại**: Để TODO — sẽ xử lý khi cần (Step 8 là mock, nên DTO này có thể chưa cần ngay):

```typescript
// TODO: Verify CreateInventoryLotDto exists at:
// backend/src/inventory-lot/dto/create-inventory-lot.dto.ts
// Required fields: lot_id, material_id, manufacturer_name, manufacturer_lot,
//   received_date, expiration_date, status, quantity, unit_of_measure
// Optional: supplier_name, in_use_expiration_date, storage_location, is_sample
```

### 2.4 Kiểm tra endpoint Bulk Quarantine trong InventoryLotController

Xem `backend/src/inventory-lot/inventory-lot.controller.ts`. Nếu endpoint dưới đây chưa có, thêm vào:

```typescript
// POST /inventory-lots/bulk-quarantine
// Body: BulkQuarantineDto (dto này sẽ tạo ở Step 3)
// Gọi InventoryLotService.bulkQuarantine(dto.lot_ids)
// TODO: Thêm khi InventoryLotService đã có method bulkQuarantine
```

**Sau khi hoàn thành Step 2, báo cáo:**
- Tên method thực tế trong `InventoryLotService` (so với bảng trên)
- `exports` đã được thêm chưa
- `CreateInventoryLotDto` đã tồn tại chưa

---

> **Checkpoint Step 2**
> ```
> 1. Continue
> 2. Review
> ```

---

## Step 3 — QCTest DTOs

**Mục tiêu:** Tạo các Data Transfer Object cho toàn bộ CRUD và workflow QC.

**File path:** `backend/src/qc-test/dto/`

### 3.1 `create-qc-test.dto.ts`

```typescript
export class CreateQCTestDto {
  @IsString() @IsNotEmpty() @MaxLength(36)
  lot_id: string;                        // FK → InventoryLot.lot_id

  @IsEnum(['Identity','Potency','Microbial','Growth Promotion','Physical','Chemical'])
  test_type: string;

  @IsString() @IsNotEmpty() @MaxLength(100)
  test_method: string;                   // Tên SOP / method

  @IsDateString()
  test_date: string;

  @IsString() @IsNotEmpty() @MaxLength(100)
  test_result: string;                   // Giá trị kết quả (ví dụ: "Độ ẩm: 4.2%")

  @IsOptional() @IsString() @MaxLength(200)
  acceptance_criteria?: string;          // Tiêu chuẩn chấp nhận

  @IsEnum(['Pass','Fail','Pending'])
  result_status: string;

  @IsString() @IsNotEmpty() @MaxLength(50)
  performed_by: string;                  // username của QC Technician

  @IsOptional() @IsString() @MaxLength(50)
  verified_by?: string;

  @IsOptional() @IsString() @MaxLength(500)
  reject_reason?: string;               // Bắt buộc điền nếu result_status = 'Fail'

  @IsOptional() @IsString() @MaxLength(20)
  label_id?: string;                    // Nhãn được gán sau kiểm định
}
```

### 3.2 `update-qc-test.dto.ts`

Dùng `PartialType(CreateQCTestDto)` — tất cả fields đều optional.

> **Lưu ý:** Không cho phép update `lot_id` sau khi tạo (bỏ field này khỏi UpdateDto hoặc dùng `OmitType`).

### 3.3 `qc-decision.dto.ts` (dành riêng cho workflow Approve/Reject/Hold)

```typescript
export class QCDecisionDto {
  @IsEnum(['Accepted','Rejected','Hold'])
  decision: 'Accepted' | 'Rejected' | 'Hold';

  @IsOptional() @IsString() @MaxLength(500)
  reject_reason?: string;
  // Validation nghiệp vụ: nếu decision = 'Rejected' → reject_reason bắt buộc
  // (validate trong Service, không trong DTO)

  @IsOptional() @IsString() @MaxLength(20)
  label_id?: string;

  @IsString() @IsNotEmpty() @MaxLength(50)
  verified_by: string;                  // username của người xác nhận
}
```

### 3.4 `bulk-quarantine.dto.ts`

```typescript
export class BulkQuarantineDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  lot_ids: string[];
}
```

---

> **Checkpoint Step 3**
> ```
> 1. Continue
> 2. Review
> ```

---

## Step 4 — QCTest Repository

**File:** `backend/src/qc-test/qc-test.repository.ts`

**Mục tiêu:** Toàn bộ truy vấn Mongoose cho collection `qctests`. Không có business logic.

```typescript
@Injectable()
export class QCTestRepository {
  constructor(
    @InjectModel(QCTest.name) private readonly qcTestModel: Model<QCTest>,
  ) {}

  // Tìm tất cả test theo lot_id (lịch sử kiểm định của một lô)
  async findByLotId(lot_id: string): Promise<QCTest[]>

  // Tìm test theo test_id
  async findByTestId(test_id: string): Promise<QCTest | null>

  // Tìm tất cả test, có filter tùy chọn
  async findAll(filter?: {
    result_status?: string;
    test_type?: string;
    performed_by?: string;
  }): Promise<QCTest[]>

  // Tạo mới
  async create(data: Partial<QCTest>): Promise<QCTest>

  // Cập nhật theo test_id
  async updateByTestId(test_id: string, data: Partial<QCTest>): Promise<QCTest | null>

  // Xóa theo test_id
  async deleteByTestId(test_id: string): Promise<boolean>

  // Đếm số test theo result_status trong khoảng thời gian (dùng cho Dashboard KPI)
  async countByResultStatus(
    result_status: string,
    from?: Date,
    to?: Date,
  ): Promise<number>

  // Lấy danh sách supplier performance:
  // Group by lot_id → join với InventoryLot → aggregate theo result_status
  // (sẽ implement ở Step 5 trong Service bằng cách join data)
}
```

**Indexes cần đảm bảo trong schema:** `lot_id`, `result_status`, `test_date` (đã kiểm tra ở Step 1).

---

> **Checkpoint Step 4**
> ```
> 1. Continue
> 2. Review
> ```

---

## Step 5 — QCTest Service

**File:** `backend/src/qc-test/qc-test.service.ts`

**Mục tiêu:** Toàn bộ business logic QC. Inject `QCTestRepository` và `InventoryLotService`.

### 5.1 Methods CRUD cơ bản

```typescript
// Lấy danh sách test (có thể filter)
async getAllTests(filter?: { result_status?: string; test_type?: string }): Promise<QCTest[]>

// Lấy test theo ID
async getTestById(test_id: string): Promise<QCTest>
// → throw NotFoundException nếu không tìm thấy

// Lấy tất cả test của một lô
async getTestsByLotId(lot_id: string): Promise<QCTest[]>
// → throw NotFoundException nếu lot không tồn tại

// Tạo QC Test mới (Pending)
async createTest(dto: CreateQCTestDto): Promise<QCTest>
// Business rules:
//   1. Kiểm tra lot tồn tại qua InventoryLotService.getLotById(dto.lot_id)
//      → throw NotFoundException nếu không có
//   2. Sinh test_id = uuid()
//   3. result_status mặc định = 'Pending' nếu không truyền vào
//   4. Lưu vào DB

// Update thông tin test (trước khi ra quyết định)
async updateTest(test_id: string, dto: UpdateQCTestDto): Promise<QCTest>
// → throw NotFoundException nếu test không tồn tại

// Xóa test
async deleteTest(test_id: string): Promise<{ deleted: boolean }>
```

### 5.2 Methods Workflow QC (quan trọng)

```typescript
// Đưa ra quyết định cuối cho lô hàng đầu vào (Workflow A — InventoryLot)
async submitDecision(lot_id: string, dto: QCDecisionDto): Promise<{
  lot: InventoryLot;
  tests: QCTest[];
}>
// Business rules:
//   1. Kiểm tra lot tồn tại
//   2. Nếu dto.decision === 'Rejected':
//      - Validate reject_reason không được rỗng
//        → throw BadRequestException('Lý do từ chối là bắt buộc khi quyết định là Rejected')
//   3. Update tất cả QCTest của lot_id có result_status = 'Pending':
//      - result_status → dto.decision === 'Accepted' ? 'Pass' : dto.decision === 'Rejected' ? 'Fail' : 'Pending'
//      - verified_by → dto.verified_by
//      - reject_reason → dto.reject_reason (nếu Rejected)
//      - label_id → dto.label_id
//   4. Update InventoryLot.status:
//      - 'Accepted' → InventoryLotService.updateLotStatus(lot_id, 'Accepted')
//      - 'Rejected' → InventoryLotService.updateLotStatus(lot_id, 'Rejected')
//      - 'Hold'     → InventoryLotService.updateLotStatus(lot_id, 'Hold')
//   5. Trả về lot đã update + danh sách tests đã update

// Re-test quyết định: Gia hạn hoặc Hủy bỏ (Workflow C)
async submitRetestDecision(lot_id: string, action: 'extend' | 'discard', dto: {
  new_expiry_date?: string;  // required nếu action = 'extend'
  performed_by: string;
}): Promise<InventoryLot>
// Business rules:
//   - action = 'extend':
//       Validate new_expiry_date tồn tại → throw BadRequestException nếu không có
//       Update InventoryLot.expiration_date = new_expiry_date
//       Update InventoryLot.status = 'Accepted'
//       Tạo QCTest mới với test_type = 'Physical', result_status = 'Pass', test_method = 'Re-test'
//   - action = 'discard':
//       Update InventoryLot.status = 'Depleted'
//       Tạo QCTest mới với result_status = 'Fail', test_method = 'Re-test - Discard'
```

### 5.3 Methods Dashboard & Reporting

```typescript
// Lấy KPI Dashboard:
// - Số lô đang Quarantine (chờ QC)
// - Số test Pass trong tháng
// - Số test Fail trong tháng
// - Tỷ lệ lỗi (failed / total * 100)
async getDashboardKPI(): Promise<{
  pending_count: number;
  approved_count: number;
  rejected_count: number;
  error_rate: number;     // percentage
}>

// Lấy supplier performance: gom nhóm theo manufacturer_name từ InventoryLots + QCTests
async getSupplierPerformance(filter?: { from?: string; to?: string }): Promise<Array<{
  supplier_name: string;
  total_batches: number;
  approved: number;
  rejected: number;
  quality_rate: number;   // percentage
}>>
// Cách implement:
//   1. Lấy tất cả QCTests trong khoảng thời gian
//   2. Với mỗi test, lấy lot → lấy supplier_name từ InventoryLot
//   3. Aggregate theo supplier_name
//   Note: Nếu quá phức tạp, có thể dùng MongoDB aggregation pipeline trong Repository
```

---

> **Checkpoint Step 5**
> ```
> 1. Continue
> 2. Review
> ```

---

## Step 6 — QCTest Controller

**File:** `backend/src/qc-test/qc-test.controller.ts`

**Base path:** `/qc-tests`

### Endpoints

| Method   | Path                            | Body / Query             | Status | Mô tả                                     |
| :------- | :------------------------------ | :----------------------- | :----- | :---------------------------------------- |
| `GET`    | `/qc-tests`                     | `?result_status=&test_type=` | 200 | Lấy tất cả QC test (có filter)        |
| `GET`    | `/qc-tests/dashboard`           | —                        | 200    | KPI Dashboard QC                          |
| `GET`    | `/qc-tests/supplier-performance`| `?from=&to=`             | 200    | Hiệu suất nhà cung cấp                   |
| `GET`    | `/qc-tests/:test_id`            | —                        | 200    | Chi tiết một QC test                      |
| `GET`    | `/qc-tests/lot/:lot_id`         | —                        | 200    | Tất cả test của một lô (Traceability)     |
| `POST`   | `/qc-tests`                     | `CreateQCTestDto`        | 201    | Tạo QC test mới                           |
| `POST`   | `/qc-tests/lot/:lot_id/decision`| `QCDecisionDto`          | 200    | Submit quyết định Approve/Reject/Hold     |
| `POST`   | `/qc-tests/lot/:lot_id/retest`  | `{ action, new_expiry_date?, performed_by }` | 200 | Quyết định Re-test    |
| `PATCH`  | `/qc-tests/:test_id`            | `UpdateQCTestDto`        | 200    | Cập nhật thông tin test                   |
| `DELETE` | `/qc-tests/:test_id`            | —                        | 200    | Xóa test                                  |

**Thêm endpoint vào InventoryLotController:**

| Method   | Path                              | Body                   | Status | Mô tả                         |
| :------- | :-------------------------------- | :--------------------- | :----- | :----------------------------- |
| `POST`   | `/inventory-lots/bulk-quarantine` | `BulkQuarantineDto`    | 200    | Cách ly hàng loạt (Workflow D) |
| `GET`    | `/inventory-lots?status=`         | —                      | 200    | Lọc lô theo status             |

### Convention cần tuân thủ

```typescript
@Controller('qc-tests')
export class QCTestController {
  constructor(private readonly qcTestService: QCTestService) {}

  @Get('dashboard')    // ← route tĩnh PHẢI đặt TRƯỚC route động (:test_id)
  getDashboard() { ... }

  @Get('supplier-performance')
  getSupplierPerformance(@Query() query: ...) { ... }

  @Get(':test_id')     // ← route động phải để sau tất cả route tĩnh
  getById(@Param('test_id') test_id: string) { ... }
}
```

> **Không trả về trực tiếp Mongoose Document** — dùng `.toObject()` hoặc map sang DTO/plain object trước khi trả về.

---

> **Checkpoint Step 6**
> ```
> 1. Continue
> 2. Review
> ```

---

## Step 7 — QCTest Module + Đăng ký AppModule

**File:** `backend/src/qc-test/qc-test.module.ts`

```typescript
@Module({
  imports: [
    MongooseModule.forFeature([{ name: QCTest.name, schema: QCTestSchema }]),
    InventoryLotModule,   // Import để inject InventoryLotService
  ],
  controllers: [QCTestController],
  providers: [QCTestService, QCTestRepository],
  exports: [QCTestService],
})
export class QCTestModule {}
```

**Cập nhật `backend/src/app.module.ts`:**

Thêm `QCTestModule` vào mảng `imports`. Đảm bảo `InventoryLotModule` cũng đã có trong AppModule.

**Kiểm tra sau khi thêm module:**

```bash
# Chạy trong thư mục backend/
npm run build
# Không được có lỗi TypeScript
```

Nếu có lỗi circular dependency (QCTestModule → InventoryLotModule → QCTestModule), dùng `forwardRef()`.

---

> **Checkpoint Step 7**
> ```
> 1. Continue
> 2. Review
> ```

---

## Step 8 — ProductionBatch → InventoryLot Auto-Creation (Workflow B) [MOCK / TODO]

**Mục tiêu:** Step này liên kết giữa `ProductionBatchModule` và `QCTestModule` — phụ thuộc vào module ngoài phạm vi QCTest. **Không triển khai đầy đủ ở giai đoạn này.** Thay vào đó, đặt TODO rõ ràng tại điểm kết nối.

> ⚠️ **Phạm vi hiện tại:** Chỉ triển khai module QCTest độc lập. Tích hợp với ProductionBatch sẽ làm sau khi ProductionBatchModule đã sẵn sàng.

### 8.1 TODO trong QCTestService (Workflow B hook)

Trong file `backend/src/qc-test/qc-test.service.ts`, thêm comment placeholder cho integration point:

```typescript
// TODO [Workflow B]: Sau khi ProductionBatchModule sẵn sàng, inject ProductionBatchService
// và gọi QCTestService.createTest() sau khi batch QC hoàn tất.
// Mapping dữ liệu dự kiến:
//   lot_id           ← uuid() mới sinh
//   material_id      ← batch.product_id
//   manufacturer_name ← 'Internal Production'
//   manufacturer_lot  ← batch.batch_number
//   received_date    ← new Date()
//   expiration_date  ← batch.expiration_date
//   status           ← 'Accepted' | 'Rejected'
//   quantity         ← batch.batch_size (Decimal128 → number)
//   unit_of_measure  ← batch.unit_of_measure
```

### 8.2 Mock endpoint (tùy chọn — dành cho smoke test)

Nếu cần test Workflow B mà chưa có ProductionBatchModule, có thể gọi trực tiếp:

```bash
# Tạo InventoryLot thủ công thay vì qua ProductionBatch
POST /inventory-lots
{
  "lot_id": "mock-batch-lot-001",
  "material_id": "PROD-MAT-001",
  "manufacturer_name": "Internal Production",
  "manufacturer_lot": "BATCH-2026-001",
  "received_date": "2026-03-08",
  "expiration_date": "2027-03-08",
  "status": "Quarantine",
  "quantity": 500,
  "unit_of_measure": "kg"
}
# Sau đó chạy QC flow bình thường (Workflow A)
```

### 8.3 Ghi chú kết nối khi ProductionBatch sẵn sàng

Khi module ProductionBatch được triển khai, cần:
- Thêm `QCTestModule` vào `imports` của `ProductionBatchModule`
- Thêm endpoint `POST /production-batches/:batch_id/qc-complete`
- Implement `ProductionBatchService.completeQC()` theo business rules Workflow B
- Xem lại tên field: `batch.product_id`, `batch.batch_number`, `batch.batch_size`, `batch.unit_of_measure` — xác nhận đúng với schema thực tế

---

> **Checkpoint Step 8**
> ```
> 1. Continue
> 2. Review
> ```

---

## Step 9 — Unit Tests (QCTestService)

**File:** `backend/src/qc-test/qc-test.service.spec.ts`

**Công cụ:** Jest + `@nestjs/testing`. Sử dụng mock cho `QCTestRepository` và `InventoryLotService`.

### Test cases bắt buộc:

#### 9.1 `createTest()`
- ✅ Tạo test thành công khi lot tồn tại
- ❌ Throw `NotFoundException` khi lot không tồn tại
- ✅ `test_id` được sinh bằng `uuid()` (kiểm tra format UUID v4)

#### 9.2 `submitDecision()` — Approved
- ✅ Update lot status → `'Accepted'`
- ✅ Update QCTest result_status → `'Pass'`
- ✅ verified_by được ghi nhận đúng

#### 9.3 `submitDecision()` — Rejected
- ✅ Update lot status → `'Rejected'`
- ✅ Update QCTest result_status → `'Fail'`
- ❌ Throw `BadRequestException` khi `reject_reason` rỗng
- ✅ `reject_reason` được lưu vào QCTest

#### 9.4 `submitDecision()` — Hold
- ✅ Update lot status → `'Hold'`
- ✅ QCTest result_status vẫn là `'Pending'`

#### 9.5 `submitRetestDecision()` — extend
- ✅ Update `expiration_date` sang ngày mới
- ❌ Throw `BadRequestException` khi không truyền `new_expiry_date`

#### 9.6 `submitRetestDecision()` — discard
- ✅ Update lot status → `'Depleted'`

#### 9.7 `getDashboardKPI()`
- ✅ Tính đúng `error_rate` = rejected / (approved + rejected) * 100
- ✅ Trả về 0 nếu không có data

### Chạy test:

```bash
cd backend
npx jest qc-test.service.spec.ts --verbose
```

Tất cả test phải **PASS** trước khi tiếp tục Step 10.

---

> **Checkpoint Step 9**
> ```
> 1. Continue
> 2. Review
> ```

---

## Step 10 — Smoke Test Toàn Bộ Flow

**Mục tiêu:** Kiểm tra end-to-end toàn bộ QC workflow với MongoDB thực tế (hoặc MongoDB in-memory).

### 10.1 Build & Start server

```bash
cd backend
npm run build
npm run start:dev
# Server phải khởi động thành công tại http://localhost:3000
```

### 10.2 Test Workflow A — Kiểm định lô nguyên liệu đầu vào

```bash
# Bước 1: Tạo QCTest cho một lot đang Quarantine
POST /qc-tests
{
  "lot_id": "<lot_id_có_status_Quarantine>",
  "test_type": "Physical",
  "test_method": "USP <905>",
  "test_date": "2026-03-08",
  "test_result": "Độ ẩm: 4.2%, Tinh khiết: 99.1%",
  "result_status": "Pending",
  "performed_by": "qc_user_01"
}
# Expect: 201 Created, test_id được sinh

# Bước 2: Submit quyết định Approve
POST /qc-tests/lot/<lot_id>/decision
{
  "decision": "Accepted",
  "label_id": "LBL-001",
  "verified_by": "qc_manager_01"
}
# Expect: 200 OK
# Expect: InventoryLot.status = "Accepted"
# Expect: QCTest.result_status = "Pass"
```

### 10.3 Test Workflow D — Bulk Quarantine

```bash
POST /inventory-lots/bulk-quarantine
{
  "lot_ids": ["<lot_id_1>", "<lot_id_2>"]
}
# Expect: 200 OK, { "updated": 2 }
# Expect: Cả 2 lot có status = "Quarantine"
```

### 10.4 Test Workflow B — ProductionBatch QC hoàn tất

```bash
POST /production-batches/<batch_id>/qc-complete
{
  "decision": "Accepted",
  "label_id": "LBL-FINISHED-001",
  "verified_by": "qc_manager_01"
}
# Expect: 200 OK
# Expect: ProductionBatch.status = "Complete"
# Expect: InventoryLot mới được tạo với manufacturer_lot = batch.batch_number
```

### 10.5 Test Dashboard KPI

```bash
GET /qc-tests/dashboard
# Expect: 200 OK, trả về { pending_count, approved_count, rejected_count, error_rate }
```

### 10.6 Kiểm tra final

- [ ] `npm run build` — không có lỗi TypeScript
- [ ] Tất cả unit tests pass: `npx jest --coverage`
- [ ] Không có unhandled exception trong console khi chạy `start:dev`
- [ ] Tất cả 5 smoke test trả về đúng HTTP status code

---

> **Checkpoint Step 10 — FINAL**
> ```
> 1. Done — Module QC Test đã hoàn chỉnh
> 2. Review — Cần xem lại một phần
> ```

---

## Tóm tắt Files cần tạo/sửa

| File | Trạng thái | Ghi chú |
| :--- | :--------- | :------ |
| `src/schemas/qc-test.schema.ts` | Verify/Update | Thêm `reject_reason`, `label_id` nếu thiếu |
| `src/schemas/inventory-lot.schema.ts` | Verify/Update | Thêm `'Hold'` vào enum status nếu thiếu |
| `src/inventory-lot/dto/create-inventory-lot.dto.ts` | Verify (assume done) | Kiểm tra đã tồn tại chưa; nếu chưa để TODO |
| `src/inventory-lot/inventory-lot.repository.ts` | Assume done | Không tự implement — chỉ ghi chú nếu method thiếu |
| `src/inventory-lot/inventory-lot.service.ts` | Assume done | Xác nhận tên method khớp với bảng Step 2 |
| `src/inventory-lot/inventory-lot.module.ts` | Update (nhỏ) | Chỉ thêm `exports: [InventoryLotService]` nếu chưa có |
| `src/qc-test/dto/create-qc-test.dto.ts` | **Tạo mới** | |
| `src/qc-test/dto/update-qc-test.dto.ts` | **Tạo mới** | |
| `src/qc-test/dto/qc-decision.dto.ts` | **Tạo mới** | |
| `src/qc-test/dto/bulk-quarantine.dto.ts` | **Tạo mới** | |
| `src/qc-test/qc-test.repository.ts` | **Tạo mới** | |
| `src/qc-test/qc-test.service.ts` | **Tạo mới** | |
| `src/qc-test/qc-test.controller.ts` | **Tạo mới** | |
| `src/qc-test/qc-test.module.ts` | **Tạo mới** | |
| `src/qc-test/qc-test.service.spec.ts` | **Tạo mới** | |
| `src/production-batch/production-batch.service.ts` | TODO (ngoài phạm vi) | Thêm `completeQC()` khi ProductionBatch module sẵn sàng |
| `src/production-batch/production-batch.controller.ts` | TODO (ngoài phạm vi) | Thêm `POST /:batch_id/qc-complete` khi sẵn sàng |
| `src/production-batch/production-batch.module.ts` | TODO (ngoài phạm vi) | Import `QCTestModule` khi integrate |
| `src/app.module.ts` | Update | Thêm `QCTestModule` |

---

## Dependencies giữa các Steps

```
Step 1 (Schemas)
    ↓
Step 2 (Verify InventoryLotModule — assume done, chỉ xác nhận interface & exports)
    ↓
Step 3 (DTOs)
    ↓
Step 4 (Repository)
    ↓
Step 5 (Service) ←── inject InventoryLotService (đã có từ module ngoài)
    ↓
Step 6 (Controller)
    ↓
Step 7 (Module + AppModule)
    ↓
Step 8 (TODO: ProductionBatch integration — mock/placeholder, làm sau)
    ↓
Step 9 (Unit Tests)
    ↓
Step 10 (Smoke Test)
```

**Không được bỏ qua thứ tự.** Step 8 là TODO — không block Step 9 và Step 10 (smoke test Workflow B dùng mock thay thế).
