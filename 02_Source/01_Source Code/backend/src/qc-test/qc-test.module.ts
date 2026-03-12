import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QCTest, QCTestSchema } from '../schemas/qc-test.schema';
import { QCTestController } from './qc-test.controller';
import { QCTestService } from './qc-test.service';
import { QCTestRepository } from './qc-test.repository';
// TODO: re-import InventoryLotModule once InventoryLotService is fully implemented

@Module({
  imports: [
    MongooseModule.forFeature([{ name: QCTest.name, schema: QCTestSchema }]),
    // TODO: InventoryLotModule,
  ],
  controllers: [QCTestController],
  providers: [QCTestService, QCTestRepository],
  exports: [QCTestService],
})
export class QCTestModule {}
