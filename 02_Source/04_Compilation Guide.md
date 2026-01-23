
# Hướng Dẫn Cài Đặt, Biên Dịch, Cấu Hình và Chạy Hệ Thống Quản Lý Kho

Tài liệu này hướng dẫn nhà phát triển (Developer) cách cài đặt môi trường, biên dịch mã nguồn, chỉnh sửa cấu hình, thực thi các tập tin kịch bản và chạy hệ thống trên máy tính mới cài đặt hệ điều hành.

## 1. Yêu cầu hệ thống
- Hệ điều hành: macOS, Windows hoặc Linux
- Phần mềm cần thiết:
  - Node.js (>= 18.x)
  - npm (>= 9.x)
  - MongoDB hoặc MySQL (tùy cấu hình)
  - Git
  - (Tùy chọn) Docker, nếu muốn chạy môi trường container

## 2. Cài đặt môi trường
1. Cài đặt Node.js và npm từ [nodejs.org](https://nodejs.org/)
2. Cài đặt Git từ [git-scm.com](https://git-scm.com/)
3. Cài đặt MongoDB hoặc MySQL theo hướng dẫn trên trang chủ
4. (Tùy chọn) Cài đặt Docker từ [docker.com](https://www.docker.com/)

## 3. Lấy mã nguồn và cấu hình
1. Mở terminal, di chuyển đến thư mục làm việc:
   ```sh
   cd ~/Downloads/Inventory-Management
   ```
2. Clone repository (nếu chưa có):
   ```sh
   git clone <link-repo-của-nhóm>
   ```
3. Cài đặt các package:
   ```sh
   cd 02_Source/01_Source Code/src
   npm install
   ```
4. Chỉnh sửa file cấu hình (ví dụ `.env` hoặc `config.js`) cho phù hợp môi trường máy bạn:
   - Thông tin kết nối database
   - Thông tin cổng chạy ứng dụng
   - Các biến môi trường khác nếu có

## 4. Biên dịch và chạy hệ thống
1. Biên dịch (nếu sử dụng TypeScript):
   ```sh
   npm run build
   ```
2. Chạy ứng dụng:
   ```sh
   npm start
   ```
   hoặc
   ```sh
   node dist/main.js
   ```
3. Truy cập hệ thống tại [http://localhost:3000](http://localhost:3000) (hoặc cổng bạn cấu hình)

## 5. Thực thi các tập tin kịch bản
- Các script hỗ trợ (import dữ liệu, migrate, seed, test...) thường nằm trong thư mục `scripts/` hoặc được định nghĩa trong `package.json`.
- Ví dụ chạy script seed dữ liệu:
  ```sh
  npm run seed
  ```

## 6. Tham gia hệ thống quản lý mã nguồn (Source Control)
- Để tham gia hệ thống GitHub của nhóm với vai trò admin/user, hãy truy cập liên kết mời sau:
  [Link mời vào GitHub](https://github.com/your-org/inventory-management/invitations)
- ![Ảnh minh họa mời vào GitHub](../01_Documents/images/github-invite.png)

## 7. Tham gia hệ thống build & CI/CD
- Để tham gia hệ thống build và tích hợp tự động (CI/CD) của nhóm (ví dụ GitLab), hãy truy cập liên kết mời sau:
  [Link mời vào GitLab CI/CD](https://gitlab.com/your-org/inventory-management/invitations)
- ![Ảnh minh họa mời vào GitLab](../01_Documents/images/gitlab-invite.png)

## 8. Video hướng dẫn cài đặt và chạy hệ thống
- Xem video hướng dẫn chi tiết quá trình cài đặt môi trường, biên dịch, cấu hình và chạy mã nguồn tại:
  [Video YouTube hướng dẫn](https://www.youtube.com/watch?v=your-video-id)

## 9. Xử lý sự cố
- Một số lỗi thường gặp:
  - Thiếu package/phụ thuộc
  - Lỗi biên dịch TypeScript
  - Lỗi kết nối database
- Cách xử lý:
  - Kiểm tra lại các bước cài đặt
  - Đọc kỹ thông báo lỗi trên terminal
  - Tham khảo tài liệu `01_Documents/07_Coding Standards.md` hoặc hỏi nhóm phát triển

## 10. Thông tin thêm
- Cấu hình nâng cao: xem `01_Documents/05_Architecture.md`
- Hướng dẫn dữ liệu: xem `02_Source/02_Raw Data`
- Liên hệ: xem file `README.md` hoặc liên hệ quản trị viên dự án
