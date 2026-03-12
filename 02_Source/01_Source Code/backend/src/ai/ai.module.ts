import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiSupplierService } from './ai-supplier.service';
import { QCTestModule } from '../qc-test/qc-test.module';

@Module({
  imports: [QCTestModule],
  controllers: [AiController],
  providers: [AiSupplierService],
})
export class AiModule {}
