import { Module } from '@nestjs/common';
import { Dispatcher } from '../event-bus/dispatcher';
import { InventoryTransactionRepository } from './inventory-transaction.repository';
import { InventoryTransactionService } from './inventory-transaction.service';
import { AdjustmentHandler } from './handlers/adjustment.handler';

@Module({
  providers: [
    InventoryTransactionRepository,
    InventoryTransactionService,
    AdjustmentHandler,
  ],
  exports: [InventoryTransactionService],
})
export class InventoryTransactionModule {
  constructor(
    private readonly dispatcher: Dispatcher,
    private readonly adjustmentHandler: AdjustmentHandler,
  ) {
    // đăng ký handler khi khởi động
    this.dispatcher.register(this.adjustmentHandler);
  }
}
