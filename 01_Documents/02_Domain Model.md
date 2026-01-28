# 02_Domain Model

## Domain Knowledge

### Material Management
Quản lý vật tư: nhập xuất, số lượng, đơn vị tính, trạng thái tồn kho.

### Inventory Lot Tracking & Control
- Mỗi lô hàng có UID duy nhất
- Thông tin: nhà cung cấp, số lượng, ngày hết hạn
- Lot Status: `Quarantine`, `Accepted`, `Rejected`, `Depleted`
- Traceability: nguồn gốc, lịch sử sử dụng

### Label Generation & Printing
Khi nhập hàng, tự động gen label với:
- Ngày nhập
- Số lượng nhập
- Nguồn (nhà cung cấp)
- Thông tin kiểm tra chất lượng
- Barcode / QR Code

### Reporting
- Báo cáo sử dụng vật tư
- Kiểm soát chất lượng
- Báo cáo tuân thủ quy định

### Security
- Đăng nhập bằng username/password
- Role-based access control
- CSRF protection
- DDoS protection
- Data encryption

---

## Core Entities

### 1. Product
- id, sku, name, description
- categoryId, unit
- lowStockThreshold
- status: Active/Inactive

### 2. Category
- id, name, parentId

### 3. Warehouse
- id, code, name, address
- managerUserId

### 4. Location
- id, warehouseId, code

### 5. Batch/Lot
- id (UID), productId
- batchCode, supplierId
- quantity, manufactureDate, expiryDate
- lotStatus: Quarantine | Accepted | Rejected | Depleted
- qualityCheckInfo (JSON)

### 6. Label
- id, batchId, productId
- receiptDate, quantity, source
- barcode, qrCode
- qualityCheckInfo

### 7. InventoryRecord
- productId, warehouseId, locationId, batchId
- quantityAvailable, quantityReserved

### 8. Supplier
- id, code, name, contact, address

### 9. Customer
- id, name, contact, address

### 10. PurchaseOrder
- id, code, supplierId, createdBy
- status: Draft | Confirmed | Received | Cancelled
- lines: [{ productId, quantityOrdered, quantityReceived, unitPrice, batchId }]

### 11. SalesOrder
- id, code, customerId, createdBy
- status: Draft | Confirmed | Picked | Shipped | Completed | Cancelled
- lines: [{ productId, quantity, unitPrice, allocatedQuantity }]

### 12. StockMove
- id, code, type: IN | OUT | TRANSFER | ADJUSTMENT
- fromWarehouseId, toWarehouseId, fromLocationId, toLocationId
- createdBy, createdAt
- lines: [{ productId, quantity, batchId }]

### 13. User
- id, username, email, passwordHash
- roleId, assignedWarehouseIds

### 14. Role
- id, name, permissions[]

### 15. AuditLog
- id, userId, action, entityType, entityId, timestamp, details

### 16. QualityControl
- id, batchId, productId
- inspectorUserId, inspectionDate
- testResults (JSON), status: Pass | Fail | Pending
- notes

### 17. StockAlert
- id, productId, warehouseId
- alertType: LowStock | Expiring | Expired | Overstock
- threshold, currentQuantity
- triggeredAt, resolvedAt

### 18. Report
- id, reportType, generatedBy, generatedAt
- parameters (JSON), filePath
- status: Generating | Completed | Failed

---

## Entity Relationships

- Product 1 → * Batch
- Product 1 → * InventoryRecord
- Batch 1 → * InventoryRecord
- Batch 1 → * Label
- Batch 1 → 0..1 QualityControl
- Warehouse 1 → * Location
- Warehouse 1 → * InventoryRecord
- Location 1 → * InventoryRecord
- Supplier 1 → * PurchaseOrder
- Customer 1 → * SalesOrder
- PurchaseOrder 1 → * StockMove (IN)
- SalesOrder 1 → * StockMove (OUT)
- User 1 → * AuditLog
- Product 1 → * StockAlert

---

## Business Rules

### Inventory Management
- Mọi thay đổi số lượng phải qua StockMove
- Phân biệt quantityAvailable vs quantityReserved để tránh oversell
- Khi inventory < lowStockThreshold → tạo StockAlert
- Không cho phép số lượng âm (negative stock)

### Lot Control
- Lot status workflow: Quarantine → Quality Check (QualityControl) → Accepted/Rejected
- Lot Depleted khi quantityAvailable = 0
- Lot Expired khi expiryDate < currentDate → tạo StockAlert
- Lot sắp hết hạn (< 30 days) → tạo StockAlert Expiring
- FEFO (First Expired First Out): ưu tiên xuất lô gần hết hạn nhất

### Order Processing
- PurchaseOrder workflow: Draft → Confirmed → Received
- SalesOrder workflow: Draft → Confirmed → Picked → Shipped → Completed
- SalesOrder phải check và reserve inventory trước khi confirm
- Khi nhận PurchaseOrder: tạo StockMove IN + gen Label + tạo Batch + QualityControl + cập nhật InventoryRecord
- Khi xuất SalesOrder: tạo StockMove OUT + release reserved quantity + cập nhật InventoryRecord

### Quality Control
- Batch mới nhận phải qua QualityControl trước khi chuyển từ Quarantine → Accepted
- QualityControl.status = Fail → Batch.lotStatus = Rejected
- Batch Rejected không được phép xuất kho

### Security & Authorization
- Role-based approval: chỉ role có quyền mới approve/cancel documents
- Mọi thao tác quan trọng phải ghi AuditLog
- User chỉ thao tác trên assignedWarehouses

### Reporting
- Report tuân thủ: theo dõi Batch traceability, QualityControl history
- Report sử dụng: dựa trên StockMove (IN/OUT)
- Report cảnh báo: dựa trên StockAlert
