import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { MaterialModule } from './material/material.module';
import { InventoryLotModule } from './inventory-lot/inventory-lot.module';
import { ProductionBatchModule } from './production-batch/production-batch.module';
import { QCTestModule } from './qc-test/qc-test.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    MaterialModule,
    InventoryLotModule,
    ProductionBatchModule,
    QCTestModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
