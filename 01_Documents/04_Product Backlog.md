# Manager
## Quản lý inventory theo quy định pháp luật
### 1. Kiểm tra thông tin hàng hóa
* **Mô tả:** Cung cấp giao diện tra cứu tập trung giúp Manager truy xuất toàn bộ thông tin định danh và trạng thái của sản phẩm trong kho phục vụ mục tiêu quản lý theo pháp luật.
* **Yêu cầu kỹ thuật:**
    * Xây dựng bộ lọc đa điều kiện (Search Engine): Hỗ trợ tìm kiếm theo SKU (Stock Keeping Unit), tên hàng (fuzzy search), loại hàng, và nhà cung cấp.
    * Giao diện Dashboard Detail: Hiển thị thông tin theo cấu trúc: Thông tin chung -> Trạng thái tồn kho -> Vị trí lưu trữ -> Lịch sử biến động.
    * Tính năng Export: Tích hợp thư viện xuất file (như Excel hoặc định dạng PDF) đảm bảo giữ nguyên định dạng bảng biểu.
* **Dữ liệu liên quan:** Mã hàng (SKU), Tên, Loại, Số lượng tồn, Vị trí (Bin/Rack), Ngày nhập, Hạn sử dụng, Trạng thái (Available/Reserved/Damaged), Lịch sử giao dịch (Transaction Log).
* **Tiêu chí chấp nhận:** Manager có thể tìm thấy thông tin sản phẩm trong vòng dưới 2 giây và file xuất ra phải đầy đủ các trường thông tin đang hiển thị.

### 2. Kiểm tra số lượng tồn kho
* **Mô tả:** Cho phép giám sát chi tiết số lượng hàng hóa thực tế tại từng vị trí kho, hỗ trợ đối soát dữ liệu nhanh chóng.
* **Yêu cầu kỹ thuật:**
    * Tính năng Real-time Stock View: Tự động cập nhật số lượng khi có giao dịch nhập/xuất được xác nhận.
    * Hệ thống phân rã kho (Warehouse Hierarchy): Hiển thị tồn kho theo dạng cây (Kho -> Khu vực -> Kệ -> Ô).
    * Tính năng Ghi nhận chênh lệch: Cho phép Manager đánh dấu và ghi chú trực tiếp lên dòng dữ liệu nếu phát hiện sai lệch so với thực tế.
* **Dữ liệu liên quan:** Mã hàng, Tên hàng, Kho, Vị trí cụ thể, Số lượng hệ thống, Số lượng thực tế (nhập tay), Ghi chú chênh lệch.
* **Tiêu chí chấp nhận:** Hệ thống hiển thị chính xác số lượng tồn tại từng Bin cụ thể. Cho phép xuất báo cáo tồn kho tại thời điểm hiện tại.

### 3. Cập nhật thông tin hàng hóa
* **Mô tả:** Cung cấp công cụ điều chỉnh các thuộc tính định danh và quản lý của hàng hóa khi có thay đổi từ nhà cung cấp hoặc yêu cầu nội bộ.
* **Yêu cầu kỹ thuật:**
    * Cơ chế Validation: Kiểm tra tính hợp lệ của dữ liệu đầu vào (ví dụ: hạn sử dụng không được trước ngày sản xuất).
    * Phân quyền Edit: Chỉ Manager mới có quyền truy cập vào các trường thông tin nhạy cảm.
    * Hệ thống Audit Log: Tự động ghi lại giá trị cũ (old_value) và giá trị mới (new_value) sau khi nhấn lưu.
* **Dữ liệu liên quan:** Form chỉnh sửa (Tên, mã, loại, mô tả, nhà cung cấp, hạn sử dụng, trạng thái).
* **Tiêu chí chấp nhận:** Thông tin được cập nhật ngay lập tức trên toàn hệ thống sau khi có thông báo "Thành công".

### 4. Cập nhật số lượng tồn kho
* **Mô tả:** Thực hiện điều chỉnh con số tồn kho trên hệ thống khi có biến động ngoài quy trình nhập/xuất thông thường (ví dụ: hàng bị hỏng, mất mát).
* **Yêu cầu kỹ thuật:**
    * Tính năng Adjust Inventory: Hỗ trợ hai phương thức: "Cập nhật con số mới" hoặc "Tăng/Giảm (+/-) số lượng hiện tại".
    * Bắt buộc lý do (Reason Code): Hệ thống không cho phép lưu nếu trường "Lý do điều chỉnh" bị bỏ trống.
    * Cập nhật Inventory Valuation: Hệ thống tự động tính toán lại tổng giá trị kho sau khi số lượng thay đổi.
* **Dữ liệu liên quan:** SKU, Số lượng điều chỉnh, Loại điều chỉnh (Tăng/Giảm), Lý do, Ghi chú chi tiết.
* **Tiêu chí chấp nhận:** Lịch sử biến động phải ghi nhận rõ giao dịch này là "Inventory Adjustment".

### 5. Tạo phiếu nhập/xuất kho theo quy trình và quy định pháp luật
* **Mô tả:** Khởi tạo các chứng từ điện tử ghi nhận luồng hàng ra/vào kho, đính kèm bằng chứng pháp lý.
* **Yêu cầu kỹ thuật:**
    * Module File Upload: Hỗ trợ đính kèm minh chứng (Hóa đơn, Hợp đồng) định dạng PDF, JPG, PNG (Max 5MB).
    * State Machine: Phiếu khi tạo mới tự động nhận trạng thái "Chờ xác nhận" (Pending).
    * Tính năng In phiếu: Tự động dàn trang theo mẫu phiếu nhập/xuất kho chuẩn của Bộ Tài chính/Quy định công ty.
* **Dữ liệu liên quan:** Mã phiếu (Auto-gen), Hàng hóa, Số lượng, Đơn vị tính, Kho, Lý do, Chứng từ đính kèm, Người tạo.
* **Tiêu chí chấp nhận:** Phiếu được lưu vào cơ sở dữ liệu và hiển thị trong danh sách chờ phê duyệt.

### 6. Xác nhận nhập/xuất kho theo quy trình và quy định pháp luật
* **Mô tả:** Bước phê duyệt cuối cùng của Manager để chính thức xác nhận việc thay đổi tồn kho vật lý trên hệ thống.
* **Yêu cầu kỹ thuật:**
    * Giao diện So sánh (Comparison View): Hiển thị thông tin phiếu và ảnh chứng từ đính kèm trên cùng một màn hình để Manager đối chiếu.
    * Logic xác nhận: Khi nhấn "Xác nhận", hệ thống thực hiện trừ/cộng tồn kho thực tế và khóa phiếu (không cho sửa).
    * Logic từ chối: Yêu cầu Manager nhập "Lý do từ chối" và chuyển phiếu về trạng thái "Bị từ chối" (Rejected).
* **Dữ liệu liên quan:** Trạng thái phiếu (Confirmed/Rejected), Thời gian xác nhận, ID Manager xác nhận.
* **Tiêu chí chấp nhận:** Tồn kho chỉ được thay đổi sau khi Manager nhấn nút "Xác nhận".

### 7. Lưu trữ, tra cứu lịch sử giao dịch kho
* **Mô tả:** Hệ thống lưu trữ vĩnh viễn mọi biến động kho, cho phép tra cứu phục vụ công tác kiểm tra, thanh tra.
* **Yêu cầu kỹ thuật:**
    * Index Database: Đánh chỉ mục (Index) cho các trường Thời gian, SKU và Người thực hiện để tối ưu tốc độ truy vấn lịch sử lớn.
    * Filter Module: Lọc theo loại giao dịch (Nhập/Xuất/Kiểm kê/Điều chỉnh) và khoảng thời gian (Date range).
* **Dữ liệu liên quan:** Toàn bộ bản ghi giao dịch (Timestamp, SKU, Số lượng, Loại giao dịch, Chứng từ liên quan).
* **Tiêu chí chấp nhận:** Truy xuất được lịch sử của bất kỳ mặt hàng nào từ lúc nhập kho lần đầu đến hiện tại.

### 8. Kiểm tra cảnh báo về hàng hóa hết hạn, hàng tồn kho lâu ngày
* **Mô tả:** Tính năng thông minh tự động phát hiện và cảnh báo các rủi ro về hạn sử dụng và hàng tồn đọng.
* **Yêu cầu kỹ thuật:**
    * Job Scheduler (Cron Job): Tự động chạy quét dữ liệu vào 00:00 hàng ngày.
    * Logic Expiry Alert: Cảnh báo khi (Hạn sử dụng - Ngày hiện tại) <= Ngưỡng cấu hình.
    * Logic Deadstock Alert: Cảnh báo khi (Ngày hiện tại - Ngày giao dịch cuối cùng) >= Ngưỡng cấu hình.
* **Dữ liệu liên quan:** Danh sách cảnh báo, Ngày nhập, Hạn sử dụng, Số ngày tồn, Trạng thái cảnh báo (Mới/Đang xử lý/Đã xử lý).
* **Tiêu chí chấp nhận:** Manager nhận được danh sách cảnh báo chính xác tại màn hình Dashboard ngay sau khi đăng nhập.

### 9. Tạo báo cáo kiểm kê định kỳ
* **Mô tả:** Quy trình phối hợp thực hiện kiểm kê thực tế giữa các bộ phận, ghi nhận kết quả kiểm đếm lên hệ thống.
* **Yêu cầu kỹ thuật:**
    * Module Lập kế hoạch: Cho phép chọn Kho/Nhóm hàng cần kiểm kê và khóa các giao dịch nhập/xuất liên quan đến nhóm đó trong thời gian kiểm kê.
    * Giao diện Operator: Form nhập số liệu kiểm kê thực tế đơn giản, tối ưu cho thiết bị di động/máy quét.
    * Cơ chế Tổng hợp: Tự động so khớp số liệu giữa các nhân sự được phân công và số liệu hệ thống.
* **Dữ liệu liên quan:** Đợt kiểm kê, Phạm vi, Nhân sự phụ trách, Số liệu thực tế, Số liệu hệ thống, Chênh lệch.
* **Tiêu chí chấp nhận:** Manager phê duyệt được kết quả kiểm kê và hệ thống tự động sinh phiếu điều chỉnh tồn kho cho phần chênh lệch.

### 10. Xuất báo cáo kiểm kê định kỳ phục vụ kiểm toán và thanh tra
* **Mô tả:** Kết xuất dữ liệu từ các đợt kiểm kê thành văn bản chính thức có giá trị pháp lý.
* **Yêu cầu kỹ thuật:**
    * Template Engine: Xuất báo cáo theo đúng biểu mẫu kiểm kê hàng tồn kho pháp định.
    * Tính năng Chữ ký số: (Tùy chọn nâng cao) Tích hợp ký số cho báo cáo PDF để đảm bảo tính xác thực.
* **Dữ liệu liên quan:** Kỳ báo cáo, Chi tiết chênh lệch, Lý do điều chỉnh, Chữ ký xác nhận của nhân sự thực hiện và Manager.
* **Tiêu chí chấp nhận:** File báo cáo PDF xuất ra không thể chỉnh sửa và chứa đầy đủ lịch sử của đợt kiểm kê.

### 11. Theo dõi và quản lý báo cáo
* **Mô tả:** Dashboard tổng hợp cung cấp cái nhìn toàn cảnh về hiệu suất và giá trị kho.
* **Yêu cầu kỹ thuật:**
    * Data Visualization: Sử dụng biểu đồ (Chart.js/Highcharts) để hiển thị xu hướng Nhập/Xuất và cơ cấu hàng tồn.
    * Tính năng Drill-down: Từ biểu đồ tổng quát có thể nhấn vào để xem dữ liệu chi tiết cấu thành.
* **Dữ liệu liên quan:** Báo cáo tồn kho, Báo cáo nhập/xuất, Báo cáo doanh thu/chi phí kho hàng.
* **Tiêu chí chấp nhận:** Thông tin báo cáo phải khớp 100% với dữ liệu giao dịch thực tế trong cơ sở dữ liệu.

## Quản lý user của hệ thống
### 12. Thêm mới user
* **Mô tả:** Khởi tạo tài khoản truy cập hệ thống và định danh nhân sự mới.
* **Yêu cầu kỹ thuật:**
    * Mã hóa mật khẩu: Sử dụng Bcrypt hoặc tương đương để bảo mật mật khẩu trong DB.
    * Logic phân quyền: Manager chọn Role từ danh sách định sẵn (Manager, Operator, QC, IT Admin).
* **Dữ liệu liên quan:** Họ tên, Email, Username, Password (encrypted), Role, Phòng ban.
* **Tiêu chí chấp nhận:** User mới nhận được thông tin tài khoản và có thể đăng nhập với đúng quyền hạn được giao.

### 13. Chỉnh sửa thông tin user, thay đổi quyền truy cập
* **Mô tả:** Điều chỉnh thông tin cá nhân và quản lý phân quyền theo sự thay đổi nhân sự thực tế.
* **Yêu cầu kỹ thuật:**
    * Tính năng Profile Update: Cập nhật thông tin định danh.
    * Role Switching: Thay đổi vai trò người dùng (sẽ có hiệu lực từ phiên đăng nhập tiếp theo).
* **Dữ liệu liên quan:** User ID, Danh sách quyền hạn mới.
* **Tiêu chí chấp nhận:** Mọi thay đổi về quyền truy cập phải được ghi lại trong log hệ thống để phục vụ bảo mật.

### 14. Khóa/mở khóa tài khoản user khi cần thiết
* **Mô tả:** Ngắt quyền truy cập hệ thống của nhân sự ngay lập tức khi phát hiện rủi ro hoặc nghỉ việc.
* **Yêu cầu kỹ thuật:**
    * Session Invalidation: Khi khóa tài khoản, hệ thống phải ngay lập tức thu hồi Access Token/Session của user đó trên mọi thiết bị.
    * Trạng thái tài khoản: Cập nhật flag `is_active` trong Database.
* **Dữ liệu liên quan:** User ID, Trạng thái (Locked/Active), Lý do khóa.
* **Tiêu chí chấp nhận:** User bị khóa sẽ nhận thông báo "Tài khoản đã bị vô hiệu hóa" khi cố gắng đăng nhập hoặc thực hiện thao tác.

### 15. Theo dõi lịch sử hoạt động của user
* **Mô tả:** Lưu trữ và giám sát mọi tương tác của người dùng trên hệ thống để đảm bảo tính tuân thủ pháp luật và an ninh thông tin.
* **Yêu cầu kỹ thuật:**
    * Activity Logger Middleware: Tự động ghi nhận thông tin mỗi khi có Request gửi tới Server từ User.
    * Thông tin IP & Device: Lưu lại địa chỉ IP và thông tin trình duyệt của mỗi phiên làm việc.
    * Read-only Log: Đảm bảo log hoạt động không thể bị sửa đổi hoặc xóa kể cả bởi quyền Admin.
* **Dữ liệu liên quan:** Thời gian, Thao tác, Đối tượng tác động (SKU/User/Report), IP, User Agent, Trạng thái (Success/Fail).
* **Tiêu chí chấp nhận:** Manager có thể tìm thấy vết của một giao dịch bị lỗi hoặc hành vi truy cập trái phép thông qua tính năng này.

# Quality Control Technician
## Kiểm soát chất lượng đầu vào (Inbound Quality Control)
### 1. Đánh giá lô hàng chờ nhập (Pending Batch Evaluation)
* **Mô tả:** Cung cấp giao diện quản lý các lô hàng vừa được Operator tiếp nhận tại khu vực đệm (Staging Area). Cho phép QC nhập kết quả kiểm nghiệm và đối chiếu với tiêu chuẩn kỹ thuật (Specification) để quyết định hàng có được phép nhập kho hay không.
* **Yêu cầu kỹ thuật:**
    * **Dashboard Pending QC:** Hiển thị danh sách các lô hàng có trạng thái `Pending` kèm theo thông tin Nhà cung cấp, Thời gian nhận hàng và Số lượng.
    * **Specification Integration:** Tự động truy xuất bảng tiêu chuẩn kỹ thuật từ cơ sở dữ liệu dựa trên mã hàng (SKU) của lô hàng đang chọn.
    * **Logic so sánh tự động:** Hệ thống tự động bôi đỏ các giá trị nhập vào nằm ngoài ngưỡng cho phép (ví dụ: Độ ẩm > 15%).
    * **State Management:** Sau khi Approve, hệ thống phải tự động cập nhật trạng thái lô hàng để Operator có thể thực hiện lệnh `Put-away`. Nếu Hold/Reject, chức năng nhập kho của Operator đối với lô hàng này sẽ bị khóa.
* **Dữ liệu liên quan:** Batch ID, SKU, Nhà cung cấp, Thông số kỹ thuật (Specification), Kết quả kiểm nghiệm (Độ ẩm, nồng độ, cảm quan...), Quyết định (Approve/Reject/Hold).
* **Tiêu chí chấp nhận:** QC có thể hoàn thành việc đánh giá một lô hàng và hệ thống cập nhật trạng thái ngay lập tức trên màn hình làm việc của Operator.

### 2. Xử lý hàng không đạt chuẩn (Rejection Handling)
* **Mô tả:** Quy trình xử lý các lô hàng bị từ chối sau kiểm định, đảm bảo có đầy đủ bằng chứng sai phạm và ngăn chặn việc nhập nhầm hàng lỗi vào kho chính.
* **Yêu cầu kỹ thuật:**
    * **Mandatory Field Logic:** Bắt buộc người dùng nhập "Lý do từ chối" (Rejection Reason) từ danh mục có sẵn hoặc nhập tay chi tiết.
    * **Image Upload Module:** Hỗ trợ chụp ảnh trực tiếp từ thiết bị di động hoặc tải file ảnh/video bằng chứng (Minh chứng bao bì rách, móp méo...).
    * **Auto-Workflow:** Tự động khởi tạo một phiếu "Yêu cầu trả hàng" (Return Request) và gửi thông báo (Notification) đến Manager để phê duyệt hướng xử lý tiếp theo.
    * **Hard-Locking:** Gắn nhãn `Rejected` và chặn mọi thao tác di chuyển lô hàng này vào các vị trí kệ lưu trữ thương mại.
* **Dữ liệu liên quan:** Batch ID, Lý do lỗi, Ảnh bằng chứng, Phiếu yêu cầu trả hàng, Trạng thái Rejected.
* **Tiêu chí chấp nhận:** Hệ thống ngăn chặn hoàn toàn việc thực hiện lệnh `Put-away` đối với các lô hàng đã bị QC xác nhận là `Rejected`.

---

## Kiểm soát chất lượng hàng tồn kho (Inventory Quality Assurance)

### 3. Tái kiểm tra định kỳ (Periodic Re-test)
* **Mô tả:** Hệ thống theo dõi vòng đời chất lượng của hàng hóa đang lưu kho, đưa ra cảnh báo cho QC thực hiện kiểm tra lại các lô hàng có tính chất thay đổi theo thời gian hoặc sắp hết hạn.
* **Yêu cầu kỹ thuật:**
    * **Quality Alert System:** Xây dựng bộ lọc hiển thị các lô hàng dựa trên trường dữ liệu `Next Re-test Date` hoặc `Expiry Date`.
    * **Location Guidance:** Hiển thị chính xác vị trí ô kệ (Bin Location) của lô hàng cần kiểm tra để QC dễ dàng tìm kiếm trong kho.
    * **Expiry Management Logic:** * Nếu chọn `Extend`: Cho phép cập nhật `Expiry Date` mới (chỉ áp dụng với một số loại hàng cho phép).
        * Nếu chọn `Discard`: Chuyển trạng thái sang `Expired` và tự động tạo phiếu yêu cầu tiêu hủy.
* **Dữ liệu liên quan:** Danh sách cảnh báo, Kết quả tái kiểm tra, Ngày hết hạn cũ/mới, Trạng thái (Extend/Discard).
* **Tiêu chí chấp nhận:** QC nhận được danh sách hàng cần tái kiểm tra đúng thời điểm cấu hình và cập nhật được thời hạn mới cho hàng hóa sau khi test đạt.

### 4. Cách ly hàng hóa (Quarantine Process)
* **Mô tả:** Cho phép QC phản ứng nhanh với các sự cố môi trường kho bằng cách khóa hàng loạt hàng hóa nghi ngờ bị ảnh hưởng để chờ kiểm tra.
* **Yêu cầu kỹ thuật:**
    * **Bulk Action Feature:** Cho phép chọn nhiều lô hàng theo Khu vực (Zone) hoặc Vị trí (Bin) để thay đổi trạng thái đồng loạt.
    * **Quarantine Lock:** Khi hàng ở trạng thái `Quarantine`, hệ thống phải chặn lệnh `Picking` (lấy hàng bán) và `Transfer` (chuyển kho).
    * **Event Logging:** Ghi lại lý do cách ly (ví dụ: Kho bị dột, sự cố nhiệt độ) để phục vụ báo cáo rủi ro.
* **Dữ liệu liên quan:** Danh sách lô hàng bị ảnh hưởng, Vị trí kho, Lý do cách ly, Trạng thái Quarantine.
* **Tiêu chí chấp nhận:** Toàn bộ hàng hóa trong khu vực xảy ra sự cố được chuyển sang trạng thái cách ly chỉ bằng 1 thao tác và không thể xuất bán.

---

## Báo cáo & Truy vết (Reporting & Traceability)

### 5. Truy xuất nguồn gốc lô hàng (Batch Traceability)
* **Mô tả:** Cung cấp khả năng nhìn lại toàn bộ "vòng đời chất lượng" của một lô hàng cụ thể từ lúc vào kho cho đến hiện tại.
* **Yêu cầu kỹ thuật:**
    * **QR/Barcode Scanner Integration:** Hỗ trợ quét mã lô hàng từ Camera hoặc thiết bị cầm tay để mở nhanh hồ sơ.
    * **Visual Timeline UI:** Hiển thị dòng thời gian các sự kiện: Nhập kho -> QC lần 1 -> Duyệt -> Tái kiểm tra -> Điều chuyển.
    * **COA Generator:** Tự động điền dữ liệu vào mẫu "Chứng nhận phân tích" (Certificate of Analysis - COA) dựa trên các kết quả test đã lưu và xuất ra file PDF có watermark của công ty.
* **Dữ liệu liên quan:** Batch ID, Timeline sự kiện, Tên người kiểm tra qua từng giai đoạn, File PDF COA.
* **Tiêu chí chấp nhận:** Hệ thống truy xuất được đầy đủ lịch sử của một lô hàng bất kỳ trong vòng dưới 3 giây.

### 6. Báo cáo hiệu suất nhà cung cấp (Supplier Quality Report)
* **Mô tả:** Tổng hợp dữ liệu kiểm định để đánh giá chất lượng hàng hóa của từng nhà cung cấp, hỗ trợ bộ phận mua hàng đưa ra quyết định hợp tác.
* **Yêu cầu kỹ thuật:**
    * **Aggregation Engine:** Tính toán tỷ lệ phần trăm: `(Số lô hàng lỗi / Tổng số lô hàng giao) * 100`.
    * **Comparative Charts:** Hiển thị biểu đồ cột so sánh tỷ lệ lỗi giữa các nhà cung cấp trong cùng một nhóm ngành hàng.
    * **Time-series Filter:** Cho phép xem báo cáo theo Tháng, Quý hoặc Năm để thấy được xu hướng cải thiện chất lượng của nhà cung cấp.
* **Dữ liệu liên quan:** Tên nhà cung cấp, Tổng số lô nhập, Số lô Approved, Số lô Rejected, Tỷ lệ lỗi (%).
* **Tiêu chí chấp nhận:** Báo cáo phản ánh chính xác dữ liệu từ các phiếu QC Inbound đã thực hiện trong kỳ.

# Operator
## Quản lý inventory theo quy định của pháp luật
### 1. Tạo phiếu nhập/xuất kho theo quy trình và quy định pháp luật
* **Mô tả:** Cho phép Operator khởi tạo các yêu cầu nhập/xuất hàng hóa hàng ngày, đảm bảo mọi sự di chuyển của hàng hóa đều có chứng từ đi kèm.
* **Yêu cầu kỹ thuật:**
    * **Form Builder:** Giao diện nhập liệu tối ưu (hỗ trợ Tablet/Mobile), tự động điền thông tin người tạo và thời gian hiện tại.
    * **Scan-to-Fill:** Hỗ trợ quét mã vạch sản phẩm để tự động điền Mã hàng và Tên hàng vào chi tiết phiếu.
    * **Attachment Support:** Tích hợp camera thiết bị để chụp ảnh chứng từ (Hóa đơn/Phiếu giao hàng) và đính kèm trực tiếp vào phiếu.
    * **Validation:** Kiểm tra số lượng nhập phải > 0.
* **Dữ liệu liên quan:** Loại phiếu (Nhập/Xuất), Danh sách hàng hóa (SKU, Qty), Kho nguồn/đích, Ảnh chứng từ, Trạng thái (Draft/Pending).
* **Tiêu chí chấp nhận:** Phiếu được tạo thành công với trạng thái "Chờ xác nhận" và lưu đầy đủ hình ảnh chứng từ.

### 2. Xác nhận nhập/xuất kho theo quy trình và quy định pháp luật
* **Mô tả:** Chức năng ghi nhận việc hoàn tất giao nhận hàng hóa thực tế tại cửa kho.
* **Yêu cầu kỹ thuật:**
    * **Worklist Dashboard:** Hiển thị danh sách các phiếu được phân công cho Operator xử lý.
    * **Verification Logic:** Yêu cầu Operator nhập lại số lượng thực tế kiểm đếm được (Blind count) để hệ thống so sánh với số lượng trên phiếu.
    * **Transaction Commit:** Khi nhấn "Xác nhận", hệ thống thực hiện trừ/cộng tồn kho tức thời (Real-time update).
* **Dữ liệu liên quan:** ID Phiếu, Số lượng thực tế, Ghi chú sai lệch (nếu có), Thời gian hoàn tất.
* **Tiêu chí chấp nhận:** Số lượng tồn kho thay đổi tương ứng ngay sau khi xác nhận. Không thể xác nhận nếu thiếu thông tin bắt buộc.

### 3. Lưu trữ, tra cứu lịch sử giao dịch kho
* **Mô tả:** Cung cấp khả năng tìm kiếm lại các phiếu nhập/xuất cũ để đối chiếu khi có thắc mắc hoặc kiểm tra.
* **Yêu cầu kỹ thuật:**
    * **Personalized View:** Mặc định hiển thị các giao dịch do chính Operator đó thực hiện (hoặc lọc theo kho được phân công).
    * **Advanced Search:** Tìm kiếm theo Mã phiếu hoặc Mã hàng.
    * **Read-only Detail:** Xem chi tiết phiếu nhưng không có quyền chỉnh sửa dữ liệu lịch sử.
* **Dữ liệu liên quan:** Lịch sử giao dịch (Transaction Logs).
* **Tiêu chí chấp nhận:** Truy xuất thông tin phiếu cũ trong vòng < 2 giây.

### 4. Tạo báo cáo kiểm kê định kỳ
* **Mô tả:** Công cụ hỗ trợ Operator thực hiện việc đếm hàng vật lý trong các đợt kiểm kê.
* **Yêu cầu kỹ thuật:**
    * **Inventory Session Mode:** Giao diện chuyên biệt cho kiểm kê: Hiển thị danh sách vị trí (Bin) cần kiểm tra.
    * **Offline Support (Optional):** Cho phép nhập liệu khi mất kết nối mạng và đồng bộ lại khi có mạng (quan trọng cho các kho lớn, sóng yếu).
    * **Conflict Alert:** Cảnh báo nếu Operator nhập số lượng chênh lệch quá lớn (> 50%) so với hệ thống để kiểm tra lại ngay lập tức.
* **Dữ liệu liên quan:** Đợt kiểm kê, Vị trí kệ, SKU, Số lượng đếm được.
* **Tiêu chí chấp nhận:** Dữ liệu kiểm đếm được gửi đầy đủ về hệ thống trung tâm để Manager đối soát.

### 5. Xuất báo cáo kiểm kê định kỳ phục vụ kiểm toán và thanh tra
* **Mô tả:** Hỗ trợ trích xuất biên bản kiểm kê để ký nhận bàn giao trách nhiệm.
* **Yêu cầu kỹ thuật:**
    * **Report Generation:** Tạo file PDF biên bản kiểm kê hiện trường.
    * **Digital Signature:** Hỗ trợ ký tên trực tiếp trên màn hình cảm ứng của thiết bị (nếu dùng Tablet).
* **Dữ liệu liên quan:** File báo cáo kiểm kê (PDF).
* **Tiêu chí chấp nhận:** File xuất ra hiển thị rõ ràng số lượng thực tế mà Operator đã đếm và xác nhận.

## Theo dõi và quản lý báo cáo
### 6. Theo dõi và quản lý báo cáo tổng hợp
* **Mô tả:** Xem các chỉ số vận hành cá nhân hoặc của kho để nắm bắt tình hình công việc.
* **Yêu cầu kỹ thuật:**
    * **Operational Dashboard:** Biểu đồ đơn giản hóa: Số phiếu chờ xử lý, Số lượng hàng đã xử lý trong ngày.
    * **Permission Gate:** Chỉ hiển thị các báo cáo phù hợp với cấp độ nhân viên (ẩn các báo cáo doanh thu/giá vốn nhạy cảm).
* **Dữ liệu liên quan:** KPI cá nhân, Thống kê nhập/xuất.
* **Tiêu chí chấp nhận:** Dashboard tải nhanh, số liệu cập nhật theo thời gian thực.

# IT Administrator
## Theo dõi trạng thái hệ thống
### 1. Theo dõi trạng thái hệ thống (System Monitoring)
* **Mô tả:** Dashboard trung tâm giúp IT Admin nắm bắt sức khỏe của toàn bộ hạ tầng phần mềm và phần cứng máy chủ.
* **Yêu cầu kỹ thuật:**
    * **Resource Monitoring:** Tích hợp API để lấy thông số: % CPU, % RAM, Disk Space, Network Latency.
    * **Service Health Check:** Hiển thị trạng thái (Up/Down) của các dịch vụ con (Database, Web Server, API Gateway).
    * **Alert Thresholds:** Cấu hình ngưỡng cảnh báo (ví dụ: CPU > 90% trong 5 phút -> Gửi Email/SMS).
* **Dữ liệu liên quan:** Metrics hệ thống, Trạng thái Service, Log cảnh báo.
* **Tiêu chí chấp nhận:** Admin nhận được cảnh báo ngay lập tức khi hệ thống gặp sự cố tải cao hoặc mất kết nối.

## Kiểm tra và xử lý lỗi hệ thống
### 2. Kiểm tra và xử lý lỗi hệ thống (Log Management)
* **Mô tả:** Công cụ truy vết lỗi chuyên sâu để debug và khắc phục sự cố phần mềm.
* **Yêu cầu kỹ thuật:**
    * **Centralized Logging:** Gom log từ tất cả các nguồn (Backend, Frontend, Database) về một giao diện duy nhất.
    * **Search & Filter:** Tìm kiếm log theo ID phiên làm việc (Session ID), Error Code (500, 403...) hoặc khoảng thời gian.
    * **Log Retention:** Cơ chế tự động xoá log cũ sau X ngày để giải phóng dung lượng.
* **Dữ liệu liên quan:** Error Logs, Access Logs, System Events.
* **Tiêu chí chấp nhận:** Log chi tiết lỗi phải được hiển thị đầy đủ (Stack trace) để xác định nguyên nhân gốc rễ.

## Đảm bảo an toàn và sao lưu dữ liệu
### 3. Thiết lập và kiểm tra lịch trình sao lưu dữ liệu tự động
* **Mô tả:** Cấu hình các tác vụ tự động (Cron Jobs) để sao lưu dữ liệu định kỳ, đảm bảo an toàn dữ liệu (Disaster Recovery).
* **Yêu cầu kỹ thuật:**
    * **Scheduler UI:** Giao diện trực quan để chọn tần suất (Daily/Weekly/Monthly) và giờ chạy (ví dụ: 02:00 AM).
    * **Backup Scope:** Tùy chọn thành phần sao lưu: Database Dump, Media Files (ảnh chứng từ), Configuration files.
    * **Storage Integration:** Hỗ trợ lưu trữ đa điểm: Local Disk và Cloud Storage (S3/Google Drive).
    * **Retention Policy:** Cấu hình số lượng bản backup giữ lại (ví dụ: Giữ 7 bản gần nhất).
* **Dữ liệu liên quan:** Cấu hình Backup Schedule.
* **Tiêu chí chấp nhận:** Hệ thống tự động thực hiện sao lưu đúng giờ đã hẹn mà không cần can thiệp thủ công.

### 4. Kiểm tra trạng thái các bản sao lưu gần nhất
* **Mô tả:** Giám sát kết quả của các tiến trình sao lưu để đảm bảo file backup luôn sẵn sàng và toàn vẹn.
* **Yêu cầu kỹ thuật:**
    * **Backup History Table:** Danh sách hiển thị: Tên file, Thời gian tạo, Dung lượng, Trạng thái (Success/Failed), Checksum (MD5/SHA).
    * **Health Indicator:** Đánh dấu màu đỏ cho các bản backup thất bại hoặc có dung lượng bất thường (quá nhỏ = nghi ngờ lỗi).
    * **Download Action:** Cho phép tải file backup về máy cục bộ để kiểm tra thủ công.
* **Dữ liệu liên quan:** Lịch sử Backup.
* **Tiêu chí chấp nhận:** Admin có thể nhìn thấy ngay lập tức nếu bản backup đêm qua bị lỗi.

### 5. Thực hiện phục hồi dữ liệu (Data Restore)
* **Mô tả:** Quy trình khôi phục hệ thống về trạng thái quá khứ khi xảy ra sự cố nghiêm trọng (mất dữ liệu, hack, lỗi phần mềm).
* **Yêu cầu kỹ thuật:**
    * **Restore Wizard:** Quy trình từng bước: Chọn file backup -> Chọn môi trường đích (Test/Prod) -> Xác nhận.
    * **Safety Lock:** Yêu cầu xác thực 2 lớp (2FA) hoặc mật khẩu Admin cấp cao trước khi thực hiện lệnh Restore đè dữ liệu.
    * **Progress Bar:** Hiển thị tiến trình phục hồi (%).
* **Dữ liệu liên quan:** File Backup nguồn, Database đích.
* **Tiêu chí chấp nhận:** Dữ liệu được khôi phục chính xác, hệ thống hoạt động bình thường sau khi restore.

### 6. Báo cáo và đánh giá hệ thống
* **Mô tả:** Tổng hợp các chỉ số kỹ thuật để đánh giá chất lượng hạ tầng và lên kế hoạch nâng cấp.
* **Yêu cầu kỹ thuật:**
    * **Uptime Report:** Báo cáo thời gian hoạt động của hệ thống (SLA: 99.9%...).
    * **Incident Report:** Thống kê số lượng lỗi xảy ra theo tháng.
    * **Export Format:** Xuất báo cáo ra định dạng HTML hoặc PDF để trình ban lãnh đạo.
* **Dữ liệu liên quan:** Thống kê hiệu năng, Lịch sử sự cố.
* **Tiêu chí chấp nhận:** Báo cáo cung cấp đủ dữ liệu để trả lời câu hỏi "Hệ thống tháng qua có ổn định không?".
