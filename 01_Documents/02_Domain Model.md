# 02_Domain Model

## Domain Knowledge

### Material Management
Quản lý vật tư (Materials): thông tin master data cho raw materials, APIs, excipients, containers, closures, process chemicals, và testing materials. Mỗi material có part number duy nhất, material type, storage conditions, và specification document.

### Inventory Lot Tracking & Control
- Mỗi lô hàng (InventoryLot) có UUID duy nhất
- Thông tin: manufacturer name, manufacturer lot number, supplier name, received date, expiration date
- Lot Status: `Quarantine`, `Accepted`, `Rejected`, `Depleted`
- Traceability: theo dõi nguồn gốc, lịch sử giao dịch (InventoryTransactions)
- Hỗ trợ sample lots (`is_sample: true`) để lấy mẫu kiểm tra chất lượng

### Inventory Transactions
Mọi thay đổi số lượng trong kho đều được ghi lại qua InventoryTransactions:
- Receipt: nhập hàng vào kho
- Usage: sử dụng vật tư (từ production batches)
- Split: chia tách lô hàng
- Adjustment: điều chỉnh số lượng
- Transfer: chuyển kho
- Disposal: hủy bỏ

### Production Batch Management
Quản lý các lô sản xuất (ProductionBatches) cho finished products:
- Mỗi batch có batch_number duy nhất
- Liên kết với product (Material) qua `product_id`
- Batch status: `In Progress`, `Complete`, `On Hold`, `Cancelled`
- Batch size và unit of measure
- Manufacture date và expiration date

### Batch Components Tracking
Theo dõi các thành phần (BatchComponents) được sử dụng trong production batch:
- Liên kết ProductionBatch với InventoryLot
- Planned quantity vs Actual quantity
- Unit of measure
- Addition date và người thêm vào

### Quality Control Testing
Quản lý kiểm tra chất lượng (QCTests) cho inventory lots:
- Test types: Identity, Potency, Microbial, Growth Promotion, Physical, Chemical
- Test method/SOP reference
- Test result và acceptance criteria
- Result status: `Pass`, `Fail`, `Pending`
- Performed by và verified by

### Label Generation & Printing
Hệ thống label templates (LabelTemplates) để in nhãn:
- Label types: Raw Material, Sample, Intermediate, Finished Product, API, Status
- Template content với placeholders để populate dữ liệu
- Width và height dimensions
- Labels được generate tại nhiều điểm:
  - Raw Material: khi nhận InventoryLot hoặc khi status thay đổi
  - Sample: khi tạo sample lot (`is_sample: true`)
  - Finished Product: khi ProductionBatch hoàn thành
  - API: cho API materials
  - Status: khi lot/batch status thay đổi
  - Intermediate: cho intermediate products trong quá trình sản xuất

### User Management & Security
- Đăng nhập bằng username/password (bcrypt-hashed)
- Role-based access control: Manager, Operator, Quality Control Technician, IT Administrator
- Account status (is_active)
- Last login tracking
- Audit trail qua các trường `performed_by`, `added_by`, `verified_by`

### Reporting
- Báo cáo sử dụng vật tư: dựa trên InventoryTransactions
- Kiểm soát chất lượng: dựa trên QCTests
- Báo cáo tuân thủ quy định: traceability từ Materials → InventoryLots → ProductionBatches
- Báo cáo batch components: theo dõi raw materials sử dụng trong production

---

## Core Entities

### 1. Users
Quản lý người dùng và phân quyền hệ thống.

**Attributes:**
- `user_id` (STRING(36), PK): UUID primary key
- `username` (STRING(50), UNIQUE, NOT NULL): Tên đăng nhập
- `email` (STRING(100), UNIQUE, NOT NULL): Email (đã validate)
- `password` (STRING(100), NOT NULL): Mật khẩu đã hash bằng bcrypt
- `role` (ENUM, NOT NULL, default: 'Operator'): Manager, Operator, Quality Control Technician, IT Administrator
- `is_active` (BOOLEAN, default: true): Trạng thái tài khoản (enabled/disabled)
- `last_login` (DATE, nullable): Thời điểm đăng nhập cuối cùng
- `created_date` (DATE, default: NOW): Ngày tạo record
- `modified_date` (DATE, default: NOW): Ngày cập nhật cuối cùng

### 2. Materials
Master data cho raw materials, APIs, excipients, containers, closures, process chemicals, và testing materials.

**Attributes:**
- `material_id` (STRING(20), PK): Internal material ID
- `part_number` (STRING(20), UNIQUE, NOT NULL): Part number (ví dụ: PART-12345)
- `material_name` (STRING(100), NOT NULL): Tên hiển thị
- `material_type` (ENUM, NOT NULL): API, Excipient, Dietary Supplement, Container, Closure, Process Chemical, Testing Material
- `storage_conditions` (STRING(100), nullable): Điều kiện bảo quản (ví dụ: "2-8°C, protected from light")
- `specification_document` (STRING(50), nullable): Tài liệu tham chiếu specification
- `created_date` (DATE, default: NOW): Ngày tạo record
- `modified_date` (DATE, default: NOW): Ngày cập nhật cuối cùng

### 3. LabelTemplates
Templates để in nhãn cho các loại khác nhau (raw material, sample, finished product, etc.).

**Attributes:**
- `template_id` (STRING(20), PK): Template identifier
- `template_name` (STRING(100), NOT NULL): Tên hiển thị template
- `label_type` (ENUM, NOT NULL): Raw Material, Sample, Intermediate, Finished Product, API, Status
- `template_content` (TEXT, NOT NULL): Nội dung template/layout với placeholders
- `width` (DECIMAL(5,2), NOT NULL): Chiều rộng nhãn (ví dụ: inches)
- `height` (DECIMAL(5,2), NOT NULL): Chiều cao nhãn
- `created_date` (DATE, default: NOW): Ngày tạo record
- `modified_date` (DATE, default: NOW): Ngày cập nhật cuối cùng

### 4. InventoryLots
Các lô hàng riêng lẻ của một material (mỗi lần nhận hàng hoặc batch của material là một lot).

**Attributes:**
- `lot_id` (STRING(36), PK): UUID primary key
- `material_id` (STRING(20), FK→Materials, NOT NULL): Material mà lot này thuộc về
- `manufacturer_name` (STRING(100), NOT NULL): Tên nhà sản xuất
- `manufacturer_lot` (STRING(50), NOT NULL): Số lô của nhà sản xuất
- `supplier_name` (STRING(100), nullable): Tên nhà cung cấp
- `received_date` (DATEONLY, NOT NULL): Ngày nhận hàng
- `expiration_date` (DATEONLY, NOT NULL): Ngày hết hạn
- `in_use_expiration_date` (DATEONLY, nullable): Ngày hết hạn sau khi mở (once-opened expiration)
- `status` (ENUM, NOT NULL): Quarantine, Accepted, Rejected, Depleted
- `quantity` (DECIMAL(10,3), NOT NULL): Số lượng hiện tại
- `unit_of_measure` (STRING(10), NOT NULL): Đơn vị tính (ví dụ: kg, L, each)
- `storage_location` (STRING(100), nullable): Vị trí lưu trữ trong kho
- `is_sample` (BOOLEAN, default: false): Có phải là sample lot không
- `parent_lot_id` (STRING(36), FK→InventoryLots, nullable): Lot cha (nếu là sample lot)
- `notes` (TEXT, nullable): Ghi chú
- `created_date` (DATE, default: NOW): Ngày tạo record
- `modified_date` (DATE, default: NOW): Ngày cập nhật cuối cùng

### 5. InventoryTransactions
Ghi lại mọi giao dịch thay đổi số lượng trong kho.

**Attributes:**
- `transaction_id` (STRING(36), PK): UUID primary key
- `lot_id` (STRING(36), FK→InventoryLots, NOT NULL): Lot được giao dịch
- `transaction_type` (ENUM, NOT NULL): Receipt, Usage, Split, Adjustment, Transfer, Disposal
- `quantity` (DECIMAL(10,3), NOT NULL): Số lượng thay đổi (dương cho Receipt, âm cho Usage/Disposal)
- `unit_of_measure` (STRING(10), NOT NULL): Đơn vị tính
- `transaction_date` (DATE, NOT NULL): Ngày giao dịch
- `reference_number` (STRING(50), nullable): Số tham chiếu (PO number, batch number, etc.)
- `performed_by` (STRING(50), NOT NULL): Người thực hiện
- `notes` (TEXT, nullable): Ghi chú
- `created_date` (DATE, default: NOW): Ngày tạo record
- `modified_date` (DATE, default: NOW): Ngày cập nhật cuối cùng

### 6. ProductionBatches
Các lô sản xuất cho finished products.

**Attributes:**
- `batch_id` (STRING(36), PK): UUID primary key
- `product_id` (STRING(20), FK→Materials, NOT NULL): Product (Material) được sản xuất
- `batch_number` (STRING(50), UNIQUE, NOT NULL): Số batch (ví dụ: PB-2025-0001)
- `batch_size` (DECIMAL(10,3), NOT NULL): Kích thước batch
- `unit_of_measure` (STRING(10), NOT NULL): Đơn vị tính
- `manufacture_date` (DATEONLY, NOT NULL): Ngày sản xuất
- `expiration_date` (DATEONLY, NOT NULL): Ngày hết hạn
- `status` (ENUM, NOT NULL): In Progress, Complete, On Hold, Cancelled
- `created_date` (DATE, default: NOW): Ngày tạo record
- `modified_date` (DATE, default: NOW): Ngày cập nhật cuối cùng

### 7. BatchComponents
Liên kết production batches với inventory lots (các raw materials/lots được sử dụng trong batch).

**Attributes:**
- `component_id` (STRING(36), PK): UUID primary key
- `batch_id` (STRING(36), FK→ProductionBatches, NOT NULL): Production batch
- `lot_id` (STRING(36), FK→InventoryLots, NOT NULL): Inventory lot được sử dụng
- `planned_quantity` (DECIMAL(10,3), NOT NULL): Số lượng dự kiến sử dụng
- `actual_quantity` (DECIMAL(10,3), nullable): Số lượng thực tế đã sử dụng
- `unit_of_measure` (STRING(10), NOT NULL): Đơn vị tính (kg, L, etc.)
- `addition_date` (DATE, nullable): Ngày thêm component vào batch
- `added_by` (STRING(50), nullable): Người thêm vào
- `created_date` (DATE, default: NOW): Ngày tạo record
- `modified_date` (DATE, default: NOW): Ngày cập nhật cuối cùng

### 8. QCTests
Kết quả kiểm tra chất lượng cho inventory lots.

**Attributes:**
- `test_id` (STRING(36), PK): UUID primary key
- `lot_id` (STRING(36), FK→InventoryLots, NOT NULL): Lot được kiểm tra
- `test_type` (ENUM, NOT NULL): Identity, Potency, Microbial, Growth Promotion, Physical, Chemical
- `test_method` (STRING(100), NOT NULL): Phương pháp kiểm tra hoặc SOP reference
- `test_date` (DATEONLY, NOT NULL): Ngày thực hiện kiểm tra
- `test_result` (STRING(100), NOT NULL): Giá trị hoặc mô tả kết quả
- `acceptance_criteria` (STRING(200), nullable): Mô tả tiêu chí chấp nhận
- `result_status` (ENUM, NOT NULL): Pass, Fail, Pending
- `performed_by` (STRING(50), NOT NULL): Kỹ thuật viên/người thực hiện
- `verified_by` (STRING(50), nullable): Người xem xét/verify
- `created_date` (DATE, default: NOW): Ngày tạo record
- `modified_date` (DATE, default: NOW): Ngày cập nhật cuối cùng

---

## Entity Relationships

### Primary Relationships

```
Materials ──1:N──> InventoryLots ──1:N──> InventoryTransactions
    │                    │
    │                    ├──1:N──> QCTests
    │                    │
    │                    └──1:N──> BatchComponents <──N:1── ProductionBatches
    │                                                              │
    └──────────────────1:N (product_id)───────────────────────────┘

LabelTemplates ──used by──> InventoryLots (Raw Material, Sample, API, Status labels)
LabelTemplates ──used by──> ProductionBatches (Finished Product, Intermediate labels)
Users (standalone)
```

### Detailed Associations

| From Model           | Association | To Model             | Foreign Key      | Description                                    |
| -------------------- | ----------- | -------------------- | ---------------- | ---------------------------------------------- |
| Material             | hasMany     | InventoryLot         | material_id      | Một material có nhiều lots                    |
| InventoryLot         | belongsTo   | Material             | material_id      | Mỗi lot thuộc về một material                 |
| InventoryLot         | hasMany     | InventoryTransaction | lot_id           | Mỗi lot có nhiều transactions                 |
| InventoryTransaction | belongsTo   | InventoryLot         | lot_id           | Mỗi transaction thuộc về một lot              |
| InventoryLot         | hasMany     | QCTest               | lot_id           | Mỗi lot có thể có nhiều QC tests              |
| QCTest               | belongsTo   | InventoryLot         | lot_id           | Mỗi QC test thuộc về một lot                  |
| ProductionBatch      | hasMany     | BatchComponent       | batch_id         | Một batch có nhiều components                 |
| BatchComponent       | belongsTo   | ProductionBatch      | batch_id         | Mỗi component thuộc về một batch              |
| BatchComponent       | belongsTo   | InventoryLot         | lot_id           | Mỗi component sử dụng một lot                 |
| InventoryLot         | hasMany     | BatchComponent       | lot_id           | Một lot có thể được dùng trong nhiều batches |
| ProductionBatch      | belongsTo   | Material             | product_id       | Mỗi batch sản xuất một product (Material)     |
| Material             | hasMany     | ProductionBatch      | product_id       | Một product có nhiều production batches       |
| InventoryLot         | belongsTo   | InventoryLot         | parent_lot_id    | Sample lot có thể có parent lot               |
| InventoryLot         | hasMany     | InventoryLot         | parent_lot_id    | Một lot có thể có nhiều sample lots          |

**Note:** LabelTemplates không có foreign key trực tiếp, nhưng được sử dụng để generate labels cho InventoryLots và ProductionBatches dựa trên `label_type`.

---

## Business Rules

### Material Management
- Mỗi material phải có `part_number` duy nhất
- `material_type` phải là một trong các giá trị enum được định nghĩa
- Material có thể được sử dụng như raw material (trong InventoryLots) hoặc như finished product (trong ProductionBatches)

### Inventory Lot Control
- Lot status workflow: `Quarantine` → QC Testing → `Accepted`/`Rejected` → `Depleted`
- Lot mới nhận phải có status `Quarantine` ban đầu
- Lot chỉ chuyển sang `Accepted` sau khi tất cả QC tests required đều `Pass`
- Lot `Rejected` không được phép sử dụng trong production
- Lot `Depleted` khi `quantity` = 0
- Sample lots (`is_sample: true`) có thể được tạo từ parent lot để kiểm tra chất lượng
- Sample lot có thể có `parent_lot_id` để traceability

### Inventory Transactions
- Mọi thay đổi số lượng phải qua InventoryTransaction
- Transaction type `Receipt`: quantity dương, tăng số lượng lot
- Transaction type `Usage`: quantity âm, giảm số lượng lot (thường từ production)
- Transaction type `Split`: chia tách lot thành nhiều lots nhỏ hơn
- Transaction type `Adjustment`: điều chỉnh số lượng (có thể dương hoặc âm)
- Transaction type `Transfer`: chuyển kho
- Transaction type `Disposal`: hủy bỏ, quantity âm
- Không cho phép số lượng âm (negative stock) sau transaction
- Mỗi transaction phải có `performed_by` để audit trail

### Production Batch Management
- Mỗi batch phải có `batch_number` duy nhất
- Batch status workflow: `In Progress` → `Complete`/`On Hold`/`Cancelled`
- Batch `Complete` khi tất cả components đã được thêm và production hoàn thành
- Batch `Cancelled` không được phép sử dụng
- Batch phải liên kết với một Material (product) qua `product_id`

### Batch Components Tracking
- Khi thêm component vào batch, tạo InventoryTransaction type `Usage` để giảm số lượng lot
- `actual_quantity` có thể khác `planned_quantity` (variance tracking)
- Component phải thuộc về một InventoryLot đã được `Accepted`
- Component không được sử dụng lot có status `Quarantine` hoặc `Rejected`

### Quality Control Testing
- Lot mới nhận (`Quarantine`) phải có ít nhất một QC test trước khi chuyển status
- Test types: Identity, Potency, Microbial, Growth Promotion, Physical, Chemical
- Result status: `Pass`, `Fail`, `Pending`
- Tất cả required tests phải `Pass` trước khi lot chuyển sang `Accepted`
- Nếu có test `Fail`, lot phải chuyển sang `Rejected`
- Test phải có `performed_by` và có thể có `verified_by` để review

### Label Generation
- Labels được generate bằng cách chọn LabelTemplate phù hợp dựa trên `label_type`
- Template content được populate với dữ liệu từ entity liên quan (InventoryLot hoặc ProductionBatch)
- Raw Material labels: generate khi nhận InventoryLot hoặc khi status thay đổi
- Sample labels: generate khi tạo sample lot (`is_sample: true`)
- Finished Product labels: generate khi ProductionBatch status = `Complete`
- API labels: tương tự Raw Material cho API materials
- Status labels: generate khi lot/batch status thay đổi (Quarantine → Accepted, etc.)
- Intermediate labels: cho intermediate products trong quá trình production

### User Management & Security
- Username và email phải unique
- Password phải được hash bằng bcrypt trước khi lưu
- Role-based access control:
  - `Manager`: Quản lý tổng thể, xem dashboard và báo cáo, phê duyệt phiếu nhập-xuất, tra cứu lịch sử giao dịch
  - `Operator`: Nhân viên kho, thực hiện receiving, picking, transfer, count, cập nhật tồn kho, scan barcode/QR
  - `Quality Control Technician`: Quản lý QC tests, verify results, lưu hình ảnh và kết quả kiểm tra, workflow Pending → Check → Approve/Reject/Hold
  - `IT Administrator`: Quản lý người dùng & RBAC, audit log, backup/restore, giám sát hệ thống, cấu hình kho và templates
- Account `is_active = false` không được phép đăng nhập
- Mọi thao tác quan trọng phải ghi `performed_by`, `added_by`, `verified_by` để audit trail

### Data Integrity & Traceability
- Không được xóa (hard delete) các records quan trọng, chỉ soft delete hoặc archive
- Mọi thay đổi quan trọng phải ghi `modified_date`
- Traceability chain: Material → InventoryLot → InventoryTransaction → ProductionBatch → BatchComponent
- QC test results phải được lưu trữ để compliance reporting
- Batch components phải trace được về InventoryLot và Material gốc

### Reporting & Compliance
- Report sử dụng vật tư: dựa trên InventoryTransactions (type Usage)
- Report kiểm soát chất lượng: dựa trên QCTests và lot status
- Report tuân thủ: traceability từ Materials → InventoryLots → ProductionBatches
- Report batch components: theo dõi raw materials sử dụng trong production batches
- Report expiration tracking: lots và batches sắp hết hạn dựa trên `expiration_date`

---

## Example Data Flow

1. **Material Creation**: Tạo Material `MAT-001` (Vitamin D3 100K) với part_number `PART-10001`, material_type `API`.

2. **Receipt**: Nhận InventoryLot `lot-uuid-001` cho `MAT-001` với 25.5 kg → Tạo InventoryTransaction type `Receipt` +25.5 kg, status = `Quarantine`.

3. **Label Generation**: Generate Raw Material label sử dụng LabelTemplate `TPL-RM-01` (label_type: 'Raw Material'). Template content được populate với dữ liệu từ `lot-uuid-001` (material_name, lot_id, manufacturer_lot, expiration_date, storage_location, etc.) và in ra để dán lên lô hàng.

4. **QC Testing**: Tạo QCTest records (Identity, Potency) cho `lot-uuid-001`. Khi tất cả tests đều `Pass`, chuyển lot status sang `Accepted`.

5. **Sample Lot**: Nếu cần, tạo sample lot từ `lot-uuid-001` (is_sample: true, parent_lot_id = lot-uuid-001) → Generate Sample label sử dụng LabelTemplate với label_type: 'Sample'.

6. **Production Batch**: Tạo ProductionBatch `batch-uuid-001` cho product `PROD-001` (Material), batch_number `PB-2025-0001`, status = `In Progress`.

7. **Batch Component**: Thêm BatchComponent liên kết `batch-uuid-001` với `lot-uuid-001`, planned_quantity = 2 kg, actual_quantity = 2 kg → Tạo InventoryTransaction type `Usage` -2 kg trên `lot-uuid-001`.

8. **Batch Completion**: Khi production hoàn thành, chuyển `batch-uuid-001` status sang `Complete` → Generate Finished Product label sử dụng LabelTemplate với label_type: 'Finished Product', populate với batch data (batch_number, product_name, manufacture_date, expiration_date, batch_size, etc.).

9. **Status Label**: Nếu QC test results thay đổi lot status, generate Status label sử dụng LabelTemplate với label_type: 'Status' để hiển thị status hiện tại (Quarantine, Accepted, Rejected) trên physical lot.

10. **User Actions**: Users đăng nhập và thực hiện các actions; `performed_by`/`added_by`/`verified_by` lưu username hoặc user_id để audit trail.

---
