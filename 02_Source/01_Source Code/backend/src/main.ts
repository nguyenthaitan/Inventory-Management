import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Allow Frontend to communicate

  // retrieve port from configuration service (reads from env or other sources)
  const config = app.get(ConfigService);
  const port = config.get<string>('PORT') ?? '3000';
  await app.listen(parseInt(port, 10));

  console.log(`Backend is running on: ${await app.getUrl()}`);
}
bootstrap();
