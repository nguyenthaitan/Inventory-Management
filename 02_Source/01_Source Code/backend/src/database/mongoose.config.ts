import { MongooseModuleOptions } from '@nestjs/mongoose';

// -----------------------------------------------------------------------------
// Trợ giúp cấu hình cho Mongoose
// -----------------------------------------------------------------------------
// Tập tin này giữ các thiết lập kết nối MongoDB/Mongoose ở một nơi duy nhất
// để toàn bộ ứng dụng có thể import các tuỳ chọn hoặc hàm factory(một hàm tạo 
// ra tùy chọn) khi thiết lập DatabaseModule.
//
// Khi ứng dụng khởi động, `DatabaseModule` (hoặc AppModule gốc) có thể gọi
// `MongooseModule.forRootAsync({ useFactory: mongooseConfigFactory })`
// hoặc trực tiếp import `mongooseOptions` nếu không cần provider bất đồng
// bộ. Các biến môi trường được đọc ở đây với giá trị mặc định hợp lý để
// chương trình hoạt động ngay sau khi chạy cùng docker-compose.
// -----------------------------------------------------------------------------

/**
 * Chuỗi kết nối mặc định dùng khi không có biến môi trường nào được định nghĩa.
 *
 * - `MONGODB_URI` là biến môi trường tiêu chuẩn trong dự án này.
 * - `MONGO_URI` cũng được hỗ trợ để tiện tương thích với một số container
 *   hoặc nền tảng xây dựng.
 */
export const DEFAULT_MONGO_URI: string =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  'mongodb://admin:password123@localhost:27017/inventory_db?authSource=admin';

/**
 * Các tuỳ chọn chung cho module mongoose. Những thiết lập này được giữ tối giản;
 * các cấu hình bổ sung (plugin, chế độ debug, v.v.) có thể thêm khi dự án tiến
 * triển.
 */
export const mongooseOptions: MongooseModuleOptions = {
  uri: DEFAULT_MONGO_URI,
  autoCreate: true, // automatically create collections defined by schemas
  autoIndex: process.env.NODE_ENV !== 'production',
  // debug: process.env.NODE_ENV !== 'production',
};

/**
 * Hàm factory tương thích với `MongooseModule.forRootAsync()`.
 */
export function mongooseConfigFactory(): MongooseModuleOptions {
  return mongooseOptions;
}

// export the default as well in case someone prefers a default import
export default mongooseOptions;
