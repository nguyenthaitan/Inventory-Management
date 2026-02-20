# 🤖 AI QC Analysis - Quick Start

Chức năng AI phân tích kết quả kiểm định chất lượng (QC) sử dụng HuggingFace Model.

## ⚡ Khởi động nhanh (Khuyến nghị)

```powershell
# Chạy script tự động
.\start-dev.ps1
```

Script sẽ tự động:
- ✅ Kiểm tra và cài đặt dependencies
- ✅ Khởi động Backend (http://localhost:3000)
- ✅ Khởi động Frontend (http://localhost:5173)
- ✅ Mở trình duyệt

## 📖 Hoặc khởi động thủ công

### Terminal 1 - Backend:
```powershell
cd inventory-backend
npm install
npm run start:dev
```

### Terminal 2 - Frontend:
```powershell
cd inventory-frontend
npm install
npm run dev
```

## 🧪 Test ngay

1. Mở: **http://localhost:5173**
2. Kéo xuống phần "Hệ thống Kiểm định Chất lượng"
3. Nhấn **"🤖 AI Analysis"** trên bất kỳ dòng nào
4. Xem nhận xét từ AI (3-5 giây)

## 📚 Hướng dẫn chi tiết

Xem file [AI_ANALYSIS_GUIDE.md](./AI_ANALYSIS_GUIDE.md) để có:
- ✅ Test cases chi tiết
- ✅ API Documentation
- ✅ Troubleshooting guide
- ✅ Cấu trúc code

## 🎯 Các Test Case mẫu

| ID | Test | Kết quả | Trạng thái | Mong đợi AI |
|----|------|---------|------------|-------------|
| QC-001 | Vi sinh vật | 550 CFU/g > 100 | ❌ Failed | Cảnh báo nghiêm trọng |
| QC-002 | Độ tinh khiết | 98.5% (95-105%) | ✅ Passed | Xác nhận đạt chuẩn |
| QC-003 | Kim loại nặng | 0.95 ppm < 1.0 | ✅ Passed | Xác nhận an toàn |
| QC-004 | Độ ẩm | 5.8% < 6.0% | ⚠️ Borderline | Theo dõi chặt chẽ |
| QC-005 | Độ pH | 3.2 (ngoài 3.5-4.5) | ❌ Failed | Kiểm tra lại quy trình |

## 🔑 Thông tin quan trọng

- **Không cần đăng nhập**: Endpoints AI là public
- **Mock Data**: Test không cần database
- **AI Model**: Qwen/Qwen2.5-72B-Instruct
- **Response Time**: 3-5 giây/request

## 🛠️ Công nghệ

- Backend: NestJS + @huggingface/inference
- Frontend: React 18/19
- AI API: HuggingFace Router

---

**Chúc bạn demo thành công! 🎉**
