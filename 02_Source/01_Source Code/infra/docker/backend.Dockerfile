# Giai đoạn 1: Build (Tải thư viện và biên dịch code)
FROM node:22-alpine AS builder

WORKDIR /app

# Copy các file cấu hình dependencies
COPY package*.json ./

# Cài đặt toàn bộ dependencies bao gồm cả devDependencies để build
RUN npm install

# Copy toàn bộ mã nguồn vào container
COPY . .

# Biên dịch mã nguồn NestJS sang JavaScript (dist folder)
RUN npm run build

# Giai đoạn 2: Production (Chỉ giữ lại những thứ cần thiết để chạy)
FROM node:22-alpine

WORKDIR /app

# Chỉ copy file package.json và cài đặt dependencies cần cho runtime (giảm dung lượng)
COPY package*.json ./
RUN npm install --only=production

# Copy folder 'dist' đã được build từ Giai đoạn 1
COPY --from=builder /app/dist ./dist

# Mở cổng 3000 (cổng mặc định của NestJS)
EXPOSE 3000

# Lệnh khởi chạy ứng dụng
CMD ["node", "dist/main"]