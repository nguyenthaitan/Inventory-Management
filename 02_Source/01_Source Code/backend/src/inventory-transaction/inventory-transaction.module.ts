import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Dispatcher } from '../event-bus/dispatcher';
import { InventoryTransactionRepository } from './inventory-transaction.repository';
import { InventoryTransactionService } from './inventory-transaction.service';
import { InventoryTransactionController } from './inventory-transaction.controller';
import { InventoryLotChangeHandler } from './handlers/inventoryChange.handler';
import {
  InventoryTransaction,
  InventoryTransactionSchema,
} from '../schemas/inventory-transaction.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InventoryTransaction.name, schema: InventoryTransactionSchema },
    ]),
  ],
  controllers: [InventoryTransactionController],
  providers: [
    InventoryTransactionRepository,
    InventoryTransactionService,
    InventoryLotChangeHandler,
  ],
  exports: [InventoryTransactionService],
})
export class InventoryTransactionModule {
  constructor(
    private readonly dispatcher: Dispatcher,
    private readonly inventoryLotChangeHandler: InventoryLotChangeHandler,
  ) {
    // đăng ký handler khi khởi động
    this.dispatcher.register(this.inventoryLotChangeHandler);
  }
}
