# Phân tích và Kế hoạch lập trình module Inventory Transaction

## Mục tiêu

Xây dựng module `Inventory Transaction` trong backend NestJS để quản lý các giao dịch tồn kho (nhập, xuất, điều chỉnh, chuyển kho). Module bao gồm schema, DTOs, repository, service, controller, validation, business rules (kiểm tra tồn trước khi xuất), audit trail, event publishing và tests.

## Các bước thực hiện

1. **Thiết kế schema và DTO**
   - Tạo Mongoose schema `inventory-transaction.schema.ts` dưới `backend/src/schemas` hoặc `backend/src/inventory-transaction/schemas`.
   - Định nghĩa các trường chính:
     - `transaction_id` (string, PK, TTL/UUID hoặc mã theo chuẩn, ví dụ 24)
     - `transaction_type` (enum: `INBOUND`, `OUTBOUND`, `ADJUSTMENT`, `TRANSFER`)
     - `material_id` (ObjectId/Ref -> `Material`)
     - `lot_id` (ObjectId/Ref -> `InventoryLot`, nullable)
     - `quantity` (number, >0)
     - `unit` (string, ví dụ `pcs`, `kg`)
     - `source_location` (string, nullable)
     - `destination_location` (string, nullable)
     - `related_document` (string, reference to PO/WO/GRN, nullable)
     - `performed_by` (string / ObjectId -> `User`)
     - `performed_date` (Date, default now)
     - `reason` (string, nullable, cho `ADJUSTMENT`)
     - `metadata` (mixed, optional)
     - `created_date` / `modified_date` (Date, default now)
   - Tạo DTOs: `create-inventory-transaction.dto.ts`, `update-inventory-transaction.dto.ts` trong `backend/src/inventory-transaction/dto`.
   - Dùng `class-validator` để validate `transaction_type`, `quantity` > 0, `material_id` required cho hầu hết loại giao dịch.

2. **Repository**
   - Tạo `inventory-transaction.repository.ts` với các phương thức chính: `findAll`, `findOne`, `findByMaterial`, `findByDateRange`, `create`, `update`, `remove`, `createMany`.
   - Hỗ trợ truy vấn phân trang, filter theo `material_id`, `transaction_type`, `performed_date` range.

3. **Service**
   - Tạo `inventory-transaction.service.ts` xử lý logic:
     - Kiểm tra và áp dụng business rules trước khi ghi transaction (vd. kiểm tra tồn kho đủ cho `OUTBOUND`).
     - Khi `OUTBOUND`: xác định lot(s) để giảm theo policy (FIFO / FEFO), hoặc sử dụng `lot_id` nếu chỉ định.
     - Với `TRANSFER`: tạo hai transaction (one OUTBOUND from source, one INBOUND to destination) hoặc xử lý atomic transaction.
     - Với `ADJUSTMENT`: ghi audit reason, không sửa đổi bên ngoài.
     - Publish sự kiện (event-bus) sau khi transaction thành công để cập nhật `InventoryLot`/Material stock, logs, search index.
   - Nhúng repository và các repository liên quan (`InventoryLotRepository`, `MaterialRepository`) bằng DI.

4. **Controller**
   - `inventory-transaction.controller.ts` với route:
     - `GET /transactions` — list (filter, paging)
     - `GET /transactions/:id` — detail
     - `POST /transactions` — tạo transaction đơn
     - `POST /transactions/bulk` — tạo nhiều transaction (import/scan)
     - `PATCH /transactions/:id` — cập nhật (chỉ cho sửa metadata/reason, không thay đổi lịch sử quan trọng trừ khi có audit)
     - `DELETE /transactions/:id` — xóa mềm (mark deleted) hoặc cấm xóa nếu đã affect stock; prefer soft-delete
   - Áp dụng `ValidationPipe`, `AuthGuard`, và `RolesGuard` nếu cần.

5. **Module**
   - Tạo `inventory-transaction.module.ts`, import schema, provider cho repository, service, controller.
   - Đăng ký vào `app.module.ts` nếu cần hoặc lazy-load theo feature module pattern.

6. **Validation & Business Rules**
   - Sử dụng `ValidationPipe` để validate DTOs.
   - Thực hiện kiểm tra stock trong service trước khi commit `OUTBOUND`. Nếu không đủ, trả lỗi rõ ràng (`409 Conflict` hoặc domain error).
   - Đảm bảo atomicity: dùng transaction session của Mongo / two-phase update khi cần (ví dụ rollback khi cập nhật lot thất bại).

7. **Testing**
   - Unit tests cho `inventory-transaction.service.spec.ts` (kiểm tra rules: outbound fail when insufficient stock, transfer creates two transactions, adjustment logs reason).
   - E2E tests trong `test/app.e2e-spec.ts` hoặc thêm file e2e riêng để cover create->affect-lot workflow.

8. **Frontend tích hợp**
   - Cập nhật/tao `transactionService.ts` ở frontend để gọi API mới.
   - Thêm components: `TransactionList`, `TransactionDetail`, `TransactionForm` (hỗ trợ tạo bulk via CSV/import/scan barcode).
   - Thêm routes và permission handling.

9. **Seed / Migrations**
   - Nếu cần seed data hoặc migration (ví dụ khi thêm new fields), thêm script vào `database/mongo-init.js` hoặc migration script riêng.

10. **Observability & Auditing**

- Ghi audit trail cho mọi thay đổi quan trọng (performed_by, reason, related_document).
- Publish events to `event-bus` (Rabbit/Kafka/Redis) để các service khác (search index, analytics) cập nhật.
- Thêm structured logging khi transaction fail/rollback.

## Timeline tóm tắt

1. Ngày 1: Thiết kế schema, DTOs, repository và module.
2. Ngày 2: Service + controller + validation + business rules (stock checks, transfer logic).
3. Ngày 3: Tests (unit + e2e), seed scripts.
4. Ngày 4: Frontend integration + docs + review.

## Ghi chú

- Tuân theo chuẩn coding trong `07_Coding Standards.md`.
- Tham khảo `material` và `inventory-lot` module để đồng bộ schema, DTO và event patterns.
- Tránh xóa cứng transaction đã affect stock; ưu tiên soft-delete và audit.
- Cân nhắc performance khi query lịch sử nhiều bản ghi: add index cho `material_id`, `performed_date`, `transaction_type`.

> File này lưu trữ kế hoạch và phân tích chi tiết cho module Inventory Transaction.
