# Backend Information — Inventory Management System

> Tài liệu này mô tả toàn bộ cấu trúc, kiến trúc, schema và quy ước code của backend.
> Mục đích: Agent/Developer mới đọc file này để triển khai tính năng tiếp theo **đúng chuẩn**, **nhất quán** và **không phá vỡ code hiện tại**.

---

## 1. Tech Stack

| Thành phần | Công nghệ | Version |
|---|---|---|
| Runtime | Node.js | ≥ 20 LTS |
| Framework | **NestJS** | ^11.0.1 |
| Ngôn ngữ | TypeScript | ^5.7.3 |
| ODM/Database | **Mongoose** + `@nestjs/mongoose` | mongoose ^9.1.6 |
| Database | **MongoDB** | 6.0 (Docker) |
| Validation | `class-validator` + `class-transformer` | ^0.15.1 / ^0.5.1 |
| Config | `@nestjs/config` (đọc `.env`) | ^4.0.3 |
| ID Generation | `uuid` | ^13.0.0 |
| Testing | Jest + `@nestjs/testing` + Supertest | Jest ^30, Supertest ^7 |
| Linter | ESLint + Prettier | eslint ^9, prettier ^3 |

---

## 2. Cấu Trúc Thư Mục

```
backend/
├── src/
│   ├── app.module.ts             # Root module — import tất cả feature modules
│   ├── app.controller.ts         # Health-check endpoint GET /
│   ├── app.service.ts
│   ├── main.ts                   # Bootstrap NestJS, cấu hình CORS, cổng
│   │
│   ├── database/
│   │   ├── database.module.ts    # MongooseModule.forRootAsync — singleton DB connection
│   │   └── mongoose.config.ts    # mongooseConfigFactory (đọc MONGODB_URI từ ConfigService)
│   │
│   ├── event-bus/                # Kafka skeleton (chưa hoàn chỉnh)
│   │   ├── kafka.config.ts
│   │   ├── kafka.module.ts
│   │   └── kafka.service.ts
│   │
│   ├── material/                 # ✅ MODULE HOÀN CHỈNH
│   │   ├── material.module.ts
│   │   ├── material.controller.ts
│   │   ├── material.service.ts
│   │   ├── material.repository.ts
│   │   ├── material.dto.ts       # CreateMaterialDto, UpdateMaterialDto, MaterialResponseDto
│   │   ├── material.service.spec.ts
│   │   └── dto/
│   │       ├── create-material.dto.ts
│   │       └── update-material.dto.ts
│   │
│   ├── inventory-lot/            # 🔶 SKELETON — cần triển khai
│   │   ├── inventory-lot.module.ts
│   │   ├── inventory-lot.controller.ts  # CRUD cơ bản, dto: any (chưa có DTO)
│   │   ├── inventory-lot.service.ts     # stub — trả về []/{id}/dto
│   │   └── inventory-lot.repository.ts  # RỖNG
│   │
│   ├── production-batch/         # 🔶 SKELETON — cần triển khai
│   │   ├── production-batch.module.ts
│   │   ├── production-batch.controller.ts
│   │   ├── production-batch.service.ts  # stub — trả về []/{id}/dto
│   │   └── production-batch.repository.ts # RỖNG
│   │
│   ├── schemas/                  # Mongoose Schemas — nguồn sự thật của dữ liệu
│   │   ├── material.schema.ts
│   │   ├── inventory-lot.schema.ts
│   │   ├── production-batch.schema.ts
│   │   ├── batch-component.schema.ts
│   │   ├── qc-test.schema.ts
│   │   ├── inventory-transaction.schema.ts
│   │   ├── user.schema.ts
│   │   └── label-template.schema.ts
│   │
│   └── unit-test/
│       └── material.create.spec.ts
│
├── test/
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
│
├── .env                          # Biến môi trường thực (không commit)
├── .env.example                  # Template biến môi trường
├── package.json
├── tsconfig.json
├── tsconfig.build.json
└── nest-cli.json
```

---

## 3. Kiến Trúc — Layered + Repository Pattern

```
HTTP Request
    ↓
Controller  (routing, parse params/query/body, trả HTTP status code)
    ↓
Service     (business logic, validation nghiệp vụ, throw exceptions)
    ↓
Repository  (tất cả truy vấn Mongoose, không chứa business logic)
    ↓
MongoDB (via Mongoose Schema)
```

**Quy tắc bắt buộc khi thêm module mới:**
1. Tạo file theo thứ tự: `schema` → `repository` → `service` → `controller` → `module`
2. Module phải import `MongooseModule.forFeature([{ name: X.name, schema: XSchema }])`
3. Module phải `export` Service để các module khác có thể inject nếu cần
4. Tất cả truy vấn DB chỉ nằm trong Repository
5. Tất cả exceptions (`NotFoundException`, `ConflictException`, `BadRequestException`) chỉ throw từ Service

---

## 4. Cách AppModule Kết Nối Các Module

```typescript
// src/app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),  // đọc .env, global
    DatabaseModule,                             // kết nối MongoDB
    MaterialModule,                             // ✅ hoàn chỉnh
    InventoryLotModule,                         // 🔶 skeleton
    ProductionBatchModule,                      // 🔶 skeleton
    // Thêm module mới ở đây
  ],
})
export class AppModule {}
```

---

## 5. Cấu Hình Môi Trường

File: `backend/.env` (xem mẫu tại `.env.example`)

| Biến | Giá trị mặc định | Ý nghĩa |
|---|---|---|
| `NODE_ENV` | `development` | Ảnh hưởng `autoIndex` Mongoose (tắt ở production) |
| `PORT` | `3000` | Cổng NestJS lắng nghe |
| `MONGODB_URI` | `mongodb://localhost:27017/inventory` | URI kết nối MongoDB |
| `FRONTEND_ORIGIN` | `http://localhost:5173` | Origin được phép CORS |

**Fallback URI MongoDB** (trong `mongoose.config.ts`):
```
mongodb://admin:password123@localhost:27017/inventory_db?authSource=admin
```

---

## 6. CORS Configuration (main.ts)

```typescript
app.enableCors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
});
```
→ Khi thêm origin mới, sửa mảng `origin` trong `src/main.ts`.

---

## 7. Mongoose Schemas — Chi Tiết Từng Collection

> Tất cả schemas dùng: `timestamps: { createdAt: 'created_date', updatedAt: 'modified_date' }`

### 7.1 Material (`schemas/material.schema.ts`)
**Collection:** `materials`

| Field | Type | Constraint | Ghi chú |
|---|---|---|---|
| `material_id` | String | required, unique, maxlength: 20 | Business key, ví dụ: "MAT-001" |
| `part_number` | String | required, unique, maxlength: 20 | Business key |
| `material_name` | String | required, maxlength: 100 | |
| `material_type` | String (enum) | required | Xem enum bên dưới |
| `storage_conditions` | String | optional, maxlength: 100 | |
| `specification_document` | String | optional, maxlength: 50 | |
| `created_date` | Date | auto | timestamp |
| `modified_date` | Date | auto | timestamp |

**Enum `material_type`:** `'API'` \| `'Excipient'` \| `'Dietary Supplement'` \| `'Container'` \| `'Closure'` \| `'Process Chemical'` \| `'Testing Material'`

**Indexes đã tạo:**
- `{ material_id: 1 }` unique
- `{ part_number: 1 }` unique
- `{ material_name: 'text' }` text search
- `{ material_type: 1 }`
- `{ created_date: -1 }`
- `{ material_type: 1, created_date: -1 }` compound

---

### 7.2 InventoryLot (`schemas/inventory-lot.schema.ts`)
**Collection:** `inventorylots`

| Field | Type | Constraint | Ghi chú |
|---|---|---|---|
| `lot_id` | String | required, unique, maxlength: 36 | UUID |
| `material_id` | String | required, maxlength: 20 | FK → Material.material_id |
| `manufacturer_name` | String | required, maxlength: 100 | |
| `manufacturer_lot` | String | required, maxlength: 50 | |
| `supplier_name` | String | optional, maxlength: 100 | |
| `received_date` | Date | required | |
| `expiration_date` | Date | required | |
| `in_use_expiration_date` | Date | optional | |
| `status` | String (enum) | required | Xem enum bên dưới |
| `quantity` | Decimal128 | required | |
| `unit_of_measure` | String | required, maxlength: 10 | |
| `storage_location` | String | optional, maxlength: 100 | |
| `is_sample` | Boolean | default: false | |

**Enum `status`:** `'Quarantine'` \| `'Accepted'` \| `'Rejected'` \| `'Depleted'`

---

### 7.3 ProductionBatch (`schemas/production-batch.schema.ts`)
**Collection:** `productionbatches`

| Field | Type | Constraint | Ghi chú |
|---|---|---|---|
| `batch_id` | String | required, unique, maxlength: 36 | UUID |
| `product_id` | String | required, maxlength: 20 | |
| `batch_number` | String | required, unique, maxlength: 50 | |
| `unit_of_measure` | String | required, maxlength: 10 | |
| `manufacture_date` | Date | required | |
| `expiration_date` | Date | required | |
| `status` | String (enum) | required | Xem enum bên dưới |
| `batch_size` | Decimal128 | required | |

**Enum `status`:** `'In Progress'` \| `'Complete'` \| `'On Hold'` \| `'Cancelled'`

---

### 7.4 BatchComponent (`schemas/batch-component.schema.ts`)
**Collection:** `batchcomponents`

| Field | Type | Constraint | Ghi chú |
|---|---|---|---|
| `component_id` | String | required, unique, maxlength: 36 | UUID |
| `batch_id` | String | required, maxlength: 36 | FK → ProductionBatch.batch_id |
| `lot_id` | String | required, maxlength: 36 | FK → InventoryLot.lot_id |
| `planned_quantity` | Decimal128 | required | |
| `actual_quantity` | Decimal128 | optional | |
| `unit_of_measure` | String | required, maxlength: 10 | |
| `addition_date` | Date | optional | |
| `added_by` | String | optional, maxlength: 50 | |

---

### 7.5 QCTest (`schemas/qc-test.schema.ts`)
**Collection:** `qctests`

| Field | Type | Constraint | Ghi chú |
|---|---|---|---|
| `test_id` | String | required, unique, maxlength: 36 | UUID |
| `lot_id` | String | required, maxlength: 36 | FK → InventoryLot.lot_id |
| `test_type` | String (enum) | required | Xem enum bên dưới |
| `test_method` | String | required, maxlength: 100 | |
| `test_date` | Date | required | |
| `test_result` | String | required, maxlength: 100 | |
| `acceptance_criteria` | String | optional, maxlength: 200 | |
| `result_status` | String (enum) | required | `'Pass'` \| `'Fail'` \| `'Pending'` |
| `performed_by` | String | required, maxlength: 50 | |
| `verified_by` | String | optional, maxlength: 50 | |

**Enum `test_type`:** `'Identity'` \| `'Potency'` \| `'Microbial'` \| `'Growth Promotion'` \| `'Physical'` \| `'Chemical'`

---

### 7.6 InventoryTransaction (`schemas/inventory-transaction.schema.ts`)
**Collection:** `inventorytransactions`

| Field | Type | Constraint | Ghi chú |
|---|---|---|---|
| `transaction_id` | String | required, unique, maxlength: 36 | UUID |
| `lot_id` | String | required, maxlength: 36 | FK → InventoryLot.lot_id |
| `transaction_type` | String (enum) | required | Xem enum bên dưới |
| `quantity` | Decimal128 | required | |
| `unit_of_measure` | String | required, maxlength: 10 | |
| `transaction_date` | Date | required | |
| `reference_number` | String | optional, maxlength: 50 | |
| `performed_by` | String | required, maxlength: 50 | |
| `notes` | String | optional | |

**Enum `transaction_type`:** `'Receipt'` \| `'Usage'` \| `'Split'` \| `'Adjustment'` \| `'Transfer'` \| `'Disposal'`

---

### 7.7 User (`schemas/user.schema.ts`)
**Collection:** `users`

| Field | Type | Constraint | Ghi chú |
|---|---|---|---|
| `user_id` | String | unique, default: uuidv4 | |
| `username` | String | required, unique, maxlength: 50 | |
| `email` | String | required, unique, maxlength: 100 | |
| `password` | String | required | phải hash trước khi lưu |
| `role` | String (enum) | default: 'Operator' | Xem enum bên dưới |
| `is_active` | Boolean | default: true | |
| `last_login` | Date | optional, default: null | |

**Enum `role`:** `'Manager'` \| `'Operator'` \| `'Quality Control Technician'` \| `'IT Administrator'`

---

### 7.8 LabelTemplate (`schemas/label-template.schema.ts`)
**Collection:** `labeltemplates`

| Field | Type | Constraint | Ghi chú |
|---|---|---|---|
| `template_id` | String | required, unique, maxlength: 20 | |
| `template_name` | String | required, maxlength: 100 | |
| `label_type` | String (enum) | required | Xem enum bên dưới |
| `template_content` | String | required | nội dung template (HTML/JSON) |
| `width` | Decimal128 | required | |
| `height` | Decimal128 | required | |

**Enum `label_type`:** `'Raw Material'` \| `'Sample'` \| `'Intermediate'` \| `'Finished Product'` \| `'API'` \| `'Status'`

---

## 8. Module Material — Tham Chiếu Chuẩn (Reference Implementation)

### 8.1 API Endpoints

| Method | Path | Mô tả | Status Code |
|---|---|---|---|
| `GET` | `/materials` | Lấy danh sách có phân trang | 200 |
| `GET` | `/materials/search?q=...` | Tìm kiếm (name/id/part_number) | 200 |
| `GET` | `/materials/type/:type` | Lọc theo loại vật tư | 200 |
| `GET` | `/materials/:id` | Lấy chi tiết theo MongoDB `_id` | 200 |
| `POST` | `/materials` | Tạo vật tư mới | 201 |
| `PUT` | `/materials/:id` | Cập nhật vật tư | 200 |
| `DELETE` | `/materials/:id` | Xóa vật tư | 200 |

**Query params phân trang:** `page` (default: 1), `limit` (default: 20, max: 100)

### 8.2 Response Format Chuẩn

**Single item:**
```json
{
  "_id": "...",
  "material_id": "MAT-001",
  "part_number": "PN-001",
  "material_name": "Aspirin",
  "material_type": "API",
  "storage_conditions": "15-25°C",
  "specification_document": "SP-001",
  "created_date": "2026-01-01T00:00:00.000Z",
  "modified_date": "2026-01-01T00:00:00.000Z"
}
```

**Paginated list:**
```json
{
  "data": [ /* array of items */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### 8.3 Exception Handling Chuẩn

| Exception NestJS | Khi nào throw | HTTP Status |
|---|---|---|
| `ConflictException` | Duplicate `material_id` hoặc `part_number` | 409 |
| `NotFoundException` | Không tìm thấy theo ID | 404 |
| `BadRequestException` | Tham số không hợp lệ (page < 1, query quá ngắn, v.v.) | 400 |

### 8.4 DTOs Chuẩn

```typescript
// File: material/material.dto.ts
export class CreateMaterialDto { /* @IsString, @IsNotEmpty, @MaxLength, @IsEnum */ }
export class UpdateMaterialDto { /* tất cả @IsOptional */ }
export class MaterialResponseDto { /* plain class, không decorator */ }
export class PaginatedMaterialResponseDto { data: []; pagination: {} }
```

### 8.5 Repository Methods Chuẩn

```typescript
// Tất cả methods đều là async, return Promise
create(dto)                          // → MaterialDocument
findAll(page, limit)                 // → { data[], total, page, limit }
findById(id: string)                 // → MaterialDocument | null  (by MongoDB _id)
findByMaterialId(materialId: string) // → MaterialDocument | null  (by business key)
findByPartNumber(partNumber: string) // → MaterialDocument | null
search(query, page, limit)           // → { data[], total }
filterByType(type, page, limit)      // → { data[], total }
update(id, dto)                      // → MaterialDocument | null
delete(id)                           // → MaterialDocument | null
```

---

## 9. Trạng Thái Các Module (Để Agent Biết Cần Làm Gì)

| Module | Controller | Service | Repository | DTO | Schema | Test |
|---|---|---|---|---|---|---|
| **material** | ✅ hoàn chỉnh | ✅ hoàn chỉnh | ✅ hoàn chỉnh | ✅ hoàn chỉnh | ✅ | ✅ |
| **inventory-lot** | 🔶 stub (dto: any) | 🔶 stub | ❌ rỗng | ❌ chưa có | ✅ schema có | ❌ |
| **production-batch** | 🔶 stub (dto: any) | 🔶 stub | ❌ rỗng | ❌ chưa có | ✅ schema có | ❌ |
| **qc-test** | ❌ chưa có | ❌ chưa có | ❌ chưa có | ❌ chưa có | ✅ schema có | ❌ |
| **inventory-transaction** | ❌ chưa có | ❌ chưa có | ❌ chưa có | ❌ chưa có | ✅ schema có | ❌ |
| **user** | ❌ chưa có | ❌ chưa có | ❌ chưa có | ❌ chưa có | ✅ schema có | ❌ |
| **label-template** | ❌ chưa có | ❌ chưa có | ❌ chưa có | ❌ chưa có | ✅ schema có | ❌ |
| **batch-component** | ❌ chưa có | ❌ chưa có | ❌ chưa có | ❌ chưa có | ✅ schema có | ❌ |

---

## 10. Hướng Dẫn Thêm Module Mới

Lấy `inventory-lot` làm ví dụ, thực hiện theo thứ tự:

### Bước 1: Tạo DTO file (`inventory-lot/inventory-lot.dto.ts`)
```typescript
import { IsString, IsNotEmpty, IsEnum, IsDateString, IsOptional } from 'class-validator';

export class CreateInventoryLotDto {
  @IsString() @IsNotEmpty()
  lot_id: string; // UUID, tạo ở Service layer

  @IsString() @IsNotEmpty()
  material_id: string; // phải tồn tại trong Material collection

  // ... các field theo schema
}

export class UpdateInventoryLotDto { /* @IsOptional cho tất cả */ }
export class InventoryLotResponseDto { /* plain class */ }
export class PaginatedInventoryLotResponseDto { data: []; pagination: {} }
```

### Bước 2: Triển khai Repository (`inventory-lot/inventory-lot.repository.ts`)
```typescript
@Injectable()
export class InventoryLotRepository {
  constructor(
    @InjectModel(InventoryLot.name)
    private readonly lotModel: Model<InventoryLotDocument>,
  ) {}
  // Triển khai các methods: create, findAll, findById, findByLotId, update, delete
}
```

### Bước 3: Triển khai Service (`inventory-lot/inventory-lot.service.ts`)
- Inject `InventoryLotRepository`
- Validate nghiệp vụ, throw NestJS exceptions
- Map Document → ResponseDto trước khi return

### Bước 4: Cập nhật Controller (`inventory-lot/inventory-lot.controller.ts`)
- Thay `dto: any` bằng đúng DTO class + `ValidationPipe`
- Thêm route search, filter nếu cần

### Bước 5: Cập nhật Module (`inventory-lot/inventory-lot.module.ts`)
```typescript
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InventoryLot.name, schema: InventoryLotSchema },
    ]),
  ],
  controllers: [InventoryLotController],
  providers: [InventoryLotRepository, InventoryLotService],
  exports: [InventoryLotService],
})
export class InventoryLotModule {}
```

### Bước 6: Import schema path
Schema import từ: `'../schemas/inventory-lot.schema'`

---

## 11. Quy Ước Code Bắt Buộc

- **Timestamps**: Luôn dùng `timestamps: { createdAt: 'created_date', updatedAt: 'modified_date' }` trong SchemaOptions
- **ID type**: Dùng UUID string (từ `import { v4 as uuidv4 } from 'uuid'`) — không dùng MongoDB ObjectId làm business key
- **Decimal fields**: Dùng `Decimal128` cho tất cả trường số thực (quantity, weight, v.v.)
- **Logger**: Mỗi Service/Repository tạo `private readonly logger = new Logger(ClassName.name)`
- **Validation**: Luôn dùng `ValidationPipe` trong Controller, không validate trong Repository
- **Sort default**: Luôn sort `{ created_date: -1 }` (mới nhất trước) khi lấy danh sách
- **Pagination cap**: Giới hạn `limit` tối đa 100 trong Service layer
- **Path prefix**: Controller dùng `@Controller('resource-name')` theo kebab-case, số nhiều (ví dụ: `'inventory-lots'`, `'production-batches'`)

---

## 12. Lệnh Khởi Chạy & Test

```powershell
# Cài đặt dependencies
npm install

# Dev mode (hot-reload)
npm run start:dev

# Production
npm run build
npm run start:prod

# Unit tests
npm run test

# Unit tests với coverage
npm run test:cov

# E2E tests
npm run test:e2e

# Lint
npm run lint
```

---

## 13. Kết Nối Database

File quản lý kết nối: `src/database/database.module.ts` + `src/database/mongoose.config.ts`

- `DatabaseModule` là **singleton**, được import trong `AppModule`
- Các feature module **KHÔNG** import `DatabaseModule` trực tiếp — chỉ dùng `MongooseModule.forFeature()`
- `autoIndex` tự động tắt khi `NODE_ENV=production`
- `autoCreate` luôn bật để tự tạo collection khi chưa có
