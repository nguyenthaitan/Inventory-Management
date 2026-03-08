# Frontend Coding Plan — Module Quality Control (QC)

> **Dành cho agent thực thi code.**
> Đọc kỹ từng step trước khi bắt tay viết code.
> Tham chiếu:
> - `api_qctest_doc.md` — API contracts
> - `01_Documents/QC_details.md` — Nghiệp vụ chi tiết
> - `src/app/pages/QualityControl/` — Code giao diện mẫu hiện có
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
Step 1 → Tạo type definitions (interfaces TypeScript cho toàn module QC)
Step 2 → Tạo API service layer (tất cả API calls tập trung một chỗ)
Step 3 → Dashboard.tsx — kết nối API KPI thực
Step 4 → PendingBatch.tsx — kết nối API kiểm định lô đầu vào
Step 5 → Products.tsx — kết nối API kiểm định lô thành phẩm
Step 6 → InventoryQA.tsx — kết nối API re-test & bulk quarantine
Step 7 → Traceability.tsx — kết nối API truy vết & supplier performance
Step 8 → Smoke test toàn bộ flow QC
```

---

## Ngữ cảnh hiện tại (trước khi bắt đầu)

| File | Trạng thái |
|---|---|
| `Dashboard.tsx` | Dùng mock data tĩnh trong component |
| `PendingBatch.tsx` | Dùng mock `Batch[]` cứng, submit chỉ cập nhật local state |
| `Products.tsx` | Dùng mock `ProductBatch[]` cứng, submit alert + xoá local |
| `InventoryQA.tsx` | Dùng mock `InventoryItem[]`, handleDecision chỉ cập nhật local state |
| `Traceability.tsx` | Dùng mock `Batch[]` và `SupplierReport[]` cứng |

**Mục tiêu:** Thay toàn bộ mock data bằng API calls thực đến `http://localhost:3000`.

---

## Step 1 — Tạo Type Definitions

**File cần tạo:** `src/app/types/qc.types.ts`

**Nội dung cần định nghĩa:**

### 1.1 QCTest (từ API response)

```ts
export interface QCTest {
  test_id: string;
  lot_id: string;
  test_type: 'Identity' | 'Potency' | 'Microbial' | 'Growth Promotion' | 'Physical' | 'Chemical';
  test_method: string;
  test_date: string;           // ISO 8601
  test_result: string;
  acceptance_criteria?: string;
  result_status: 'Pass' | 'Fail' | 'Pending';
  performed_by: string;
  verified_by?: string;
  reject_reason?: string;
  label_id?: string;
  created_date: string;
  modified_date: string;
}
```

### 1.2 InventoryLot (dùng cho PendingBatch, InventoryQA)

```ts
export interface InventoryLot {
  lot_id: string;
  product_name: string;
  supplier_name: string;
  quantity: number;
  unit?: string;
  location?: string;
  expiration_date?: string;
  status: 'Quarantine' | 'Accepted' | 'Rejected' | 'Depleted' | 'Hold';
  created_date?: string;
  modified_date?: string;
}
```

### 1.3 DashboardKPI

```ts
export interface DashboardKPI {
  pending_count: number;
  approved_count: number;
  rejected_count: number;
  error_rate: number;
}
```

### 1.4 SupplierPerformance

```ts
export interface SupplierPerformance {
  supplier_name: string;
  total_batches: number;
  approved: number;
  rejected: number;
  quality_rate: number;
}
```

### 1.5 DTOs để POST/PATCH

```ts
export interface CreateQCTestDto {
  lot_id: string;
  test_type: QCTest['test_type'];
  test_method: string;
  test_date: string;
  test_result: string;
  acceptance_criteria?: string;
  result_status: QCTest['result_status'];
  performed_by: string;
  verified_by?: string;
  reject_reason?: string;
  label_id?: string;
}

export interface LotDecisionDto {
  decision: 'Accepted' | 'Rejected' | 'Hold';
  verified_by: string;
  reject_reason?: string;  // bắt buộc khi decision = 'Rejected'
  label_id?: string;
}

export interface RetestDto {
  action: 'extend' | 'discard';
  performed_by: string;
  new_expiry_date?: string;  // bắt buộc khi action = 'extend'
}
```

**Validation sau step này:**
- File `src/app/types/qc.types.ts` tồn tại và export đầy đủ 7 interface/type trên
- Không có lỗi TypeScript

---

## Step 2 — Tạo API Service Layer

**File cần tạo:** `src/app/services/qcApi.ts`

**Base URL:** `const BASE_URL = 'http://localhost:3000'`

**Yêu cầu:** Mỗi function phải:
1. Dùng `fetch` (hoặc `axios` nếu dự án đã cài)
2. Throw error khi response không OK (kiểm tra `res.ok`)
3. Return typed response khớp với types ở Step 1

### 2.1 Danh sách functions cần tạo

| Function | Method | Endpoint | Tham số |
|---|---|---|---|
| `getDashboardKPI()` | GET | `/qc-tests/dashboard` | — |
| `getInventoryLots(status?)` | GET | `/inventory-lots?status=...` | `status?: string` |
| `getQCTestsByLot(lot_id)` | GET | `/qc-tests/lot/:lot_id` | `lot_id: string` |
| `getAllQCTests(filters?)` | GET | `/qc-tests?result_status=...&test_type=...` | `filters?: { result_status?: string; test_type?: string }` |
| `createQCTest(dto)` | POST | `/qc-tests` | `dto: CreateQCTestDto` |
| `updateQCTest(test_id, dto)` | PATCH | `/qc-tests/:test_id` | `test_id, dto: Partial<CreateQCTestDto>` |
| `deleteQCTest(test_id)` | DELETE | `/qc-tests/:test_id` | `test_id: string` |
| `submitLotDecision(lot_id, dto)` | POST | `/qc-tests/lot/:lot_id/decision` | `lot_id, dto: LotDecisionDto` |
| `submitRetest(lot_id, dto)` | POST | `/qc-tests/lot/:lot_id/retest` | `lot_id, dto: RetestDto` |
| `bulkQuarantine(lot_ids)` | POST | `/inventory-lots/bulk-quarantine` | `lot_ids: string[]` |
| `getSupplierPerformance(from?, to?)` | GET | `/qc-tests/supplier-performance` | `from?, to?: string` |

### 2.2 Template mẫu cho mỗi function

```ts
export async function getDashboardKPI(): Promise<DashboardKPI> {
  const res = await fetch(`${BASE_URL}/qc-tests/dashboard`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
```

### 2.3 Xử lý lỗi tập trung

Tạo helper function `handleApiError(res: Response)`:
- Nếu `res.ok === false`: parse body JSON → throw `new Error(body.message)`
- Dùng ở mọi function trong service

**Validation sau step này:**
- File `src/app/services/qcApi.ts` export đầy đủ 11 functions
- Import types từ `../types/qc.types`
- Không có lỗi TypeScript

---

## Step 3 — Cập nhật Dashboard.tsx

**File:** `src/app/pages/QualityControl/Dashboard.tsx`

### Hiện tại:
- `stats` là array tĩnh hard-code với value "12", "145", "08", "1.2%"
- `pendingBatches` là array tĩnh 3 phần tử

### Cần làm:

#### 3.1 Thêm state và useEffect

```ts
import { useState, useEffect } from "react";
import { getDashboardKPI, getInventoryLots } from "@/app/services/qcApi";
import type { DashboardKPI, InventoryLot } from "@/app/types/qc.types";

// Thêm states:
const [kpi, setKpi] = useState<DashboardKPI | null>(null);
const [pendingLots, setPendingLots] = useState<InventoryLot[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

#### 3.2 Fetch data trong useEffect

```ts
useEffect(() => {
  async function fetchData() {
    try {
      setLoading(true);
      const [kpiData, lotsData] = await Promise.all([
        getDashboardKPI(),
        getInventoryLots('Quarantine'),
      ]);
      setKpi(kpiData);
      setPendingLots(lotsData.slice(0, 3)); // chỉ lấy 3 lô mới nhất
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }
  fetchData();
}, []);
```

#### 3.3 Map KPI data vào `stats` array

Thay thế `stats` tĩnh bằng computed array từ `kpi`:

| Thẻ | Mapping |
|---|---|
| "Chờ lấy mẫu" | `kpi.pending_count` |
| "Đạt chuẩn (Approved)" | `kpi.approved_count` |
| "Từ chối (Rejected)" | `kpi.rejected_count` |
| "Tỷ lệ lỗi trung bình" | `kpi.error_rate.toFixed(1) + '%'` |

#### 3.4 Map `pendingLots` vào bảng lô hàng chờ kiểm định

Thay các field hard-code:
- `batch.id` → `lot.lot_id`
- `batch.name` → `lot.product_name`
- `batch.supplier` → `lot.supplier_name`
- `batch.quantity` → `lot.quantity`
- `batch.priority` → tính theo logic: nếu `lot.expiration_date` gần (< 7 ngày) → "High", còn lại → "Normal"

#### 3.5 Hiển thị Loading và Error states

- Khi `loading`: hiển thị skeleton cards (4 cards với `animate-pulse bg-gray-200`)
- Khi `error`: hiển thị alert đỏ với message lỗi
- Khi `kpi === null` sau loading: render giá trị `—`

#### 3.6 Nút "LẤY MẪU NGAY" và "Xem tất cả yêu cầu"

- Nút "LẤY MẪU NGAY" → dùng `useNavigate()` hoặc `<Link>` điều hướng đến `/quality-control/pending`
- Nút "VÀO MÀN HÌNH TRUY VẾT" → điều hướng đến `/quality-control/traceability`
- Nút "Xem tất cả yêu cầu" → điều hướng đến `/quality-control/pending`

**Validation sau step này:**
- Dashboard hiển thị KPI từ API (không phải mock)
- Bảng lô hàng chờ lấy dữ liệu thực từ `/inventory-lots?status=Quarantine`
- Loading spinner xuất hiện khi đang fetch
- Khi API lỗi → hiển thị error message

---

## Step 4 — Cập nhật PendingBatch.tsx

**File:** `src/app/pages/QualityControl/PendingBatch.tsx`

### Hiện tại:
- `batches` là mock `Batch[]` với specs hard-code
- `handleFinalSubmit()` chỉ cập nhật local state
- Không có API call

### Interface cần thay đổi:

Xoá interface `Batch` cũ, thay bằng `InventoryLot` từ `qc.types.ts`. Giữ lại logic specs nhưng lấy từ API response của lot (field `acceptance_criteria` trong QCTest).

### Cần làm:

#### 4.1 Load danh sách lô từ API

```ts
// Thêm states:
const [lots, setLots] = useState<InventoryLot[]>([]);
const [loading, setLoading] = useState(true);

// useEffect:
useEffect(() => {
  getInventoryLots(filterStatus === 'all' ? undefined : mapStatusFilter(filterStatus))
    .then(setLots)
    .catch(console.error)
    .finally(() => setLoading(false));
}, [filterStatus]);
```

**Map giá trị dropdown status → query param API:**

| UI value | API query param |
|---|---|
| `"pending"` | `"Quarantine"` |
| `"approved"` | `"Accepted"` |
| `"rejected"` | `"Rejected"` |
| `"hold"` | `"Hold"` |
| `"all"` | `undefined` (không filter) |

#### 4.2 Map `InventoryLot` vào bảng

- `lot.lot_id` → cột "Mã lô"
- `lot.product_name` → cột "Tên nguyên liệu"
- `lot.supplier_name` → cột "Nhà cung cấp"
- `lot.status` → badge (map: `Quarantine → pending`, `Accepted → approved`, `Rejected → rejected`, `Hold → hold`)
- Nút "Tiến hành kiểm định" chỉ hiển thị nếu `lot.status === 'Quarantine'`

#### 4.3 Modal — Specs

Vì `InventoryLot` không có field `specs.moisture` / `specs.purity`, cần xử lý:
- **Option A (đơn giản):** Lấy `acceptance_criteria` từ QCTest gần nhất của lô (`GET /qc-tests/lot/:lot_id`), parse text để lấy ngưỡng. Nếu không có → hiển thị textarea "Tiêu chuẩn kỹ thuật" để QC tự nhập.
- **Option B (mặc định):** Dùng hard-code specs mặc định theo `test_type`. Ví dụ Physical: moisture ≤ 5%, purity ≥ 99%.

**Áp dụng Option B** (đơn giản hơn, phù hợp scope), thêm constant:

```ts
const DEFAULT_SPECS: Record<string, { moisture: number; purity: number }> = {
  default: { moisture: 5.0, purity: 98.0 },
};
```

#### 4.4 `handleFinalSubmit()` — Thay bằng API call 2 bước

**Bước 1:** `POST /qc-tests` để tạo kết quả kiểm nghiệm:

```ts
const testDto: CreateQCTestDto = {
  lot_id: selectedLot.lot_id,
  test_type: 'Physical',                    // mặc định, hoặc để QC chọn
  test_method: 'USP Standard',             // mặc định
  test_date: new Date().toISOString().split('T')[0],
  test_result: `Độ ẩm: ${testResults.moisture}%, Tinh khiết: ${testResults.purity}%, Cảm quan: ${testResults.sensory}`,
  acceptance_criteria: `Độ ẩm ≤ ${specs.moisture}%, Tinh khiết ≥ ${specs.purity}%`,
  result_status: isAutoPass ? 'Pass' : 'Fail',
  performed_by: currentUser,               // lấy từ AuthContext
  reject_reason: decision === 'rejected' ? rejectReason : undefined,
  label_id: label || undefined,
};
await createQCTest(testDto);
```

**Bước 2:** `POST /qc-tests/lot/:lot_id/decision` để cập nhật trạng thái lô:

```ts
const decisionDto: LotDecisionDto = {
  decision: mapDecision(decision),          // 'approved' → 'Accepted', v.v.
  verified_by: currentUser,
  reject_reason: decision === 'rejected' ? rejectReason : undefined,
  label_id: label || undefined,
};
await submitLotDecision(selectedLot.lot_id, decisionDto);
```

**Map decision values:**

| UI value | API value |
|---|---|
| `"approved"` | `"Accepted"` |
| `"rejected"` | `"Rejected"` |
| `"hold"` | `"Hold"` |

**Sau khi submit thành công:**
- Đóng modal
- Gọi lại API để refresh danh sách (`getInventoryLots(...)`)
- Hiển thị toast/alert success thay vì `alert()` (dùng `sonner` — đã có trong `/ui/sonner.tsx`)

#### 4.5 Xử lý loading state trong modal

- Nút "XÁC NHẬN & CẬP NHẬT HỆ THỐNG" phải có `disabled` và spinner khi đang submit
- Nếu API lỗi: hiển thị error message trong modal (không đóng modal)

#### 4.6 Lấy `currentUser` từ AuthContext

```ts
import { useAuth } from "@/app/context/AuthContext";
const { user } = useAuth();
const currentUser = user?.username ?? 'qc_user';
```

**Validation sau step này:**
- Danh sách lô load từ `GET /inventory-lots?status=Quarantine`
- Filter status thay đổi → gọi lại API với params khác
- Submit modal → gọi đúng 2 API endpoint theo thứ tự
- Sau submit thành công → danh sách refresh, toast success hiện lên
- Khi submit fail → toast error, modal không đóng

---

## Step 5 — Cập nhật Products.tsx

**File:** `src/app/pages/QualityControl/Products.tsx`

### Bối cảnh:
- `Products.tsx` dùng để kiểm định "lô thành phẩm" (ProductionBatch) — hàng sản xuất nội bộ, đối lập với `PendingBatch` là hàng nhập từ NCC.
- API doc không có endpoint riêng cho ProductionBatch. Theo `be_coding_step.md` Step 8, ProductionBatch sẽ được tự động tạo thành `InventoryLot` với một `source` flag phân biệt.
- **Tạm thời:** Vẫn dùng mock data cho `ProductBatch[]`, nhưng thay `handleFinalSubmit()` để gọi API thực.

### Cần làm:

#### 5.1 Giữ nguyên mock data `batches`

Giữ nguyên `useState<ProductBatch[]>([...])` với mock data hiện tại. Chưa kết nối `GET` endpoint (sẽ bổ sung khi backend có endpoint riêng).

#### 5.2 Thêm `test_type` và `test_method` vào form

Hiện tại modal chỉ có `appearance`, `purity`, `microbial`. Cần bổ sung:
- Dropdown chọn `test_type`: `Identity | Potency | Microbial | Growth Promotion | Physical | Chemical`
- Input `test_method`: text input, placeholder "VD: USP <61>, BP 2022..."

#### 5.3 Cập nhật `handleFinalSubmit()` — gọi 2 API bước

**Bước 1:** `POST /qc-tests` với:

```ts
{
  lot_id: selectedBatch.batch_number,   // dùng batch_number làm lot_id tạm
  test_type: selectedTestType,
  test_method: selectedTestMethod,
  test_date: new Date().toISOString().split('T')[0],
  test_result: `Ngoại quan: ${testResults.appearance}, Tinh khiết: ${testResults.purity}%, Vi sinh: ${testResults.microbial}`,
  result_status: decision === 'approved' ? 'Pass' : decision === 'rejected' ? 'Fail' : 'Pending',
  performed_by: currentUser,
  label_id: productLabel || undefined,
}
```

**Bước 2:** `POST /qc-tests/lot/:lot_id/decision`

#### 5.4 Sau submit thành công

- Xoá batch khỏi danh sách (giữ nguyên logic hiện tại: `setBatches(batches.filter(...))`)
- Thay `alert()` bằng toast từ `sonner`

**Validation sau step này:**
- Submit modal gọi `POST /qc-tests` → `POST /qc-tests/lot/:batch_number/decision`
- Toast hiển thị thay vì native alert
- Form có thêm dropdown `test_type` và input `test_method`

---

## Step 6 — Cập nhật InventoryQA.tsx

**File:** `src/app/pages/QualityControl/InventoryQA.tsx`

### Hiện tại:
- `items` là mock `InventoryItem[]`
- Tab Alert: chỉ lọc local state
- Tab Quarantine: `handleBulkQuarantine()` chỉ cập nhật local

### Cần làm:

#### 6.1 Thay interface `InventoryItem` bằng `InventoryLot`

Import `InventoryLot` từ `qc.types.ts`. Cập nhật tất cả tham chiếu:

| Cũ | Mới |
|---|---|
| `item.id` | `lot.lot_id` |
| `item.name` | `lot.product_name` |
| `item.batchNo` | `lot.lot_id` |
| `item.location` | `lot.location` |
| `item.expiryDate` | `lot.expiration_date` |
| `item.status` | `lot.status` (Quarantine/Accepted/...) |

#### 6.2 Load dữ liệu từ API khi component mount

```ts
const [lots, setLots] = useState<InventoryLot[]>([]);
const [loading, setLoading] = useState(true);

const loadLots = async () => {
  setLoading(true);
  try {
    const data = await getInventoryLots();  // lấy tất cả
    setLots(data);
  } catch (err) {
    toast.error('Không thể tải dữ liệu');
  } finally {
    setLoading(false);
  }
};

useEffect(() => { loadLots(); }, []);
```

#### 6.3 Tab Alert — Logic filter near-expiry và retest

Vì API không có field riêng cho `near-expiry` / `retest`, filter từ `expiration_date`:

```ts
const alertLots = lots.filter(lot => {
  if (!lot.expiration_date) return false;
  const daysUntilExpiry = Math.ceil(
    (new Date(lot.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
});
```

- Hiển thị badge "Near Expiry" nếu ≤ 7 ngày
- Hiển thị badge "Retest Due" nếu 8–30 ngày

#### 6.4 Re-test Modal — Kết nối API `submitRetest()`

Thay `handleDecision()` hiện tại:

```ts
const handleDecision = async (decision: 'extend' | 'discard') => {
  if (!retestItem) return;

  // Nếu extend, cần hỏi thêm new_expiry_date
  // Thêm state: const [newExpiryDate, setNewExpiryDate] = useState('');
  if (decision === 'extend' && !newExpiryDate) {
    return toast.error('Vui lòng nhập ngày hạn sử dụng mới');
  }

  try {
    setSubmitting(true);
    await submitRetest(retestItem.lot_id, {
      action: decision,
      performed_by: currentUser,
      new_expiry_date: decision === 'extend' ? newExpiryDate : undefined,
    });
    toast.success(decision === 'extend' ? 'Đã gia hạn thành công' : 'Đã hủy lô hàng');
    setRetestItem(null);
    loadLots();  // refresh
  } catch (err) {
    toast.error(err instanceof Error ? err.message : 'Lỗi xử lý');
  } finally {
    setSubmitting(false);
  }
};
```

**Cập nhật Re-test Modal UI:**
- Khi user chọn "GIA HẠN (Extend)": **trước khi gọi API**, hiển thị thêm date input "Ngày hạn sử dụng mới (new_expiry_date)"
- Nút confirm chỉ enable khi đã nhập date

#### 6.5 Tab Quarantine — Kết nối API `bulkQuarantine()`

```ts
const handleBulkQuarantine = async () => {
  if (selectedItems.length === 0) {
    return toast.error('Vui lòng chọn các lô hàng cần cách ly');
  }
  try {
    setSubmitting(true);
    const result = await bulkQuarantine(selectedItems);
    toast.success(`Đã cách ly ${result.updated} lô hàng thành công`);
    setSelectedItems([]);
    loadLots();  // refresh
  } catch (err) {
    toast.error('Không thể thực hiện cách ly');
  } finally {
    setSubmitting(false);
  }
};
```

**Validation sau step này:**
- Tab Alert load real data, filter đúng theo `expiration_date`
- Re-test modal có date picker cho "extend", gọi đúng API
- Quarantine bulk action gọi `POST /inventory-lots/bulk-quarantine`
- Mọi action thành công → danh sách refresh + toast

---

## Step 7 — Cập nhật Traceability.tsx

**File:** `src/app/pages/QualityControl/Traceability.tsx`

### Hiện tại:
- Tab History: mock `Batch[]` với `timeline` hard-code
- Tab Supplier: mock `SupplierReport[]` với date range static

### Cần làm:

#### 7.1 Tab History — Truy vết lô hàng

**Luồng:** Người dùng nhập lot_id vào ô tìm kiếm → gọi `GET /qc-tests/lot/:lot_id` → hiển thị timeline từ kết quả.

```ts
const [qcHistory, setQcHistory] = useState<QCTest[]>([]);
const [searching, setSearching] = useState(false);
const [selectedLotId, setSelectedLotId] = useState<string | null>(null);

const handleSearch = async (lotId: string) => {
  if (!lotId.trim()) return;
  try {
    setSearching(true);
    const tests = await getQCTestsByLot(lotId);
    setQcHistory(tests);
    setSelectedLotId(lotId);
  } catch (err) {
    toast.error('Không tìm thấy lô hàng hoặc không có lịch sử QC');
    setQcHistory([]);
  } finally {
    setSearching(false);
  }
};
```

**Map `QCTest[]` thành timeline:**

Thay `TimelineStep[]` hard-code bằng computed từ `QCTest[]`:

```ts
const timelineFromTests = (tests: QCTest[]) =>
  tests.map(t => ({
    date: t.test_date,
    event: `${t.test_type} — ${t.test_result} (${t.result_status})`,
    user: t.performed_by,
    status: t.result_status === 'Pending' ? 'pending' : 'complete',
  }));
```

**UI thay đổi:**
- Bỏ grid cards từ `mockBatches`
- Ô tìm kiếm trở thành trung tâm: nhập lot_id → Enter hoặc nút Tìm → hiển thị timeline ngay bên dưới
- Hiển thị thông tin lô (nếu API trả về): `lot_id`, `performed_by`, `verified_by`, v.v.
- Badge màu cho từng step: Pass → xanh, Fail → đỏ, Pending → vàng
- Nút "Xuất COA (PDF)" → dùng `window.print()` hoặc package `jspdf` (nếu đã có)

#### 7.2 Tab Supplier — Kết nối API với date range

```ts
const [suppliers, setSuppliers] = useState<SupplierPerformance[]>([]);
const [dateFrom, setDateFrom] = useState('');
const [dateTo, setDateTo] = useState('');
const [loadingSuppliers, setLoadingSuppliers] = useState(false);

const loadSuppliers = async () => {
  try {
    setLoadingSuppliers(true);
    const data = await getSupplierPerformance(
      dateFrom || undefined,
      dateTo || undefined,
    );
    setSuppliers(data);
  } catch (err) {
    toast.error('Không thể tải báo cáo nhà cung cấp');
  } finally {
    setLoadingSuppliers(false);
  }
};

useEffect(() => { loadSuppliers(); }, []);
```

**Cập nhật date range filter UI:**
- Thay `<select>` tĩnh ("Tháng 1/2026", "Quý 4/2025"...) bằng 2 `<input type="date">` (`dateFrom`, `dateTo`)
- Thêm nút **"Áp dụng"** → gọi `loadSuppliers()`

**Map `SupplierPerformance[]` vào bảng:**

| UI field | API field |
|---|---|
| Nhà cung cấp | `supplier_name` |
| Tổng Batch | `total_batches` |
| Approved | `approved` |
| Rejected | `rejected` |
| Chỉ số chất lượng | `quality_rate` (progress bar) |

**KPI cards tổng hợp (3 cards trên cùng):**

```ts
// Tính toán từ suppliers array:
const bestSupplier = [...suppliers].sort((a, b) => b.quality_rate - a.quality_rate)[0];
const worstSupplier = [...suppliers].sort((a, b) => a.quality_rate - b.quality_rate)[0];
const totalBatches = suppliers.reduce((sum, s) => sum + s.total_batches, 0);
```

**"Chi tiết lỗi" button:**
- Khi click → gọi `GET /qc-tests?result_status=Fail` filtered by supplier (nếu API hỗ trợ)
- Hiện tại: dùng mock `mockRejectedDetails` nhưng mở bằng modal thực sự (thay vì `alert`)

**Nút "Xuất báo cáo":** `window.print()` hoặc tạo CSV download từ `suppliers` array.

**Validation sau step này:**
- Tab History: search theo lot_id → hiển thị đúng timeline từ API
- Tab Supplier: load từ API, date range filter hoạt động
- KPI cards tính tự động từ dữ liệu thực
- Không còn mock data cứng trong component

---

## Step 8 — Smoke Test Toàn Bộ Flow

**Mục tiêu:** Kiểm tra end-to-end flow QC từ nhận lô → kiểm định → quyết định → truy vết.

### Checklist kiểm tra thủ công:

#### Flow 1: Kiểm định lô đầu vào (Accepted)
1. Đăng nhập với role QC (username: `2`, password: `2`)
2. Vào Dashboard → xác nhận 4 KPI cards load đúng giá trị từ API
3. Vào PendingBatch → xác nhận bảng hiển thị các lô `Quarantine` từ API
4. Nhấn "Tiến hành kiểm định" một lô → nhập kết quả → chọn APPROVE → chọn nhãn → submit
5. Xác nhận toast success xuất hiện
6. Xác nhận list refresh → lô đã chuyển sang `Accepted`
7. Vào Traceability → search `lot_id` vừa approve → xác nhận timeline hiển thị test record

#### Flow 2: Kiểm định lô đầu vào (Rejected)
1. Nhấn "Tiến hành kiểm định" một lô khác → nhập kết quả vượt ngưỡng
2. Xác nhận banner cảnh báo đỏ xuất hiện
3. Chọn REJECT → nhập lý do từ chối → submit
4. Xác nhận lô chuyển sang `Rejected`

#### Flow 3: Re-test Inventory
1. Vào InventoryQA → Tab "Cảnh báo chất lượng"
2. Xác nhận list lọc đúng các lô gần hết hạn (≤ 30 ngày)
3. Click "Thực hiện Re-test" → chọn "GIA HẠN" → nhập ngày mới → xác nhận
4. Xác nhận lô cập nhật `expiration_date` và `status = Accepted`

#### Flow 4: Bulk Quarantine
1. Vào InventoryQA → Tab "Cách ly hàng hóa"
2. Check nhiều lô → click "Cách ly hàng loạt"
3. Xác nhận API trả về `{ updated: N }` và lô chuyển sang `Quarantine`

#### Flow 5: Supplier Performance
1. Vào Traceability → Tab "Hiệu suất Nhà CC"
2. Chọn khoảng thời gian → click "Áp dụng"
3. Xác nhận bảng load lại đúng dữ liệu từ API

### Kiểm tra lỗi:
- Tắt backend server → xác nhận tất cả trang hiển thị error message (không crash app)
- Submit form thiếu field bắt buộc → xác nhận validation hoạt động trước khi gọi API

---

## Các lưu ý quan trọng cho Agent

### Về Authentication
- Lấy `currentUser` (username) từ `AuthContext` để điền `performed_by` và `verified_by`
- Xem `src/app/context/AuthContext.tsx` trước khi implement

### Về Toast Notifications
- Dự án đã có `src/app/components/ui/sonner.tsx`
- Import: `import { toast } from "sonner"`
- Dùng `toast.success()`, `toast.error()` thay cho `alert()` ở mọi nơi

### Về Loading States
- Nút submit phải `disabled` khi đang gọi API (tránh double submit)
- Thêm `isSubmitting` state cho mọi form có submit

### Về Error Handling
- Mọi API call phải có `try/catch`
- Lỗi 404: hiển thị "Không tìm thấy dữ liệu"
- Lỗi 400: hiển thị message từ API response
- Lỗi network: hiển thị "Lỗi kết nối server"

### Về Styling
- Giữ nguyên **toàn bộ** class Tailwind hiện có — không được xóa hay thay đổi style
- Chỉ thêm class mới khi cần (skeleton loading, error states)
- Font, màu sắc, bo góc, shadow giữ nguyên như thiết kế mẫu

### Thứ tự ưu tiên API Mapping (PendingBatch vs Products)
- `PendingBatch.tsx` → `InventoryLot` với `status = Quarantine` (hàng nhập từ NCC)
- `Products.tsx` → `ProductionBatch` (hiện chưa có API riêng) → **giữ mock data**, chỉ kết nối submit
