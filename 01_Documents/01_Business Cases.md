# 01. Business Cases — Quản lý Kho

## 1. Bối cảnh nghiệp vụ
Phần mềm Quản lý Kho được xây dựng nhằm hỗ trợ các doanh nghiệp vừa và nhỏ quản lý hàng tồn kho, theo dõi luồng di chuyển hàng hóa (nhập/xuất/chuyển/kiểm kê), quản lý sản phẩm, kho, giao dịch, đồng thời cung cấp chức năng phân quyền người dùng, audit log và báo cáo hỗ trợ quản trị.

---

## 2. Các vai trò

### Các vai trò chính

- Role Name: Manager (Quản lý)
  - Pain Points:
    - Thiếu thông tin kịp thời để ra quyết định (không biết hàng sắp hết, tồn ứ ở đâu).
    - Báo cáo rời rạc, khó so sánh theo thời gian hoặc theo kho.
    - Khó đánh giá hiệu suất tồn kho và nhà cung cấp.
  - Needs:
    - Dashboard và báo cáo thời gian thực về tồn kho, nhập/xuất, tồn tối thiểu và cảnh báo.
    - Công cụ lọc/so sánh theo kho, SKU, nhà cung cấp, khoảng thời gian.
    - Báo cáo xuất được CSV/Excel để làm báo cáo quản trị.

- Role Name: Quality Control Technician (Nhân viên kiểm soát chất lượng)
  - Pain Points:
    - Nhiều thao tác giấy tờ thủ công khi kiểm nhận, khó lưu evidence kèm hình ảnh.
    - Thiếu tiêu chí/luồng chuẩn cho kiểm tra chất lượng tại kho.
    - Khó theo dõi lot/serial liên quan đến các lỗi chất lượng.
  - Needs:
    - Ứng dụng quét barcode/lưu ảnh, ghi nhận kết quả kiểm tra ngay trên mobile.
    - Quy trình kiểm nhận chuẩn (checklist) và workflow xử lý hàng lỗi (scrap/return).
    - Theo dõi lịch sử chất lượng theo lot/serial và liên kết với PO/Receipt.

- Role Name: Operator / Warehouse Staff (Nhân viên kho)
  - Pain Points:
    - Sai sót khi nhập/xuất do thao tác tay, giấy tờ hoặc dữ liệu không đồng bộ.
    - Phải xử lý nhiều phiếu cùng lúc, dễ nhầm lẫn vị trí/khoảng cách hàng.
    - Khó quản lý hàng theo lô/serial khi có yêu cầu truy xuất.
  - Needs:
    - Giao diện thao tác đơn giản (mobile/scan) cho picking, receiving, transfer và count.
    - Hỗ trợ barcode/serial để giảm lỗi và tăng tốc xử lý phiếu.
    - Hướng dẫn/phiếu picking rõ ràng kèm vị trí lưu trữ để giảm thời gian tìm kiếm.

- Role Name: IT Administrator (Quản trị hệ thống)
  - Pain Points:
    - Quản lý tài khoản và phân quyền phức tạp khi số lượng người dùng tăng.
    - Cần đảm bảo an toàn dữ liệu, backup, audit log và khả năng khôi phục.
    - Cấu hình hệ thống (kho, vị trí, quyền) dễ sai sót khi thực hiện thủ công.
  - Needs:
    - Công cụ quản lý người dùng & RBAC rõ ràng, dễ tích hợp với hệ thống hiện tại.
    - Audit logs chi tiết cho mọi thao tác quan trọng và báo cáo kiểm toán.
    - Cơ chế backup/restore, hướng dẫn cấu hình kho nhanh (templates/migrate từ CSV).


### Objectives (Mục tiêu hệ thống chung)
- Thay thế các công việc bằng giấy tờ thủ công.
- Đảm bảo tuân thủ các quy định của pháp luật và lưu audit trail.
- Theo dõi quản lý các nguyên vật liệu từ lúc nhận đến chuyển giao.
- Cung cấp báo cáo quản trị đầy đủ (export CSV/Excel, lọc theo nhiều chiều).
- Độ sẵn sàng (uptime) mục tiêu: 99.9%.
- Mục tiêu trải nghiệm: >= 90% người dùng đánh giá good/excellent.
- Khả năng mở rộng: hệ thống có thể chạy trên dữ liệu lớn (scale).
