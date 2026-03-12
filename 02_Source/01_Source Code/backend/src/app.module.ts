import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { MaterialModule } from './material/material.module';
import { InventoryLotModule } from './inventory-lot/inventory-lot.module';
import { ProductionBatchModule } from './production-batch/production-batch.module';
import { LabelTemplateModule } from './label-template/label-template.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    MaterialModule,
    InventoryLotModule,
    ProductionBatchModule,
    LabelTemplateModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
