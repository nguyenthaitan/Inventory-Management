 # Hệ Thống Quản Trị Kho Hàng (Inventory Management System - IMS)

## 1. Các Mô Hình Quản Lý Kho Phổ Biến
Quản lý kho không chỉ là đếm hàng tồn, mà là tối ưu hóa dòng chảy hàng hóa để giảm chi phí và tăng hiệu quả vận hành.

### Các phương pháp định giá tồn kho
* **FIFO (First-In, First-Out):** Hàng nhập trước xuất trước. Phù hợp với hàng có hạn sử dụng (thực phẩm, dược phẩm).
* **LIFO (Last-In, First-Out):** Hàng nhập sau xuất trước. Thường dùng cho các mặt hàng đồng nhất (than, đá) hoặc tối ưu thuế.
* **Weighted Average Cost:** Tính giá trung bình gia quyền của toàn bộ hàng trong kho sau mỗi lần nhập.

### Các mô hình tối ưu hóa
* **EOQ (Economic Order Quantity):** Công thức tính lượng hàng đặt tối ưu để tổng chi phí đặt hàng và chi phí lưu kho là thấp nhất.
* **ABC Analysis:** Phân loại hàng hóa dựa trên giá trị mang lại:
    * **Nhóm A:** Giá trị cao (~80%), số lượng ít (~20%). Cần kiểm soát chặt chẽ.
    * **Nhóm B:** Giá trị và số lượng trung bình.
    * **Nhóm C:** Giá trị thấp, số lượng rất lớn. Kiểm soát lỏng hơn.
* **JIT (Just-In-Time):** Mô hình sản xuất/nhập hàng đúng lúc cần, giúp giảm thiểu tối đa vốn tồn kho.

---

## 2. Kiến Trúc Hệ Thống (System Architecture)

Để xây dựng một hệ thống IMS có khả năng mở rộng cao, chúng ta tiếp cận theo 3 góc nhìn:

### A. Góc nhìn Chức năng (Functional View)
Hệ thống được chia thành các module nghiệp vụ tách biệt:
1.  **Catalog Management:** Quản lý thông tin SKU, thuộc tính sản phẩm, mã vạch (Barcode/QR).
2.  **Inbound Management:** Quy trình nhận hàng, kiểm định (QC) và nhập kho (Put-away).
3.  **Inventory Control:** Quản lý số lượng tồn, vị trí (Bin/Rack), chuyển kho nội bộ.
4.  **Outbound Management:** Xử lý đơn hàng, lấy hàng (Picking), đóng gói (Packing) và giao hàng.
5.  **Audit & Stocktake:** Kiểm kê định kỳ và điều chỉnh sai lệch dữ liệu.



### B. Góc nhìn Kỹ thuật (Technical View)
Sử dụng kiến trúc **Microservices** để tách biệt các luồng nghiệp vụ nặng:
* **Service Inventory:** Đảm nhận việc cộng/trừ tồn kho. Sử dụng *Distributed Locking* để tránh tranh chấp dữ liệu khi nhiều đơn hàng đến cùng lúc.
* **Service Integration:** Kết nối với các sàn TMĐT (Shopee, TikTok Shop) và đơn vị vận chuyển (GHN, GHTK).
* **Service Reporting:** Xử lý các truy vấn dữ liệu lớn để xuất báo cáo mà không ảnh hưởng đến hiệu năng hệ thống bán hàng.

### C. Góc nhìn Dữ liệu (Data View)
* **RDBMS (PostgreSQL/MySQL):** Lưu trữ dữ liệu quan hệ cần tính toàn vẹn cao (Transactions, Products, Orders).
* **NoSQL (MongoDB):** Lưu trữ lịch sử thay đổi (Audit Logs) hoặc thông tin sản phẩm có thuộc tính linh hoạt.
* **In-memory Data (Redis):** Dùng để quản lý "Virtual Inventory" (tồn kho ảo) nhằm phản hồi nhanh cho người dùng trên website/app.



---

## 3. Công Nghệ và Công Cụ Đề Xuất (Tech Stack)

| Thành phần | Công nghệ đề xuất |
| :--- | :--- |
| **Backend** | Node.js (NestJS) |
| **Frontend** | React.js(typescript)|
| **Database** | MongoDB, Redis (Caching/Locking), ELK |
| **DevOps** | Docker, Kubernetes, Jenkins/GitHub Actions |
| **Security** | Okta |

---

## 4. Các Thách Thức Kỹ Thuật Cần Giải Quyết

1.  **Over-selling:** Giải quyết bằng cách sử dụng Cơ chế khóa (Optimistic/Pessimistic Locking) trong Database hoặc Redis.
2.  **Real-time Sync:** Đồng bộ số lượng tồn kho lên nhiều sàn TMĐT ngay lập tức khi có thay đổi (Webhook/Message Queue).
3.  **Traceability:** Khả năng truy xuất nguồn gốc theo từng số Serial hoặc số Lô (Batch number).

---
*Tài liệu được biên soạn cho mục đích thiết kế hệ thống IMS hiện đại.*
