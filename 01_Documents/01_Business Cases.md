## 1. Bối cảnh nghiệp vụ
Phần mềm Quản lý Kho được xây dựng nhằm hỗ trợ các doanh nghiệp vừa và nhỏ quản lý hàng tồn kho, theo dõi luồng di chuyển hàng hóa (nhập/xuất/tồn), quản lý sản phẩm, kho, giao dịch, đồng thời cung cấp chức năng phân quyền người dùng và báo cáo phục vụ quản trị.

## 2. Các vai trò, vấn đề, mục tiêu
### 2.1. Manager (Quản lý)
- **Vấn đề:**
	- Khó kiểm soát toàn bộ hệ thống nếu chỉ dựa vào báo cáo giấy tờ thủ công
	- Thiếu thông tin thời gian thực về tồn kho, giao dịch
	- Tổng hợp, phân tích dữ liệu mất nhiều thời gian
- **Mục tiêu:**
	- Quản lý toàn bộ hệ thống kho hiệu quả
	- Theo dõi báo cáo, trạng thái tồn kho (inventory status) kịp thời
	- Ra quyết định nhanh, chính xác dựa trên dữ liệu
- **Quy trình nghiệp vụ:**
	- Xem báo cáo tổng hợp trên hệ thống
	- Phân tích số liệu theo thời gian, sản phẩm, kho
	- Họp định kỳ với nhân viên kho, kiểm tra báo cáo giấy tờ thủ công

### 2.2. Quality Control Technician (Nhân viên kiểm soát chất lượng)
- **Vấn đề:**
	- Công việc giấy tờ thủ công, khó kiểm soát chất lượng hàng hóa khi nhập/xuất
	- Thiếu công cụ số hóa để theo dõi lỗi chất lượng, nguy cơ vi phạm quy trình
- **Mục tiêu:**
	- Đảm bảo hàng hóa đạt tiêu chuẩn chất lượng khi nhập kho/xuất kho
	- Ghi nhận, xử lý kịp thời các lỗi chất lượng
- **Quy trình nghiệp vụ:**
	- Kiểm tra chất lượng hàng hóa khi nhập kho, xuất kho
	- Ghi nhận lỗi trên hệ thống hoặc sổ tay thủ công
	- Báo cáo cho quản lý, đề xuất phương án xử lý hàng lỗi

### 2.3. Operator (Nhân viên kho)
- **Vấn đề:**
	- Dễ sai sót khi nhập/xuất hàng hóa nếu thao tác thủ công
	- Ghi nhận số lượng không chính xác, đối chiếu thủ công tốn thời gian
- **Mục tiêu:**
	- Thực hiện chính xác các thao tác nhập, xuất, cập nhật hàng hóa
	- Đảm bảo số liệu tồn kho luôn cập nhật đúng
- **Quy trình nghiệp vụ:**
	- Tạo phiếu nhập kho, xuất kho trên hệ thống hoặc ghi sổ tay
	- Cập nhật số lượng hàng hóa
	- Đối chiếu số liệu thực tế với hệ thống/sổ sách
	- Báo cáo sự cố hoặc sai lệch cho quản lý

### 2.4. IT Administrator (Quản trị hệ thống)
- **Vấn đề:**
	- Hệ thống bị gián đoạn, downtime ảnh hưởng đến vận hành
	- Mất dữ liệu, lỗi bảo mật
	- Khó bảo trì, nâng cấp hệ thống
- **Mục tiêu:**
	- Quản trị hệ thống, phân quyền người dùng
	- Đảm bảo hệ thống hoạt động liên tục, ổn định
	- Phòng tránh mất mát dữ liệu, backup định kỳ
- **Quy trình nghiệp vụ:**
	- Theo dõi, giám sát hệ thống
	- Thực hiện backup, phục hồi dữ liệu định kỳ (có thể thủ công hoặc tự động)
	- Xử lý sự cố, hỗ trợ người dùng
	- Nâng cấp, bảo trì hệ thống định kỳ

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
