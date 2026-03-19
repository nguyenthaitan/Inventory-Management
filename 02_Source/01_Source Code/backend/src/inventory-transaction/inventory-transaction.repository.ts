import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  InventoryTransaction,
  InventoryTransactionDocument,
} from '../schemas/inventory-transaction.schema';

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface FilterOptions {
  lot_id?: string;
  transaction_type?: string;
  from?: Date;
  to?: Date;
}

@Injectable()
export class InventoryTransactionRepository {
  constructor(
    @InjectModel(InventoryTransaction.name)
    private readonly model: Model<InventoryTransactionDocument>,
  ) {}
  async findAll(
    filters: FilterOptions = {},
    pagination: PaginationOptions = { page: 1, limit: 20 },
  ) {
    const query = this.model.find();

    if (filters.lot_id) {
      query.where('lot_id').equals(filters.lot_id);
    }
    if (filters.transaction_type) {
      query.where('transaction_type').equals(filters.transaction_type);
    }
    if (filters.from || filters.to) {
      const range: any = {};
      if (filters.from) range.$gte = filters.from;
      if (filters.to) range.$lte = filters.to;
      query.where('transaction_date').find(range);
    }

    // pagination
    const page = pagination.page && pagination.page > 0 ? pagination.page : 1;
    const limit =
      pagination.limit && pagination.limit > 0 ? pagination.limit : 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      query.skip(skip).limit(limit).exec(),
      // count filtered documents without pagination
      this.model.countDocuments(query.getFilter()).exec(),
    ]);

    return { items, total };
  }

  async findOne(id: string) {
    return this.model.findById(id).exec();
  }

  async create(dto: any) {
    const doc = new this.model(dto);
    return doc.save();
  }

  async createMany(dtos: any[]) {
    return this.model.insertMany(dtos);
  }

  async update(id: string, dto: any) {
    return this.model.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  async remove(id: string) {
    return this.model.findByIdAndDelete(id).exec();
  }

  async deleteByLotId(lot_id: string) {
    return this.model.deleteMany({ lot_id }).exec();
  }
}
