# 02_Domain Model

## Mục đích
Tài liệu này trình bày mô hình miền (domain model) cho hệ thống Inventory Management: các thực thể nghiệp vụ chính trong đời sống thực (và phần mềm), thuộc tính tiêu biểu, mối quan hệ giữa chúng, các ràng buộc nghiệp vụ quan trọng và đề xuất về aggregate/transactional boundaries. Mục tiêu là làm rõ cấu trúc dữ liệu và những luồng nghiệp vụ để thuận tiện cho thiết kế cơ sở dữ liệu, API và logic ứng dụng.

## Phạm vi
Tập trung vào nghiệp vụ quản lý tồn kho, nhập/xuất hàng, quản lý sản phẩm, kho, nhà cung cấp, giao dịch mua/bán, người dùng và audit. Không đi sâu vào chi tiết kỹ thuật (triển khai, indexing cụ thể), nhưng có các gợi ý kiến trúc hữu ích.

---

## Các thực thể chính (Entities)
Mỗi thực thể liệt kê các thuộc tính chính (không giới hạn) và ghi chú.

1. Product (Sản phẩm)
   - id (PK) — UUID / ObjectId
   - sku (string) — mã hàng (unique)
   - name (string)
   - description (text)
   - categoryId (FK)
   - unit (string) — đơn vị tính (ví dụ: cái, kg)
   - priceCost (decimal) — giá nhập (có thể có lịch sử)
   - priceSale (decimal) — giá bán
   - status (enum) — Active/Inactive
   - attributes (map) — thuộc tính mở rộng (size, color, v.v.)
   - lowStockThreshold (integer)
   Ghi chú: Product là thực thể trung tâm; một Product có thể có nhiều Batch/Lot hoặc nhiều SKU variant tuỳ mô hình.

2. Category (Danh mục)
   - id (PK)
   - name
   - parentId (nullable)
   Ghi chú: phục vụ phân loại và tìm kiếm.

3. Warehouse (Kho)
   - id (PK)
   - code, name, address
   - managerUserId (FK)
   - status
   Ghi chú: Một hệ thống có thể có nhiều kho vật lý.

4. Location (Vị trí trong kho)
   - id (PK)
   - warehouseId (FK)
   - code (kệ, vị trí)
   - description
   Ghi chú: Location giúp theo dõi vị trí vật lý chi tiết trong warehouse.

5. InventoryRecord / Stock (Bản ghi tồn)
   - id (PK) hoặc composite (productId + locationId)
   - productId (FK)
   - warehouseId (FK)
   - locationId (FK, nullable)
   - quantityAvailable (decimal)
   - quantityReserved (decimal)
   - lastUpdated (timestamp)
   - batchId (optional)
   Ghi chú: Đây là thực thể đại diện cho trạng thái tồn kho (số lượng) tại một vị trí/kho.

6. Batch / Lot (Lô hàng)
   - id (PK)
   - productId (FK)
   - batchCode
   - quantity
   - manufactureDate, expiryDate (nullable)
   Ghi chú: Dùng khi quản lý theo lô, hết hạn, traceability.

7. Supplier (Nhà cung cấp)
   - id (PK)
   - name, contact, address
   - code
   Ghi chú: Nhà cung cấp liên quan đến phiếu nhập (Purchase Order).

8. Customer (Khách hàng)
   - id (PK)
   - name, contact, address
   Ghi chú: Liên quan đến phiếu xuất/bán hàng.

9. PurchaseOrder (Phiếu/đơn nhập)
   - id (PK)
   - code
   - supplierId (FK)
   - createdBy (userId)
   - status (Draft / Confirmed / Received / Cancelled)
   - createdAt, updatedAt
   - lines: array of PurchaseOrderLine

   PurchaseOrderLine
   - id (PK)
   - purchaseOrderId (FK)
   - productId (FK)
   - quantityOrdered
   - quantityReceived
   - unitPrice
   - batch (optional)

   Ghi chú: PO tạo ra khi nhập hàng từ nhà cung cấp.

10. SalesOrder / Shipment / Picking (Phiếu xuất / Bán)
    - id (PK)
    - code
    - customerId (FK)
    - createdBy
    - status (Draft / Confirmed / Picked / Shipped / Completed / Cancelled)
    - lines: array of SalesOrderLine

    SalesOrderLine
    - id
    - salesOrderId
    - productId
    - quantity
    - unitPrice
    - allocatedQuantity (số đã reservation)

    Ghi chú: SalesOrder liên quan đến kiểm tra tồn, reservation và ghi giảm khi xuất.

11. Transaction / StockMove (Giao dịch tồn kho / Phiếu điều chuyển)
    - id (PK)
    - code
    - type (IN / OUT / TRANSFER / ADJUSTMENT)
    - relatedDocument (PO / SO / Transfer code)
    - fromWarehouseId, toWarehouseId
    - fromLocationId, toLocationId
    - createdBy, createdAt
    - lines: array of StockMoveLine

    StockMoveLine
    - id
    - productId
    - quantity
    - batchId (optional)

    Ghi chú: Dùng để ghi nhận mọi thay đổi thực tế trên tồn.

12. Invoice (Hóa đơn)
    - id, code
    - relatedOrderId (salesOrderId / purchaseOrderId)
    - totalAmount, tax, status

13. User (Người dùng)
    - id, username, displayName, email
    - roleId
    - assignedWarehouseIds

14. Role / Permission
    - roleId, name, permissions

15. AuditLog (Nhật ký sửa đổi)
    - id, userId, action, entityType, entityId, timestamp, details
    Ghi chú: Quan trọng cho truy vết hoạt động.

16. PriceHistory (Lịch sử giá)
    - id, productId, priceCost, priceSale, startDate, endDate

---

## Mối quan hệ chính (Relationships)
Trình bày dạng "EntityA (cardinality) — mô tả — EntityB (cardinality)".

- Product (1) — thuộc về — Category (1..1) (một Product có một Category chính; Category có thể có nhiều Product)
- Warehouse (1) — có nhiều — Location (0..*)
- Warehouse (1) — có nhiều — InventoryRecord (0..*)
- Location (1) — chứa — InventoryRecord (0..*)
- Product (1) — có nhiều — InventoryRecord (0..*) (mỗi bản ghi là product tại một vị trí/kho)
- Product (1) — có nhiều — Batch (0..*)
- Supplier (1) — cung cấp — PurchaseOrder (0..*)
- PurchaseOrder (1) — có nhiều — PurchaseOrderLine (1..*) — mỗi line tham chiếu Product
- Customer (1) — tạo — SalesOrder (0..*)
- SalesOrder (1) — có nhiều — SalesOrderLine (1..*) — mỗi line tham chiếu Product
- SalesOrder (1) — khi xuất — tạo — StockMove (0..1)
- User (1) — thực hiện — Transaction / PurchaseOrder / SalesOrder (0..*)
- Product (1) — có nhiều — PriceHistory (0..*)
- AnyEntity (1) — được ghi lại bởi — AuditLog (0..*)

---

## ER sơ đồ (text-based)
Một bản tóm tắt ER đơn giản bằng ASCII để dễ hình dung:

Product(pk: id, sku, name, categoryId) 1---* InventoryRecord(pk: id, productId, warehouseId, locationId, qty)
InventoryRecord *---1 Warehouse(pk: id, name)
InventoryRecord *---1 Location(pk: id, code)
Product 1---* Batch(pk: id, productId, batchCode)
PurchaseOrder(pk: id, supplierId) 1---* PurchaseOrderLine(pk: id, productId, qty)
SalesOrder(pk: id, customerId) 1---* SalesOrderLine(pk: id, productId, qty)
StockMove(pk: id) 1---* StockMoveLine(pk: id, productId, qty)

---

## Quy tắc nghiệp vụ quan trọng (Business Rules)
- Tồn kho thực tế được giữ trong InventoryRecord (product + location/warehouse). Mọi thay đổi số lượng phải qua một Transaction/StockMove để đảm bảo lịch sử.
- Trước khi xác nhận SalesOrder phải check và reserve (đặt giữ) quantity trên InventoryRecord.
- Khi nhận hàng từ PurchaseOrder, tạo StockMove IN và cập nhật InventoryRecord, có thể gắn Batch/Lot.
- Cần phân biệt quantityAvailable vs quantityReserved để tránh oversell.
- Mỗi phiếu (PO, SO, StockMove) có trạng thái rõ ràng (Draft, Confirmed, Completed, Cancelled) và không cho phép ghi giảm trái phép.
- Quyền hạn: chỉ role có quyền mới có thể approve/cancel các document nhất định.

---

## Aggregate boundaries & transactional considerations
Đề xuất aggregates theo DDD để dễ quản lý consistency:

- Product Aggregate: Product + PriceHistory + (tham chiếu readonly tới Category)
- Inventory Aggregate: InventoryRecord (productId + locationId) là root; mọi StockMove phải cập nhật aggregate này bằng transaction (or eventual consistency via events)
- Order Aggregate: PurchaseOrder hoặc SalesOrder gồm các OrderLine; việc thay đổi qty/price nằm trong aggregate.
- User/Permission Aggregate: quản lý user và role.

Ghi chú: Cross-aggregate operations (ví dụ: chuyển kho nhiều InventoryRecord) nên dùng sagas/long-running transaction hoặc event-driven workflow để đảm bảo an toàn.

---

## Gợi ý thiết kế DB & indexing
- Bảng InventoryRecord: index theo (productId), (warehouseId), (productId, warehouseId), hoặc composite (productId, locationId) để lookup nhanh.
- Product: unique index trên sku.
- PurchaseOrder/SalesOrder: index theo status và createdAt để lọc nhanh.
- AuditLog: partition hoặc lưu vào separate store (Elasticsearch) nếu lớn.

---

## Các edge-cases & lưu ý
- Negative stock: cho phép hoặc không? Nếu cho phép, phải có flag và quy trình audit.
- Concurrency: nhiều nhân viên thao tác trên cùng product/location — cần lock optimistic/pessimistic hoặc kiểm tra version (row version) trước cập nhật.
- Returns / Refunds: cần model thêm CreditNote / ReturnOrder để xử lý trả hàng.
- Hàng theo lot/hạn dùng: nếu cần, mọi StockMove/InventoryRecord cần gắn batchId.

---

## Kết luận & bước tiếp theo
- Tài liệu này là nền tảng cho việc thiết kế schema và API. Bước tiếp theo:
  1. Phân tách rõ bảng/collection cho SQL vs NoSQL (ví dụ: InventoryRecord và transactional docs -> SQL; AuditLog, Log -> Elasticsearch/MongoDB).
  2. Viết các API contract (Request/Response) cho các thao tác chính: CRUD sản phẩm, tạo PO/SO, thực hiện StockMove, kiểm tra tồn và reservation.
  3. Nếu cần, tôi có thể chuyển phần này thành sơ đồ UML (Mermaid) hoặc tạo migration/schema mẫu (SQL/TypeORM) — cho tôi biết chọn option nào.

Nếu bạn muốn tôi chỉnh sửa tên trường, thêm thực thể hoặc xuất ra sơ đồ Mermaid/UML, nói rõ yêu cầu và tôi sẽ mở rộng ngay.

