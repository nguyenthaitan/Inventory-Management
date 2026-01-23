# 08_Project Management

## Mục đích
Tài liệu này trình bày kế hoạch quản lý dự án cho đồ án "Inventory Management" bao gồm ước lượng kích cỡ công việc (person-days), lịch trình thời gian (theo tuần), ước tính chi phí, các cột mốc quan trọng, phân công vai trò thành viên, rủi ro và biện pháp giảm thiểu, cùng các liên kết mời tham gia hệ thống hỗ trợ (team chat, quản lý dự án, quản lý lỗi). Mục tiêu giúp nhóm và giảng viên nắm được phạm vi, tiến độ và nguồn lực cần thiết để hoàn thành đồ án.

---

## Tổng quan ước lượng (Tóm tắt)
- Số thành viên: 6
- Tổng ước lượng kích cỡ: 240 person-days (tham khảo chi tiết bên dưới)
- Thời gian thực hiện dự kiến: 12 tuần (3 tháng)
- Chi phí nhân công ước tính: 96.000.000 VND (dựa trên 400.000 VND/ngày)
- Chi phí hạ tầng & khác (10% overhead): 9.600.000 VND
- Tổng chi phí ước tính: 105.600.000 VND

---

## 1. Ước lượng kích cỡ theo module (person-days)
Bảng dưới đây liệt kê các module/chức năng chính và ước lượng person-days (PD). Đây là ước lượng ở mức trung bình (Normal). Có thể thêm buffer nếu cần (ví dụ +15-25%).

| Module / Chức năng | Mô tả ngắn | Ước lượng (person-days) |
|---|---:|---:|
| 1. Authentication & Authorization | Đăng nhập, phân quyền, quản lý role | 20 |
| 2. Product Management | CRUD sản phẩm, SKU, category | 30 |
| 3. Warehouse & Location | Quản lý kho, vị trí, gán nhân viên | 20 |
| 4. Inventory & Stock | InventoryRecord, kiểm kê, cảnh báo tồn | 40 |
| 5. Purchase (PO) | Tạo PO, nhận hàng, liên kết supplier | 25 |
| 6. Sales (SO) & Invoice | Tạo SO, reservation, hóa đơn | 30 |
| 7. Stock Movements & Transfers | StockMove, điều chuyển giữa kho | 20 |
| 8. Reporting & Export | Báo cáo nhập/xuất/tồn, xuất CSV/Excel | 20 |
| 9. Audit & Logging | Audit log, history, activity feed | 10 |
| 10. Frontend UI/UX & Integration | Layout, responsive, form validation | 25 |
| 11. Testing & QA | Unit tests, e2e, manual testing | 15 |
| 12. DevOps & Deployment | CI/CD, môi trường staging/production | 15 |
| **Tổng** |  | **285** |

> Ghi chú: Tổng ở bảng là 285 PD — đây là tổng mức effort nếu mỗi chức năng được triển khai độc lập. Để phản ánh năng lực nhóm 6 người trong 12 tuần, ta sử dụng giả định phân bổ song song và ưu tiên song song các module để đưa ra tổng 240 PD làm con số tham khảo thực tế (đã điều chỉnh một số song song hóa và giảm overlap).

---

## 2. Giả định ước lượng
- 1 person-day = 8 giờ làm việc.
- Nhóm 6 người làm việc bán thời gian/đồ án: trung bình 4 ngày/tuần/người (tương đương 0.8 FTE nếu full-time 5 ngày/tuần) vì sinh viên có lịch học khác.
- Mức năng suất trung bình: 1 person-day = hoàn thành 1 PD theo ước lượng.
- Không tính thời gian chờ phê duyệt từ bên ngoài (giảng viên, doanh nghiệp).
- Không tính các chi phí khấu hao thiết bị cá nhân.
- Ước lượng có thể thay đổi ±20% tùy rủi ro và phạm vi thay đổi.

---

## 3. Lịch trình tổng thể (12 tuần)
Giả sử ngày bắt đầu: Tuần 1 (T0). Mỗi tuần 5 ngày làm việc. Dưới đây là lịch trình theo tuần, mốc chính và phân công sơ bộ.

- Tuần 1–2: Lập kế hoạch chi tiết, thiết kế system architecture và domain model, chuẩn bị môi trường dev
  - Deliverables: Tài liệu kiến trúc, domain model, môi trường repo & CI cơ bản
  - Người phụ trách: Nguyễn Thái Tân (PM/Lead), Nguyễn Tuấn Minh (Backend), Nguyễn Huy Tấn (Frontend)

- Tuần 3–5: Phát triển backend core (auth, product, warehouse, inventory basic)
  - Deliverables: API cơ bản, DB schema, test unit backend
  - Người phụ trách: Nguyễn Tuấn Minh (Backend Lead), Phạm Văn Minh (Backend), Nguyễn Ngọc Giang (QA hỗ trợ)

- Tuần 4–7: Phát triển frontend (UI quản lý sản phẩm, kho, tồn kho), tích hợp với API
  - Deliverables: Giao diện quản trị cơ bản, tích hợp CRUD
  - Người phụ trách: Nguyễn Huy Tấn (Frontend Lead), Trần Gia Bảo (Frontend), Nguyễn Thái Tân (UX review)

- Tuần 6–8: Tính năng Purchase Order & Sales Order, StockMove
  - Deliverables: PO/SO flow, reservation, stock move
  - Người phụ trách: Nguyễn Tuấn Minh, Phạm Văn Minh, Nguyễn Huy Tấn

- Tuần 8–10: Reporting, Export, Invoice và Audit Log
  - Deliverables: Báo cáo cơ bản, export CSV/Excel, audit trail
  - Người phụ trách: Nguyễn Ngọc Giang (QA), Trần Gia Bảo

- Tuần 10–11: Testing tổng thể, fix bug, chuẩn bị demo
  - Deliverables: Test report, bug list resolved, release candidate
  - Người phụ trách: Toàn bộ nhóm (QA dẫn dắt)

- Tuần 12: Triển khai production (nếu có), hoàn thiện tài liệu, báo cáo và nộp đồ án
  - Deliverables: Deployment, README hoàn chỉnh, video demo
  - Người phụ trách: Nguyễn Thái Tân (Lead), DevOps: Phạm Văn Minh

> Ghi chú phân bổ thời gian: Mỗi thành viên đảm nhận song song các nhiệm vụ với tỉ lệ dev/test/PM theo vai trò. Giả định trung bình 60% thời gian dành cho development, 30% cho testing/QA, 10% cho quản lý & kiểm thử.

---

## 4. Phân bổ công việc sơ bộ (Theo tên)
Bảng dưới đây là đề xuất vai trò và tỉ lệ công việc.

| Thành viên | Vai trò đề xuất | Tỉ lệ dev / QA / PM |
|---|---|---:|
| Nguyễn Thái Tân | Nhóm trưởng, PM, UX reviewer | 30% dev / 10% QA / 60% PM |
| Nguyễn Tuấn Minh | Backend Lead | 70% dev / 20% QA / 10% PM |
| Nguyễn Huy Tấn | Frontend Lead | 70% dev / 20% QA / 10% PM |
| Phạm Văn Minh | Backend dev & DevOps | 60% dev / 20% QA / 20% DevOps |
| Nguyễn Ngọc Giang | QA & Test Engineer | 20% dev / 70% QA / 10% PM |
| Trần Gia Bảo | Frontend dev & tích hợp | 60% dev / 30% QA / 10% PM |

---

## 5. Ước tính chi phí
- Mức lương/chi phí sử dụng: 400.000 VND / person-day.
- Tổng PD dùng cho ước tính thực tế: 240 PD (đã điều chỉnh song song) -> Nhân công = 240 * 400.000 = 96.000.000 VND
- Chi phí hạ tầng & khác (10%): 9.600.000 VND
- Tổng chi phí ước tính: 105.600.000 VND

> Ghi chú: Chi phí này chỉ mang tính tham khảo cho đồ án (không tính thuế, chi phí văn phòng, thiết bị cá nhân). Nếu muốn chi tiết hơn, có thể phân tách chi phí hosting (Ví dụ: VPS, DB), domain, công cụ trả phí (Slack / Trello premium), và chi phí video/marketing.

---

## 6. Các cột mốc quan trọng (Milestones)
Dưới đây là ít nhất 6 mốc quan trọng kèm ngày dự kiến (tính theo lịch 12 tuần, bắt đầu Tuần 1 = ngày bắt đầu dự án).

1. Milestone 1 — Project Setup & Architecture (Kết thúc Tuần 2)
   - Ngày dự kiến: End of Week 2
   - Deliverables: Repo initialised, CI basic, domain model, ER diagram, môi trường dev

2. Milestone 2 — Core Backend APIs (Kết thúc Tuần 5)
   - Ngày dự kiến: End of Week 5
   - Deliverables: Auth, Product CRUD, Warehouse, Inventory basic APIs, unit tests

3. Milestone 3 — Frontend MVP (Kết thúc Tuần 7)
   - Ngày dự kiến: End of Week 7
   - Deliverables: UI cho quản lý sản phẩm/kho/tồn, tích hợp CRUD

4. Milestone 4 — PO/SO & Stock Movements (Kết thúc Tuần 8)
   - Ngày dự kiến: End of Week 8
   - Deliverables: PurchaseOrder, SalesOrder flows, stock move logic

5. Milestone 5 — Reporting & Audit (Kết thúc Tuần 10)
   - Ngày dự kiến: End of Week 10
   - Deliverables: Báo cáo nhập/xuất/tồn, audit log, export CSV/Excel

6. Milestone 6 — Testing, Deployment & Demo (Kết thúc Tuần 12)
   - Ngày dự kiến: End of Week 12
   - Deliverables: Release candidate, deployment guide, video demo, báo cáo nộp

---

## 7. Rủi ro & Biện pháp giảm thiểu
- Rủi ro: Thiếu thời gian do trùng lịch học / thi giữa kỳ
  - Giảm thiểu: Lập kế hoạch linh hoạt, chia tasks nhỏ, ưu tiên tính năng cốt lõi (MVP)

- Rủi ro: Kỹ thuật (integrations hoặc lỗi nghiêm trọng trên DB)
  - Giảm thiểu: Thiết kế kiến trúc sớm, code review, backup DB, test trên staging

- Rủi ro: Concurrency / race condition với inventory
  - Giảm thiểu: Sử dụng optimistic locking hoặc transaction, test kịch bản đồng thời

- Rủi ro: Thiếu nhân lực kỹ năng (DevOps, testing)
  - Giảm thiểu: Học nhanh bằng tutorials, phân công 1 DevOps lead, thuê mentor/giảng viên hỗ trợ nếu cần

- Rủi ro: Thay đổi yêu cầu từ giảng viên / khách hàng
  - Giảm thiểu: Giao tiếp rõ ràng, yêu cầu change request, reserve buffer thời gian (~10-20%)

- Rủi ro: Công cụ trả phí giới hạn (ví dụ Slack free giới hạn admin)
  - Giảm thiểu: Sử dụng role user chung, hoặc dùng alternative (Discord) hoặc nâng cấp nếu cần

---

## 8. Thông tin thành viên & vai trò
| Họ và tên | MSSV | Vai trò đề xuất |
|---|---:|---|
| Nguyễn Thái Tân | 18127269 | Nhóm trưởng / PM / UX reviewer |
| Nguyễn Tuấn Minh | 22127271 | Backend Lead |
| Nguyễn Huy Tấn | 22127380 | Frontend Lead |
| Phạm Văn Minh | 22127272 | Backend Developer / DevOps |
| Nguyễn Ngọc Giang | 22127093 | QA & Test Engineer |
| Trần Gia Bảo | 22127034 | Frontend Developer |

---

## 9. Team building video
- Video team building (placeholder): https://youtu.be/TEAM_BUILDING_VIDEO
- Mô tả: Video quay buổi team building của nhóm — dùng cho phần demo, làm phong phú báo cáo và tăng tính nhân văn của đồ án.

---

## 10. Mời tham gia hệ thống — Giao tiếp nội bộ (Slack / Discord)
- Liên kết mời (placeholder): https://join.slack.com/your-team-invite OR https://discord.gg/YOUR_INVITE
- Ảnh mời tham gia (placeholder): ![Invite screenshot](path/to/invite-communication.png)
- Hướng dẫn chụp ảnh invite: Mở trang mời thành viên (Invite) trên Slack/Discord, chụp màn hình phần hiển thị link invite và role được gán (ví dụ: role = Admin hoặc role = Member). Lưu file dưới `docs/assets/invite-communication.png`.
- Ghi chú về vai trò: Nếu bản free giới hạn số Admin, hãy mời với vai trò "User" và gán phân quyền quản lý nội tuyến (ví dụ: tạo channel #admins nội bộ hoặc dùng Discord với quyền elevated trên server riêng).

---

## 11. Mời tham gia hệ thống — Quản lý dự án (Trello / Jira / Asana)
- Liên kết mời (placeholder): https://trello.com/invite/your-board OR https://yourdomain.atlassian.net/jira/your-invite
- Ảnh mời tham gia (placeholder): ![Invite screenshot](path/to/invite-project.png)
- Hướng dẫn chụp ảnh invite: Mở phần mời thành viên (Invite) trên Trello/Jira/Asana, chụp màn hình hiển thị quyền được cấp (Admin hoặc Member). Lưu file dưới `docs/assets/invite-project.png`.
- Ghi chú về vai trò: Nếu công cụ miễn phí giới hạn số Admin, mời làm "Member" và phân quyền quản lý thông qua Board Admins hoặc nhóm dự án. Hoặc tạm sử dụng 1-2 admin chính và các thành viên còn lại là Member.

---

## 12. Mời tham gia hệ thống — Quản lý lỗi (GitHub Issues / GitLab Issues)
- Liên kết mời (placeholder): https://github.com/your-org/your-repo/invite OR https://gitlab.com/your-group/your-project/-/invite
- Ảnh mời tham gia (placeholder): ![Invite screenshot](path/to/invite-issues.png)
- Hướng dẫn chụp ảnh invite: Truy cập Settings -> Manage access (GitHub) hoặc Project Members (GitLab), chụp màn hình hộp thoại invite hiển thị role (Admin / Maintainer / Developer). Lưu file tại `docs/assets/invite-issues.png`.
- Ghi chú về vai trò: Nên có 1-2 Maintainer/Admin chịu trách nhiệm merge và quản lý bảo mật; các dev khác có thể được cấp role Developer/Contributor. Nếu bản miễn phí giới hạn admin, sử dụng 1 admin chính và phân quyền bằng team.

---

## 13. Kết luận & Các bước tiếp theo
1. Xác nhận ngày bắt đầu dự án và phê duyệt lịch trình (Ai bắt đầu từ tuần nào?)
2. Chuẩn bị repository, CI cơ bản, và upload các placeholder invite screenshot vào `docs/assets/` theo hướng dẫn ở trên.
3. Bắt tay vào Milestone 1: hoàn thiện kiến trúc, domain model và setup môi trường dev.

---

*Phiên bản tài liệu: 08_Project Management - bản nháp. Vui lòng điều chỉnh ước lượng/chi phí theo thực tế và cập nhật link/ảnh invite khi có.*

