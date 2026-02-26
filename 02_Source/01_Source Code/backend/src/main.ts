import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cấu hình CORS cơ bản: cho phép các nguồn, phương thức, header và credentials cụ thể
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'], // url frontend
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,                // cho phép cookie và header xác thực
    preflightContinue: false,         // truyền phản hồi preflight cho bộ xử lý tiếp theo
    optionsSuccessStatus: 204,
  });

  // lấy cổng từ ConfigService (đọc từ env hoặc nơi khác)
  const config = app.get(ConfigService);
  const port = config.get<string>('PORT') ?? '3000';
  await app.listen(parseInt(port, 10));

  console.log(`Backend is running on: ${await app.getUrl()}`);
}
bootstrap();
