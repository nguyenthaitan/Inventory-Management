# Giai đoạn 1: Build (Biên dịch React code)
FROM node:22-alpine AS build-stage

WORKDIR /app

# Copy các file quản lý thư viện
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Argument for API URL
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Copy toàn bộ mã nguồn
COPY . .

# Biên dịch ứng dụng sang các file tĩnh (thường nằm trong folder /dist)
RUN npm run build

# Giai đoạn 2: Production (Dùng Nginx để chạy file tĩnh)
FROM nginx:stable-alpine

# Copy các file đã build từ Giai đoạn 1 vào thư mục mặc định của Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Mở cổng 80 (cổng mặc định của HTTP)
EXPOSE 80

# Chạy Nginx
CMD ["nginx", "-g", "daemon off;"]