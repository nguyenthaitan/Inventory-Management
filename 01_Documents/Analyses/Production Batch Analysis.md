# Phân tích và Kế hoạch lập trình module Production Batch

## Mục tiêu
Xây dựng module Production Batch trong backend NestJS để quản lý thông tin lô sản xuất và thành phần nguyên liệu (Batch Components). Module này bao gồm CRUD đầy đủ cho cả ProductionBatch và BatchComponent, validation, repository, service và controller. Ngoài ra cần tests và tích hợp với frontend.

## Các bước thực hiện

1. **Thiết kế schema và DTO**
   - Schema `production-batch.schema.ts` đã tồn tại trong `backend/src/schemas`.
   - Các trường hiện có:
     - `batch_id` (string 36, UUID, PK, unique, required)
     - `product_id` (string 20, FK->Materials, required)
     - `batch_number` (string 50, unique, required)
     - `unit_of_measure` (string 10, required)
     - `manufacture_date` (Date, required)
     - `expiration_date` (Date, required)
     - `status` (enum: In Progress, Complete, On Hold, Cancelled, required)
     - `batch_size` (Decimal128, required)
     - `created_date` / `modified_date` (Date, timestamps tự động)
   - Schema `batch-component.schema.ts` đã tồn tại trong `backend/src/schemas`.
   - Các trường BatchComponent hiện có:
     - `component_id` (string 36, UUID, PK, unique, required)
     - `batch_id` (string 36, FK->ProductionBatch, required)
     - `lot_id` (string 36, FK->InventoryLot, required)
     - `planned_quantity` (Decimal128, required)
     - `actual_quantity` (Decimal128, nullable)
     - `unit_of_measure` (string 10, required)
     - `addition_date` (Date, nullable)
     - `added_by` (string 50, nullable)
     - `created_date` / `modified_date` (Date, timestamps tự động)
   - Tạo DTOs trong `backend/src/production-batch/dto`:
     - `create-production-batch.dto.ts` — validate đầu vào tạo batch.
     - `update-production-batch.dto.ts` — validate đầu vào cập nhật batch (partial).
     - `create-batch-component.dto.ts` — validate thêm thành phần vào batch.
     - `update-batch-component.dto.ts` — validate cập nhật thành phần (partial).
   - Sử dụng `class-validator` cho các rules (required, enum, IsUUID, IsDateString, IsPositive...).

2. **Repository**
   - Tạo file `production-batch.repository.ts` và implement đầy đủ các phương thức.
   - Tạo `batch-component.repository.ts` dưới `backend/src/production-batch`.
   - ProductionBatchRepository: `findAll` (phân trang), `findOne` (theo batch_id), `findByBatchNumber`, `create`, `update`, `remove`, `findByProductId`, `findByStatus`.
   - BatchComponentRepository: `findByBatchId`, `findOne` (theo component_id), `findOneByBatch`, `create`, `update`, `remove`.
   - Dùng Mongoose Model injection (`@InjectModel`).

3. **Service**
   - Implement đầy đủ cho file `production-batch.service.ts`.
   - Tạo `batch-component.service.ts` dưới `backend/src/production-batch`.
   - Tạo `production-batch.dto.ts` chứa response DTOs (ProductionBatchResponseDto, BatchComponentResponseDto, PaginatedProductionBatchResponseDto).
   - ProductionBatchService:
     - Kiểm tra `batch_number` unique khi tạo.
     - Kiểm tra `expiration_date` phải sau `manufacture_date`.
     - Kiểm tra `product_id` tồn tại trong Materials (tham chiếu chéo, inject Material model).
     - Không cho phép xóa batch đang ở trạng thái `In Progress`.
     - Hỗ trợ thay đổi `status` theo state machine (In Progress → Complete/On Hold/Cancelled).
   - BatchComponentService:
     - Kiểm tra `batch_id` tồn tại trong ProductionBatch.
     - Kiểm tra `lot_id` tồn tại trong InventoryLot (inject InventoryLot model).
     - Kiểm tra `planned_quantity` > 0 (handled by DTO validator).
     - Tự động điền `addition_date` khi tạo nếu không có.
   - Dùng DI (dependency injection) qua constructor.

4. **Controller**
   - File `production-batch.controller.ts`.
   - Routes cho ProductionBatch: `GET /production-batches`, `GET /production-batches/:id`, `GET /production-batches/product/:productId`, `GET /production-batches/status/:status`, `POST /production-batches`, `PATCH /production-batches/:id`, `DELETE /production-batches/:id`.
   - Routes cho BatchComponent (nested): `GET /production-batches/:id/components`, `GET /production-batches/:id/components/:componentId`, `POST /production-batches/:id/components`, `PATCH /production-batches/:id/components/:componentId`, `DELETE /production-batches/:id/components/:componentId`.
   - Áp dụng `ValidationPipe`, đúng HTTP status codes (`HttpCode`), xử lý `ParseIntPipe` cho query params phân trang.

5. **Module**
   - File `production-batch.module.ts` đăng ký schema Mongoose.
   - Import `MongooseModule.forFeature` với `ProductionBatch`, `BatchComponent` schemas.
   - Đăng ký provider `ProductionBatchRepository`, `BatchComponentRepository`, `BatchComponentService`.
   - Export `ProductionBatchService` (đã có), bổ sung export `BatchComponentService`.
   - `ProductionBatchModule` đã được import trong `app.module.ts`.

6. **Validation & Pipes**
   - Sử dụng `ValidationPipe` cục bộ tại từng endpoint hoặc theo convention của dự án.
   - Kiểm tra `batch_number` unique trong service logic (pattern giống `material_id` / `part_number`).
   - Kiểm tra business rule ngày tháng: `expiration_date > manufacture_date`.
   - Kiểm tra tham chiếu hợp lệ: `product_id` trong Materials, `lot_id` trong InventoryLot.

7. **Testing**
   - Viết unit test `production-batch.service.spec.ts` trong `backend/src/production-batch`.
   - Viết unit test `batch-component.service.spec.ts` trong `backend/src/production-batch`.
   - Tham khảo `material.create.spec.ts` trong `backend/src/unit-test` để làm mẫu.
   - Coverage tối thiểu: create (happy path + duplicate batch_number + invalid date range), update status, remove (khi In Progress phải bị chặn), thêm/xóa component.

8. **Frontend tích hợp** (nếu triển khai sau):
   - Tạo `productionBatchService.ts` trong `frontend/src/services`.
   - Thêm các trang quản lý trong `frontend/src/pages/manager/production-batches/`:
     - `List.tsx` — danh sách batch, filter theo status/product.
     - `Detail.tsx` — chi tiết batch + danh sách BatchComponents.
     - `FormPage.tsx` — form tạo/sửa batch.
   - Thêm route trong router và liên kết với Sidebar.
   - Cân nhắc integrate với InventoryLot để chọn lot khi thêm component.

9. **Document & Seed Data**
   - Nếu cần seed data: bổ sung vào `database/mongo-init.js` một vài production batches mẫu tương ứng với materials đã seed sẵn.

10. **Observability**
    - Logging bằng NestJS `Logger` tại từng method trong service và repository (theo pattern module `material`).
    - Error handling chuẩn: `NotFoundException`, `ConflictException`, `BadRequestException` — không để lộ stack trace ra response.

## Timeline tóm tắt
1. Ngày 1: Hoàn thiện DTOs, implement Repository (ProductionBatch + BatchComponent), cập nhật Module.
2. Ngày 2: Implement Service (ProductionBatch + BatchComponent) với đầy đủ business logic và validation.
3. Ngày 3: Hoàn thiện Controller (thay thế placeholder, thêm nested routes cho BatchComponent).
4. Ngày 4: Tests (unit test cho cả hai service).
5. Ngày 5: Frontend integration (service, pages, router) + review, refactor, chuẩn hoá coding standards.

## Ghi chú
- Tuân theo coding standards đã mô tả trong tài liệu `07_Coding Standards.md`.
- Tham khảo module `material` để đồng bộ pattern (repository, service, controller, DTO, Logger).
- BatchComponent là entity phụ thuộc vào ProductionBatch — nên đặt repository/service vào cùng folder `production-batch/`.
- State machine cho `status`: chỉ cho phép chuyển trạng thái hợp lệ (ví dụ `Complete` không thể chuyển về `In Progress`).
- Decimal128 cần xử lý cẩn thận khi serialize JSON — chuyển sang `number` hoặc `string` trong response DTO.
- Tham chiếu chéo với MaterialModule cần inject `MaterialService` hoặc dùng `MaterialRepository` trực tiếp — cân nhắc circular dependency.

> File này lưu trữ kế hoạch và phân tích chi tiết cho module Production Batch.