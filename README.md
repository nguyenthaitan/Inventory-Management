# Inventory Management

## Member

Thành viên nhóm:

| Họ và tên                     | MSSV     |
|-------------------------------|----------|
| Nguyễn Thái Tân (Nhóm trưởng) | 18127269 |
| Nguyễn Tuấn Minh              | 22127271 |
| Nguyễn Huy Tấn                | 22127380 |
| Phạm Văn Minh                 | 22127272 |
| Nguyễn Ngọc Giang             | 22127093 |
| Trần Gia Bảo                  | 22127034 |

## 1. Giới thiệu
Inventory Management Web Application là một hệ thống web dùng để **quản lý hàng tồn kho**, hỗ trợ theo dõi **nhập – xuất – tồn**, quản lý **sản phẩm, kho, giao dịch mua bán**, phân quyền người dùng và cung cấp **báo cáo – thống kê** cho quản lý.

Hệ thống được xây dựng theo mô hình **Web Application hiện đại**, phù hợp cho cửa hàng, doanh nghiệp vừa và nhỏ hoặc làm đồ án môn **Công nghệ phần mềm / Web nâng cao**.

---

## 2. Mục tiêu hệ thống
- Quản lý chính xác số lượng hàng tồn kho
- Giảm sai sót trong nhập – xuất hàng
- Phân quyền người dùng rõ ràng
- Cung cấp báo cáo doanh thu và tồn kho
- Dễ mở rộng và bảo trì

---

## 3. Đối tượng sử dụng
- **Admin**: Quản trị hệ thống, quản lý người dùng
- **Nhân viên kho**: Nhập kho, xuất kho, kiểm kê
- **Manager**: Theo dõi báo cáo, doanh thu
- **User**: Chỉ xem dữ liệu được phân quyền

---

## 4. Chức năng chính

### 4.1 Xác thực & phân quyền
- Đăng nhập / đăng xuất
- Quản lý tài khoản người dùng
- Phân quyền theo vai trò (Role-based Access Control)
- Đổi mật khẩu

---

### 4.2 Quản lý sản phẩm
- Thêm / sửa / xóa sản phẩm
- Quản lý mã sản phẩm (SKU)
- Danh mục sản phẩm
- Giá mua, giá bán
- Trạng thái sản phẩm

---

### 4.3 Quản lý kho
- Tạo và quản lý kho
- Quản lý vị trí trong kho
- Gán nhân viên phụ trách kho

---

### 4.4 Quản lý tồn kho
- Theo dõi tồn kho theo sản phẩm và kho
- Hiển thị số lượng tồn khả dụng
- Cảnh báo hàng sắp hết

---

### 4.5 Nhập kho
- Tạo phiếu nhập kho
- Nhập từ nhà cung cấp hoặc trả hàng
- Nhập nhiều sản phẩm trong một phiếu
- Lưu lịch sử nhập kho

---

### 4.6 Xuất kho
- Tạo phiếu xuất kho
- Xuất bán hàng hoặc chuyển kho
- Kiểm tra tồn kho trước khi xuất
- Lưu lịch sử xuất kho

---

### 4.7 Mua – bán & hóa đơn
- Tạo giao dịch mua
- Tạo giao dịch bán
- Tạo và quản lý hóa đơn
- Lưu lịch sử giao dịch

---

### 4.8 Nhà cung cấp
- Thêm / sửa / xóa nhà cung cấp
- Xem lịch sử giao dịch với nhà cung cấp

---

### 4.9 Báo cáo & thống kê
- Báo cáo nhập – xuất – tồn
- Báo cáo doanh thu
- Thống kê theo thời gian, sản phẩm, kho
- Xuất báo cáo (Excel / CSV)

---

### 4.10 Audit log
- Ghi lại lịch sử thao tác người dùng
- Theo dõi thay đổi dữ liệu hệ thống

---

## 5. Công nghệ sử dụng

### Frontend
- React
- HTML, CSS, JavaScript

### Backend
- Node.js
- NestJS
- TypeScript

### Database & Hệ thống hỗ trợ
- MongoDB (dữ liệu chính)
- MySQL (giao dịch, báo cáo)
- Redis (cache)
- Elasticsearch (log & search)

---

## 6. Kiến trúc hệ thống
- Client – Server
- RESTful API
- Authentication bằng JWT
- Role-based Authorization

---

## 7. Cài đặt & chạy dự án (tham khảo)

```bash
# Cài đặt backend
npm install
npm run start:dev

```
