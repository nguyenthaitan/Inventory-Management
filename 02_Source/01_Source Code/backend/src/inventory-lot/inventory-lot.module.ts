import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryLotController } from './inventory-lot.controller';
import { InventoryLotService } from './inventory-lot.service';
import { InventoryLotRepository } from './inventory-lot.repository';
import {
  InventoryLot,
  InventoryLotSchema,
} from '../schemas/inventory-lot.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InventoryLot.name, schema: InventoryLotSchema },
    ]),
  ],
  controllers: [InventoryLotController],
  providers: [InventoryLotService, InventoryLotRepository],
  exports: [InventoryLotService],
})
export class InventoryLotModule {}

