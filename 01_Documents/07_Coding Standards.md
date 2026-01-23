## Chuẩn mã nguồn và quy ước phát triển dự án

### 1. Mục tiêu
Thiết lập các quy tắc và chuẩn mã nguồn nhằm đảm bảo chất lượng, tính nhất quán, dễ bảo trì và mở rộng cho dự án Quản lý Kho.

### 2. Chuẩn mã nguồn chung
- Sử dụng đặt tên biến, hàm, class rõ ràng, có ý nghĩa, theo chuẩn camelCase (JavaScript/TypeScript) hoặc snake_case (Python)
- Đặt tên file, thư mục ngắn gọn, phản ánh đúng nội dung
- Mỗi hàm chỉ thực hiện một nhiệm vụ (Single Responsibility)
- Hạn chế lặp mã, ưu tiên tái sử dụng hàm, module
- Viết chú thích rõ ràng cho các hàm phức tạp, class, module
- Không sử dụng mã nguồn "cứng" (hard-code), thay vào đó dùng biến cấu hình
- Đảm bảo mã nguồn không chứa thông tin nhạy cảm (mật khẩu, key...)
- Sử dụng cấu trúc thư mục hợp lý: tách riêng các phần frontend, backend, database, tài liệu

### 3. Quy ước mã nguồn cho từng công nghệ
#### 3.1. JavaScript/TypeScript (React, Node.js, NestJS)
- Sử dụng camelCase cho biến, hàm, thuộc tính
- Sử dụng PascalCase cho tên class, component
- Sử dụng const/let thay cho var
- Ưu tiên sử dụng arrow function khi phù hợp
- Sử dụng async/await thay cho callback
- Đảm bảo kiểm tra null/undefined trước khi truy cập thuộc tính
- Sử dụng TypeScript để kiểm tra kiểu dữ liệu

#### 3.2. Python
- Sử dụng snake_case cho biến, hàm
- Sử dụng PascalCase cho class
- Viết docstring cho hàm, class
- Tuân thủ PEP8 về khoảng trắng, độ dài dòng, đặt tên

#### 3.3. SQL
- Đặt tên bảng, cột rõ ràng, nhất quán
- Sử dụng chữ thường, phân tách bằng dấu gạch dưới
- Viết câu truy vấn ngắn gọn, dễ hiểu

### 4. Công cụ đảm bảo chuẩn mã nguồn
- **ESLint**: Kiểm tra và enforce quy tắc mã nguồn cho JavaScript/TypeScript
- **Prettier**: Định dạng mã nguồn tự động, đảm bảo nhất quán
- **EditorConfig**: Thiết lập quy tắc định dạng chung cho nhiều IDE
- **Husky**: Thiết lập pre-commit hook để kiểm tra mã nguồn trước khi đẩy lên repository
- **TypeScript**: Kiểm tra kiểu dữ liệu, giảm lỗi runtime
- **PEP8 linter**: Kiểm tra chuẩn mã nguồn Python
- **Git**: Quản lý phiên bản, kiểm tra lịch sử thay đổi

### 5. Quy trình kiểm tra mã nguồn
1. Mã nguồn phải được kiểm tra bằng các công cụ lint trước khi commit
2. Tất cả pull request phải được review bởi ít nhất một thành viên khác
3. Không merge nếu có lỗi lint hoặc không đạt chuẩn mã nguồn
4. Định kỳ kiểm tra lại các quy tắc và cập nhật nếu cần
## Coding Standards Draft

### 1. General Principles
- Code must be clear, readable, and maintainable.
- Use English for code, comments, and documentation (except UI/UX text for end-users).
- Follow DRY (Don't Repeat Yourself) and KISS (Keep It Simple, Stupid) principles.
- Use version control (Git) for all source code.

### 2. Frontend (React, JavaScript, CSS)
- Use functional components and React Hooks.
- Use TypeScript for type safety.
- Follow Airbnb JavaScript/React style guide.
- Use SCSS or CSS Modules for styling; avoid inline styles.
- Name components and files in PascalCase.
- Use ESLint and Prettier for code formatting and linting.
- Write meaningful commit messages.

### 3. Backend (Node.js, NestJS, TypeScript)
- Use TypeScript for all backend code.
- Follow NestJS best practices for module, controller, and service structure.
- Use dependency injection provided by NestJS.
- Name files in kebab-case, classes in PascalCase, variables/functions in camelCase.
- Validate all API inputs (DTOs, validation pipes).
- Use async/await for asynchronous code.
- Handle errors with try/catch and proper logging.
- Use ESLint and Prettier for code formatting and linting.

### 4. Database (MongoDB, MySQL)
- Use clear, consistent naming for collections/tables and fields (snake_case or camelCase, be consistent).
- Define indexes for frequently queried fields.
- Use migrations for schema changes (where applicable).
- Avoid storing sensitive data in plain text.

### 5. Documentation & Comments
- Write JSDoc/TSDoc comments for all public functions, classes, and modules.
- Document API endpoints (e.g., with Swagger/OpenAPI for backend).
- Use README files for module-level documentation.
- Keep documentation up to date with code changes.

### 6. Testing
- Write unit tests for core logic (Jest for backend, React Testing Library for frontend).
- Use descriptive test names and group related tests.
- Ensure tests are repeatable and independent.

---
*This draft should be reviewed and updated by the team to fit project-specific needs.*
