import { Injectable, Logger } from '@nestjs/common';
import { Handler } from '../../event-bus/dispatcher';
import { TransactionType } from '../dto/create-inventory-transaction.dto';

@Injectable()
export class AdjustmentHandler implements Handler {
  private readonly logger = new Logger(AdjustmentHandler.name);

  supports(type: string): boolean {
    return type === TransactionType.Adjustment;
  }

  async handle(payload: any): Promise<void> {
    // payload là bản ghi giao dịch vừa tạo
    // bạn có thể triển khai logic nghiệp vụ ở đây (vd. kiểm tra luật, sinh sự kiện khác, v.v.)
    this.logger.log(
      `Adjustment event received, payload: ${JSON.stringify(payload)}`,
    );
    // chỗ dành sẵn: không làm gì
  }
}
