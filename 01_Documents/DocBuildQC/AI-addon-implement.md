# AI Addon — Phân tích Nhà Cung Cấp Tiềm Năng (Supplier AI Analysis)

## 1. Tổng quan

Thêm module AI vào backend NestJS hiện tại để phân tích hiệu suất và rủi ro của các nhà cung cấp dựa trên dữ liệu QC test thực tế. AI (Qwen/Qwen2.5-72B-Instruct qua HuggingFace API — giống PoC) sẽ nhận dữ liệu tổng hợp từ `QCTestService.getSupplierPerformance()` và trả về nhận xét chuyên sâu, xếp hạng rủi ro, và khuyến nghị hành động.

### Mục tiêu chức năng
| Endpoint | Mô tả |
|---|---|
| `GET /ai/supplier-analysis` | Phân tích toàn bộ nhà cung cấp (có filter theo ngày) |
| `GET /ai/supplier-analysis/:name` | Phân tích chi tiết một nhà cung cấp cụ thể |
| `GET /ai/test-connection` | Kiểm tra kết nối HuggingFace API |

---

## 2. Kiến trúc

```
src/ai/                          ← folder đã tồn tại (đang trống)
├── ai.module.ts                 ← Module definition
├── ai.controller.ts             ← REST endpoints
├── ai-supplier.service.ts       ← Logic gọi HuggingFace
└── dto/
    └── supplier-analysis.dto.ts ← Input / Output DTOs
```

### Luồng dữ liệu

```
GET /ai/supplier-analysis
       │
       ▼
AiController.analyzeAllSuppliers()
       │
       ├── QCTestService.getSupplierPerformance(filter)   ← dữ liệu thực từ MongoDB
       │       └── returns: [{ supplier_name, total_batches, approved, rejected, quality_rate }]
       │
       ├── AiSupplierService.analyzeSuppliers(data)       ← gọi HuggingFace
       │       ├── Build system prompt (vai trò chuyên gia chuỗi cung ứng)
       │       ├── Build user prompt (bảng số liệu nhà cung cấp)
       │       └── hf.chatCompletion({ model, messages, max_tokens: 600 })
       │
       └── return SupplierAnalysisResponseDto
```

---

## 3. Các file cần tạo

### 3.1. `src/ai/dto/supplier-analysis.dto.ts`

```typescript
import { IsOptional, IsString } from 'class-validator';

// Input cho endpoint filter theo ngày
export class SupplierAnalysisFilterDto {
  @IsOptional() @IsString()
  from?: string;   // ISO date string, e.g. "2026-01-01"

  @IsOptional() @IsString()
  to?: string;
}

// Shape dữ liệu một nhà cung cấp (khớp với QCTestService.getSupplierPerformance)
export interface SupplierPerformanceRecord {
  supplier_name: string;
  total_batches: number;
  approved: number;
  rejected: number;
  quality_rate: number;  // % approved / (approved+rejected)
}

// Response trả về client
export class SupplierAnalysisResponseDto {
  success: boolean;
  analysis: string;           // Văn bản AI sinh ra
  suppliers_analyzed: number; // Số nhà cung cấp đã phân tích
  timestamp: string;
  model_used: string;
}
```

### 3.2. `src/ai/ai-supplier.service.ts`

**Nhiệm vụ:** Wrapper quanh HuggingFace API, xây dựng prompt từ dữ liệu nhà cung cấp.

```typescript
@Injectable()
export class AiSupplierService {
  private hf: HfInference;
  private model: string;

  constructor(private configService: ConfigService) {
    const apiKey = configService.get<string>('HUGGINGFACE_API_KEY');
    this.model = configService.get<string>('HUGGINGFACE_MODEL')
                 || 'Qwen/Qwen2.5-72B-Instruct';
    if (!apiKey) throw new Error('HUGGINGFACE_API_KEY is required');
    this.hf = new HfInference(apiKey);
  }

  async analyzeSuppliers(
    suppliers: SupplierPerformanceRecord[],
  ): Promise<SupplierAnalysisResponseDto> { ... }

  async analyzeOneSupplier(
    supplier: SupplierPerformanceRecord,
  ): Promise<SupplierAnalysisResponseDto> { ... }

  async testConnection(): Promise<{ connected: boolean; model: string }> { ... }
}
```

**System prompt (analyzeSuppliers):**
```
Bạn là chuyên gia quản lý chuỗi cung ứng và kiểm soát chất lượng với hơn 10 năm kinh nghiệm
trong ngành dược phẩm và thực phẩm chức năng. Nhiệm vụ của bạn là phân tích hiệu suất các
nhà cung cấp dựa trên dữ liệu QC test và đưa ra:
1. Xếp hạng rủi ro (Thấp / Trung bình / Cao) cho từng nhà cung cấp
2. Nhận xét ngắn gọn điểm mạnh / yếu
3. Khuyến nghị: tiếp tục, theo dõi, hoặc xem xét thay thế
Trả lời bằng tiếng Việt, chuyên nghiệp, có cấu trúc rõ ràng.
```

**User prompt (analyzeSuppliers):**  
Bảng dạng text với các cột: STT | Nhà cung cấp | Tổng lô | Đạt | Không đạt | Tỷ lệ chất lượng

**User prompt (analyzeOneSupplier):**  
Chi tiết một nhà cung cấp + so sánh với ngưỡng chấp nhận (quality_rate < 80% = rủi ro cao).

### 3.3. `src/ai/ai.controller.ts`

```typescript
@Controller('ai')
export class AiController {

  // Phân tích tất cả nhà cung cấp
  @Get('supplier-analysis')
  async analyzeAllSuppliers(@Query() filter: SupplierAnalysisFilterDto) { ... }

  // Phân tích một nhà cung cấp theo tên
  @Get('supplier-analysis/:name')
  async analyzeOneSupplier(@Param('name') name: string,
                           @Query() filter: SupplierAnalysisFilterDto) { ... }

  // Kiểm tra kết nối HuggingFace
  @Get('test-connection')
  async testConnection() { ... }
}
```

### 3.4. `src/ai/ai.module.ts`

```typescript
@Module({
  imports: [
    ConfigModule,     // đã global — không cần khai báo lại
    QCTestModule,     // inject QCTestService
  ],
  controllers: [AiController],
  providers: [AiSupplierService],
})
export class AiModule {}
```

### 3.5. Cập nhật `src/app.module.ts`

```typescript
// Thêm import
import { AiModule } from './ai/ai.module';

// Thêm vào imports[]
AiModule,
```

---

## 4. Cài đặt dependency

```bash
# Trong folder backend/
npm install @huggingface/inference
```

`@huggingface/inference` chưa có trong `package.json` hiện tại — đây là package duy nhất cần cài thêm.

---

## 5. Biến môi trường

Thêm vào file `.env` trong `backend/`:

```env
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
HUGGINGFACE_MODEL=Qwen/Qwen2.5-72B-Instruct
```

> `ConfigModule.forRoot({ isGlobal: true })` đã được cấu hình trong `AppModule` — không cần thay đổi gì thêm.

---

## 6. Thứ tự implement

```
Step 1 │ Cài dependency: npm install @huggingface/inference
       │
Step 2 │ Tạo dto/supplier-analysis.dto.ts
       │   - SupplierAnalysisFilterDto (class-validator decorators)
       │   - SupplierPerformanceRecord (interface)
       │   - SupplierAnalysisResponseDto
       │
Step 3 │ Tạo ai-supplier.service.ts
       │   - Constructor nhận ConfigService, khởi tạo HfInference
       │   - analyzeSuppliers(suppliers[]) → gọi chatCompletion, parse response
       │   - analyzeOneSupplier(supplier) → prompt chi tiết hơn
       │   - testConnection()
       │
Step 4 │ Tạo ai.controller.ts
       │   - GET /ai/supplier-analysis          → lấy data từ QCTestService, gọi service
       │   - GET /ai/supplier-analysis/:name    → filter theo tên, gọi analyzeOneSupplier
       │   - GET /ai/test-connection            → gọi testConnection
       │
Step 5 │ Tạo ai.module.ts
       │   - imports: [QCTestModule]
       │   - controllers: [AiController]
       │   - providers: [AiSupplierService]
       │
Step 6 │ Cập nhật app.module.ts
       │   - Thêm AiModule vào imports[]
       │
Step 7 │ Smoke test
       │   - GET /ai/test-connection → { success: true }
       │   - GET /ai/supplier-analysis → { success: true, analysis: "...", suppliers_analyzed: N }
       │   - GET /ai/supplier-analysis/SupplierName → phân tích chi tiết
```

---

## 7. Tham chiếu với PoC

| PoC (`/05_Proof of Concept/src/ai/`) | Production (`/01_Source Code/backend/src/ai/`) |
|---|---|
| `ai-qc.service.ts` | `ai-supplier.service.ts` — cùng pattern HfInference + ConfigService |
| `ai-qc.controller.ts` | `ai.controller.ts` — cùng cấu trúc Controller + Logger |
| `ai.module.ts` | `ai.module.ts` — thêm import `QCTestModule` |
| `dto/analyze-qc.dto.ts` | `dto/supplier-analysis.dto.ts` — DTO mới cho supplier |
| Dùng mock data | Dùng dữ liệu thực từ `QCTestService.getSupplierPerformance()` |
| max_tokens: 250 | max_tokens: 600 (nhiều nhà cung cấp hơn, cần response dài hơn) |

---

## 8. Lưu ý kỹ thuật

- **Circular dependency:** `AiModule` → `QCTestModule` → `InventoryLotModule`. Không có vòng tròn vì `AiModule` chỉ import `QCTestModule` một chiều.
- **Error handling:** Nếu HuggingFace API trả lỗi, service trả về `{ success: false, analysis: "Lỗi: ..." }` thay vì throw exception — giống pattern PoC.
- **Rate limit:** HuggingFace free tier có giới hạn. Nên cache kết quả nếu filter giống nhau (future improvement).
- **Empty data:** Nếu `getSupplierPerformance()` trả về `[]` (không có test nào trong khoảng ngày), trả về `400 BadRequestException` với message rõ ràng trước khi gọi AI.
- **Supplier name encoding:** URL `GET /ai/supplier-analysis/:name` cần `encodeURIComponent` ở frontend nếu tên nhà cung cấp có dấu cách hoặc ký tự đặc biệt.
