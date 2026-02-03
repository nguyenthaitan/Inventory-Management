import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module'
import { TestModule } from './test/test.module' 

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule, TestModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
