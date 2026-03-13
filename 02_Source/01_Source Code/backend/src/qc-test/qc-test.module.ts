import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QCTest, QCTestSchema } from '../schemas/qc-test.schema';
import { QCTestController } from './qc-test.controller';
import { QCTestService } from './qc-test.service';
import { QCTestRepository } from './qc-test.repository';
import { InventoryLotModule } from '../inventory-lot/inventory-lot.module';
import { ProductionBatchModule } from '../production-batch/production-batch.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: QCTest.name, schema: QCTestSchema }]),
    InventoryLotModule, // Import to use InventoryLotService
    // Phase 3 - ProductionBatchService integration
    // Use forwardRef to handle circular dependency: ProductionBatchModule -> QCTestModule -> ProductionBatchModule
    forwardRef(() => ProductionBatchModule),
  ],
  controllers: [QCTestController],
  providers: [QCTestService, QCTestRepository],
  exports: [QCTestService],
})
export class QCTestModule {}
