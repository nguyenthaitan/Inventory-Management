# Workflow (Phiên bản đồng bộ với DB schema)

> Lưu ý: Các tên bảng/field trong ngoặc đơn dùng để tham chiếu kỹ thuật cho dev: ví dụ `products` (id, sku, name), `batches` (id, batchCode, productId, quantity, expiryDate, lotStatus), `stock_moves` (id, type, fromWarehouseId, toWarehouseId), `stock_move_lines` (stockMoveId, productId, quantity, batchId), `inventory_records` (productId, warehouseId, locationId, batchId, quantityAvailable, quantityReserved), `quality_controls` (id, batchId, inspectorUserId, testResults, status), `audit_logs` (userId, action, entityType, entityId, details), `backups` (id, type, createdAt, status).

---

## Các vai trò chính và mapping quyền
- Manager (role: `roles.name = "Manager"`) — có quyền duyệt/confirm `stock_moves`, duyệt `reports`, quản lý `users`.
- Operator (role: `roles.name = "Operator"`) — tạo `purchase_orders` / `stock_moves` (draft), thực hiện quét/nhập/xuất (tạo `stock_moves` với `createdBy`).
- Quality Control Technician (role: `roles.name = "QualityControl"`) — thực hiện `quality_controls` trên `batches`.
- IT Administrator (role: `roles.name = "ITAdmin"`) — quản lý `backups`, `audit_logs`, cấu hình hệ thống.

Mọi thao tác quan trọng (tạo/confirm/delete) phải ghi `audit_logs` (userId, action, entityType, entityId, details).

---

## 1. Quy trình Tạo và Xác nhận Phiếu Nhập (Receiving)

Mục tiêu: Khi nhận hàng, hệ thống phải tạo record lô, QC nếu cần, sinh label, tạo stock move để cập nhật tồn.

Step-by-step:
1. Operator tạo Purchase Order (PO) (bảng `purchase_orders` với lines chứa `productId`, `quantityOrdered`) — UI gọi endpoint tạo `purchase_orders`.
2. Khi hàng về kho, Operator tạo phiếu nhận (Receive) — tạo `stock_moves` (type = "IN", fromWarehouseId = supplier/null, toWarehouseId = warehouseId) và `stock_move_lines` (productId, quantityReceived, batchId (nếu đã có) hoặc tạo batch mới). (bảng `stock_moves`, `stock_move_lines`)
3. Nếu batch mới: tạo `batches` (batchCode, productId, supplierId, quantity, manufactureDate, expiryDate, lotStatus="Quarantine"). (bảng `batches`)
4. Sinh nhãn (label): tạo `labels` liên kết `batchId`, `productId`, `receiptDate`, `quantity`. (bảng `labels`)
5. Tự động tạo `quality_controls` record với `status = "Pending"` nếu quy tắc yêu cầu kiểm tra (ví dụ: hàng nhập phải QC theo `purchase_order` hoặc `product` policy). (bảng `quality_controls`)
6. Ghi `audit_logs` cho hành động tạo PO / Stock Move / Batch / QC. (bảng `audit_logs`)
7. Phiếu nhận lưu trạng thái `stock_moves.status = "Pending Confirmation"` cho phép người có quyền (Manager/role có permission) kiểm tra và Confirm. (bảng `stock_moves`, field `status`)

Xác nhận (Confirm):
1. Manager vào danh sách phiếu chờ (lọc `stock_moves.status = "Pending Confirmation"`).
2. Mở chi tiết, đối chiếu chứng từ (attachments) → nếu hợp lệ, nhấn "Confirm": hệ thống sẽ:
   - cập nhật `stock_moves.status = "Confirmed"`;
   - với mỗi `stock_move_line`: cập nhật hoặc tạo `inventory_records` tương ứng: `quantityAvailable += line.quantity` (với `productId`, `warehouseId`, `locationId`, `batchId`); nếu dùng reserve flow, có thể update `quantityReserved`. (bảng `inventory_records`)
   - ghi `audit_logs`. (bảng `audit_logs`)
3. Nếu không hợp lệ → từ chối (set `stock_moves.status = "Rejected"`) và ghi lý do (chi tiết trong `audit_logs` / `stock_moves.notes`).

Ghi chú kỹ thuật:
- Không cho phép thay đổi `inventory_records` trực tiếp ngoài `stock_moves` (all quantity changes must be via `stock_moves` type=IN/OUT/ADJUSTMENT).
- Nếu `batches.lotStatus = "Quarantine"`, `inventory_records` cho batch đó có thể bị locked (không cho xuất) cho tới khi QC pass.

---

## 2. Quy trình Kiểm soát chất lượng (QC)

Mục tiêu: Đảm bảo batch được kiểm tra trước khi cho vào lưu thông. QC thay đổi `batches.lotStatus` thông qua `quality_controls`.

Step-by-step:
1. Sau khi tạo `batches` với `lotStatus = "Quarantine"`, hệ thống tạo `quality_controls` (status = "Pending"). (bảng `quality_controls`)
2. QC Technician mở `quality_controls` liên quan tới `batchId`:
   - Thực hiện test, nhập `testResults` (JSON) gồm các chỉ tiêu (độ ẩm, hàm lượng, cảm quan...). (field `quality_controls.testResults`)
3. Ra quyết định:
   - Nếu Pass → cập nhật `quality_controls.status = "Pass"` và cập nhật `batches.lotStatus = "Accepted"`. Hệ thống unlock batch để `inventory_records` của batch có thể được sử dụng cho xuất.
   - Nếu Fail → cập nhật `quality_controls.status = "Fail"` và `batches.lotStatus = "Rejected"`; tạo phiếu trả hàng/hủy (ghi vào `stock_moves` type=ADJUSTMENT hoặc create return document). (bảng `quality_controls`, `batches`, `stock_moves`)
   - Nếu Hold → `quality_controls.status = "Hold"`; chờ Manager quyết định.
4. Ghi `audit_logs` cho mọi quyết định QC.

Truy vết & Certificate:
- Từ `batchId`, có thể xuất timeline: `batches` → `quality_controls` → `stock_moves` (IN/OUT) → `labels`. (Sử dụng liên kết id để phục vụ COA/traceability.)

---

## 3. Quy trình Xuất kho (Sales / Picking / Shipping)

Mục tiêu: Khi có Sales Order, reserve inventory, tạo pick/stock_move OUT, cập nhật `inventory_records`.

Step-by-step:
1. Sales Order (bảng `sales_orders`) được tạo/chốt; trước khi Confirm cần kiểm tra tồn: hệ thống reserve inventory bằng cách cập nhật `inventory_records.quantityReserved` hoặc tạo reservation record. (bảng `inventory_records`)
2. Khi bắt đầu picking: tạo `stock_moves` type = "OUT" (fromWarehouseId, toWarehouseId = customer/null) với `stock_move_lines` (productId, quantity, batchId nếu FEFO/lot-based). (bảng `stock_moves`, `stock_move_lines`)
3. Khi hoàn tất pick/ship: cập nhật `inventory_records.quantityAvailable -= shippedQty`; nếu có `quantityReserved`, giảm tương ứng. (bảng `inventory_records`)
4. Ghi `audit_logs` cho thao tác confirm/out.

FEFO logic:
- Chọn batch để xuất theo `batches.expiryDate` (prioritize earliest expiry) và `inventory_records.quantityAvailable` per batch.

---

## 4. Cập nhật/Điều chỉnh tồn kho (Adjustments & Inventory Count)

Mục tiêu: Mọi điều chỉnh phải có chứng từ (`stock_moves` type = "ADJUSTMENT") và lưu audit.

Step-by-step:
1. Khi phát hiện chênh lệch (từ kiểm kê hoặc phát hiện), tạo `stock_moves` type = "ADJUSTMENT" với `stock_move_lines` chi tiết (productId, batchId, deltaQuantity).
2. Khi `stock_moves` ADJUSTMENT được Confirm bởi role có quyền, hệ thống cập nhật `inventory_records.quantityAvailable` tương ứng.
3. Ghi `audit_logs` và nếu cần tạo `reports` (reportType = "inventory_adjustment").

---

## 5. Kiểm kê định kỳ (Cycle Count / Full Inventory Count)

Mục tiêu: Thực hiện kiểm kê, so khớp với `inventory_records`, sinh report, và tạo `stock_moves` ADJUSTMENT nếu cần.

Step-by-step:
1. Manager tạo đợt kiểm kê (tạo `reports` entry type = "inventory_count", `reports.parameters` chứa phạm vi: warehouseId, locationIds, productIds). (bảng `reports`)
2. Phân công Operator cho từng khu vực (ghi vào nhiệm vụ, liên kết userId → `users.assignedWarehouseIds`).
3. Operator thực hiện kiểm kê thực tế, nhập số liệu (per `productId` + `batchId` + `locationId`). Hệ thống so sánh với `inventory_records`.
4. Với mỗi chênh lệch, Manager xét duyệt và tạo `stock_moves` ADJUSTMENT để cập nhật `inventory_records`.
5. Hoàn tất: `reports.status = "Completed"`, lưu file (PDF/Excel) vào `reports.filePath`. Ghi `audit_logs`.

---

## 6. Cảnh báo tồn kho & Hết hạn (Alerts)

- Hệ thống định kỳ kiểm tra `inventory_records.quantityAvailable` và `batches.expiryDate` để tạo `stock_alerts` (alertType: LowStock | NearExpiry | Expired) khi thỏa điều kiện (dựa trên `products.lowStockThreshold` và `batches.expiryDate`).
- Manager có thể xem `stock_alerts` và tạo action (move, promotion, discard) — mọi action tạo `stock_moves` hoặc `quality_controls` tương ứng.

---

## 7. Quản lý user & phân quyền

Thao tác:
1. Tạo user → insert `users` (username, email, passwordHash, roleId, assignedWarehouseIds). Ghi `audit_logs`. (bảng `users`)
2. Sửa user/phân quyền → update `users.roleId` hoặc `users.assignedWarehouseIds`. Ghi `audit_logs`.
3. Khóa/mở khóa → update `users.status` hoặc `users.locked` (tùy schema), ghi `audit_logs`.

Quy tắc:
- Quá trình thay đổi quyền phải có trace (`audit_logs`) và thông báo cho người liên quan (nếu hệ thống hỗ trợ email).

---

## 8. Báo cáo & Truy vết (Reporting & Traceability)

- Các báo cáo chính (inventory, inbound/outbound, QC, supplier performance) lưu thành `reports` với `parameters` và `filePath`.
- Truy vết lô: từ `batchId` theo dõi `quality_controls`, `stock_moves` (IN/OUT), và `labels` để xuất timeline/COA.

Ví dụ fields để reference:
- `reports.reportType` = "inventory", "qc", "supplier_performance"
- `reports.generatedBy` = users.id
- `reports.parameters` = JSON filter (warehouseId, dateRange)

---

## 9. Nhật ký & Audit (Audit Logs)

- Mọi thao tác quan trọng (tạo/confirm/reject/adjust) phải lưu `audit_logs` (userId, action, entityType, entityId, timestamp, details).
- IT/Manager có thể tra cứu `audit_logs` theo user/time/action để phục vụ kiểm toán.

---

## 10. IT Admin — Sao lưu & Phục hồi (Backups & Restore)

- IT Admin kiểm tra `backups` (id, type, createdAt, status, filePath).
- Tạo lịch trình backup (table `backups` lưu metadata), kiểm tra `backups.status` (success/failure), và thực hiện restore theo record đã chọn.
- Ghi `audit_logs` cho mọi restore (restore là hành động nhạy cảm).

---

## Phụ lục: Bảng/Field thường tham chiếu trong workflows
- `users` (id, username, email, roleId, assignedWarehouseIds)
- `roles` (id, name, permissions)
- `products` (id, sku, name, lowStockThreshold)
- `batches` (id, batchCode, productId, supplierId, quantity, expiryDate, lotStatus)
- `labels` (id, batchId, productId, barcode, qrCode, receiptDate)
- `warehouses` (id, code, name)
- `locations` (id, warehouseId, code)
- `inventory_records` (id, productId, warehouseId, locationId, batchId, quantityAvailable, quantityReserved)
- `stock_moves` (id, code, type, fromWarehouseId, toWarehouseId, status, createdBy, createdAt)
- `stock_move_lines` (id, stockMoveId, productId, quantity, batchId)
- `quality_controls` (id, batchId, inspectorUserId, testResults, status, notes)
- `stock_alerts` (id, productId, warehouseId, alertType, threshold, currentQuantity)
- `reports` (id, reportType, generatedBy, parameters, filePath, status)
- `audit_logs` (id, userId, action, entityType, entityId, timestamp, details)
- `backups` (id, type, createdAt, status, filePath, retention)
