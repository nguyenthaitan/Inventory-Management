import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProductionBatch,
  ProductionBatchSchema,
} from '../schemas/production-batch.schema';
import {
  BatchComponent,
  BatchComponentSchema,
} from '../schemas/batch-component.schema';
import { Material, MaterialSchema } from '../schemas/material.schema';
import {
  InventoryLot,
  InventoryLotSchema,
} from '../schemas/inventory-lot.schema';
import { ProductionBatchController } from './production-batch.controller';
import { ProductionBatchService } from './production-batch.service';
import { ProductionBatchRepository } from './production-batch.repository';
import { BatchComponentService } from './batch-component.service';
import { BatchComponentRepository } from './batch-component.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductionBatch.name, schema: ProductionBatchSchema },
      { name: BatchComponent.name, schema: BatchComponentSchema },
      // Cross-references needed by services for FK validation
      { name: Material.name, schema: MaterialSchema },
      { name: InventoryLot.name, schema: InventoryLotSchema },
    ]),
  ],
  controllers: [ProductionBatchController],
  providers: [
    ProductionBatchRepository,
    BatchComponentRepository,
    ProductionBatchService,
    BatchComponentService,
  ],
  exports: [ProductionBatchService, BatchComponentService],
})
export class ProductionBatchModule {}
