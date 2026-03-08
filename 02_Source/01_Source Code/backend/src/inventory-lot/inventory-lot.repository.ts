import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  InventoryLot,
  InventoryLotDocument,
} from '../schemas/inventory-lot.schema';

@Injectable()
export class InventoryLotRepository {
  constructor(
    @InjectModel(InventoryLot.name)
    private readonly lotModel: Model<InventoryLotDocument>,
  ) {}

  async findAll(filter?: { status?: string }): Promise<InventoryLotDocument[]> {
    const query = filter?.status ? { status: filter.status } : {};
    return this.lotModel.find(query).sort({ created_date: -1 }).exec();
  }

  async findByLotId(lot_id: string): Promise<InventoryLotDocument | null> {
    return this.lotModel.findOne({ lot_id }).exec();
  }

  async findByLotIds(lot_ids: string[]): Promise<InventoryLotDocument[]> {
    return this.lotModel.find({ lot_id: { $in: lot_ids } }).exec();
  }

  async findByStatus(status: string): Promise<InventoryLotDocument[]> {
    return this.lotModel.find({ status }).exec();
  }

  async create(data: Partial<InventoryLot>): Promise<InventoryLotDocument> {
    const lot = new this.lotModel(data);
    return lot.save();
  }

  async updateByLotId(
    lot_id: string,
    data: Partial<InventoryLot>,
  ): Promise<InventoryLotDocument | null> {
    return this.lotModel
      .findOneAndUpdate({ lot_id }, { $set: data }, { new: true })
      .exec();
  }

  async updateManyStatus(lot_ids: string[], status: string): Promise<number> {
    const result = await this.lotModel
      .updateMany({ lot_id: { $in: lot_ids } }, { $set: { status } })
      .exec();
    return result.modifiedCount;
  }
}
