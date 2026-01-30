# Workflow (Theo mô hình: Materials → InventoryLots → InventoryTransactions → QCTests / ProductionBatches / BatchComponents / LabelTemplates)

Mục tiêu: Mô tả các quy trình vận hành theo roles (Manager, Operator, Quality Control Technician, IT Administrator) và cách các hành động ánh xạ vào các thực thể dữ liệu chính: Materials, InventoryLots, InventoryTransactions, QCTests, ProductionBatches, BatchComponents, LabelTemplates/labels, Users, audit_logs.

---

## Tóm tắt thực thể chính
- Materials (vật tư / sản phẩm): định nghĩa material/product (id, code, name, unit, etc.).
- InventoryLots (lô tồn kho): mỗi material có thể có nhiều lots (id, lot_code, material_id, quantity, available_quantity, is_sample, manufacture_date, expiry_date, status).
- InventoryTransactions: các giao dịch liên quan tới một InventoryLot (id, inventory_lot_id, type: RECEIPT/USAGE/SPLIT/ADJUSTMENT/TRANSFER, quantity, location_id, reference_id, performed_by, created_at, status).
- QCTests: kết quả kiểm nghiệm trên InventoryLot (id, inventory_lot_id, test_type, test_results(JSON), status: Pending/Pass/Fail/Hold, verified_by, verified_at).
- ProductionBatches: lô sản xuất (id, batch_code, product_id (references Materials), planned_qty, produced_qty, status, started_at, finished_at).
- BatchComponents: thành phần của ProductionBatch liên kết tới InventoryLots (id, production_batch_id, inventory_lot_id, planned_quantity, actual_quantity).
- LabelTemplates: mẫu nhãn (id, template_code, label_type (Raw Material / Sample / API / Status / Finished Product / Intermediate), template_content, fields).
- Labels: nhãn sinh ra cho InventoryLots / ProductionBatches (id, template_id, inventory_lot_id, production_batch_id, rendered_content, barcode_value, created_by, created_at).
- Users: (id, username, role_id).
- Audit logs: (id, user_id, action, entity_type, entity_id, details, timestamp).

---

## Roles & Quyền tổng quan
- Manager: duyệt/confirm transactions quan trọng (adjustments, returns), phê duyệt production batch, review và quyết định QCTest nếu cần, truy vấn báo cáo, quản lý label templates.
- Operator: tạo Receipts (InventoryLot + InventoryTransaction), thực hiện InventoryTransactions (usage, transfer, split), tạo Labels, khởi tạo ProductionBatch consumptions (BatchComponents).
- Quality Control Technician (QC): tạo và thực hiện QCTests, verify test results, set lot status (Accepted/Rejected/Hold) theo policy.
- IT Administrator: quản lý LabelTemplates, hệ thống in nhãn, backups, quyền truy cập, audit logs.

Mỗi hành động quan trọng phải lưu performed_by / added_by / verified_by (user id hoặc username) và ghi audit_logs.

---

## Quy trình chi tiết theo luồng dữ liệu

### 1) Tạo Material
- Hành động: Người (Manager/Operator) tạo record `Materials` (material_code, name, unit, default_label_template_id, low_stock_threshold...).
- Ghi audit_logs: action = "create_material", entity_type = "Materials", entity_id = material_id, user = created_by.

---

### 2) Nhận nguyên liệu → Tạo InventoryLot → InventoryTransaction(Receipt) → Sinh Label
Mô tả: Khi nguyên liệu về kho, Operator tạo InventoryLot cho mỗi lô thực tế và tạo InventoryTransaction kiểu RECEIPT để phản ánh +quantity.

Step-by-step:
1. Operator tạo `InventoryLot`:
   - Tạo bản ghi `inventory_lots` với fields: lot_code (ví dụ: lot-uuid-001), material_id (ví dụ: MAT-001), quantity = 25.5 (kg), available_quantity = 25.5, is_sample = false (mặc định), manufacture_date, expiry_date, status = "Quarantine" (nếu yêu cầu QC).
   - fields performed_by/added_by lưu user id.
2. Tạo `InventoryTransaction` type = RECEIPT:
   - `inventory_transactions` record: inventory_lot_id = lot-uuid-001, type = "RECEIPT", quantity = +25.5, location_id, reference_id (purchase_order_id), performed_by = operator.
   - Khi transaction được ghi (và Confirm nếu cần), hệ thống cập nhật `inventory_lots.available_quantity += quantity`.
3. Sinh nhãn Raw Material:
   - Hệ thống lấy `LabelTemplate` với label_type = 'Raw Material' (ví dụ template_code = TPL-RM-01).
   - Render `template_content` với dữ liệu từ `inventory_lots` (material_name, lot_id, manufacturer_lot, expiration_date, storage_location, quantity, etc.).
   - Tạo `labels` record với rendered_content và barcode/qr_value.
   - In nhãn lên thùng/lô.
4. Nếu policy yêu cầu QC ngay khi nhận, tạo `QCTest` records cho lot:
   - `qc_tests` với inventory_lot_id = lot-uuid-001, test_type = Identity/Assay/Purity..., status = "Pending".
5. Ghi `audit_logs` cho tất cả hành động (create inventory_lot, receipt transaction, label generation, qctest creation).

---

### 3) QC trên InventoryLot (QCTests)
1. QC Technician thực hiện các test và lưu kết quả vào `qc_tests.test_results` (JSON) và set `qc_tests.status` = Pass/Fail/Hold, recorded `verified_by` & `verified_at`.
2. Nếu tất cả QCTests liên quan tới lot đều Pass → hệ thống cập nhật `inventory_lots.status = "Accepted"` và unlock sử dụng cho Production/Export.
3. Nếu bất kỳ test Fail → `inventory_lots.status = "Rejected"` → hệ thống có thể tự sinh `InventoryTransaction` type = RETURN/ADJUSTMENT để xử lý trả hàng hoặc huỷ. Đồng thời có thể sinh `Status` label (label_type = 'Status') ghi rõ trạng thái Rejected.
4. Nếu Hold → set `inventory_lots.status = "On Hold"` chờ Manager quyết định.
5. Ghi `audit_logs` cho verify actions.

---

### 4) Tạo mẫu (Sample) từ InventoryLot → Sample Label
- Nếu tạo sample (is_sample = true): tạo một `InventoryLot` mới nhỏ hơn (ví dụ sample-uuid-001) với parent_lot_id = lot-uuid-001.
- Ghi `InventoryTransaction` type = SPLIT on parent lot (-sample_qty).
- Sinh Label theo LabelTemplate type = 'Sample' chứa thông tin sample (parent lot, sample_date, sampled_by).
- Ghi audit_logs.

---

### 5) Sản xuất: ProductionBatch, BatchComponents và Usage Transactions
Mục tiêu: Liên kết nguyên liệu theo lot vào ProductionBatch thông qua BatchComponents và tạo InventoryTransactions để giảm tồn theo lot.

Step-by-step:
1. Production Planner tạo `ProductionBatch` (batch_code = batch-uuid-001, product_id = PROD-001 (tham chiếu Materials), planned_qty).
2. Planner hoặc Operator xác định BatchComponents: cho mỗi nguyên liệu dùng cho lô sản xuất, tạo `batch_components` record (production_batch_id = batch-uuid-001, inventory_lot_id = lot-uuid-001, planned_quantity = 2.0 (kg)).
3. Khi nguyên liệu được thực tế dùng trong sản xuất:
   - Tạo `InventoryTransaction` type = USAGE/CONSUMPTION: inventory_lot_id = lot-uuid-001, quantity = -2.0, reference_id = production_batch_id, performed_by = operator.
   - Cập nhật `batch_components.actual_quantity` = 2.0.
   - Sau confirm, cập nhật `inventory_lots.available_quantity -= 2.0`.
4. Khi ProductionBatch hoàn tất (status → Complete, produced_qty cập nhật), hệ thống tạo `InventoryLot`(s) cho finished/intermediate goods (ví dụ finished-lot-uuid-001) với liên kết `production_batch_id`.
5. Sinh nhãn Finished Product:
   - Chọn `LabelTemplate` label_type = 'Finished Product'.
   - Render template với batch data (batch_number, product_name, manufacture_date, expiry_date, batch_size, etc.) và tạo `labels` record.
6. Ghi `audit_logs` cho create batch, consume transactions, create finished lots, label generation.

---

### 6) Trạng thái thay đổi → Status Label
- Khi QCTest hoặc manager action thay đổi `inventory_lots.status`, hệ thống có thể tự động sinh một `Status` label (label_type = 'Status') cho InventoryLot để thể hiện Quarantine / Accepted / Rejected.

---

## Ví dụ Data Flow (bằng dữ liệu mẫu bạn cung cấp)
1. Material tạo: MAT-001 (Vitamin D3).
2. Nhận lot: InventoryLot `lot-uuid-001` cho MAT-001, quantity = 25.5 kg.
   - Tạo InventoryTransaction (RECEIPT) +25.5 kg liên kết `lot-uuid-001`.
   - Sinh Label Raw Material dùng LabelTemplate `TPL-RM-01` (label_type = 'Raw Material'). Template được populate các trường: material_name = "Vitamin D3", lot_id = "lot-uuid-001", manufacturer_lot, expiration_date, storage_location, quantity = 25.5 kg.
3. QC: tạo QCTests (Identity, Potency) cho lot-uuid-001. Khi tất cả pass → set lot-uuid-001.status = Accepted.
4. Sample: nếu tạo sample từ lot-uuid-001 (is_sample = true) → tạo sample lot, InventoryTransaction SPLIT, và phát sinh Sample label (label_type = 'Sample') chứa parent lot và sample_date.
5. Production: tạo ProductionBatch `batch-uuid-001` cho product `PROD-001`.
   - Tạo BatchComponent linking batch-uuid-001 ← lot-uuid-001 với planned_quantity = 2.0 kg.
   - Khi thực tế dùng 2.0 kg: tạo InventoryTransaction type = USAGE -2.0 kg cho lot-uuid-001, cập nhật batch_components.actual_quantity = 2.0.
6. Khi batch-uuid-001 chuyển sang status = Complete: tạo Finished Product label (label_type = 'Finished Product') dựa trên LabelTemplate tương ứng, populate các trường batch_number, product_name, manufacture_date, expiration_date, batch_size.
7. Nếu QC thay đổi lot status (e.g., Rejected) → tạo Status label (label_type = 'Status') phản ánh trạng thái mới trên nhãn.

---

## Ghi chú thiết kế & nguyên tắc thực thi
- Single source of truth: mọi thay đổi số lượng lot phải được thể hiện bằng `inventory_transactions` (không update trực tiếp quantity của inventory_lots mà không có transaction).
- Mỗi `InventoryTransaction` cần lưu performed_by/verified_by để audit.
- QCTests quyết định trạng thái lot (Accepted/Rejected/On Hold) và điều khiển khả năng sử dụng lot cho Production hoặc xuất.
- BatchComponents cho phép truy vết nguồn nguyên liệu (by lot) cho từng ProductionBatch.
- LabelTemplates tách rời dữ liệu và format: template_content có thể là templating string (ví dụ Mustache/Handlebars) sẽ được render với dữ liệu lot/batch.
- Labels lưu rendered_content & barcode_value để truy xuất lịch sử in nhãn.

---

## Truy vết (Traceability)
- Từ Finished Product (production_batch_id hoặc finished inventory_lot) → có thể truy vết ngược: ProductionBatch → BatchComponents → InventoryLots (source lots) → InventoryTransactions và QCTests.
- Từ một InventoryLot → có thể liệt kê tất cả InventoryTransactions (receipt, usage, split...), QCTests, Labels, và BatchComponents liên quan.

---

## Audit & Logging
- Mọi hành động (create/update/confirm/reject/print) cần ghi `audit_logs` với user_id, action, entity_type, entity_id, details, timestamp.
- Các trường performed_by / added_by / verified_by lưu user id (hoặc username theo config) để thuận tiện cho truy vết.

---

## Phụ lục: ví dụ bảng/field (gợi ý)
- materials (id, material_code, name, unit, default_label_template_id)
- inventory_lots (id, lot_code, material_id, quantity, available_quantity, is_sample, manufacture_date, expiry_date, status, parent_lot_id)
- inventory_transactions (id, inventory_lot_id, type, quantity, location_id, reference_id, performed_by, created_at, status)
- qc_tests (id, inventory_lot_id, test_type, test_results, status, verified_by, verified_at)
- production_batches (id, batch_code, product_id, planned_qty, produced_qty, status, started_at, finished_at)
- batch_components (id, production_batch_id, inventory_lot_id, planned_quantity, actual_quantity)
- label_templates (id, template_code, label_type, template_content, fields)
- labels (id, template_id, inventory_lot_id, production_batch_id, rendered_content, barcode_value, created_by, created_at)
- users (id, username, role_id)
- audit_logs (id, user_id, action, entity_type, entity_id, details, timestamp)

---

## Bảng bị thay đổi — Chi tiết trường đọc / ghi & ví dụ payload
Phần này mô tả rõ hơn: với mỗi hành động workflow, các bảng nào sẽ được đọc (read) và những bảng/trường nào sẽ được ghi/cập nhật (write/update). Kèm ví dụ JSON payload tối thiểu cho thao tác viết chính.

A. Receive / Create InventoryLot + Receipt Transaction
- Đọc:
  - `materials` (id, material_code, name, unit, default_label_template_id)
  - `label_templates` (id, template_code, label_type)
- Ghi/Update:
  - `inventory_lots` (INSERT): { lot_code, material_id, quantity, available_quantity, is_sample, manufacture_date, expiry_date, status, parent_lot_id, created_by }
  - `inventory_transactions` (INSERT): { inventory_lot_id, type='RECEIPT', quantity, location_id, reference_id (purchase_order_id), performed_by, created_at, status }
  - `labels` (optional INSERT): { template_id, inventory_lot_id, rendered_content, barcode_value, created_by }
  - `inventory_lots.available_quantity` (UPDATE) — applied when transaction is confirmed
- Ví dụ payload (create InventoryLot + Receipt):
{
  "lot_code": "lot-uuid-001",
  "material_id": "MAT-001",
  "quantity": 25.5,
  "unit": "kg",
  "manufacture_date": "2026-01-10",
  "expiry_date": "2028-01-10",
  "created_by": "operator1",
  "receipt_transaction": {
    "type": "RECEIPT",
    "quantity": 25.5,
    "location_id": "WH-01",
    "reference_id": "PO-12345",
    "performed_by": "operator1"
  }
}

B. Generate Label (Raw Material / Sample / Finished / Status)
- Đọc:
  - `label_templates` (template_content, fields)
  - `inventory_lots` or `production_batches` (fields needed by template)
- Ghi/Update:
  - `labels` (INSERT): { template_id, inventory_lot_id?, production_batch_id?, rendered_content, barcode_value, created_by, created_at }
- Ví dụ payload (generate label for lot):
{
  "template_id": "TPL-RM-01",
  "inventory_lot_id": "lot-uuid-001",
  "render_data": { "material_name": "Vitamin D3", "lot_code": "lot-uuid-001", "expiry_date": "2028-01-10", "quantity": "25.5 kg" },
  "created_by": "operator1"
}

C. Create QCTest / Verify QCTest Result
- Đọc:
  - `inventory_lots` (id, status)
  - `qc_tests` (existing for same lot)
- Ghi/Update:
  - `qc_tests` (INSERT): { inventory_lot_id, test_type, test_results(JSON), status='Pending', created_by }
  - `qc_tests` (UPDATE on verify): { status=('Pass'|'Fail'|'Hold'), test_results, verified_by, verified_at }
  - `inventory_lots.status` (UPDATE) — set 'Accepted'/'Rejected'/'On Hold' when applicable
  - optional `inventory_transactions` (INSERT): RETURN/ADJUSTMENT if rejected
  - optional `labels` (INSERT): Status label
- Ví dụ payload (submit QCTest result):
{
  "inventory_lot_id": "lot-uuid-001",
  "test_type": "Identity",
  "test_results": { "method": "HPLC", "result": "Match" },
  "status": "Pass",
  "verified_by": "qc_user_1",
  "verified_at": "2026-01-20T10:30:00Z"
}

D. Create Sample / Split from InventoryLot
- Đọc:
  - `inventory_lots` parent (id, available_quantity)
- Ghi/Update:
  - `inventory_lots` (INSERT new sample lot): { lot_code, material_id, quantity, is_sample=true, parent_lot_id, created_by }
  - `inventory_transactions` (INSERT on parent): { inventory_lot_id=parent, type='SPLIT', quantity = -sample_qty, performed_by }
  - `inventory_lots.available_quantity` (UPDATE parent) when transaction confirmed
  - `labels` (INSERT sample label)
- Ví dụ payload (create sample):
{
  "parent_lot_id": "lot-uuid-001",
  "quantity": 0.1,
  "is_sample": true,
  "created_by": "operator1"
}

E. Create ProductionBatch & BatchComponents (planning)
- Đọc:
  - `materials` (product details), `inventory_lots` (available lots)
- Ghi/Update:
  - `production_batches` (INSERT): { batch_code, product_id, planned_qty, status, created_by }
  - `batch_components` (INSERT per component): { production_batch_id, inventory_lot_id, planned_quantity }
- Ví dụ payload (create batch + components):
{
  "batch_code": "batch-uuid-001",
  "product_id": "PROD-001",
  "planned_qty": 1000,
  "components": [ { "inventory_lot_id": "lot-uuid-001", "planned_quantity": 2.0 } ],
  "created_by": "planner1"
}

F. Consume InventoryLot for Production (Usage transaction)
- Đọc:
  - `inventory_lots` (available_quantity), `batch_components`
- Ghi/Update:
  - `inventory_transactions` (INSERT): { inventory_lot_id, type='USAGE', quantity = -x, reference_id=production_batch_id, performed_by }
  - `batch_components.actual_quantity` (UPDATE)
  - `inventory_lots.available_quantity` (UPDATE after confirmation)
- Ví dụ payload (usage):
{
  "inventory_lot_id": "lot-uuid-001",
  "type": "USAGE",
  "quantity": -2.0,
  "reference_id": "batch-uuid-001",
  "performed_by": "operator1"
}

G. Complete ProductionBatch → Create Finished InventoryLot(s)
- Đọc:
  - `production_batches`, `batch_components`
- Ghi/Update:
  - `production_batches` (UPDATE): { status='Complete', produced_qty, finished_at }
  - `inventory_lots` (INSERT finished lot): { lot_code, production_batch_id, material_id=product_id, quantity=produced_qty, status='Available' }
  - `labels` (INSERT finished product label)
- Ví dụ payload (complete batch):
{
  "production_batch_id": "batch-uuid-001",
  "produced_qty": 1000,
  "finished_at": "2026-01-25T14:00:00Z",
  "completed_by": "supervisor1"
}

H. Inventory Adjustment / Return
- Đọc:
  - `inventory_lots`, `inventory_transactions`
- Ghi/Update:
  - `inventory_transactions` (INSERT): { inventory_lot_id, type='ADJUSTMENT'|'RETURN', quantity, reason, performed_by }
  - `inventory_lots.available_quantity` (UPDATE after approval)
- Ví dụ payload (adjustment):
{
  "inventory_lot_id": "lot-uuid-001",
  "type": "ADJUSTMENT",
  "quantity": -1.5,
  "reason": "count discrepancy",
  "performed_by": "operator1"
}

I. Status change triggered by QC or Manager decision
- Đọc:
  - `qc_tests`, `inventory_lots`
- Ghi/Update:
  - `inventory_lots` (UPDATE): { status = 'Accepted'|'Rejected'|'On Hold', status_reason }
  - `labels` (optional INSERT): { template_id (Status), inventory_lot_id, rendered_content }
  - `audit_logs` (INSERT)
- Ví dụ payload (set status):
{
  "inventory_lot_id": "lot-uuid-001",
  "status": "Accepted",
  "status_reason": "All QC tests passed",
  "changed_by": "qc_user_1"
}

J. User management actions
- Đọc:
  - `roles` (if exists)
- Ghi/Update:
  - `users` (INSERT/UPDATE): { username, role_id, assigned_warehouses }
  - `audit_logs`
- Ví dụ payload (create user):
{
  "username": "operator1",
  "role_id": "Operator",
  "assigned_warehouses": ["WH-01"]
}

K. LabelTemplate management (IT/Admin)
- Đọc: `label_templates`
- Ghi/Update: `label_templates` (INSERT/UPDATE/DELETE): { template_code, label_type, template_content, fields }
- Ví dụ payload (create template):
{
  "template_code": "TPL-RM-01",
  "label_type": "Raw Material",
  "template_content": "{{material_name}} - {{lot_code}} - Exp: {{expiry_date}}",
  "fields": ["material_name","lot_code","expiry_date"]
}

L. Reports / Trace queries
- Đọc: various tables (read-only) — may create `reports` record if persisted.
- Ví dụ payload (generate report request):
{
  "report_type": "inventory_count",
  "parameters": { "warehouse_id": "WH-01", "date_range": ["2026-01-01","2026-01-31"] },
  "generated_by": "manager1"
}

M. Audit logging (central)
- Ghi/Update:
  - `audit_logs` (INSERT): { user_id, action, entity_type, entity_id, details, timestamp }
- Ví dụ payload:
{
  "user_id": "operator1",
  "action": "create_inventory_lot",
  "entity_type": "inventory_lots",
  "entity_id": "lot-uuid-001",
  "details": "receipt PO-12345",
  "timestamp": "2026-01-20T09:45:00Z"
}
