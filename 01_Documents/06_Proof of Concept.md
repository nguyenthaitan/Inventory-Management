# 06. Proof of Concept (PoC)

## 1. Mục tiêu của Proof of Concept
Mục tiêu của Proof of Concept (PoC) này là kiểm chứng tính khả thi về mặt kỹ thuật của **tính năng authentication** trong hệ thống **Inventory Management**.

Cụ thể, nhóm muốn trả lời các câu hỏi sau:
- Tính năng này có thể được hiện thực hóa bằng công nghệ đã lựa chọn hay không?
- Những khó khăn, rủi ro kỹ thuật chính là gì?
- Giải pháp đề xuất có đáp ứng được yêu cầu cốt lõi hay không?

---

## 2. Mô tả tính năng cần kiểm chứng
### 2.1. Tên tính năng
- **Authentication cho hệ thống Inventory Management**

### 2.2. Mô tả ngắn gọn
[Tính năng làm gì? Ai sử dụng? Kết quả mong muốn là gì?]
- Tính năng authentication là quá trình kiểm tra và xác nhận danh tính của người dùng khi họ truy cập vào hệ thống. Cụ thể, hệ thống sẽ yêu cầu người dùng cung cấp thông tin đăng nhập (ví dụ: tên đăng nhập và mật khẩu), sau đó kiểm tra thông tin này với dữ liệu đã lưu trữ để xác định người dùng có hợp lệ hay không. Nếu xác thực thành công, người dùng sẽ được phép truy cập vào các chức năng của hệ thống; nếu không, truy cập sẽ bị từ chối.

- Tính năng authentication này sẽ được sử dụng bởi tất cả người dùng của hệ thống Inventory Management, bao gồm Manager, Quality Control Technician, Operator, IT Administrator. Kết quả mong muốn là đảm bảo rằng chỉ những người dùng hợp lệ mới có thể truy cập vào hệ thống, từ đó bảo vệ dữ liệu và tài nguyên quan trọng khỏi các truy cập trái phép.

### 2.3. Lý do tính năng này khó về mặt kỹ thuật
Tính năng này được đánh giá là khó về mặt kỹ thuật do:
- Cần xử lý bất đồng bộ, ví dụ như xác thực qua nhiều bước hoặc tích hợp xác thực đa yếu tố (MFA), có thể phải xử lý real-time giữa client và server.
- Phải đồng bộ dữ liệu người dùng giữa nhiều thành phần (ví dụ: nhiều server, microservices, hoặc tích hợp với hệ thống bên ngoài như LDAP, OAuth).
- Yêu cầu hiệu năng cao và độ trễ thấp để đảm bảo trải nghiệm người dùng, đặc biệt khi số lượng người dùng lớn hoặc truy cập đồng thời.
- Đảm bảo an toàn bảo mật: phải mã hóa mật khẩu, bảo vệ khỏi các tấn công như brute-force, SQL injection, session hijacking, v.v.
- Công nghệ xác thực hiện đại (OAuth2, JWT, SSO, v.v.) có thể còn mới với nhóm, đòi hỏi phải học hỏi và thử nghiệm.
- Xử lý các trường hợp lỗi, phục hồi khi xác thực thất bại hoặc hệ thống xác thực bên ngoài không phản hồi.

---

## 3. Phạm vi Proof of Concept
PoC **chỉ tập trung kiểm chứng khả năng hoạt động cốt lõi**, không bao gồm:
- Giao diện người dùng hoàn chỉnh
- Bảo mật, phân quyền
- Tối ưu hiệu năng ở quy mô lớn
- Kiểm thử toàn diện

---

## 4. Công nghệ và công cụ sử dụng
- Ngôn ngữ lập trình: Typescript
- Framework / Thư viện: React cho frontend, NestJS cho backend
- Cơ sở dữ liệu: MongoDB

---

## 5. Hiện thực PoC bằng mã nguồn
### 5.1. Kiến trúc tổng quan
```less
[ReactJS]  ──(OAuth2/OIDC)──>  [Keycloak]
    |                              |
    |<─ Access Token (JWT) ────────|
    |
    └── gọi API ───────────────> [NestJS]
                                     |
                                     └── MongoDB (user profile, business data)
```
- Những lưu ý chính:
    - Keycloak xử lý đăng ký / đăng nhập / mật khẩu / refresh token
    - Keycloak cấp Access Token (dạng JWT) cho frontend (ReactJS)
    - Backend KHÔNG tự xác thực username/password
    - MongoDB KHÔNG lưu password, chỉ lưu thông tin mở rộng của user

### 5.2. Các bước thực hiện chi tiết

1. **Cài đặt và cấu hình Keycloak**
    - Cài đặt Keycloak server (có thể dùng Docker hoặc bản cài đặt chính thức).
    - Tạo Realm mới cho hệ thống Inventory Management. **Realm** là một không gian quản lý độc lập trong Keycloak, nơi bạn có thể định nghĩa các user, role, client, v.v. Realm giúp tách biệt các hệ thống hoặc môi trường xác thực khác nhau trên cùng một Keycloak server.
    - Tạo Client cho frontend (ReactJS) với loại Public, cấu hình redirect URI phù hợp.
        - Loại "Public" phù hợp cho ứng dụng chạy phía trình duyệt như ReactJS, vì không cần bảo mật client secret.
        - Cấu hình "redirect URI" phù hợp: Là địa chỉ mà Keycloak sẽ chuyển hướng người dùng về sau khi đăng nhập thành công. Thường là URL của ửng dụng ReactJS.   
    - Tạo Client cho backend (NestJS) với loại Confidential (nếu cần xác thực backend với Keycloak).
    - Tạo các Role và User mẫu trên Keycloak để kiểm thử.

2. **Tích hợp Keycloak vào Frontend (ReactJS)**
    - Cài đặt thư viện hỗ trợ Keycloak cho React (ví dụ: `@react-keycloak/web`).
    - Khởi tạo Keycloak instance trong ứng dụng React, cấu hình với thông tin Realm, Client ID, URL Keycloak.
    - Thực hiện luồng đăng ký/đăng nhập bằng giao diện Keycloak (redirect hoặc popup):
        - Khi người dùng nhấn nút "Đăng nhập" trên giao diện ReactJS, ứng dụng sẽ gọi hàm keycloak.login() (nếu dùng @react-keycloak/web).
        - Trình duyệt sẽ được chuyển hướng (redirect) sang trang đăng nhập của Keycloak.
        - Người dùng nhập tên đăng nhập và mật khẩu trên giao diện Keycloak.
        - Sau khi xác thực thành công, Keycloak sẽ chuyển hướng lại về ứng dụng ReactJS (theo redirect URI đã cấu hình), kèm theo mã xác thực (authorization code hoặc token).
        - Ứng dụng ReactJS nhận Access Token (JWT) từ Keycloak, lưu vào localStorage/sessionStorage hoặc state quản lý phiên.
        - Nếu người dùng chưa có tài khoản, có thể nhấn "Đăng ký" trên giao diện Keycloak để tạo tài khoản mới (nếu bật self-registration).
        - Sau khi đăng nhập, ứng dụng ReactJS có thể lấy thông tin user (profile) từ token hoặc gọi API userinfo của Keycloak nếu cần.
    - Sau khi đăng nhập thành công, nhận Access Token (JWT) từ Keycloak và lưu vào localStorage/sessionStorage.
    - Gửi Access Token này kèm theo mỗi request API đến backend.

3. **Tích hợp xác thực Keycloak vào Backend (NestJS)**
    - Cài đặt các package hỗ trợ xác thực JWT/OAuth2 (ví dụ: `@nestjs/passport`, `passport-keycloak-oauth2`, `passport-jwt`).
    - Cấu hình middleware/guard để kiểm tra và xác thực Access Token từ client gửi lên.
    - Giải mã và xác thực token với public key của Keycloak (hoặc introspect token nếu cần).
    - Lấy thông tin user từ token (sub, email, roles, ...) để xử lý logic nghiệp vụ.

4. **Kết nối Backend với MongoDB**
    - Cài đặt và cấu hình kết nối MongoDB trong NestJS (dùng `@nestjs/mongoose`).
    - Khi người dùng đăng nhập lần đầu, backend có thể tạo bản ghi user profile mở rộng (không lưu password) vào MongoDB nếu chưa có.
    - Các thông tin mở rộng (profile, quyền hạn, dữ liệu nghiệp vụ) sẽ lưu ở MongoDB, còn xác thực vẫn do Keycloak quản lý.

5. **Kiểm thử luồng đăng ký/đăng nhập**
    - Đăng ký user mới qua giao diện Keycloak hoặc API (nếu mở chức năng self-registration).
    - Đăng nhập từ frontend, kiểm tra nhận token và truy cập các API backend thành công khi có token hợp lệ.
    - Kiểm tra các trường hợp token hết hạn, không hợp lệ, hoặc user không đủ quyền truy cập.

## 6. Kết quả thu được
### 6.1. Kết quả đạt được

[Ví dụ: Tính năng hoạt động đúng trong các kịch bản thử nghiệm]

[Ví dụ: Dữ liệu được xử lý và phản hồi chính xác]

[Ví dụ: Độ trễ chấp nhận được trong phạm vi PoC]

### 6.2. Những vấn đề gặp phải

[Vấn đề kỹ thuật 1]

[Vấn đề kỹ thuật 2]

[Hạn chế của giải pháp hiện tại]

## 7. Đánh giá và kết luận
Dựa trên kết quả PoC, nhóm nhận thấy:

Tính năng [có / chưa] khả thi về mặt kỹ thuật

Giải pháp đề xuất [có thể / cần điều chỉnh] để áp dụng vào hệ thống chính thức

PoC này là cơ sở để nhóm:

Tiếp tục thiết kế chi tiết

Mở rộng thành Prototype / MVP

Điều chỉnh lại kiến trúc nếu cần

## 8. Hướng phát triển tiếp theo

Trong giai đoạn tiếp theo, nhóm dự kiến:

[Hoàn thiện kiến trúc]

[Tối ưu hiệu năng]

[Bổ sung bảo mật và kiểm thử]

[Tích hợp vào hệ thống chính]