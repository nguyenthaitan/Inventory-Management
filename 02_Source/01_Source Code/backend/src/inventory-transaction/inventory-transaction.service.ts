import { Injectable, BadRequestException } from '@nestjs/common';
import { InventoryTransactionRepository } from './inventory-transaction.repository';
import { InventoryLotRepository } from '../inventory-lot/inventory-lot.repository';
import { MaterialRepository } from '../material/material.repository';
import { KafkaService } from '../event-bus/kafka.service';
import {
  CreateInventoryTransactionDto,
  TransactionType,
} from './dto/create-inventory-transaction.dto';
import { UpdateInventoryTransactionDto } from './dto/update-inventory-transaction.dto';

@Injectable()
export class InventoryTransactionService {
  constructor(
    private readonly repo: InventoryTransactionRepository,
    private readonly lotRepo: InventoryLotRepository,
    private readonly materialRepo: MaterialRepository,
    private readonly kafka: KafkaService,
  ) {}

  async create(transactionDto: CreateInventoryTransactionDto) {
    // tiền xử lý chung: gán ngày giao dịch nếu chưa có, tạo transaction_id
    if (!transactionDto.transaction_date) {
      transactionDto.transaction_date = new Date().toISOString();
    }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    transactionDto.transaction_id = require('uuid').v4();

    // sign rule per type: receipt>0, usage<0, disposal>0;
    // split/adjustment/transfer !=0 (sign indicates direction)
    switch (transactionDto.transaction_type) {
      case TransactionType.Receipt:
        if (transactionDto.quantity <= 0) {
          throw new BadRequestException('receipt quantity must be positive');
        }
        break;
      case TransactionType.Usage:
        if (transactionDto.quantity >= 0) {
          throw new BadRequestException('usage quantity must be negative');
        }
        break;
      case TransactionType.Split:
        if (transactionDto.quantity === 0) {
          throw new BadRequestException('split quantity cannot be zero');
        }
        break;
      case TransactionType.Disposal:
        if (transactionDto.quantity <= 0) {
          throw new BadRequestException('disposal quantity must be positive');
        }
        break;
      case TransactionType.Adjustment:
        if (transactionDto.quantity === 0) {
          throw new BadRequestException('adjustment quantity cannot be zero');
        }
        break;
      case TransactionType.Transfer:
        if (transactionDto.quantity === 0) {
          throw new BadRequestException('transfer quantity cannot be zero');
        }
        break;
    }

    switch (transactionDto.transaction_type) {
      case TransactionType.Receipt:
        return this.handleReceipt(transactionDto);
      case TransactionType.Usage:
        return this.handleUsage(transactionDto);
      case TransactionType.Split:
        return this.handleSplit(transactionDto);
      case TransactionType.Adjustment:
        return this.handleAdjustment(transactionDto);
      case TransactionType.Transfer:
        return this.handleTransfer(transactionDto);
      case TransactionType.Disposal:
        return this.handleDisposal(transactionDto);
      default:
        throw new BadRequestException('unknown transaction type');
    }
  }

  async getAll(filters, paging) {
    return this.repo.findAll(filters, paging);
  }
  async getOne(id: string) {
    return this.repo.findOne(id);
  }
  async update(id: string, dto: UpdateInventoryTransactionDto) {
    // có thể giới hạn trường được phép sửa, ghi log thay đổi, v.v.
    return this.repo.update(id, dto);
  }
  async remove(id: string) {
    return this.repo.remove(id);
  }

  // các hàm hỗ trợ theo loại
  protected async handleReceipt(dto: CreateInventoryTransactionDto) {
    // tăng số lượng của lô được chỉ định
    const created = await this.repo.create(dto);
    await this.kafka.publish('inventory-transactions', [{ value: created }]);
    return created;
  }

  protected async handleUsage(dto: CreateInventoryTransactionDto) {
    // kiểm tra tồn kho và giảm, áp dụng FIFO/FEFO
    // nếu thiếu lot_id thì chọn lô tự động
    // đảm bảo không âm tồn
    // đơn giản: chỉ lưu bản ghi
    const created = await this.repo.create(dto);
    await this.kafka.publish('inventory-transactions', [{ value: created }]);
    return created;
  }

  protected async handleSplit(dto: CreateInventoryTransactionDto) {
    // tạo giao dịch split và lô con mới
    const created = await this.repo.create(dto);
    // bỏ qua phần tạo lô bổ sung
    await this.kafka.publish('inventory-transactions', [{ value: created }]);
    return created;
  }

  protected async handleAdjustment(dto: CreateInventoryTransactionDto) {
    // điều chỉnh +/- số lượng kèm lý do
    const created = await this.repo.create(dto);
    await this.kafka.publish('inventory-transactions', [{ value: created }]);
    return created;
  }

  protected async handleTransfer(dto: CreateInventoryTransactionDto) {
    // có thể gọi handleUsage + handleReceipt hoặc dùng một bản ghi transfer
    const created = await this.repo.create(dto);
    await this.kafka.publish('inventory-transactions', [{ value: created }]);
    return created;
  }

  protected async handleDisposal(dto: CreateInventoryTransactionDto) {
    // giống usage nhưng đánh dấu là hủy
    const created = await this.repo.create(dto);
    await this.kafka.publish('inventory-transactions', [{ value: created }]);
    return created;
  }
}
