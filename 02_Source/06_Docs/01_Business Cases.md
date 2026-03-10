# 01. Business Cases — Quản lý Kho

## 1. Bối cảnh nghiệp vụ
Nhiều doanh nghiệp vừa và nhỏ hiện nay vẫn quản lý kho bằng phương pháp thủ công hoặc bán thủ công (giấy tờ, Excel rời rạc). Cách làm này dẫn đến:
- Sai lệch tồn kho giữa thực tế và hệ thống.
- Khó truy vết lô hàng, đặc biệt khi có lỗi chất lượng.
- Rủi ro pháp lý khi kiểm toán hoặc thanh tra.
- Thông tin chậm trễ, ảnh hưởng đến quyết định quản lý.

Hệ thống Inventory Management System được đề xuất nhằm số hóa toàn bộ vòng đời hàng hóa trong kho, từ nhập – kiểm soát chất lượng – lưu kho – xuất – kiểm kê, đồng thời vẫn hỗ trợ các nghiệp vụ thủ công bắt buộc (in phiếu, ký tay, lưu hồ sơ giấy).

---

## 2. Vấn đề nghiệp vụ
Các vấn đề chính mà doanh nghiệp đang gặp phải:
- Không có cái nhìn tổng thể, thời gian thực về tồn kho.
- Quy trình kiểm soát chất lượng và truy vết lô hàng không nhất quán.
- Sai sót do nhập liệu thủ công và thiếu kiểm soát.
- Chi phí vận hành cao do xử lý lại, kiểm kê lại và xử lý sự cố.
- Khó đáp ứng yêu cầu kiểm toán và tuân thủ pháp lý.

---

## 3. Vai trò chính, vấn đề và mục tiêu
### 3.1 Manager (Quản lý)
- Pain Points:
  - Thiếu thông tin kịp thời để ra quyết định (không biết hàng sắp hết, tồn ứ ở đâu).
  - Báo cáo rời rạc, khó so sánh theo thời gian hoặc theo kho.
  - Khó đánh giá hiệu suất tồn kho và nhà cung cấp.
- Goals:
  - Nhận báo cáo và dashboard thời gian thực về tồn kho, cảnh báo hết hạn, chênh lệch kiểm kê.
  - Dễ dàng lọc và xuất báo cáo (CSV/Excel) phục vụ kiểm toán.
  - Có công cụ phê duyệt/duyệt phiếu nhập-xuất và tra cứu lịch sử giao dịch.

### 3.2 Quality Control Technician (Kỹ thuật viên kiểm soát chất lượng)
- Pain Points:
  - Nhiều thủ tục giấy tờ khi đánh giá chất lượng, khó lưu evidence (ảnh, kết quả test).
  - Thiếu checklist tiêu chuẩn và workflow xử lý hàng lỗi.
  - Khó truy vết lot/serial liên quan đến lỗi.
- Goals:
  - Quét barcode/QR, lưu hình ảnh và kết quả kiểm tra ngay tại điểm lấy mẫu.
  - Có workflow rõ ràng: Pending -> Check -> Approve/Reject/Hold -> Lưu lịch sử.
  - Báo cáo truy xuất nguồn gốc (COA) và báo cáo chất lượng theo nhà cung cấp.

### 3.3 Operator / Warehouse Staff (Nhân viên kho)
- Pain Points:
  - Sai sót do nhập tay, giấy tờ hoặc dữ liệu không đồng bộ.
  - Phải xử lý nhiều phiếu cùng lúc, dễ nhầm lẫn vị trí/kệ hàng.
  - Khó quản lý lô/serial khi cần truy xuất.
- Goals:
  - Giao diện đơn giản, hỗ trợ scan barcode/QR cho receiving, picking, transfer và count.
  - Phiếu picking/receiving rõ ràng kèm vị trí (bin location) để giảm thời gian tìm kiếm.
  - Tối thiểu sai sót khi cập nhật tồn kho và tạo chứng từ.
  - Hỗ trợ import dữ liệu từ file CSV/Excel khi cần.

### 3.4 IT Administrator (Quản trị hệ thống)
- Pain Points:
  - Phức tạp khi quản lý số lượng user và phân quyền RBAC.
  - Cần đảm bảo an toàn dữ liệu, backup, audit log và khả năng khôi phục dữ liệu.
  - Cấu hình kho, vị trí, template dễ sai khi thao tác thủ công.
- Goals:
  - Cung cấp công cụ quản lý người dùng & RBAC, audit log chi tiết.
  - Thiết lập backup/restore, giám sát hệ thống và cảnh báo sớm.
  - Hỗ trợ import cấu hình từ CSV/Excel để nhanh triển khai.

---

## 4. Mục tiêu hệ thống (tổng quát)
- Thay thế các công việc giấy tờ thủ công, giảm sai sót thao tác tay.
- Đảm bảo truy vết đầy đủ (audit trail) và tuân thủ pháp lý.
- Chặn các lô hàng bị lỗi, hết hạn.
- Cung cấp dashboard cảnh báo rủi ro (near-expiry, rejected, inventory discrepancy).
- Cung cấp báo cáo/analytics hỗ trợ quản trị.
- Uptime mục tiêu: 99.9%
- Khả năng mở rộng cho dữ liệu lớn
- Phản hồi API/Report trong ngưỡng chấp nhận.

---

## 5. Luồng quy trình nghiệp vụ chính (theo vai trò)
### 5.1 Luồng cho Manager
1) Kiểm tra thông tin hàng hóa
- Mục đích: Xem nhanh hồ sơ sản phẩm, lịch sử giao dịch và trạng thái lô.
- Hệ thống: Tìm kiếm SKU / Batch -> Mở Detail Product -> Xem lịch sử, vị trí, trạng thái, COA.
- Thủ công: In hồ sơ hoặc COA để lưu trữ, ký tay xác nhận nếu cần.

2) Kiểm tra & điều chỉnh tồn kho
- Mục đích: Xác nhận số liệu tồn kho, xử lý chênh lệch sau kiểm kê.
- Hệ thống: Tạo/duyệt phiếu kiểm kê, so sánh số thực tế vs hệ thống, tạo điều chỉnh tồn kho (Adjustment).
- Thủ công: Kiểm tra thực địa, ký xác nhận biên bản kiểm kê, lưu bản giấy nếu phục vụ kiểm toán.

3) Tạo, phê duyệt phiếu nhập/xuất
- Mục đích: Quản lý chứng từ nhập xuất hợp lệ theo quy định.
- Hệ thống: Tạo phiếu (Create Import/Export) -> Đính kèm chứng từ (invoice/PO) -> Trạng thái Chờ xác nhận -> Manager duyệt/không duyệt.
- Thủ công: Kiểm tra chứng từ gốc (hóa đơn, biên bản giao nhận), in phiếu để lưu kho pháp lý, chữ ký tay khi cần.

4) Tạo & xuất báo cáo kiểm kê / tuân thủ
- Mục đích: Cung cấp báo cáo cho kiểm toán, quản lý cấp cao.
- Hệ thống: Tạo báo cáo theo phạm vi (kho, nhóm hàng, thời gian), xuất PDF/Excel, lịch sử versioning.
- Thủ công: Ký xác nhận báo cáo in, lưu trữ bản cứng theo quy định.

5) Theo dõi cảnh báo rủi ro
- Mục đích: Phát hiện lô near-expiry, hàng tồn lâu, lô bị QC hold.
- Hệ thống: Dashboard cảnh báo, gửi email/notification cho người liên quan.
- Thủ công: Họp xử lý, quyết định tiêu hủy, khuyến mãi hoặc trả hàng.


### 5.2 Luồng cho Quality Control Technician (QC)
1) Đánh giá lô chờ nhập (Pending Batch Evaluation)
- Hệ thống: Dashboard Pending QC -> Chọn Batch -> Lấy mẫu -> Nhập kết quả test vào form -> Hệ thống so sánh với Spec -> Chọn Approve / Reject / Hold.
- Thủ công: Lấy mẫu vật lý, test offline (phòng lab), chụp ảnh bằng chứng, ký vào giấy tờ COA nếu cần.

2) Xử lý lô bị từ chối (Rejection Handling)
- Hệ thống: Khi Reject -> Yêu cầu nhập lý do, upload ảnh -> Tạo phiếu yêu cầu trả hàng/hủy gửi Manager/Operator -> Khóa lô (block scan).
- Thủ công: Lập biên bản hủy/trả hàng, liên hệ nhà cung cấp, sắp xếp vận chuyển trả hàng.

3) Re-test & Quarantine
- Hệ thống: Lập lịch re-test, cập nhật trạng thái (Extend / Discard), chuyển hàng sang Quarantine (bulk action).
- Thủ công: Di chuyển thực tế lô đến khu vực cách ly, niêm phong và ký nhận.

4) Truy vết & báo cáo chất lượng
- Hệ thống: Batch History / Timeline -> Xuất COA (PDF) -> Báo cáo hiệu suất nhà cung cấp.
- Thủ công: Chuẩn bị hồ sơ gửi thanh tra/nhà cung cấp, họp xử lý khi có vi phạm.


### 5.3 Luồng cho Operator (Nhân viên kho)
1) Tiếp nhận hàng (Receiving)
- Hệ thống: Tạo phiếu nhận / hoặc nhận phiếu từ PO -> Scan barcode/Batch -> Nhập số lượng thực tế -> Gán vị trí bin -> Hoàn tất nhập kho (trạng thái chờ QC nếu cần).
- Thủ công: Kiểm tra hàng hóa thực tế, đối chiếu hóa đơn/giao nhận, ký biên bản nhận hàng.

2) Thực hiện xuất kho (Picking & Dispatch)
- Hệ thống: Nhận lệnh xuất -> Danh sách picking kèm vị trí -> Scan khi lấy -> Xác nhận số lượng -> Tạo chứng từ xuất (warehouse release) -> Manager/Requester duyệt.
- Thủ công: Chuẩn bị kiện hàng, in phiếu xuất, ký giao nhận khi giao cho bên vận chuyển.

3) Tạo phiếu & xử lý phiếu đặc biệt
- Hệ thống: Tạo Purchase Order/Ad-hoc Receipt khi có hàng phát sinh ngoài PO -> Ghi chú, đính kèm chứng từ.
- Thủ công: Ghi nhật ký thủ công nếu hệ thống offline, lưu biên bản tạm thời.

4) Kiểm kê định kỳ
- Hệ thống: Nhận nhiệm vụ kiểm kê -> Quét/nhập số thực tế vào InventoryProcess -> Lưu & gửi báo cáo -> Manager so sánh và điều chỉnh.
- Thủ công: Đếm tay, ghi sổ kiểm kê, ký biên bản kiểm kê.


### 5.4 Luồng cho IT Administrator
1) Giám sát & xử lý sự cố
- Hệ thống: Dashboard giám sát (CPU/RAM/disk/service) -> Xem logs -> Thực hiện restart service/scale up theo cảnh báo.
- Thủ công: Truy cập vật lý/SSH vào server, khởi động lại dịch vụ khi cần, ghi hồ sơ thao tác.

2) Sao lưu & phục hồi
- Hệ thống: Thiết lập schedule backup (DB, FS, logs) -> Kiểm tra lịch sử backup -> Thực hiện recovery từ bản sao lưu.
- Thủ công: Lưu trữ bản backup offline (tape/USB/hard drive), kiểm tra checksum, in/ghi lại nhật ký phục hồi.

3) Quản lý user & RBAC
- Hệ thống: Tạo/Sửa/Khóa user, gán role, xem audit logs chi tiết.
- Thủ công: Xác nhận danh tính người dùng bằng giấy tờ nếu cần (khi xử lý trường hợp nhạy cảm), lưu trữ biểu mẫu phê duyệt quyền truy cập.

---

## 6. Luồng liên vai trò (handoff) — những điểm cần chú ý
- Receiving -> QC: Operator nhập lô vào hệ thống với trạng thái "Pending QC"; QC phải thực hiện kiểm tra trước khi Manager/Operator có thể chuyển lô vào kho để xuất.
- QC Reject -> Manager & Operator: Khi QC Reject, lô sẽ bị khóa, hệ thống gửi thông báo cho Manager để quyết định (return/toxic/discard). Thủ tục trả hàng thường bao gồm biên bản và văn bản liên hệ nhà cung cấp.
- Inventory Count -> Manager Approval: Operator báo cáo kết quả kiểm kê, Manager xét và phê duyệt điều chỉnh tồn kho.
- Backup & Incident: IT thực hiện phục hồi, thông báo và ghi log cho Manager/QA để đánh giá ảnh hưởng nghiệp vụ.

---

## 7. Quy trình nghiệp vụ thủ công (ví dụ thực tế)
1) Biên bản kiểm nhận hàng hóa: khi xảy ra chênh lệch lượng/khi có hàng bị hư hỏng, nhân viên lập biên bản có chữ ký của người giao, người nhận và Manager.
2) Phiếu giao nhận giấy: Dùng khi thiết bị quét/ứng dụng offline, sau đó nhập thủ công vào hệ thống.
3) Niêm phong & ký xác nhận Quarantine: QC/Operator niêm phong lô và lưu biên bản cách ly.
4) Lưu trữ chứng từ gốc: Hóa đơn/COA/PO in ra, đóng thành hồ sơ theo quy định pháp lý.

---

## 8. Tiêu chí chấp nhận (Acceptance Criteria) & KPI liên quan
- Hệ thống lưu đầy đủ lịch sử (audit trails) cho mọi thao tác nhập/xuất/duyệt/kiểm tra.
- Có dashboard cảnh báo Near-Expiry / Rejected / Inventory-Discrepancy.
- Hỗ trợ export báo cáo CSV/Excel.
- Tích hợp scan barcode/QR cho receiving, picking, inventory count.
- Backup & restore được kiểm tra định kỳ (test recovery ít nhất hàng tháng).

KPI:
- Thời gian tạo báo cáo: < 30s (với dataset mẫu).
- API response: < 20s cho các truy vấn chuẩn.
- Uptime: >= 99.9%.
- Tỷ lệ người dùng đánh giá good/excellent: >= 90%.

---

## 9. Conclusion

Hệ thống Inventory Management được đề xuất nhằm giải quyết các vấn đề cốt lõi trong quản lý kho của doanh nghiệp, đồng thời tạo nền tảng cho việc mở rộng và tích hợp trong tương lai. Việc triển khai hệ thống này giúp doanh nghiệp giảm rủi ro, tăng hiệu quả vận hành và nâng cao khả năng kiểm soát.
