## 1. Bối cảnh nghiệp vụ
Phần mềm Quản lý Kho được xây dựng nhằm hỗ trợ các doanh nghiệp vừa và nhỏ quản lý hàng tồn kho, theo dõi luồng di chuyển hàng hóa (nhập/xuất/tồn), quản lý sản phẩm, kho, giao dịch, đồng thời cung cấp chức năng phân quyền người dùng và báo cáo phục vụ quản trị.

## 2. Các vai trò, vấn đề, mục tiêu
### 2.1. Quản trị viên (Admin)
- **Vấn đề:** Quản lý người dùng, thiết lập hệ thống, kiểm soát truy cập, đảm bảo an toàn dữ liệu.
- **Mục tiêu:**
	- Quản lý tài khoản, phân quyền hợp lý
	- Giám sát hoạt động hệ thống
	- Đảm bảo dữ liệu chính xác, bảo mật
- **Quy trình nghiệp vụ:**
	- Tạo/sửa/xóa tài khoản người dùng
	- Phân quyền vai trò
	- Theo dõi nhật ký hệ thống
	- Quy trình thủ công: Kiểm tra định kỳ các thay đổi hệ thống, xác thực thông tin người dùng mới

### 2.2. Nhân viên kho
- **Vấn đề:** Quản lý nhập/xuất hàng, kiểm tra tồn kho, cập nhật số liệu thực tế.
- **Mục tiêu:**
	- Thực hiện chính xác các giao dịch nhập/xuất
	- Giảm sai sót khi ghi nhận số lượng
	- Đảm bảo tồn kho phản ánh đúng thực tế
- **Quy trình nghiệp vụ:**
	- Tạo phiếu nhập kho, xuất kho
	- Kiểm tra số lượng thực tế so với hệ thống
	- Cập nhật tồn kho
	- Quy trình thủ công: Kiểm kho định kỳ, đối chiếu sổ sách với thực tế

### 2.3. Quản lý
- **Vấn đề:** Giám sát hoạt động kinh doanh, phân tích báo cáo, ra quyết định.
- **Mục tiêu:**
	- Theo dõi doanh thu, tồn kho, hiệu quả hoạt động
	- Phát hiện sớm các vấn đề (hàng tồn, thiếu hụt, sai lệch)
	- Đưa ra quyết định dựa trên dữ liệu
- **Quy trình nghiệp vụ:**
	- Xem báo cáo tổng hợp
	- Phân tích số liệu theo thời gian, sản phẩm, kho
	- Quy trình thủ công: Họp định kỳ với nhân viên kho, kiểm tra báo cáo giấy tờ

### 2.4. Người dùng (User)
- **Vấn đề:** Truy cập thông tin theo phân quyền, sử dụng dữ liệu phục vụ công việc.
- **Mục tiêu:**
	- Xem thông tin sản phẩm, kho, giao dịch phù hợp với vai trò
	- Đảm bảo quyền truy cập đúng quy định
- **Quy trình nghiệp vụ:**
	- Đăng nhập hệ thống
	- Xem dữ liệu được cấp quyền

## 3. Các luồng quy trình nghiệp vụ nhóm sẽ xây dựng
### 3.1. Quy trình nhập kho
1. Nhân viên kho kiểm tra hàng thực tế
2. Tạo phiếu nhập kho trên hệ thống
3. Quản trị viên xác nhận nếu cần
4. Cập nhật số lượng tồn kho
5. Đối chiếu với sổ sách thủ công

### 3.2. Quy trình xuất kho
1. Nhân viên kho nhận yêu cầu xuất hàng
2. Kiểm tra số lượng tồn kho
3. Tạo phiếu xuất kho trên hệ thống
4. Quản trị viên xác nhận nếu cần
5. Cập nhật số lượng tồn kho
6. Đối chiếu với sổ sách thủ công

### 3.3. Quy trình kiểm kho định kỳ
1. Nhân viên kho kiểm tra thực tế số lượng hàng hóa
2. Đối chiếu với số liệu hệ thống
3. Báo cáo sai lệch cho quản trị viên
4. Quản trị viên xử lý sai lệch

### 3.4. Quy trình quản lý sản phẩm
1. Quản trị viên/nhân viên kho thêm/sửa/xóa sản phẩm
2. Cập nhật thông tin SKU, giá mua/bán, trạng thái sản phẩm

### 3.5. Quy trình quản lý nhà cung cấp
1. Quản trị viên/nhân viên kho thêm/sửa/xóa nhà cung cấp
2. Theo dõi lịch sử giao dịch với nhà cung cấp

### 3.6. Quy trình báo cáo
1. Quản lý truy cập báo cáo doanh thu, tồn kho, nhập/xuất
2. Phân tích số liệu theo thời gian, sản phẩm, kho
3. Xuất báo cáo ra Excel/CSV

### 3.8. Quy trình Quản lý Thuế & Hóa đơn điện tử
1. Đầu vào: Khi tạo Phiếu nhập kho -> Bắt buộc nhập thông tin/upload ảnh Hóa đơn đỏ (VAT) từ nhà cung cấp -> Hệ thống liên kết Lô hàng với Hóa đơn này.
2. Đầu ra: Khi hoàn thành Phiếu xuất kho/Bán hàng -> Hệ thống tự động gom đơn, gửi dữ liệu sang nhà cung cấp Hóa đơn điện tử (MISA/Viettel...) để phát hành hóa đơn.
3. Nhận về "Mã cơ quan thuế" và lưu vào lịch sử giao dịch.

## 4. Công nghệ sử dụng (tham khảo)
- **Frontend**: React, HTML, CSS, JavaScript
- **Backend**: Node.js, NestJS, TypeScript
- **Database**: MongoDB, MySQL
- **Hệ thống hỗ trợ**: Redis (cache), Elasticsearch (log & tìm kiếm)

## 5. Tiêu chí thành công
- Hệ thống được các vai trò sử dụng hiệu quả
- Độ chính xác tồn kho được cải thiện
- Báo cáo được sử dụng cho quyết định kinh doanh
- Phân quyền và bảo mật được đảm bảo
