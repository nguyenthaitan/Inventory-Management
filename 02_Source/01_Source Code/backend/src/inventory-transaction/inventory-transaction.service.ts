import { Injectable, BadRequestException } from '@nestjs/common';
import { InventoryTransactionRepository } from './inventory-transaction.repository';
import { InventoryLotRepository } from '../inventory-lot/inventory-lot.repository';
import { MaterialRepository } from '../material/material.repository';
import { KafkaService } from '../event-bus/kafka.service';
import {
  CreateInventoryTransactionDto,
  UpdateInventoryTransactionDto,
  TransactionType,
} from './dto';

@Injectable()
export class InventoryTransactionService {
  constructor(
    private readonly repo: InventoryTransactionRepository,
    private readonly lotRepo: InventoryLotRepository,
    private readonly materialRepo: MaterialRepository,
    private readonly kafka: KafkaService,
  ) {}

  async create(transactionDto: CreateInventoryTransactionDto) {
    // common preprocessing: set transaction_date default, uuid etc.
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
    // could restrict which fields can be updated, logging etc.
    return this.repo.update(id, dto);
  }
  async remove(id: string) {
    return this.repo.remove(id);
  }

  // helpers
  protected async handleReceipt(dto: CreateInventoryTransactionDto) {
    // increase quantity on specified lot
    const created = await this.repo.create(dto);
    await this.kafka.publish('inventory-transactions', [{ value: created }]);
    return created;
  }

  protected async handleUsage(dto: CreateInventoryTransactionDto) {
    // check stock and decrement, apply FIFO/FEFO
    // select lots if lot_id missing
    // ensure not negative
    // simplified: just save
    const created = await this.repo.create(dto);
    await this.kafka.publish('inventory-transactions', [{ value: created }]);
    return created;
  }

  protected async handleSplit(dto: CreateInventoryTransactionDto) {
    // create a split transaction and new child lot(s)
    const created = await this.repo.create(dto);
    // additional lot creation skipped
    await this.kafka.publish('inventory-transactions', [{ value: created }]);
    return created;
  }

  protected async handleAdjustment(dto: CreateInventoryTransactionDto) {
    // +/- quantity with reason
    const created = await this.repo.create(dto);
    await this.kafka.publish('inventory-transactions', [{ value: created }]);
    return created;
  }

  protected async handleTransfer(dto: CreateInventoryTransactionDto) {
    // could call handleUsage and handleReceipt or a single transfer record
    const created = await this.repo.create(dto);
    await this.kafka.publish('inventory-transactions', [{ value: created }]);
    return created;
  }

  protected async handleDisposal(dto: CreateInventoryTransactionDto) {
    // similar to usage but mark disposal
    const created = await this.repo.create(dto);
    await this.kafka.publish('inventory-transactions', [{ value: created }]);
    return created;
  }
}
