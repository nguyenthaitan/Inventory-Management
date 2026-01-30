# Workflow chi tiết (theo schema)

Mục tiêu: Dựa trên schema (Materials → InventoryLots → InventoryTransactions → QCTests / ProductionBatches → BatchComponents → Labels), mô tả chi tiết từng bước workflow, liệt kê các bảng và trường liên quan, và chỉ rõ giá trị nào thay đổi (before → after) trong mỗi bước. Kèm ví dụ thực tế ngành dược: Ascorbic Acid (Vitamin C) dùng cho viên 500 mg.

Ngắn gọn về cách đọc tài liệu:
- Mỗi bước mô tả: mục tiêu → bảng được đọc (READ) → bảng được ghi/cập nhật (WRITE/UPDATE) → ví dụ giá trị (before → action → after)
- Dùng ký hiệu: table.field để chỉ trường cụ thể.

---

## 1. Bảng & trường chính (tổng quan)
Danh sách bảng/field thường dùng xuyên suốt workflow (tên trường là gợi ý; tuỳ schema thực tế có thể khác tên):
- materials: id, material_code, name, unit, default_label_template_id, specifications
- inventory_lots: id, lot_code, material_id, quantity, available_quantity, is_sample, parent_lot_id, manufacture_date, expiry_date, status
- inventory_transactions: id, inventory_lot_id, type, quantity, location_id, reference_id, performed_by, status, created_at
- qc_tests: id, inventory_lot_id, test_type, test_results (JSON), status, verified_by, verified_at
- production_batches: id, batch_code, product_id, planned_qty, produced_qty, status, started_at, finished_at
- batch_components: id, production_batch_id, inventory_lot_id, planned_quantity, actual_quantity
- label_templates: id, template_code, label_type, template_content, fields
- labels: id, template_id, inventory_lot_id, production_batch_id, rendered_content, barcode_value, created_by, created_at
- users: id, username, role_id
- audit_logs: id, user_id, action, entity_type, entity_id, details, timestamp

---

## 2. Quy ước thể hiện Before → Action → After
Khi mô tả thay đổi, tôi sẽ dùng định dạng:
- Trường: BEFORE -> (action) -> AFTER
Ví dụ: inventory_lots.available_quantity: 0.0 -> (RECEIPT +60.0) -> 60.0

---

## 3. Kịch bản thực tế mẫu (Pharmacy)
Giá trị mẫu sẽ dùng xuyên suốt: 
- Material: MAT-VC-500 (Ascorbic Acid, Vitamin C), unit = kg
- Receipt: InventoryLot lot-VC-20260115, manufacturer_lot = MFG-VC-20260115, quantity = 60.0 kg, expiry_date = 2028-01-15
- ProductionBatch: batch-TBL-1001 (Vitamin C 500 mg tablets), planned_qty = 100000 viên, API planned consumption = 50.0 kg
- Label templates: TPL-RM-01 (Raw Material), TPL-SAMPLE-01 (Sample), TPL-FIN-01 (Finished), TPL-STAT-01 (Status)

---

## 4. Quy trình chi tiết — từng bước và thay đổi bảng

### A. Tạo Material (setup)
Mục tiêu: tạo bản ghi vật tư/sản phẩm.
- READ: (optional) label_templates để gán default
- WRITE: materials
  - materials: INSERT { material_code: "MAT-VC-500", name: "Ascorbic Acid (Vitamin C)", unit: "kg", default_label_template_id: "TPL-RM-01" }
- AUDIT: audit_logs INSERT

Giá trị minh họa:
- materials (new): id=mat-1, material_code=MAT-VC-500, name="Ascorbic Acid (Vitamin C)"

Thay đổi: bảng materials thêm bản ghi mới.

---

### B. Nhận nguyên liệu (Receipt) → Tạo InventoryLot + InventoryTransaction + Label
Mục tiêu: ghi nhận lô nhập, sinh transaction và in nhãn raw material.

READ:
- materials (material_code, name, unit)
- label_templates (template_content)

WRITE/UPDATE:
- inventory_lots: INSERT new lot record
- inventory_transactions: INSERT RECEIPT transaction
- labels: INSERT rendered label
- inventory_lots.available_quantity: UPDATE when transaction confirmed
- audit_logs: INSERT

Chi tiết trường thay đổi (ví dụ Vitamin C):
- inventory_lots.quantity: (N/A) -> (create) -> 60.0
- inventory_lots.available_quantity: 0.0* -> (RECEIPT +60.0) -> 60.0
  * note: initial default could be 0 or equal to quantity depending policy; here we create with available_quantity = quantity if transaction auto-confirmed.
- inventory_transactions: new TX record
  - inventory_transactions: INSERT { id: tx-1, inventory_lot_id: lot-VC-20260115, type: 'RECEIPT', quantity: +60.0, location_id: 'WH-PHARMA-01', reference_id: 'PO-VC-9876', performed_by: 'operator_vn', status: 'Confirmed' }
- labels: INSERT { template_id: 'TPL-RM-01', inventory_lot_id: lot-VC-20260115, rendered_content: 'Ascorbic Acid - lot-VC-20260115 - Exp: 2028-01-15 - 60.0 kg', barcode_value: 'BC-...' }
- audit_logs: INSERT entry for lot creation and receipt

Before → Action → After (sample fields):
- inventory_lots (before): (no record for lot-VC-20260115) → (create lot) → inventory_lots.quantity = 60.0, inventory_lots.available_quantity = 60.0, inventory_lots.status = 'Quarantine'
- inventory_transactions (before): none → (insert) → TX record with +60.0
- labels (before): none → (generate) → Raw Material label record

Notes:
- If policy requires QC before counting as available, then available_quantity remains 0.0 until QC passes;receipt TX recorded but inventory_lots.available_quantity stays 0.0 until QC step sets status=Accepted and triggers availability update.

---

### C. Kiểm nghiệm chất lượng (QCTests)
Mục tiêu: thực hiện các phép thử trên InventoryLot; thay đổi trạng thái lot dựa trên kết quả.

READ:
- inventory_lots (status, quantity)
- qc_tests (existing tests for same lot)

WRITE/UPDATE:
- qc_tests: INSERT per test; UPDATE on verification
- inventory_lots.status: UPDATE to 'Accepted' / 'Rejected' / 'On Hold'
- optionally inventory_transactions: INSERT RETURN or ADJUSTMENT if rejected
- labels: optional create Status label
- audit_logs: INSERT

Ví dụ (lot-VC-20260115):
- qc_tests entries created:
  - QC1: { id: qc-1, inventory_lot_id: lot-VC-20260115, test_type: 'Identity', test_results: { method: 'HPLC', result: 'Match' }, status: 'Pass', verified_by: 'qc_user_vn' }
  - QC2: { test_type: 'Assay', test_results: { assay_percent: 99.2 }, status: 'Pass' }
  - QC3: { test_type: 'LOD', test_results: { value: 0.3 }, status: 'Pass' }
  - QC4: { test_type: 'Impurities', test_results: { total_impurities: 0.05 }, status: 'Pass' }

Before → Action → After (status):
- inventory_lots.status: 'Quarantine' → (all QC Pass) → 'Accepted'

If one test fails (example):
- inventory_lots.status: 'Quarantine' → (Assay 95.0% < spec 98.0%) → 'Rejected'
- Then system actions:
  - inventory_transactions: INSERT { type: 'RETURN' or 'ADJUSTMENT', quantity: -60.0 (or adjust available to 0) }
  - labels: INSERT Status label (TPL-STAT-01) indicating 'Rejected - reason...'
  - audit_logs: record rejection and action taken

Business rule examples to implement:
- If lot.status != 'Accepted', block consumption for ProductionBatches (reject USAGE transactions or prevent BatchComponent allocation).

---

### D. Tạo mẫu (Sample) từ InventoryLot (Split)
Mục tiêu: lấy một phần lot làm sample; ghi transaction và tạo sample lot

READ:
- inventory_lots (parent available_quantity)

WRITE/UPDATE:
- inventory_lots: INSERT sample lot; UPDATE parent.available_quantity when split confirmed
- inventory_transactions: INSERT SPLIT on parent (negative quantity)
- labels: INSERT sample label
- audit_logs: INSERT

Ví dụ:
- Parent before: inventory_lots.available_quantity: 60.0
- Action: create sample 0.1 kg
  - inventory_lots (new): sample-VC-20260115-1 quantity=0.1, is_sample=true, parent_lot_id=lot-VC-20260115
  - inventory_transactions: INSERT { type: 'SPLIT', inventory_lot_id: lot-VC-20260115, quantity: -0.1 }
- After confirmation:
  - parent.available_quantity: 60.0 -> (SPLIT -0.1) -> 59.9

---

### E. Lập kế hoạch sản xuất (Create ProductionBatch & BatchComponents)
Mục tiêu: tạo lô sản xuất, gán nguồn nguyên liệu theo lot.

READ:
- materials (product)
- inventory_lots (available lots and quantities)

WRITE/UPDATE:
- production_batches: INSERT
- batch_components: INSERT per component linking production batch to inventory lots (planned quantities)
- audit_logs: INSERT

Ví dụ (batch-TBL-1001):
- production_batches (new): { batch_code: 'batch-TBL-1001', product_id: 'PROD-VC-500', planned_qty: 100000, status: 'Planned' }
- batch_components: { production_batch_id: 'batch-TBL-1001', inventory_lot_id: 'lot-VC-20260115', planned_quantity: 50.0 }

Important: this step does not reduce inventory quantities yet — it only reserves/records planned consumption. Some systems may mark inventory as reserved (a reserved_quantity field), in which case update inventory_lots.available_quantity or inventory_lots.reserved_quantity accordingly:
- Option A (reservation): inventory_lots.reserved_quantity: 0 -> (reserve 50.0) -> 50.0; inventory_lots.available_quantity: 60.0 -> 10.0 (logical reserve)
- Option B (no reserve): quantities unchanged until consumption transaction executed.

---

### F. Tiêu thụ nguyên liệu cho sản xuất (Usage / Consume)
Mục tiêu: khi thực sự dùng nguyên liệu, ghi transaction USAGE và cập nhật actual quantity trong BatchComponent

READ:
- inventory_lots (available_quantity)
- batch_components (planned)

WRITE/UPDATE:
- inventory_transactions: INSERT USAGE (negative quantity)
- batch_components.actual_quantity: UPDATE
- inventory_lots.available_quantity: UPDATE after confirmation
- audit_logs: INSERT

Ví dụ (usage for batch-TBL-1001):
- Before:
  - inventory_lots.available_quantity (lot-VC-20260115): 60.0
  - batch_components.actual_quantity: 0
- Action: create inventory_transactions USAGE -50.0
  - inventory_transactions: INSERT { id: tx-usage-1, inventory_lot_id: 'lot-VC-20260115', type: 'USAGE', quantity: -50.0, reference_id: 'batch-TBL-1001', performed_by: 'operator_prod1', status: 'Confirmed' }
  - batch_components.actual_quantity: 0 -> (apply) -> 50.0
  - inventory_lots.available_quantity: 60.0 -> (USAGE -50.0) -> 10.0

Edge cases:
- If available_quantity < required consumption, block operation or partial consume + allocate from other lots (FEFO/expiry logic).
- When consumption spans multiple lots, create multiple USAGE transactions per lot.

---

### G. Hoàn tất lô sản xuất (Complete ProductionBatch) → Tạo Finished InventoryLot(s) + Labels
Mục tiêu: khi batch complete, tạo lot thành phẩm, in nhãn và lưu produced_qty

READ:
- production_batches, batch_components

WRITE/UPDATE:
- production_batches.status: UPDATE -> 'Complete'
- production_batches.produced_qty: UPDATE
- inventory_lots: INSERT finished lot(s) { production_batch_id }
- labels: INSERT Finished Product labels
- audit_logs: INSERT

Ví dụ:
- production_batches.status: 'Planned' -> (complete) -> 'Complete'
- produced_qty: 0 -> (set) -> 100000
- inventory_lots (new finished lot): finished-lot-TBL-1001 { material_id: 'PROD-VC-500', quantity: 100000 (units), production_batch_id: 'batch-TBL-1001', status: 'Available' }
- labels: create using TPL-FIN-01 with fields: batch_number='batch-TBL-1001', product_name='Vitamin C 500 mg tablet', manufacture_date, expiry_date (calc from product shelf-life), batch_size=100000

---

### H. Điều chỉnh tồn kho / Trả hàng (Adjustment / Return)
Mục tiêu: khi có chênh lệch kiểm kê hoặc trả hàng, ghi ADJUSTMENT/RETURN

READ:
- inventory_lots, inventory_transactions

WRITE/UPDATE:
- inventory_transactions: INSERT ADJUSTMENT/RETURN
- inventory_lots.available_quantity: UPDATE after approval
- audit_logs: INSERT

Ví dụ:
- inventory_lots.available_quantity: 10.0 -> (ADJUSTMENT -1.5) -> 8.5
- inventory_transactions: INSERT { type: 'ADJUSTMENT', quantity: -1.5, reason: 'count discrepancy' }

Approval flows:
- ADJUSTMENT may be created as status='Pending' and require Manager approve → upon approval set status='Confirmed' and apply change to inventory_lots.available_quantity.

---

### I. Thay đổi trạng thái lot (Status change) và nhãn trạng thái
Mục tiêu: quản lý trạng thái lot và in Status label khi status thay đổi

READ:
- qc_tests, inventory_lots

WRITE/UPDATE:
- inventory_lots.status: UPDATE (Accepted/Rejected/On Hold)
- labels: optionally INSERT Status label (TPL-STAT-01)
- inventory_transactions: possibly INSERT adjustments/returns
- audit_logs: INSERT

Ví dụ:
- inventory_lots.status: 'Quarantine' -> (QC pass) -> 'Accepted'
- If fail: 'Quarantine' -> (QC fail) -> 'Rejected' -> create RETURN tx
- labels: INSERT { template_id: 'TPL-STAT-01', inventory_lot_id: 'lot-VC-20260115', rendered_content: 'Rejected - reason: assay 95.0% < spec' }

---

### J. Truy vết (Traceability) — read-only flows
Mục tiêu: cho phép truy vết nguồn gốc nguyên liệu cho lô thành phẩm

READ-only queries (no writes unless report persisted):
- From production_batch -> batch_components -> inventory_lots -> inventory_transactions & qc_tests
- From inventory_lot -> inventory_transactions, qc_tests, labels, batch_components

Example query intent:
- List all source lots for batch-TBL-1001 and QC status for each
- Consumption timeline for lot-VC-20260115

---

### K. Audit logging (central)
Mọi action quan trọng phải INSERT một record vào audit_logs: { user_id, action, entity_type, entity_id, details, timestamp }
- Ví dụ: { user_id: 'operator_vn', action: 'receive_lot', entity_type: 'inventory_lots', entity_id: 'lot-VC-20260115', details: 'PO-VC-9876', timestamp: '2026-01-15T10:00:00Z' }

---

## 5. Tóm tắt mapping action → bảng & trường (bảng tóm tắt)
Một bảng ngắn gọn để dev tham khảo nhanh:
- Create Material: write -> materials (material_code,name,unit,default_label_template_id)
- Receive Lot: write -> inventory_lots (lot_code,material_id,quantity,available_quantity,status), inventory_transactions (type='RECEIPT',quantity), labels
- QC: write -> qc_tests (test_type,test_results,status,verified_by), update inventory_lots.status
- Sample: write -> inventory_lots (is_sample,parent_lot_id), inventory_transactions (type='SPLIT')
- Create Batch: write -> production_batches, batch_components
- Consume: write -> inventory_transactions (type='USAGE',quantity negative), update batch_components.actual_quantity, update inventory_lots.available_quantity
- Complete Batch: update -> production_batches.status/produced_qty, write -> inventory_lots (finished lot), labels
- Adjustment/Return: write -> inventory_transactions (type='ADJUSTMENT'/'RETURN'), update inventory_lots.available_quantity
- Label generation: write -> labels (rendered_content,barcode_value)
- Audit: write -> audit_logs

---

## 6. Recommendations for implementation details
- Use transaction boundaries for multi-step actions: e.g., creating a lot + receipt tx + labels should be atomic.
- Separate 'recorded' vs 'available' quantity: record initial receipt tx then set available only after QC pass (if policy requires). Consider fields: `received_quantity`, `available_quantity`, `reserved_quantity`.
- Reserve logic for production planning: add `reserved_quantity` on inventory_lots or separate reservations table to avoid double allocation.
- Store QC results as structured JSON in `qc_tests.test_results` for future reporting.
- Label rendering: store `template_content` separately and rendered output in `labels.rendered_content` for audit.
- Implement approval workflows: ADJUSTMENT and RETURN should have status steps (Pending -> Approved -> Applied).

---
