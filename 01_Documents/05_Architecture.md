# Hệ Thống Quản Trị Kho Hàng (Inventory Management System - IMS)

## 1. Các Mô Hình Quản Lý Kho Phổ Biến

Quản lý kho không chỉ là đếm hàng tồn, mà là tối ưu hóa dòng chảy hàng hóa để giảm chi phí và tăng hiệu quả vận hành.

### Các phương pháp định giá tồn kho

- **FIFO (First-In, First-Out):** Hàng nhập trước xuất trước. Phù hợp với hàng có hạn sử dụng (thực phẩm, dược phẩm).
- **LIFO (Last-In, First-Out):** Hàng nhập sau xuất trước. Thường dùng cho các mặt hàng đồng nhất (than, đá) hoặc tối ưu thuế.
- **Weighted Average Cost:** Tính giá trung bình gia quyền của toàn bộ hàng trong kho sau mỗi lần nhập.

### Các mô hình tối ưu hóa

- **EOQ (Economic Order Quantity):** Công thức tính lượng hàng đặt tối ưu để tổng chi phí đặt hàng và chi phí lưu kho là thấp nhất.
- **ABC Analysis:** Phân loại hàng hóa dựa trên giá trị mang lại:
  - **Nhóm A:** Giá trị cao (~80%), số lượng ít (~20%). Cần kiểm soát chặt chẽ.
  - **Nhóm B:** Giá trị và số lượng trung bình.
  - **Nhóm C:** Giá trị thấp, số lượng rất lớn. Kiểm soát lỏng hơn.
- **JIT (Just-In-Time):** Mô hình sản xuất/nhập hàng đúng lúc cần, giúp giảm thiểu tối đa vốn tồn kho.

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

- **Service Inventory:** Đảm nhận việc cộng/trừ tồn kho. Sử dụng _Distributed Locking_ để tránh tranh chấp dữ liệu khi nhiều đơn hàng đến cùng lúc.
- **Service Integration:** Kết nối với các sàn TMĐT (Shopee, TikTok Shop) và đơn vị vận chuyển (GHN, GHTK).
- **Service Reporting:** Xử lý các truy vấn dữ liệu lớn để xuất báo cáo mà không ảnh hưởng đến hiệu năng hệ thống bán hàng.

### C. Góc nhìn Dữ liệu (Data View)

- **RDBMS (PostgreSQL/MySQL):** Lưu trữ dữ liệu quan hệ cần tính toàn vẹn cao (Transactions, Products, Orders).
- **NoSQL (MongoDB):** Lưu trữ lịch sử thay đổi (Audit Logs) hoặc thông tin sản phẩm có thuộc tính linh hoạt.
- **In-memory Data (Redis):** Dùng để quản lý "Virtual Inventory" (tồn kho ảo) nhằm phản hồi nhanh cho người dùng trên website/app.

---

## 3. Công Nghệ và Công Cụ Đề Xuất (Tech Stack)

| Thành phần     | Công nghệ đề xuất                          |
| :------------- | :----------------------------------------- |
| **Backend**    | Node.js (NestJS)                           |
| **Frontend**   | React (Typescript)                         |
| **Database**   | MongoDB, Redis (Caching/Locking)           |
| **DevOps**     | Docker, Kubernetes, Jenkins/GitHub Actions |
| **Security**   | Keycloak                                   |
| **Logging**    | ELK                                        |
| **Monitoring** | Prometheus & Grafana                       |

---

## 4. Các Thách Thức Kỹ Thuật Cần Giải Quyết

1.  **Over-selling:** Giải quyết bằng cách sử dụng Cơ chế khóa (Optimistic/Pessimistic Locking) trong Database hoặc Redis.
2.  **Real-time Sync:** Đồng bộ số lượng tồn kho lên nhiều sàn TMĐT ngay lập tức khi có thay đổi (Webhook/Message Queue).
3.  **Traceability:** Khả năng truy xuất nguồn gốc theo từng số Serial hoặc số Lô (Batch number).

---

## 5. Architectural View Model

### 1. Logical View

\*Logical View này mô tả cấu trúc nghiệp vụ. Khi triển khai trên MongoDB, các quan hệ 1:N chặt chẽ (như Batch và BatchComponents) sẽ được triển khai theo dạng **Embedded Document** để tối ưu tốc độ đọc, các quan hệ lỏng hơn sẽ dùng **Reference\***

<img width="1242" height="817" alt="image" src="https://github.com/user-attachments/assets/e0f2a846-f2d5-4389-9ed1-298af0a2f94b" />

### Các tầng kiến trúc (Architecture Layers)

- **Frontend (React + TS):** Lớp giao diện người dùng. Chứa các module quản lý Material (Vật tư), InventoryLot (Lô kho) và ProductionBatch (Mẻ sản xuất). Tích hợp thư viện Keycloak-js để xử lý đăng nhập.
- **API / Server (NestJS):** Tầng trung gian tiếp nhận yêu cầu. Chịu trách nhiệm điều hướng (Routing), xác thực Token (JWT Validation) và kiểm tra dữ liệu đầu vào (Validation).
- **Logic / Persistent (NestJS):** Trái tim của hệ thống. Chứa logic nghiệp vụ xử lý các quy tắc phức tạp (ví dụ: tự động khóa lô hàng khi kiểm nghiệm không đạt, tính toán định mức sản xuất).
- **Database (MongoDB):** Tầng lưu trữ dữ liệu bền vững. Dữ liệu được tổ chức theo các Collection tương ứng với thực thể nghiệp vụ: Vật tư, Lô hàng và Sản xuất.

### Dịch vụ hạ tầng & Công nghệ (Services & Technologies)

- **Security Service (Keycloak IdP):** Quản lý định danh tập trung. Cấp phát Token OIDC cho người dùng và xác thực quyền truy cập của các yêu cầu API.
- **Reporting Service (PDFKit/ExcelJS):** Xử lý việc tổng hợp dữ liệu từ tầng Logic để xuất ra các chứng từ pháp lý như Phiếu nhập kho, Biên bản kiểm kê hoặc nhãn Barcode.
- **Event Bus (Kafka):** Hệ thống hàng đợi thông điệp. Ghi nhận các sự kiện biến động (ví dụ: "LotChanged") để phục vụ hệ thống Audit Trail hoặc gửi thông báo.

### Các mối quan hệ & Luồng dữ liệu (Relationships)

- **Xác thực (OIDC Auth & JWT):** Người dùng đăng nhập qua Keycloak. Tầng API sử dụng Public Key từ Keycloak để xác thực tính hợp lệ của mọi yêu cầu gửi đến.
- **Giao tiếp Frontend - Backend:** Sử dụng giao thức **HTTP/REST API** để trao đổi dữ liệu JSON.
- **Phụ thuộc nghiệp vụ (Internal Logic):**
  - **InventoryLot ➔ Material:** Khi tạo lô hàng, hệ thống tham chiếu đến Master Data (Material) để lấy thông tin quy cách, tiêu chuẩn kiểm nghiệm.
  - **ProductionBatch ➔ InventoryLot:** Khi sản xuất, hệ thống thực hiện trừ tồn kho vật lý từ các lô hàng cụ thể (Picking).
- **Luồng báo cáo (Data Flows):** Tầng Logic đẩy dữ liệu thô vào Reporting Service ➔ Trả về file (PDF/Excel) cho người dùng tải xuống tại giao diện Frontend.
- **Truy vết (Traceability):** Mọi hành động thay đổi trạng thái dữ liệu ở tầng Logic đều phát một sự kiện (Event) vào Kafka để đảm bảo tính minh bạch và khả năng phục hồi dữ liệu.

### 2. Development View

<img width="1117" height="812" alt="image" src="https://github.com/user-attachments/assets/3fe4a702-13ad-4d54-831c-d6f90e129d20" />

#### 01_Source Code: Thư mục gốc chứa toàn bộ mã nguồn và cấu hình triển khai

- **docker-compose.yml**: File cấu hình Orchestration chính để khởi chạy toàn bộ hệ thống (Backend, Frontend, MongoDB, Redis, Keycloak) trong môi trường phát triển local chỉ với một câu lệnh.

#### frontend/: Ứng dụng giao diện người dùng (React.js + TypeScript)

- **package.json**: Quản lý các thư viện phụ thuộc như React, Keycloak-js, Axios và các scripts build/run.
- **src/**: Chứa mã nguồn chính của giao diện.
  - **App.tsx**: File thành phần gốc, nơi định nghĩa Route và bọc ứng dụng trong Keycloak Provider để quản lý bảo mật.
  - **main.tsx**: Điểm đầu vào (Entry point) của ứng dụng để render React vào DOM.

#### database/: Cấu hình dữ liệu

- **mongo-init.js**: Script khởi tạo cơ sở dữ liệu MongoDB, dùng để tạo các Collections ban đầu, Index và User quản trị database khi container khởi chạy lần đầu.

#### backend/: Ứng dụng xử lý nghiệp vụ (NestJS Monolith)

- **package.json**: Chứa cấu hình các thư viện backend (NestJS, Mongoose, Nest-keycloak-connect, Kafka).
- **src/**: Thư mục chứa logic nghiệp vụ theo kiến trúc Module-based.
  - **app.module.ts**: Module gốc kết nối tất cả các sub-modules lại với nhau.
  - **user/**: Quản lý thông tin định danh và phân quyền nội bộ.
  - **auth/**: Xử lý tích hợp Keycloak, xác thực JWT và bảo mật API.
  - **catalog/**: Quản lý danh mục vật tư, nguyên liệu (Master Data).
  - **inbound/ & outbound/**: Xử lý logic nhập kho và xuất kho vật lý.
  - **inventory/**: Quản lý tồn kho thời gian thực và lịch sử giao dịch.
  - **qc/**: Module kiểm định chất lượng, đối chiếu Specification (US01-QC).
  - **production/**: Quản lý mẻ sản xuất (Batch) và định mức nguyên vật liệu (BOM).
  - **audit/**: Ghi nhật ký hoạt động hệ thống (US15-Manager).
  - **reporting/**: Xuất các báo cáo PDF/Excel (US01, US10-Manager).

#### infra/: Hạ tầng và cấu hình triển khai (DevOps)

- **docker/**: Chứa các Dockerfile riêng biệt để đóng gói ứng dụng.
  - **backend.Dockerfile**: Build image cho NestJS (Node.js runtime).
  - **frontend.Dockerfile**: Build image cho React và sử dụng Nginx để phục vụ web static.
- **k8s/**: Chứa các file YAML để triển khai hệ thống lên cụm Kubernetes.
  - **deployment.yaml**: Định nghĩa số lượng Pods, tài nguyên CPU/RAM cho các dịch vụ.
  - **ingress.yaml**: Cấu hình bộ cân bằng tải và Routing (Điều hướng) traffic từ ngoài vào hệ thống.
  - **mongo-pv.yaml**: Cấu hình Persistent Volume để đảm bảo dữ liệu MongoDB không bị mất khi Pod khởi động lại.
  - **redis-config.yaml**: Cấu hình cho bộ nhớ đệm Redis phục vụ Locking.

### 3. Deployment View

<img width="1089" height="995" alt="image" src="https://github.com/user-attachments/assets/59ae026e-99d7-45f1-993a-a2d7de45f13b" />

#### Giao diện Người dùng (User's Device)

Hệ thống hỗ trợ đa nền tảng bao gồm **React Web** và **Mobile App**. Tất cả các kết nối từ thiết bị người dùng đến hệ thống đều được thực hiện qua giao thức **HTTPS** để đảm bảo tính bảo mật và mã hóa dữ liệu.

#### Kubernetes Cluster (K8s)

- **Ingress Controller:** Đóng vai trò là điểm tiếp nhận duy nhất, thực hiện điều hướng (Routing) để phân biệt yêu cầu truy cập giao diện (Frontend) hay dữ liệu (Backend API).
- **IMS Pod (Monolith):** Mã nguồn NestJS chạy tập trung trong các Pods. Có khả năng nhân bản (Scaling) linh hoạt trên K8s để xử lý tải khi cần thiết.

#### Bảo mật (Security - Okta)

Backend thực hiện xác thực và định danh người dùng thông qua kết nối trực tiếp với dịch vụ **Okta** bên ngoài cụm K8s, đảm bảo an toàn truy cập.

#### Tầng Dữ liệu (Data Tier)

Được triển khai trên các Nodes chuyên dụng nhằm tối ưu hiệu suất lưu trữ:

- **MongoDB:** Lưu trữ dữ liệu chính của hệ thống.
- **Redis:** Xử lý Caching và cơ chế **Locking tồn kho** với tốc độ cực nhanh, tránh xung đột dữ liệu.

#### Tầng Giám sát (Observability Tier)

- **ELK Stack:** Thu thập và lưu trữ Logs từ Backend, hỗ trợ IT Admin truy vết lỗi và kiểm soát vận hành.
- **Prometheus & Grafana:** Thu thập số liệu (Metrics) từ phần cứng và ứng dụng, cung cấp cái nhìn trực quan về sức khỏe hệ thống theo thời gian thực.

### 4. Process View

<img width="1727" height="1025" alt="image" src="https://github.com/user-attachments/assets/5ef84afb-f075-44d6-aea1-5c4ca88a2a72" />

#### Logic So sánh Tự động

Tại bước xử lý dữ liệu, **Business Logic của NestJS** thực hiện đối soát tự động:

- So sánh các giá trị thực tế nhập vào với ngưỡng thông số cho phép được cấu hình trong Database.
- Hệ thống tự động phản hồi tín hiệu trực quan, thực hiện **bôi đỏ trên giao diện** nếu dữ liệu nằm ngoài ngưỡng an toàn, giúp nhân viên nhận diện sai sót tức thì.

#### Cập nhật Trạng thái Tức thời

Ngay khi quy trình QC hoàn thành đánh giá:

- Trạng thái lô hàng được cập nhật đồng bộ ngay lập tức trên hệ thống.
- Cho phép nhân viên vận hành (**Operator**) thực hiện lệnh cất hàng (**Put-away**) ngay khi đạt chuẩn, hoặc hệ thống sẽ tự động chặn hoàn toàn nếu hàng bị đánh giá lỗi.

#### Cơ chế Khóa Cứng (Hard-locking)

Để đảm bảo an toàn tuyệt đối cho chuỗi cung ứng, hệ thống sử dụng **Redis** để quản lý trạng thái khóa:

- Khi một lô hàng bị trạng thái **Rejected**, cơ chế Hard-locking sẽ được kích hoạt.
- Hệ thống sẽ chặn mọi lệnh lấy hàng (**Picking**) hoặc điều chuyển (**Transfer**) liên quan đến lô hàng đó, loại bỏ rủi ro xuất nhầm hàng lỗi.

#### Tính Minh bạch & Truy xuất (Traceability)

Hệ thống đảm bảo khả năng giám sát toàn diện thông qua luồng dữ liệu thời gian thực:

- Mọi sự kiện thay đổi chất lượng đều được đẩy qua **Kafka** để lưu trữ vào nhật ký truy xuất nguồn gốc.
- Tính năng này giúp IT và Quản lý có thể truy xuất lại toàn bộ "vòng đời chất lượng" của một lô hàng bất kỳ trong thời gian **dưới 3 giây**.

---

# 6. Security - Keycloak Integration

Hệ thống Inventory Management System (IMS) sử dụng **Keycloak** làm nền tảng quản trị định danh và truy cập (IAM) tập trung, tuân thủ các tiêu chuẩn bảo mật **OpenID Connect (OIDC)** và **OAuth 2.0**.

### 6.1 Thành phần bảo mật

- **Keycloak Identity Provider (IdP):** Quản lý tập trung Realm, Clients, Roles và Users. Lưu trữ thông tin định danh và thực hiện cấp phát Token.
- **React Frontend (Client):** Sử dụng thư viện `keycloak-js`. Chịu trách nhiệm chuyển hướng đăng nhập, quản lý Access Token và Refresh Token trong phiên làm việc của người dùng.
- **NestJS Backend (Resource Server):** Sử dụng `nest-keycloak-connect` để xác thực chữ ký JWT từ Keycloak và thực thi phân quyền ở mức API (Method-level Security).

### 6.2 Luồng xác thực & Ủy quyền

1.  **Authentication (PKCE Flow):** Người dùng đăng nhập qua giao diện tập trung của Keycloak. Sau khi thành công, React nhận về **Access Token (JWT)** chứa thông tin định danh và vai trò (Roles).
2.  **API Authorization:** Mọi yêu cầu từ Frontend tới Backend phải đính kèm Token trong Header `Authorization: Bearer <Token>`.
3.  **2FA (Xác thực 2 lớp):** Bắt buộc đối với vai trò **IT Administrator** khi thực hiện các tác vụ nhạy cảm như _Phục hồi dữ liệu (US05)_ thông qua cấu hình Authentication Policies trên Keycloak.

### 6.3 Phân quyền dựa trên vai trò (RBAC)

Hệ thống định nghĩa 4 vai trò chính với các quyền hạn đặc thù dựa trên User Stories:

| Vai trò (Role)       | Phạm vi quyền hạn (Permissions)                                                                                | Ghi chú nghiệp vụ      |
| :------------------- | :------------------------------------------------------------------------------------------------------------- | :--------------------- |
| **Manager**          | Tra cứu tập trung, phê duyệt phiếu nhập/xuất, điều chỉnh tồn kho, quản lý người dùng và xem Dashboard.         | US01 - US15 (Manager)  |
| **Quality Control**  | Đánh giá lô hàng (QC), xử lý hàng Rejected, cách ly hàng hóa (Quarantine), truy xuất nguồn gốc (Traceability). | US01 - US06 (QC)       |
| **Operator**         | Tạo phiếu nhập/xuất điện tử, xác thực kiểm đếm thực tế (Blind count), thực hiện kiểm kê tại hiện trường.       | US01 - US05 (Operator) |
| **IT Administrator** | Giám sát sức khỏe hệ thống, quản lý Log tập trung, thiết lập sao lưu và phục hồi dữ liệu (Restore).            | US01 - US06 (IT Admin) |

### 6.4 Cơ chế bảo vệ đặc thù

Dựa trên các yêu cầu an ninh từ User Stories, hệ thống triển khai các kỹ thuật sau:

- **Session Termination (Manager US14):** Khi Manager thực hiện khóa tài khoản, hệ thống gọi API `Admin REST` của Keycloak để thu hồi toàn bộ Active Sessions. Đồng thời, NestJS cập nhật Blacklist trong **Redis** để từ chối Access Token hiện tại ngay lập tức.
- **Audit Trail (Manager US15):** Mọi thao tác (Method, Path, UserID, Payload) được NestJS Interceptor ghi lại và đẩy về **ELK Stack**. Nhật ký này được thiết lập ở chế độ **Read-only** để đảm bảo tính toàn vẹn cho công tác hậu kiểm.
- **Hard-locking (QC US04):** Khi QC thực hiện lệnh cách ly (Quarantine), trạng thái được ghi vào DB và đồng bộ lên **Redis Cache**. Mọi API liên quan đến `Picking` hoặc `Transfer` sẽ kiểm tra trạng thái này đầu tiên để chặn giao dịch trong < 50ms.
- **Data Integrity (IT Admin US04):** Các bản sao lưu được bảo vệ bằng mã **Checksum (SHA-256)**. Hệ thống Security kiểm tra mã này trước khi cho phép tiến hành quy trình Restore nhằm đảm bảo dữ liệu không bị thay đổi trái phép.

### 6.5 Quản lý thông tin định danh

- **Mã hóa:** Thông tin mật khẩu được Keycloak quản lý và băm (hashing) bằng thuật toán **PBKDF2** hoặc **Bcrypt** (tương đương yêu cầu US12).
- **Linh hoạt quyền hạn:** Manager có thể thay đổi Role của nhân sự trên giao diện quản trị (US13). Keycloak sẽ cập nhật Claims trong Token mới ngay khi người dùng Re-login.

---

## 7. Database Schema

Hệ thống sử dụng **MongoDB**. Dữ liệu được tổ chức thành các **Collections**. Các quan hệ được quản lý thông qua **References** (tương tự Foreign Keys) để đảm bảo tính toàn vẹn cho hệ thống quản lý kho phức tạp.

### Users Collection

Lưu trữ thông tin người dùng và phân quyền.

| Field        | Type          | Constraints      | Description                                                 |
| :----------- | :------------ | :--------------- | :---------------------------------------------------------- |
| `_id`        | String/UUID   | PK, NOT NULL     | ID duy nhất                                                 |
| `username`   | String        | NOT NULL, UNIQUE | Tên đăng nhập                                               |
| `email`      | String        | NOT NULL, UNIQUE | Email người dùng                                            |
| `password`   | String        | NOT NULL         | Hash Bcrypt                                                 |
| `role`       | String (Enum) | NOT NULL         | Admin, InventoryManager, QualityControl, Production, Viewer |
| `is_active`  | Boolean       | Default: true    | Trạng thái tài khoản                                        |
| `last_login` | Date          | Nullable         | Lần đăng nhập cuối                                          |
| `created_at` | Date          | Default: NOW     | Ngày tạo                                                    |

### Materials Collection

Dữ liệu gốc về vật tư, nguyên liệu và sản phẩm.

| Field                | Type          | Constraints      | Description                     |
| :------------------- | :------------ | :--------------- | :------------------------------ |
| `material_id`        | String        | PK, NOT NULL     | Mã vật tư nội bộ                |
| `part_number`        | String        | NOT NULL, UNIQUE | Mã Part Number (VD: PART-12345) |
| `material_name`      | String        | NOT NULL         | Tên hiển thị                    |
| `material_type`      | String (Enum) | NOT NULL         | API, Excipient, Container, v.v. |
| `storage_conditions` | String        | Nullable         | Điều kiện bảo quản              |
| `spec_doc`           | String        | Nullable         | Tham chiếu tài liệu kỹ thuật    |

### InventoryLots Collection

Chi tiết từng lô hàng nhập kho hoặc lô sản xuất.

| Field             | Type          | Constraints        | Description                              |
| :---------------- | :------------ | :----------------- | :--------------------------------------- |
| `lot_id`          | String/UUID   | PK, NOT NULL       | ID lô hàng                               |
| `material_id`     | String        | Ref: Materials     | Liên kết với vật tư                      |
| `mfr_name`        | String        | NOT NULL           | Tên nhà sản xuất                         |
| `mfr_lot`         | String        | NOT NULL           | Số lô của nhà sản xuất                   |
| `status`          | String (Enum) | NOT NULL           | Quarantine, Accepted, Rejected, Depleted |
| `quantity`        | Decimal128    | NOT NULL           | Số lượng hiện tại                        |
| `uom`             | String        | NOT NULL           | Đơn vị tính (kg, L, each)                |
| `expiration_date` | Date          | NOT NULL           | Ngày hết hạn                             |
| `parent_lot_id`   | String        | Ref: InventoryLots | ID lô gốc (nếu là lô tách)               |
| `is_sample`       | Boolean       | Default: false     | Đánh dấu hàng mẫu                        |

### InventoryTransactions Collection

Lịch sử biến động của từng lô hàng.

| Field              | Type          | Constraints        | Description                                 |
| :----------------- | :------------ | :----------------- | :------------------------------------------ |
| `transaction_id`   | String/UUID   | PK, NOT NULL       | ID giao dịch                                |
| `lot_id`           | String        | Ref: InventoryLots | Lô hàng bị tác động                         |
| `type`             | String (Enum) | NOT NULL           | Receipt, Usage, Split, Transfer, Adjustment |
| `quantity`         | Decimal128    | NOT NULL           | Lượng thay đổi (+/-)                        |
| `performed_by`     | String        | NOT NULL           | Người/Hệ thống thực hiện                    |
| `transaction_date` | Date          | Default: NOW       | Thời điểm thực hiện                         |

### ProductionBatches Collection

Thông tin các mẻ sản xuất thành phẩm.

| Field              | Type          | Constraints      | Description                              |
| :----------------- | :------------ | :--------------- | :--------------------------------------- |
| `batch_id`         | String/UUID   | PK, NOT NULL     | ID mẻ sản xuất                           |
| `product_id`       | String        | Ref: Materials   | Sản phẩm đầu ra                          |
| `batch_number`     | String        | UNIQUE, NOT NULL | Số hiệu mẻ (Human-readable)              |
| `batch_size`       | Decimal128    | NOT NULL         | Quy mô mẻ                                |
| `status`           | String (Enum) | NOT NULL         | Planned, In Progress, Complete, Rejected |
| `manufacture_date` | Date          | NOT NULL         | Ngày sản xuất                            |

### BatchComponents Collection

Liên kết mẻ sản xuất với các lô nguyên liệu đầu vào.

| Field          | Type        | Constraints            | Description              |
| :------------- | :---------- | :--------------------- | :----------------------- |
| `component_id` | String/UUID | PK, NOT NULL           | ID thành phần            |
| `batch_id`     | String      | Ref: ProductionBatches | Thuộc mẻ sản xuất nào    |
| `lot_id`       | String      | Ref: InventoryLots     | Lô nguyên liệu sử dụng   |
| `planned_qty`  | Decimal128  | NOT NULL               | Số lượng dự định         |
| `actual_qty`   | Decimal128  | Nullable               | Số lượng thực tế sử dụng |

### QCTests Collection

Kết quả kiểm định chất lượng cho lô hàng.

| Field           | Type          | Constraints         | Description                        |
| :-------------- | :------------ | :------------------ | :--------------------------------- |
| `test_id`       | String/UUID   | PK, NOT NULL        | ID bài kiểm tra                    |
| `lot_id`        | String        | Ref: InventoryLots  | Lô hàng được kiểm tra              |
| `test_type`     | String (Enum) | NOT NULL            | Identity, Potency, Microbial, v.v. |
| `test_result`   | String        | NOT NULL            | Kết quả thực tế                    |
| `result_status` | String (Enum) | Pass, Fail, Pending | Trạng thái đánh giá                |
| `verified_by`   | String        | Nullable            | Người phê duyệt kết quả            |

### LabelTemplates Collection

Mẫu nhãn dùng để in ấn.

| Field              | Type          | Constraints  | Description                                         |
| :----------------- | :------------ | :----------- | :-------------------------------------------------- |
| `template_id`      | String        | PK, NOT NULL | ID mẫu                                              |
| `label_type`       | String (Enum) | NOT NULL     | Raw Material, Sample, Finished Product, API, Status |
| `content`          | Text          | NOT NULL     | Markup cấu trúc nhãn (Placeholders)                 |
| `width` / `height` | Decimal       | NOT NULL     | Kích thước nhãn (inches)                            |

### Entity Relationship Overview

- **Materials (1) ── (N) InventoryLots:** Một loại vật tư có thể có nhiều lô nhập về.
- **InventoryLots (1) ── (N) InventoryTransactions:** Một lô hàng có nhiều biến động kho.
- **InventoryLots (1) ── (N) QCTests:** Một lô hàng có thể trải qua nhiều bài kiểm tra QC.
- **ProductionBatches (1) ── (N) BatchComponents:** Một mẻ sản xuất tiêu thụ nhiều nguyên liệu (từ các lô hàng khác nhau).
- **LabelTemplates (Used by):** InventoryLots & ProductionBatches dựa trên `label_type`.

### Example Data Flow

1. **Tiếp nhận:** Material `MAT-001` được nhập -> Tạo `InventoryLot` (lot-uuid-001) -> Ghi `InventoryTransaction` (Receipt).
2. **Dán nhãn:** Hệ thống lấy `LabelTemplate` (TPL-RM-01) -> Điền dữ liệu lô hàng -> In nhãn vật tư.
3. **Kiểm định:** Tạo `QCTest` cho lô hàng -> Trạng thái lô chuyển từ `Quarantine` sang `Accepted`.
4. **Sản xuất:** Tạo `ProductionBatch` -> `BatchComponent` liên kết lô nguyên liệu -> Trừ kho tự động thông qua `InventoryTransaction` (Usage).
