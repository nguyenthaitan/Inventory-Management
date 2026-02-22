import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {AuthModule} from './auth/auth.module'
import {TestModule} from './test/test.module'
import {AiModule} from './ai/ai.module';
import {BarcodeModule} from './barcode/barcode.module';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    AuthModule,
    TestModule,
    AiModule,
    BarcodeModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
