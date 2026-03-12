# QC Test API Documentation

**Base URL:** `http://localhost:3000`  
**Content-Type:** `application/json`

---

## Mục lục

1. [Data Models](#1-data-models)
2. [QC Test — CRUD](#2-qc-test--crud)
3. [QC Workflow — Quyết định & Re-test](#3-qc-workflow--quyết-định--re-test)
4. [Dashboard & Reporting](#4-dashboard--reporting)
5. [InventoryLot — Hỗ trợ QC](#5-inventorylot--hỗ-trợ-qc)
6. [Error Handling](#6-error-handling)

---

## 1. Data Models

### QCTest Object

```ts
{
  test_id: string            // UUID v4, sinh tự động
  lot_id: string             // FK → InventoryLot.lot_id
  test_type: string          // 'Identity' | 'Potency' | 'Microbial' | 'Growth Promotion' | 'Physical' | 'Chemical'
  test_method: string        // Tên phương pháp / SOP (vd: "USP <905>")
  test_date: string          // ISO 8601 Date
  test_result: string        // Giá trị kết quả đo được
  acceptance_criteria?: string  // Tiêu chuẩn chấp nhận (optional)
  result_status: string      // 'Pass' | 'Fail' | 'Pending'
  performed_by: string       // Username người thực hiện
  verified_by?: string       // Username người xác nhận (optional)
  reject_reason?: string     // Lý do từ chối (bắt buộc nếu Rejected)
  label_id?: string          // ID nhãn được gán
  created_date: string       // ISO 8601 DateTime (tự động)
  modified_date: string      // ISO 8601 DateTime (tự động)
}
```

### DashboardKPI Object

```ts
{
  pending_count: number    // Số lô đang chờ QC (status = Quarantine)
  approved_count: number   // Số test Pass trong tháng hiện tại
  rejected_count: number   // Số test Fail trong tháng hiện tại
  error_rate: number       // Tỷ lệ lỗi (%) = rejected / (approved + rejected) * 100
}
```

### SupplierPerformance Object

```ts
{
  supplier_name: string   // Tên nhà cung cấp / nhà sản xuất
  total_batches: number   // Tổng số lô đã test
  approved: number        // Số lô Pass
  rejected: number        // Số lô Fail
  quality_rate: number    // Tỷ lệ đạt (%) = approved / (approved + rejected) * 100
}
```

---

## 2. QC Test — CRUD

### `GET /qc-tests`

Lấy danh sách tất cả QC Test, có thể lọc.

**Query Parameters:**

| Tham số | Kiểu | Mô tả |
|---|---|---|
| `result_status` | string (optional) | Lọc theo `Pass` / `Fail` / `Pending` |
| `test_type` | string (optional) | Lọc theo loại test |

**Response `200`:**
```json
[
  {
    "test_id": "550e8400-e29b-41d4-a716-446655440000",
    "lot_id": "LOT-001",
    "test_type": "Physical",
    "test_method": "USP <905>",
    "test_date": "2026-03-08T00:00:00.000Z",
    "test_result": "Độ ẩm: 4.2%",
    "acceptance_criteria": "≤ 5.0%",
    "result_status": "Pending",
    "performed_by": "qc_user_01",
    "verified_by": null,
    "reject_reason": null,
    "label_id": null,
    "created_date": "2026-03-08T07:30:00.000Z",
    "modified_date": "2026-03-08T07:30:00.000Z"
  }
]
```

---

### `GET /qc-tests/:test_id`

Lấy chi tiết một QC Test theo `test_id`.

**Path Parameter:** `test_id` — UUID của test

**Response `200`:** QCTest object (xem trên)

**Response `404`:**
```json
{ "statusCode": 404, "message": "QCTest '<test_id>' not found" }
```

---

### `GET /qc-tests/lot/:lot_id`

Lấy toàn bộ lịch sử QC Test của một lô hàng (Traceability).

**Path Parameter:** `lot_id` — ID của InventoryLot

**Response `200`:** `QCTest[]` — mảng test, sort theo `test_date` mới nhất

**Response `404`:** Nếu `lot_id` không tồn tại

---

### `POST /qc-tests`

Tạo QC Test mới.

**Request Body:**

| Field | Kiểu | Bắt buộc | Ràng buộc |
|---|---|---|---|
| `lot_id` | string | ✅ | maxlength: 36; lot phải tồn tại |
| `test_type` | string | ✅ | `'Identity'` \| `'Potency'` \| `'Microbial'` \| `'Growth Promotion'` \| `'Physical'` \| `'Chemical'` |
| `test_method` | string | ✅ | maxlength: 100 |
| `test_date` | string | ✅ | ISO 8601 (vd: `"2026-03-08"`) |
| `test_result` | string | ✅ | maxlength: 100 |
| `acceptance_criteria` | string | ❌ | maxlength: 200 |
| `result_status` | string | ✅ | `'Pass'` \| `'Fail'` \| `'Pending'` |
| `performed_by` | string | ✅ | maxlength: 50 |
| `verified_by` | string | ❌ | maxlength: 50 |
| `reject_reason` | string | ❌ | maxlength: 500 |
| `label_id` | string | ❌ | maxlength: 20 |

**Request Body Example:**
```json
{
  "lot_id": "LOT-001",
  "test_type": "Physical",
  "test_method": "USP <905>",
  "test_date": "2026-03-08",
  "test_result": "Độ ẩm: 4.2%, Tinh khiết: 99.1%",
  "acceptance_criteria": "Độ ẩm ≤ 5%, Tinh khiết ≥ 99%",
  "result_status": "Pending",
  "performed_by": "qc_user_01"
}
```

**Response `201`:** QCTest object đã tạo (với `test_id` được sinh tự động)

**Response `404`:** Nếu `lot_id` không tồn tại

---

### `PATCH /qc-tests/:test_id`

Cập nhật thông tin QC Test. Không cho phép thay đổi `lot_id`.

**Path Parameter:** `test_id`

**Request Body:** Bất kỳ field nào của `CreateQCTestDto` ngoại trừ `lot_id` (tất cả đều optional)

**Request Body Example:**
```json
{
  "test_result": "Độ ẩm: 4.1% (đã đo lại)",
  "acceptance_criteria": "≤ 5.0%"
}
```

**Response `200`:** QCTest object đã cập nhật

**Response `404`:** Nếu `test_id` không tồn tại

---

### `DELETE /qc-tests/:test_id`

Xóa một QC Test.

**Path Parameter:** `test_id`

**Response `200`:**
```json
{ "deleted": true }
```

**Response `404`:** Nếu `test_id` không tồn tại

---

## 3. QC Workflow — Quyết định & Re-test

### `POST /qc-tests/lot/:lot_id/decision`

Submit quyết định QC cuối cùng cho một lô hàng.

**Hành vi:**
- `"Accepted"` → tất cả test Pending của lô → `Pass`; lô → `Accepted`
- `"Rejected"` → tất cả test Pending của lô → `Fail`; lô → `Rejected`; `reject_reason` **bắt buộc**
- `"Hold"` → test giữ nguyên `Pending`; lô → `Hold`

**Path Parameter:** `lot_id`

**Request Body:**

| Field | Kiểu | Bắt buộc | Ràng buộc |
|---|---|---|---|
| `decision` | string | ✅ | `'Accepted'` \| `'Rejected'` \| `'Hold'` |
| `verified_by` | string | ✅ | maxlength: 50 |
| `reject_reason` | string | ⚠️ | Bắt buộc nếu `decision = 'Rejected'`; maxlength: 500 |
| `label_id` | string | ❌ | maxlength: 20 |

**Request Body Example — Accepted:**
```json
{
  "decision": "Accepted",
  "verified_by": "qc_manager_01",
  "label_id": "LBL-2026-001"
}
```

**Request Body Example — Rejected:**
```json
{
  "decision": "Rejected",
  "verified_by": "qc_manager_01",
  "reject_reason": "Vượt ngưỡng giới hạn vi sinh cho phép"
}
```

**Request Body Example — Hold:**
```json
{
  "decision": "Hold",
  "verified_by": "qc_manager_01"
}
```

**Response `200`:**
```json
{
  "lot": {
    "lot_id": "LOT-001",
    "status": "Accepted",
    ...
  },
  "tests": [
    {
      "test_id": "550e8400-...",
      "result_status": "Pass",
      "verified_by": "qc_manager_01",
      ...
    }
  ]
}
```

**Response `400`:**
```json
{
  "statusCode": 400,
  "message": "Lý do từ chối là bắt buộc khi quyết định là Rejected"
}
```

---

### `POST /qc-tests/lot/:lot_id/retest`

Quyết định Re-test: gia hạn hạn dùng hoặc tiêu hủy lô.

**Path Parameter:** `lot_id`

**Request Body:**

| Field | Kiểu | Bắt buộc | Ràng buộc |
|---|---|---|---|
| `action` | string | ✅ | `'extend'` \| `'discard'` |
| `performed_by` | string | ✅ | maxlength: 50 |
| `new_expiry_date` | string | ⚠️ | Bắt buộc nếu `action = 'extend'`; ISO 8601 |

**Request Body Example — Gia hạn:**
```json
{
  "action": "extend",
  "new_expiry_date": "2028-03-08",
  "performed_by": "qc_user_01"
}
```

**Hành vi `extend`:**
- Cập nhật `InventoryLot.expiration_date = new_expiry_date`
- Cập nhật `InventoryLot.status = 'Accepted'`
- Tạo QCTest mới: `test_type = 'Physical'`, `test_method = 'Re-test'`, `result_status = 'Pass'`

**Request Body Example — Tiêu hủy:**
```json
{
  "action": "discard",
  "performed_by": "qc_user_01"
}
```

**Hành vi `discard`:**
- Cập nhật `InventoryLot.status = 'Depleted'`
- Tạo QCTest mới: `test_method = 'Re-test - Discard'`, `result_status = 'Fail'`

**Response `200`:** InventoryLot object đã cập nhật

**Response `400`:** Nếu `action = 'extend'` mà thiếu `new_expiry_date`

---

## 4. Dashboard & Reporting

### `GET /qc-tests/dashboard`

Lấy KPI Dashboard QC tháng hiện tại.

**Response `200`:**
```json
{
  "pending_count": 5,
  "approved_count": 42,
  "rejected_count": 3,
  "error_rate": 6.67
}
```

| Field | Mô tả |
|---|---|
| `pending_count` | Số lô đang `Quarantine` (chờ QC) |
| `approved_count` | Số test `Pass` trong tháng hiện tại |
| `rejected_count` | Số test `Fail` trong tháng hiện tại |
| `error_rate` | `rejected / (approved + rejected) * 100`, làm tròn 2 chữ số thập phân |

---

### `GET /qc-tests/supplier-performance`

Báo cáo hiệu suất nhà cung cấp theo kết quả QC.

**Query Parameters:**

| Tham số | Kiểu | Mô tả |
|---|---|---|
| `from` | string (optional) | ISO 8601 date — ngày bắt đầu lọc |
| `to` | string (optional) | ISO 8601 date — ngày kết thúc lọc |

**URL Example:**
```
GET /qc-tests/supplier-performance?from=2026-01-01&to=2026-03-31
```

**Response `200`:**
```json
[
  {
    "supplier_name": "PharmaCo VN",
    "total_batches": 15,
    "approved": 13,
    "rejected": 2,
    "quality_rate": 86.67
  },
  {
    "supplier_name": "MediChem",
    "total_batches": 8,
    "approved": 8,
    "rejected": 0,
    "quality_rate": 100
  }
]
```

---

## 5. InventoryLot — Hỗ trợ QC

### `GET /inventory-lots`

Lấy danh sách lô hàng, tùy chọn lọc theo status.

**Query Parameters:**

| Tham số | Kiểu | Mô tả |
|---|---|---|
| `status` | string (optional) | `'Quarantine'` \| `'Accepted'` \| `'Rejected'` \| `'Depleted'` \| `'Hold'` |

**URL Example:**
```
GET /inventory-lots?status=Quarantine
```

---

### `POST /inventory-lots/bulk-quarantine`

Chuyển hàng loạt lô hàng sang trạng thái `Quarantine`.

**Request Body:**
```json
{
  "lot_ids": ["LOT-001", "LOT-002", "LOT-003"]
}
```

**Response `200`:**
```json
{ "updated": 3 }
```

---

## 6. Error Handling

Tất cả lỗi trả về theo chuẩn NestJS:

```json
{
  "statusCode": <number>,
  "message": "<string hoặc string[]>",
  "error": "<string>"
}
```

### Bảng mã lỗi

| HTTP Status | Trường hợp |
|---|---|
| `400 Bad Request` | Sai kiểu dữ liệu, thiếu field bắt buộc, `reject_reason` bị bỏ trống khi Rejected, thiếu `new_expiry_date` khi extend |
| `404 Not Found` | `test_id` / `lot_id` không tồn tại trong database |
| `201 Created` | Tạo QCTest thành công |
| `200 OK` | Mọi thao tác thành công khác |

### Ví dụ lỗi validation `400`:
```json
{
  "statusCode": 400,
  "message": [
    "test_type must be one of the following values: Identity, Potency, Microbial, Growth Promotion, Physical, Chemical",
    "result_status must be one of the following values: Pass, Fail, Pending"
  ],
  "error": "Bad Request"
}
```

---

## Ghi chú cho Frontend

- **`test_id`** không cần gửi khi `POST /qc-tests` — được sinh tự động bằng UUID v4.
- **`lot_id`** không thể thay đổi sau khi tạo test (`PATCH` sẽ bỏ qua field này).
- **Thứ tự workflow thông thường:**
  1. `POST /inventory-lots` → tạo lô với `status: "Quarantine"`
  2. `POST /qc-tests` → tạo test với `result_status: "Pending"`
  3. `POST /qc-tests/lot/:lot_id/decision` → submit quyết định
- **`error_rate`** trong dashboard là phần trăm (0–100), không phải tỉ số (0–1).
- **Date fields** (`test_date`, `new_expiry_date`) nhận chuỗi ISO 8601 (`"2026-03-08"` hoặc `"2026-03-08T00:00:00.000Z"`).
