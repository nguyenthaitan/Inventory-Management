# User Interface Screens Overview

> **Figma UI Design:** [https://www.figma.com/make/M4oBqro4C0xRpbjKkpVFaK/Simple-Auth-for-Inventory-System?t=xN4GnleNv06fS01O-20&fullscreen=1](https://www.figma.com/make/M4oBqro4C0xRpbjKkpVFaK/Simple-Auth-for-Inventory-System?t=xN4GnleNv06fS01O-20&fullscreen=1)

UI có cả phiên bản cho web máy tính (desktop) và mobile.


**Mockdata đăng nhập cho các vai trò:**

| Role                      | Username | Password |
|---------------------------|----------|----------|
| Manager                   | 1        | 1        |
| Quality Control Technician| 2        | 2        |
| Operator                  | 3        | 3        |
| IT Administrator          | 4        | 4        |

---

Tài liệu này mô tả các màn hình giao diện người dùng của hệ thống Inventory Management, được chia theo các role chính.

## 1. Auth Screens
### 1.1 Đăng nhập hệ thống

![Login Screen](./Images/Auth/login.png)

Màn hình đăng nhập cho phép người dùng nhập tên đăng nhập (username) và mật khẩu (password) để truy cập vào hệ thống. Giao diện gồm các trường nhập liệu, nút đăng nhập. Sau khi nhập thông tin hợp lệ và nhấn nút đăng nhập, hệ thống sẽ xác thực và chuyển sang giao diện chính nếu thành công.

---

### 1.2 Đăng ký tài khoản

![Register Screen](./Images/Auth/register.png)

Màn hình đăng ký cho phép người dùng tạo tài khoản mới bằng cách nhập các thông tin như tên đăng nhập, mật khẩu, xác nhận mật khẩu và chọn role. Sau khi điền đầy đủ thông tin và nhấn nút đăng ký, hệ thống sẽ kiểm tra hợp lệ và tạo tài khoản mới cho người dùng.

---

## 2. Manager Screens

### 2.1 Dashboard Screen

![Dashboard Screen](./Images/Manager/DashboardScreen.png)

Sau khi đăng nhập với vai trò Manager, hệ thống hiển thị DashboardScreen để cung cấp cái nhìn tổng thể về giá trị tồn kho, tỷ lệ hàng lỗi và vòng quay kho. Biểu đồ trung tâm mô phỏng xu hướng xuất nhập kho trong tuần hoặc tháng, hỗ trợ nhà quản lý theo dõi biến động hàng hóa và dự báo nhu cầu lưu trữ. Khu vực cảnh báo rủi ro phía bên phải giúp nhận diện nhanh các mặt hàng sắp hết hạn hoặc chênh lệch kiểm kê cần xử lý gấp.

---

### 2.2 Inventory Screen

![Inventory Screen](./Images/Manager/InventoryScreen.png)

Khi nhấn vào mục "Quản lý hàng hoá" trên thanh điều hướng, người dùng truy cập InventoryScreen để thực hiện kiểm tra danh mục thuốc. Giao diện tích hợp bộ lọc và thanh tìm kiếm theo mã hàng hoặc tên thuốc để trích xuất danh sách hàng hóa phù hợp. Bảng dữ liệu hiển thị chi tiết số lượng, vị trí kệ và trạng thái thực tế, hỗ trợ xuất file Excel phục vụ công tác kiểm tra.

---

### 2.3 Detail Product Screen

![Detail Product Screen](./Images/Manager/DetailProduct.png)

Khi chọn biểu tượng con mắt tại danh sách hàng hóa, hệ thống hiển thị DetailProduct dưới dạng cửa sổ modal cung cấp hồ sơ chi tiết của sản phẩm. Màn hình liệt kê rõ ràng vị trí lưu trữ tại Kho A, ngày nhập kho, hạn sử dụng và trạng thái để phục vụ việc đối chiếu thông tin. Manager có thể thực hiện in tem nhãn hoặc chuyển sang chế độ chỉnh sửa thông tin trực tiếp từ giao diện này.

---

### 2.4 Edit Product Screen

![Edit Product Screen](./Images/Manager/EditProduct.png)

Người dùng chọn biểu tượng chỉnh sửa tại màn hình quản lý hàng hóa để mở giao diện EditProduct khi cần cập nhật dữ liệu sản phẩm. Giao diện cung cấp các trường nhập liệu tối giản để thay đổi tên thuốc, mã hàng, số lượng và trạng thái lưu kho. Thao tác nhấn "Lưu thay đổi" sẽ ghi nhận dữ liệu mới vào hệ thống, đảm bảo tính chính xác của hồ sơ hàng hóa.

---

### 2.5 Stock Screen

![Stock Screen](./Images/Manager/StockScreen.png)

Truy cập mục "Tồn kho" trên navbar sẽ dẫn Manager đến StockScreen để theo dõi số lượng tồn hiện tại theo từng danh mục dược lý. Màn hình hiển thị tổng số tồn và nhãn trạng thái của từng nhóm hàng như thuốc giảm đau hay kháng sinh giúp xác định phạm vi cần kiểm tra. Đây là giao diện chính để theo dõi mức độ lưu thông và quản lý tồn kho tổng thể theo đúng quy trình pháp lý.

---

### 2.6 Stock Detail Screen

![Stock Detail Screen](./Images/Manager/StockDetail.png)

Khi nhấn vào "Xem chi tiết & đối chiếu" từ màn hình tồn kho, giao diện StockDetail sẽ hiển thị để thực hiện quy trình kiểm kê thực tế. Màn hình cho phép so sánh trực diện số liệu trên hệ thống với số lượng thực tế tại từng vị trí kho lạnh hoặc kho tổng. Manager có thể ghi nhận lý do chênh lệch vào khu vực ghi chú trước khi nhấn nút xác nhận điều chỉnh để cập nhật lại số tồn kho.

---


### 2.7 Report Screen

![Report Screen](./Images/Manager/ReportScreen.png)

Khi chọn mục "Báo cáo" trên navbar, ReportScreen hiển thị danh sách các bản báo cáo tổng hợp về tồn kho, nhập xuất và doanh thu. Giao diện hỗ trợ tra cứu nhanh chóng theo thời gian hoặc loại báo cáo để phục vụ thanh tra và kiểm toán định kỳ. Mỗi bản ghi đều có tùy chọn xem chi tiết hoặc tải xuống định dạng tệp tin để lưu trữ hồ sơ theo quy định pháp luật.

---

### 2.8 Report Detail Screen

![Report Detail Screen](./Images/Manager/ReportDetail.png)

Khi nhấn nút "Xem chi tiết" tại danh sách báo cáo, màn hình ReportDetail xuất hiện cung cấp nội dung tóm tắt và kết quả phân tích kỹ thuật chuyên sâu. Màn hình trình bày rõ rệt lý do biến động dữ liệu và các nhận định về mức độ an toàn của hàng hóa trong kỳ báo cáo cụ thể. Manager có thể thực hiện xuất file PDF chính thức từ giao diện này để trình cấp trên hoặc lưu trữ hồ sơ pháp lý theo quy định.

## 3. Operator Screens

### 3.1 Dashboard

![Operator Dashboard](./Images/Operator/Dashboard.png)

Sau khi đăng nhập với vai trò Operator, hệ thống hiển thị màn hình Dashboard cung cấp số liệu tổng quan về các yêu cầu chờ nhập kho, chờ xuất kho và nhiệm vụ kiểm kê trong tuần. Giao diện liệt kê danh sách các nhiệm vụ khẩn cấp cần xử lý như tiếp nhận hàng hóa hoặc đối chiếu số liệu tại kho lạnh. Ngoài ra, khu vực "Tra cứu nhanh" cho phép nhân viên sử dụng mã lô (Batch ID) để truy vấn vị trí lưu trữ hàng hóa một cách chính xác và tức thời.

---

### 3.2 Import Screen

![Import Screen](./Images/Operator/ImportScreen.png)

Khi truy cập mục "Nhập kho" trên thanh điều hướng, màn hình ImportScreen xuất hiện hiển thị toàn bộ danh sách các yêu cầu đang chờ xử lý. Bảng dữ liệu cung cấp thông tin về mã chứng từ, tên hàng hóa, số lượng dự kiến và nhà cung cấp tương ứng. Tại đây, nhân viên có thể theo dõi trạng thái của từng lô hàng và thực hiện lệnh nhập kho thông qua cột thao tác.

---

### 3.3 Handling Incoming Goods

![Handling Incoming Goods](./Images/Operator/HandlingIncomingGoods.png)

Bằng cách nhấn vào "Thực hiện nhập kho", hệ thống hiển thị cửa sổ modal HandlingIncomingGoods để nhân viên cập nhật thông tin thực tế khi hàng về. Nhân viên thực hiện nhập số lượng thực nhận và chỉ định vị trí lưu trữ cụ thể theo từng kho hoặc kệ hàng đã được quy định. Thao tác nhấn "Hoàn thành nhập" giúp ghi nhận dữ liệu vào kho và cập nhật trạng thái mới cho chứng từ.

---

### 3.4 Create a Purchase Order

![Create a Purchase Order](./Images/Operator/CreateAPurchaseOrder.png)

Khi cần khởi tạo một yêu cầu nhập hàng thủ công, nhân viên chọn nút "Tạo phiếu mới" để mở giao diện CreateAPurchaseOrder. Form này yêu cầu nhập các thông tin cơ bản bao gồm mã hóa đơn chứng từ, tên dược phẩm, số lượng dự kiến và đơn vị cung cấp. Đây là bước đầu tiên trong quy trình nhập kho đối với những lô hàng phát sinh ngoài kế hoạch tự động của hệ thống.

---

### 3.5 Export Screen

![Export Screen](./Images/Operator/ExportScreen.png)

Truy cập mục "Xuất kho" trên navbar dẫn người dùng đến màn hình ExportScreen để quản lý các lệnh lấy hàng từ kho. Giao diện cung cấp lộ trình lấy hàng tối ưu bằng cách hiển thị rõ tên hàng hóa, số lượng yêu cầu và vị trí kệ hàng cụ thể (ví dụ: Kho A - Kệ 2). Nhân viên sử dụng danh sách này để chuẩn bị hàng hóa và chuyển sang bước xác nhận thực hiện xuất kho vật lý.

---

### 3.6 Warehouse Dispatch

![Warehouse Dispatch](./Images/Operator/WarehouseDispatch.png)

Khi chọn "Thực hiện xuất kho", giao diện modal WarehouseDispatch xuất hiện để nhân viên xác nhận số lượng hàng thực tế đã lấy khỏi kệ. Màn hình hiển thị lại vị trí lấy hàng chính xác để giảm thiểu sai sót trong quá trình vận hành tại các khu vực lưu trữ lớn. Sau khi nhập số lượng thực xuất, thao tác "Xác nhận hoàn thành" sẽ chính thức trừ tồn kho trên hệ thống và lưu lại lịch sử giao dịch.

---

### 3.7 Create a Warehouse Release Order

![Create a Warehouse Release Order](./Images/Operator/CreateAWarehouseReleaseOrder.png)

Người dùng chọn "Tạo lệnh xuất" tại màn hình quản lý xuất kho để mở giao diện CreateAWarehouseReleaseOrder khi cần xuất hàng cho khách hàng. Giao diện yêu cầu khai báo chi tiết mã đơn hàng, tên sản phẩm, vị trí lấy hàng và thông tin khách hàng nhận hàng. Việc thiết lập lệnh xuất chính xác giúp hệ thống tự động điều hướng nhân viên đến đúng vị trí lưu trữ của lô hàng đó.

---

### 3.8 Inventory Screen

![Inventory Screen](./Images/Operator/InventoryScreen.png)

Khi nhấn vào mục "Kiểm kê" trên navbar, hệ thống hiển thị màn hình InventoryScreen liệt kê lịch sử các đợt kiểm kê định kỳ. Nhân viên có thể theo dõi tỷ lệ độ chính xác của các lần kiểm kê trước đó tại từng khu vực như Kho Lạnh A hoặc Kho Tổng B. Nút "Bắt đầu kiểm kê" ở góc trên cùng được sử dụng để khởi tạo một đợt đối soát số liệu thực tế mới theo kế hoạch tuần hoặc tháng.

---

### 3.9 Detail Report

![Detail Report](./Images/Operator/DetailReport.png)

Bằng cách chọn "Chi tiết" tại một bản ghi trong lịch sử kiểm kê, màn hình DetailReport sẽ hiển thị kết quả đối soát cụ thể. Báo cáo cung cấp các chỉ số quan trọng như độ chính xác phần trăm, số lượng mã hàng bị chênh lệch và tổng số mặt hàng đã kiểm tra. Nhân viên có thể xem lý do chênh lệch từ phần ghi chú của Operator và thực hiện tải file PDF hoặc gửi kết quả báo cáo cho cấp quản lý.

---

### 3.10 Inventory Process

![Inventory Process](./Images/Operator/InventoryProcess.png)

Khi nhấn nút "Bắt đầu kiểm kê", hệ thống mở giao diện InventoryProcess để nhân viên thực hiện nhập liệu thực tế tại kho. Danh sách hiển thị số lượng tồn trên hệ thống và các ô input để nhân viên điền con số thực tế đếm được tại từng kệ hàng. Chức năng "Lưu & Đối chiếu ngay" giúp hệ thống tự động tính toán chênh lệch và cập nhật số liệu kho dựa trên kết quả vừa nhập.

---

### 3.11 History Screen

![History Screen](./Images/Operator/HistoryScreen.png)

Mục "Lịch sử" trên navbar dẫn đến HistoryScreen, nơi lưu trữ nhật ký hoạt động chi tiết của mọi giao dịch nhập, xuất và kiểm kê. Giao diện hỗ trợ tra cứu linh hoạt theo mã giao dịch hoặc tên hàng, kèm theo tính năng "Xuất Excel" cho toàn bộ nhật ký hoạt động. Mỗi bản ghi hiển thị số lượng, thời gian ghi nhận và định danh nhân viên thực hiện để đảm bảo tính minh bạch dữ liệu.

---

### 3.12 Activity Details

![Activity Details](./Images/Operator/ActivityDetails.png)

Khi chọn biểu tượng mắt tại nhật ký hoạt động, hệ thống hiển thị ActivityDetails cung cấp hồ sơ đầy đủ về một giao dịch cụ thể. Màn hình liệt kê loại giao dịch, mã chứng từ, thời gian ghi nhận và thông tin chi tiết về hàng hóa cùng vị trí lưu kho. Nút "Tải PDF chứng từ" cho phép người dùng trích xuất văn bản giao dịch để lưu trữ hoặc phục vụ công tác kiểm tra khi cần thiết.

## 4. Quality Control Screens

### 4.1 Dashboard Screen

![Dashboard Screen](./Images/QualityControlTechnician/DashboardScreen.png)

Sau khi đăng nhập với vai trò Quality Control Technician, giao diện DashboardScreen cung cấp cái nhìn tổng quát về khối lượng công việc thông qua các chỉ số như số lô chờ lấy mẫu, số lô đạt chuẩn và tỷ lệ lỗi trung bình. Danh sách các lô hàng mới nhất từ bộ phận Inbound được liệt kê trực quan tại trung tâm, giúp kỹ thuật viên ưu tiên thực hiện lấy mẫu kiểm định ngay. Phía bên phải tích hợp hệ thống cảnh báo về các nhà cung cấp có tỷ lệ lỗi biến động để người dùng chủ động kiểm soát rủi ro chất lượng đầu vào.

---

### 4.2 Inbound Screen

![Inbound Screen](./Images/QualityControlTechnician/InboundScreen.png)

Khi truy cập mục "Kiểm soát đầu vào" trên thanh điều hướng, màn hình InboundScreen hiển thị danh sách toàn bộ các lô nguyên liệu đang ở trạng thái chờ đánh giá chất lượng. Màn hình cung cấp các thông tin định danh quan trọng như mã lô, tên nguyên liệu và nhà cung cấp tương ứng để thuận tiện cho việc tra cứu hồ sơ. Tại đây, kỹ thuật viên có thể sử dụng công cụ lọc để phân loại các lô hàng cần ưu tiên xử lý trước khi tiến hành quy trình kiểm định chuyên sâu.

---

### 4.3 Check Batch

![Check Batch](./Images/QualityControlTechnician/CheckBatch.png)

Bằng cách nhấn "Tiến hành kiểm định", một giao diện modal xuất hiện để người dùng nhập các kết quả phân tích thực tế như độ ẩm, hàm lượng tinh khiết và cảm quan. Màn hình hiển thị rõ các tiêu chuẩn kỹ thuật (Specs) làm căn cứ khoa học để kỹ thuật viên đối chiếu trực tiếp và đưa ra quyết định phê duyệt. Nếu kết quả nhập vào nằm ngoài ngưỡng cho phép, hệ thống sẽ tự động hiển thị cảnh báo để ngăn chặn các sai sót trong đánh giá chất lượng dược phẩm. Người dùng có thể chọn trạng thái lô hàng.

---

### 4.4 Reject Batch

![Reject Batch](./Images/QualityControlTechnician/RejectBatch.png)

Trong trường hợp chọn trạng thái từ chối (Reject), hệ thống sẽ mở rộng giao diện yêu cầu cung cấp lý do chi tiết và tải lên bằng chứng hình ảnh lỗi. Thông tin này là bắt buộc để hệ thống tự động khởi tạo phiếu hủy hàng và gửi báo cáo trực tiếp đến bộ phận Quản lý (Manager). Quy trình này đảm bảo tính minh bạch và lưu trữ đầy đủ căn cứ pháp lý cho các lô hàng không đạt tiêu chuẩn an toàn.

---

### 4.5 Quality Alert Screen

![Quality Alert Screen](./Images/QualityControlTechnician/QualityAlertScreen.png)

Mục "Kiểm định tồn kho" dẫn đến giao diện quản lý chất lượng hàng hóa lưu kho, mặc định hiển thị danh sách các mặt hàng sắp đến hạn tái kiểm tra. Màn hình phân loại rõ rệt các nhãn trạng thái như "Near Expiry" (sắp hết hạn) hoặc "Retest Due" (đến hạn kiểm định lại) của từng loại thuốc cụ thể. Kỹ thuật viên dựa vào danh sách này để lập kế hoạch lấy mẫu kiểm tra lại tính ổn định của dược phẩm theo đúng quy định bảo quản.

---

### 4.6 Retest Screen

![Retest Screen](./Images/QualityControlTechnician/RetestScreen.png)

Khi người dùng nhấn "Thực hiện Re-test", giao diện modal xuất hiện hiển thị thông tin sản phẩm và vị trí kho hiện tại của lô hàng cần kiểm tra. Dựa trên kết quả phân tích thực tế, kỹ thuật viên có thể lựa chọn quyết định gia hạn thời gian sử dụng (Extend) hoặc hủy bỏ hoàn toàn lô hàng nếu không còn đạt chuẩn (Discard). Thao tác này giúp cập nhật ngay lập tức hạn sử dụng mới hoặc trạng thái hàng hóa trên toàn bộ hệ thống quản lý tồn kho.

---

### 4.7 Quarantine

![Quarantine](./Images/QualityControlTechnician/Quarantine.png)

Chuyển sang tab "Cách ly hàng hóa (Quarantine)", người dùng có thể quản lý các lô hàng đang gặp vấn đề về chất lượng hoặc nằm trong diện nghi ngờ rủi ro. Màn hình cho phép chọn nhiều lô hàng cùng lúc để thực hiện lệnh cách ly hàng loạt, ngăn chặn tuyệt đối việc xuất kho các sản phẩm chưa đảm bảo an toàn. Các thông tin về vị trí Bin và trạng thái hiện tại được hiển thị chi tiết để hỗ trợ việc theo dõi và di dời hàng hóa vào khu vực biệt trữ.

---

### 4.8 Report & Traceability Screen

![Report & Traceability Screen](./Images/QualityControlTechnician/ReportAndTraceabilityScreen.png)

Mục "Báo cáo & Truy vết" hỗ trợ người dùng tìm kiếm nhanh vòng đời của từng lô hàng thông qua mã định danh hoặc tính năng quét mã QR tiện lợi. Giao diện hiển thị các thẻ thông tin tóm tắt về trạng thái hiện hành của sản phẩm như "Active" (đang lưu hành) hoặc "Rejected" (đã bị từ chối). Từ đây, kỹ thuật viên có thể truy cập vào sơ đồ lịch sử chi tiết để phục vụ công tác thanh tra hoặc báo cáo thu hồi sản phẩm.

---

### 4.9 Timeline Traceability

![Timeline Traceability](./Images/QualityControlTechnician/TimelineTraceability.png)

Khi nhấn nút "Xem Timeline", hệ thống cung cấp sơ đồ dòng thời gian ghi lại mọi hoạt động của lô hàng từ lúc nhập kho đến các kỳ tái kiểm định định kỳ. Mỗi bước thực hiện đều hiển thị rõ thời gian chính xác và định danh nhân viên chịu trách nhiệm, đảm bảo tính truy xuất nguồn gốc tuyệt đối cho dược phẩm. Tính năng "Xuất COA (PDF)" được tích hợp sẵn giúp người dùng trích xuất chứng nhận phân tích đạt chuẩn để cung cấp cho các bên liên quan.

---

### 4.10 Efficiency

![Efficiency](./Images/QualityControlTechnician/Efficiency.png)

Tab "Hiệu suất Nhà CC" cung cấp bảng thống kê định lượng về chất lượng hàng hóa của từng đơn vị cung ứng dựa trên dữ liệu lịch sử nhập kho. Giao diện sử dụng các biểu đồ thanh và tỷ lệ phần trăm để đánh giá mức độ tin cậy của các đối tác thông qua chỉ số đạt chuẩn (Approved) và từ chối (Rejected). Dữ liệu này là căn cứ khoa học để nhà quản lý đưa ra quyết định tái đánh giá hoặc điều chỉnh kế hoạch thu mua trong chuỗi cung ứng.

---

### 4.11 Error Detail

![Error Detail](./Images/QualityControlTechnician/ErrorDetail.png)

Khi người dùng nhấn vào "Chi tiết lỗi" tại danh sách hiệu suất, hệ thống hiển thị modal ErrorDetail cung cấp hồ sơ cụ thể về các lô hàng bị từ chối. Màn hình liệt kê chi tiết lý do lỗi như bao bì rách hoặc độ ẩm vượt ngưỡng, kèm theo ảnh bằng chứng và mức độ nghiêm trọng của từng sự cố. Thông tin này giúp bộ phận QC có bằng chứng xác thực để làm việc với nhà cung cấp về các vấn đề sai hỏng định kỳ.

## 5. IT Administrator Screens

### 5.1 Dashboard Screen

![Dashboard Screen](./Images/ITAdministrator/DashboardScreen.png)

Sau khi đăng nhập với vai trò IT Administrator, hệ thống hiển thị DashboardScreen cung cấp cái nhìn tổng thể về sức khỏe hạ tầng thông qua các chỉ số: trạng thái hệ thống, hiệu suất CPU, dung lượng ổ đĩa và số lượng cảnh báo hiện có. Màn hình tích hợp biểu đồ hiệu năng thời gian thực cho phép theo dõi đồng thời CPU, RAM và độ trễ mạng. Phía bên phải là danh sách các cảnh báo bảo mật và lưu trữ khẩn cấp kèm theo lối tắt quản trị nhanh để truy cập tức thì vào nhật ký hoặc báo cáo.

---

### 5.2 Monitoring Screen

![Monitoring Screen](./Images/ITAdministrator/MonitoringScreen.png)

Khi nhấn vào mục "Giám sát hệ thống" trên thanh điều hướng, người dùng truy cập giao diện giám sát chi tiết các thông số tài nguyên máy chủ. Màn hình hiển thị trạng thái vận hành của các dịch vụ cốt lõi như Database Cluster và Auth Service kèm theo mức tải hệ thống tương ứng. Trung tâm cảnh báo phía bên phải liệt kê các sự cố hiệu năng bất thường, giúp kỹ thuật viên chủ động kiểm soát rủi ro thông qua chỉ số tin cậy Uptime Reliability.

---

### 5.3 Logs Screen

![Logs Screen](./Images/ITAdministrator/LogsScreen.png)

Mục "Nhật kí lỗi" trên navbar dẫn đến giao diện LogsScreen, nơi hiển thị luồng dữ liệu log hệ thống dưới định dạng console chuyên dụng. Khi chọn một dòng lỗi cụ thể, bảng "Chi tiết lỗi" sẽ hiện ra cung cấp mã lỗi và mã nguồn gây lỗi (Stack Trace) để phục vụ phân tích nguyên nhân. Tại đây, quản trị viên có thể thực hiện thao tác khắc phục như Restart service và ghi chú quá trình xử lý vào mục "Báo cáo xử lý" để lưu vết hệ thống.

---

### 5.4 Logs History

![Logs History](./Images/ITAdministrator/LogsHistory.png)

Bằng cách nhấn vào nút "Lịch sử xử lý", hệ thống hiển thị giao diện LogsHistory cung cấp hồ sơ toàn diện về các hoạt động khắc phục sự cố đã thực hiện. Mỗi bản ghi lịch sử liệt kê chi tiết mã truy vết, loại hành động (như Restart hoặc Edit Config), và nội dung giải trình nguyên nhân gốc rễ. Màn hình này đảm bảo tính minh bạch bằng cách ghi nhận chính xác định danh quản trị viên thực hiện và thời gian hoàn thành cho từng vụ việc.

---

### 5.5 Backup Screen

![Backup Screen](./Images/ITAdministrator/BackupScreen.png)

Khi chọn mục "Sao lưu & khôi phục", người dùng truy cập vào trung tâm quản lý an toàn dữ liệu với bảng phân tích rủi ro và các đề xuất phòng ngừa cụ thể. Quản trị viên có thể thiết lập lịch trình sao lưu tự động theo tần suất và thời gian tùy chỉnh, đồng thời kiểm tra trạng thái "Verified" của các bản sao lưu gần nhất. Đặc biệt, tính năng "Recovery Drill Console" cho phép thực hiện phục hồi thử nghiệm trong môi trường Sandbox để đảm bảo khả năng khôi phục dữ liệu 100% khi có sự cố thật xảy ra.

---

### 5.6 Report Screen

![Report Screen](./Images/ITAdministrator/ReportScreen.png)

Mục "Báo cáo hệ thống" trên navbar dẫn đến giao diện tổng kết dữ liệu vận hành theo tháng, bao gồm tỷ lệ Uptime, lịch sử sự cố và trạng thái sao lưu. Dựa trên kết quả báo cáo, hệ thống tự động đưa ra các đề xuất cải tiến hạ tầng như nâng cấp RAM hoặc cấu hình sao lưu đa vùng (Multi-Region) kèm theo mức độ ưu tiên xử lý. Người dùng có thể sử dụng nút "XUẤT BÁO CÁO (PDF)" để trích xuất văn bản phục vụ công tác thanh tra hoặc trình phương án nâng cấp hệ thống cho cấp quản lý.