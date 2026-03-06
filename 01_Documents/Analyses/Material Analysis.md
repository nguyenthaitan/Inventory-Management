# Phân tích và Kế hoạch lập trình module Material

## Mục tiêu
Xây dựng module Material trong backend NestJS để quản lý thông tin vật tư (SKU). Module này bao gồm CRUD, validation, repository, service và controller. Ngoài ra cần tests và tương tác với frontend nếu có.

## Các bước thực hiện

1. **Thiết kế schema và DTO** 
   - Tạo Mongoose schema `material.schema.ts` tồn tại trong `backend/src/schemas`. (x)
   - Định nghĩa các trường (x):
    - `material_id` (string 20, PK)
    - `part_number` (string 20, unique, required)
    - `material_name` (string 100, required)
    - `material_type` (enum: API, Excipient, Dietary Supplement, Container, Closure, Process Chemical, Testing Material)
    - `storage_conditions` (string 100, nullable)
    - `specification_document` (string 50, nullable)
    - `created_date` / `modified_date` (Date, default now)
   - Tạo DTOs: `create-material.dto.ts`, `update-material.dto.ts` trong `backend/src/material/dto` (x).
   - Sử dụng class-validator để thêm rules (required, enums...) (x).

2. **Repository**
   - Tạo `material.repository.ts` dưới `backend/src/material` với phương thức truy vấn cơ bản: findAll, findOne, create, update, remove (x).
   - Dùng Mongoose Model injection (x).

3. **Service**
   - Tạo `material.service.ts` xử lý logic: kiểm tra unique material_code, các business rule (x).
   - Nhúng repository via DI (x).
   - Thêm phương thức tương ứng cho CRUD (x).

4. **Controller**
   - `material.controller.ts` với các route: GET /materials, GET /materials/:id, POST /materials, PATCH /materials/:id, DELETE /materials/:id (x).
   - Áp dụng validation pipe, JWT/AuthGuard/RoleGuard nếu cần, tham khảo pattern module khác.

5. **Module**
   - Cập nhật `material.module.ts` import services, controllers, schemas (x). 
   - Đăng ký vào `app.module.ts` nếu chưa (x). 

6. **Validation & Pipes**
   - Sử dụng `ValidationPipe` toàn cục hoặc cục bộ.
   - Kiểm tra xem material_code unique - có thể qua decorator custom hoặc service logic.

7. **Testing**
   - Thực hiện unit test cho service `material.service.spec.ts` (x).
   - Thử e2e test trong `test/app.e2e-spec.ts` thêm phần cho materials.

8. **Frontend tích hợp** (nếu triển khai sau):
   - Cập nhật `materialService.ts` ở frontend (x).
   - Thêm các component MaterialList, MaterialDetail, MaterialForm đã có.
   - Router và pages.

9. **Document & Migrations**
   - Nếu cần seed data: thêm script trong `mongo-init.js` để tạo vài materials.

10. **Observability**
   - Logging, error handling chuẩn theo pattern.

## Timeline tóm tắt
1. Ngày 1: Schema, DTO, repo, module.
2. Ngày 2: Service + controller + validation.
3. Ngày 3: Tests (unit + e2e).
4. Ngày 4: Frontend integration + docs.
5. Ngày 5: Review, refactor, chuẩn hoá coding standards.

## Ghi chú
- Tuân theo coding standards đã mô tả trong tài liệu `07_Coding Standards.md`.
- Liên quan tới UI: sử dụng component tách sẵn và service hiện có; phân phân role nếu cần.
- Có thể tham khảo module `inventory-lot` để pattern.

> File này lưu trữ kế hoạch và phân tích chi tiết cho module Material.