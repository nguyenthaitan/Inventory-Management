## HƯỚNG DẪN TRIỂN KHAI HỆ THỐNG QUẢN LÝ KHO

### 1. Giới thiệu
Tài liệu này hướng dẫn các bước triển khai hệ thống Quản lý kho lên môi trường thực tế.

### 2. Yêu cầu hệ thống
- Hệ điều hành: Windows/Linux
- Cài đặt Docker hoặc Node.js, npm (nếu chạy trực tiếp)
- Cơ sở dữ liệu: MySQL/PostgreSQL

### 3. Chuẩn bị môi trường
1. Tải mã nguồn từ repository:
	```bash
	git clone <đường dẫn repository>
	```
2. Cài đặt các phụ thuộc:
	```bash
	cd Inventory-Management
	npm install
	```

### 4. Cấu hình hệ thống
1. Tạo file `.env` và cấu hình các biến môi trường:
	```env
	DB_HOST=localhost
	DB_USER=root
	DB_PASS=yourpassword
	DB_NAME=inventory_db
	PORT=3000
	```

### 5. Khởi động hệ thống
- Nếu sử dụng Docker:
  ```bash
  docker-compose up -d
  ```
- Nếu chạy trực tiếp:
  ```bash
  npm start
  ```

### 6. Kiểm tra triển khai
Truy cập địa chỉ `http://localhost:3000` để kiểm tra hệ thống đã hoạt động.

### 7. Một số lỗi thường gặp
- Không kết nối được database: Kiểm tra lại cấu hình `.env` và trạng thái database.
- Port bị chiếm dụng: Đổi PORT trong file `.env`.

### 8. Thông tin liên hệ hỗ trợ
Nếu gặp khó khăn trong quá trình triển khai, vui lòng liên hệ nhóm phát triển qua email: support@inventory.com
