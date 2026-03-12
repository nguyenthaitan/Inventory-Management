import { Injectable, Logger } from '@nestjs/common';
import { Handler } from '../../event-bus/dispatcher';
import {
  TransactionType,
  CreateInventoryTransactionDto,
} from '../dto/create-inventory-transaction.dto';
import { InventoryTransactionService } from '../inventory-transaction.service';

@Injectable()
export class AdjustmentHandler implements Handler {
  private readonly logger = new Logger(AdjustmentHandler.name);

  constructor(private readonly invTxService: InventoryTransactionService) {}

  supports(type: string): boolean {
    return type === 'InventoryLotAdjusted';
  }

  async handle(payload: any): Promise<void> {
    // payload là bản ghi giao dịch vừa tạo (hoặc thông tin adjustment từ module khác)
    this.logger.log(
      `Adjustment event received, payload: ${JSON.stringify(payload)}`,
    );

    // chuyển payload thành CreateInventoryTransactionDto với loại Adjustment
    const dto: CreateInventoryTransactionDto = {
      lot_id: payload.lot_id || payload.inventory_lot_id,
      transaction_type: TransactionType.Adjustment,
      quantity: payload.quantity,
      unit_of_measure: payload.unit_of_measure || payload.uom || '',
      performed_by: payload.performed_by || payload.user_id || '',
      notes: payload.notes || payload.reason || undefined,
      reference_number: payload.reference_number,
      // transaction_date sẽ được gán tự động nếu thiếu
    };

    // kiểm tra các trường bắt buộc để tránh lỗi validation
    if (
      !dto.lot_id ||
      dto.quantity === undefined ||
      dto.quantity === null ||
      !dto.unit_of_measure ||
      !dto.performed_by
    ) {
      this.logger.warn(
        'adjustment payload missing required fields, skipping transaction creation',
      );
      return;
    }

    try {
      await this.invTxService.create(dto);
      this.logger.log('InventoryTransaction (adjustment) created successfully');
    } catch (err) {
      this.logger.error(
        'failed to create adjustment transaction',
        err.stack || err.message,
      );
    }
  }
}
