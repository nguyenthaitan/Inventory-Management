# 🤖 Hướng dẫn Test Chức năng AI Analysis cho QC

## 📋 Tổng quan

Chức năng **AI Analysis** cho phép phân tích kết quả kiểm định chất lượng (QC) bằng AI model từ HuggingFace (Qwen/Qwen2.5-72B-Instruct).

### Công nghệ sử dụng:
- **Backend**: NestJS với @huggingface/inference
- **Frontend**: React 18/19
- **AI Model**: Qwen/Qwen2.5-72B-Instruct (HuggingFace)
- **Authentication**: Không cần (Public endpoint để test nhanh)

---

## 🚀 Cách chạy hệ thống

### Bước 1: Khởi động Backend (NestJS)

```powershell
# Di chuyển đến thư mục backend
cd "02_Source/05_Proof of Concept/inventory-backend"

# Cài đặt dependencies (nếu chưa cài)
npm install

# Khởi động backend ở chế độ development
npm run start:dev
```

✅ Backend sẽ chạy tại: **http://localhost:3000**

**Kiểm tra backend đang hoạt động:**
```powershell
# Test kết nối HuggingFace API
curl http://localhost:3000/ai/test-connection

# Lấy mock data
curl http://localhost:3000/ai/mock-data
```

---

### Bước 2: Khởi động Frontend (React)

**Mở terminal mới** (giữ backend đang chạy):

```powershell
# Di chuyển đến thư mục frontend
cd "02_Source/05_Proof of Concept/inventory-frontend"

# Cài đặt dependencies (nếu chưa cài)
npm install

# Khởi động frontend
npm run dev
```

✅ Frontend sẽ chạy tại: **http://localhost:5173** (hoặc port khác nếu đã có app chạy)

---

## 🧪 Cách Test Chức năng

### 1️⃣ Test qua Giao diện React (Khuyến nghị)

1. Mở trình duyệt và truy cập: **http://localhost:5173**

2. Kéo xuống phần **"Hệ thống Kiểm định Chất lượng (QC)"**

3. Bạn sẽ thấy bảng dữ liệu với 5 test cases mẫu:
   - 🔴 **QC-001**: Vi sinh vật (Failed - 550 CFU/g > 100 CFU/g)
   - 🟢 **QC-002**: Độ tinh khiết (Passed - 98.5% trong khoảng 95-105%)
   - 🟢 **QC-003**: Kim loại nặng (Passed - 0.95 ppm < 1.0 ppm)
   - 🟡 **QC-004**: Độ ẩm (Borderline - 5.8% gần 6.0%)
   - 🔴 **QC-005**: Độ pH (Failed - 3.2 ngoài khoảng 3.5-4.5)

4. **Nhấn nút "🤖 AI Analysis"** trên bất kỳ dòng nào

5. Xem kết quả:
   - ⏳ Trạng thái "Đang phân tích..." sẽ hiển thị
   - 💡 Sau 3-5 giây, nhận xét từ AI sẽ xuất hiện trong khung màu vàng nhạt
   - ✅ AI sẽ đưa ra:
     - Đánh giá Pass/Fail
     - Mức độ nghiêm trọng
     - Khuyến nghị cụ thể

---

### 2️⃣ Test qua API (curl/Postman)

#### Endpoint 1: Lấy Mock Data
```powershell
curl http://localhost:3000/ai/mock-data
```

**Response mẫu:**
```json
{
  "success": true,
  "data": [...],
  "count": 5
}
```

---

#### Endpoint 2: Phân tích QC Test
```powershell
curl -X POST http://localhost:3000/ai/analyze-mock `
  -H "Content-Type: application/json" `
  -d '{
    "test_type": "Microbial Testing",
    "test_name": "Vi sinh vật",
    "test_result": "550 CFU/g",
    "acceptance_criteria": "< 100 CFU/g",
    "product_name": "Thực phẩm chức năng ABC",
    "batch_number": "BATCH-20260218-01"
  }'
```

**Response mẫu:**
```json
{
  "success": true,
  "analysis": "Kết quả kiểm tra vi sinh vật cho thấy mật độ 550 CFU/g vượt xa tiêu chuẩn cho phép (< 100 CFU/g), đây là lỗi nghiêm trọng về an toàn thực phẩm. Sản phẩm phải bị từ chối và không được phép lưu thông. Khuyến nghị kiểm tra lại quy trình vệ sinh và bảo quản ngay lập tức.",
  "timestamp": "2026-02-20T10:30:45.123Z",
  "model_used": "Qwen/Qwen2.5-72B-Instruct"
}
```

---

#### Endpoint 3: Test kết nối HuggingFace
```powershell
curl http://localhost:3000/ai/test-connection
```

**Response mẫu:**
```json
{
  "success": true,
  "message": "Kết nối thành công với HuggingFace API",
  "model": "Qwen/Qwen2.5-72B-Instruct",
  "timestamp": "2026-02-20T10:30:45.123Z"
}
```

---

#### Endpoint 4: Phân tích theo ID
```powershell
curl -X POST http://localhost:3000/ai/analyze-by-id `
  -H "Content-Type: application/json" `
  -d '{"id": "QC-001"}'
```

---

## 📊 Test Cases để Kiểm tra

### ✅ Test 1: Trường hợp **PASS**
- **Test**: QC-002 (Độ tinh khiết)
- **Kết quả**: 98.5%
- **Tiêu chuẩn**: 95-105%
- **Mong đợi AI**: Xác nhận sản phẩm đạt tiêu chuẩn, an toàn

---

### ❌ Test 2: Trường hợp **FAIL nghiêm trọng**
- **Test**: QC-001 (Vi sinh vật)
- **Kết quả**: 550 CFU/g
- **Tiêu chuẩn**: < 100 CFU/g
- **Mong đợi AI**: Cảnh báo nghiêm trọng, từ chối sản phẩm

---

### ⚠️ Test 3: Trường hợp **BORDERLINE**
- **Test**: QC-004 (Độ ẩm)
- **Kết quả**: 5.8%
- **Tiêu chuẩn**: < 6.0%
- **Mong đợi AI**: Chấp nhận nhưng khuyến nghị theo dõi chặt chẽ

---

### ❌ Test 4: Trường hợp **FAIL ngoài khoảng**
- **Test**: QC-005 (Độ pH)
- **Kết quả**: 3.2
- **Tiêu chuẩn**: 3.5-4.5
- **Mong đợi AI**: Không đạt tiêu chuẩn, kiểm tra lại quy trình

---

## 🔧 Troubleshooting

### ❗ Lỗi: "Cannot connect to HuggingFace API"

**Nguyên nhân**: 
- API Key không hợp lệ hoặc đã hết hạn
- Network/Firewall chặn kết nối

**Giải pháp**:
1. Kiểm tra API Key trong file `.env`:
   ```
   HUGGINGFACE_API_KEY=
   ```
2. Test kết nối: 
   ```powershell
   curl http://localhost:3000/ai/test-connection
   ```
3. Kiểm tra log backend để xem chi tiết lỗi

---

### ❗ Lỗi: "CORS Error" khi gọi API từ Frontend

**Nguyên nhân**: Backend chưa bật CORS

**Giải pháp**: 
Kiểm tra file `main.ts` có đoạn sau:
```typescript
app.enableCors();
```

---

### ❗ Frontend không hiển thị dữ liệu

**Nguyên nhân**: 
- Backend chưa chạy
- URL API sai

**Giải pháp**:
1. Kiểm tra backend đang chạy: `http://localhost:3000`
2. Kiểm tra frontend component config:
   ```javascript
   const API_BASE_URL = 'http://localhost:3000';
   ```

---

## 📁 Cấu trúc Files đã tạo

### Backend:
```
inventory-backend/src/ai/
├── ai.module.ts                 # Module chính
├── ai-qc.service.ts             # Service gọi HuggingFace API
├── ai-qc.controller.ts          # Controller xử lý endpoints
├── qc-mock.data.ts              # Mock data 5 test cases
└── dto/
    └── analyze-qc.dto.ts        # DTO cho request/response
```

### Frontend:
```
inventory-frontend/src/
├── components/
│   ├── QCTestList.jsx           # Component chính hiển thị QC list
│   └── QCTestList.css           # Styles cho component
└── App.jsx                      # Updated để import QCTestList
```

---

## 🎯 API Endpoints Tóm tắt

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/ai/analyze-mock` | Phân tích QC test | ❌ Public |
| GET | `/ai/mock-data` | Lấy danh sách mock data | ❌ Public |
| GET | `/ai/test-connection` | Test kết nối HuggingFace | ❌ Public |
| POST | `/ai/analyze-by-id` | Phân tích theo ID test | ❌ Public |

---

## 🎨 Screenshots (Mô tả giao diện)

### 1. Bảng QC Tests
- Header màu gradient tím
- Bảng dữ liệu với các cột: ID, Sản phẩm, Loại Test, Kết quả, Tiêu chuẩn, Trạng thái, Ngày test, Hành động
- Nút "🤖 AI Analysis" màu tím gradient

### 2. Khi đang phân tích
- Nút hiển thị spinner + text "Đang phân tích..."
- Nút bị disabled

### 3. Kết quả AI
- Khung màu vàng nhạt với border trái màu vàng
- Icon 🤖 + nhận xét từ AI
- Timestamp + tên model ở footer
- Hiệu ứng slide down mượt mà

---

## ✅ Checklist khi Demo

- [ ] Backend đang chạy (`npm run start:dev`)
- [ ] Frontend đang chạy (`npm run dev`)
- [ ] Test kết nối: `curl http://localhost:3000/ai/test-connection`
- [ ] Mở browser: `http://localhost:5173`
- [ ] Click "🤖 AI Analysis" ở test Failed (QC-001)
- [ ] Click "🤖 AI Analysis" ở test Passed (QC-002)
- [ ] Xem và so sánh nhận xét từ AI

---

## 📝 Ghi chú

1. **Không cần Authentication**: Các endpoint AI đều public để test nhanh
2. **Mock Data**: Dữ liệu mẫu được load từ backend (không cần database)
3. **Response Time**: Mỗi phân tích mất khoảng 3-5 giây
4. **API Key**: Đã cấu hình sẵn trong `.env`, bạn có thể thay đổi nếu cần

---

## 🔗 Tài liệu tham khảo

- [HuggingFace Inference API](https://huggingface.co/docs/api-inference/index)
- [Qwen Model](https://huggingface.co/Qwen/Qwen2.5-72B-Instruct)
- [NestJS Documentation](https://docs.nestjs.com/)
- [React Documentation](https://react.dev/)

---

**Chúc bạn test thành công! 🎉**

Nếu có vấn đề gì, hãy kiểm tra:
1. Log của backend terminal
2. Console trong browser (F12)
3. Network tab để xem request/response
