/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  InventoryLot,
  InventoryLotDocument,
} from '../schemas/inventory-lot.schema';
import type {
  CreateInventoryLotDto,
  UpdateInventoryLotDto,
} from './inventory-lot.dto';

@Injectable()
export class InventoryLotRepository {
  constructor(
    @InjectModel(InventoryLot.name)
    private inventoryLotModel: Model<InventoryLotDocument>,
  ) {}

  async create(
    createDto: CreateInventoryLotDto,
  ): Promise<InventoryLotDocument> {
    // Dynamic import to avoid Jest issues with uuid ESM module
    const newLot = new this.inventoryLotModel({
      ...createDto,
    });
    return newLot.save();
  }

  async findAll(
    page?: number,
    limit?: number,
  ): Promise<{ data: InventoryLotDocument[]; total: number }> {
    // If page/limit not provided => return all documents
    if (page === undefined || limit === undefined) {
      const data = await this.inventoryLotModel
        .find()
        .sort({ created_date: -1 })
        .exec();
      return { data, total: data.length };
    }
    const skip = (page - 1) * limit;
    const data = await this.inventoryLotModel
      .find()
      .skip(skip)
      .limit(limit)
      .sort({ created_date: -1 })
      .exec();
    const total = await this.inventoryLotModel.countDocuments().exec();
    return { data, total };
  }

  async findById(lot_id: string): Promise<InventoryLotDocument | null> {
    return this.inventoryLotModel.findOne({ lot_id }).exec();
  }

  async findByMaterialId(
    material_id: string,
    page?: number,
    limit?: number,
  ): Promise<{ data: InventoryLotDocument[]; total: number }> {
    if (page === undefined || limit === undefined) {
      const data = await this.inventoryLotModel
        .find({ material_id })
        .sort({ created_date: -1 })
        .exec();
      return { data, total: data.length };
    }
    const skip = (page - 1) * limit;
    const data = await this.inventoryLotModel
      .find({ material_id })
      .skip(skip)
      .limit(limit)
      .sort({ created_date: -1 })
      .exec();
    const total = await this.inventoryLotModel
      .countDocuments({ material_id })
      .exec();
    return { data, total };
  }

  async findByStatus(
    status: string,
    page?: number,
    limit?: number,
  ): Promise<{ data: InventoryLotDocument[]; total: number }> {
    if (page === undefined || limit === undefined) {
      const data = await this.inventoryLotModel
        .find({ status })
        .sort({ created_date: -1 })
        .exec();
      return { data, total: data.length };
    }
    const skip = (page - 1) * limit;
    const data = await this.inventoryLotModel
      .find({ status })
      .skip(skip)
      .limit(limit)
      .sort({ created_date: -1 })
      .exec();
    const total = await this.inventoryLotModel
      .countDocuments({ status })
      .exec();
    return { data, total };
  }

  async findBySampleStatus(
    is_sample: boolean,
    page?: number,
    limit?: number,
  ): Promise<{ data: InventoryLotDocument[]; total: number }> {
    if (page === undefined || limit === undefined) {
      const data = await this.inventoryLotModel
        .find({ is_sample })
        .sort({ created_date: -1 })
        .exec();
      return { data, total: data.length };
    }
    const skip = (page - 1) * limit;
    const data = await this.inventoryLotModel
      .find({ is_sample })
      .skip(skip)
      .limit(limit)
      .sort({ created_date: -1 })
      .exec();
    const total = await this.inventoryLotModel
      .countDocuments({ is_sample })
      .exec();
    return { data, total };
  }

  async findSamplesByParentLot(
    parent_lot_id: string,
  ): Promise<InventoryLotDocument[]> {
    return this.inventoryLotModel
      .find({ parent_lot_id, is_sample: true })
      .sort({ created_date: -1 })
      .exec();
  }

  async search(
    query: string,
    page?: number,
    limit?: number,
  ): Promise<{ data: InventoryLotDocument[]; total: number }> {
    const regex = new RegExp(query, 'i');
    if (page === undefined || limit === undefined) {
      const data = await this.inventoryLotModel
        .find({
          $or: [
            { manufacturer_name: regex },
            { manufacturer_lot: regex },
            { supplier_name: regex },
            { lot_id: regex },
          ],
        })
        .sort({ created_date: -1 })
        .exec();
      return { data, total: data.length };
    }
    const skip = (page - 1) * limit;
    const data = await this.inventoryLotModel
      .find({
        $or: [
          { manufacturer_name: regex },
          { manufacturer_lot: regex },
          { supplier_name: regex },
          { lot_id: regex },
        ],
      })
      .skip(skip)
      .limit(limit)
      .sort({ created_date: -1 })
      .exec();
    const total = await this.inventoryLotModel
      .countDocuments({
        $or: [
          { manufacturer_name: regex },
          { manufacturer_lot: regex },
          { supplier_name: regex },
        ],
      })
      .exec();
    return { data, total };
  }

  async findByFilter(
    filter: {
      material_id?: string;
      status?: string;
      is_sample?: boolean;
      manufacturer_name?: string;
    },
    page?: number,
    limit?: number,
  ): Promise<{ data: InventoryLotDocument[]; total: number }> {
    const query: any = {};

    if (filter.material_id) query.material_id = filter.material_id;
    if (filter.status) query.status = filter.status;
    if (filter.is_sample !== undefined) query.is_sample = filter.is_sample;
    if (filter.manufacturer_name)
      query.manufacturer_name = new RegExp(filter.manufacturer_name, 'i');

    if (page === undefined || limit === undefined) {
      const data = await this.inventoryLotModel
        .find(query)
        .sort({ created_date: -1 })
        .exec();
      return { data, total: data.length };
    }

    const skip = (page - 1) * limit;
    const data = await this.inventoryLotModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort({ created_date: -1 })
      .exec();
    const total = await this.inventoryLotModel.countDocuments(query).exec();
    return { data, total };
  }

  async findOptions(
    options: {
      q?: string;
      material_id?: string;
      status?: string;
      exclude_statuses?: string[];
      warehouse_id?: string;
      // allow camelCase variant for callers that pass `warehouseId`
      warehouseId?: string;
    },
    page?: number,
    limit?: number,
  ): Promise<{ data: InventoryLotDocument[]; total: number }> {
    const query: any = {};

    if (options.material_id) {
      query.material_id = options.material_id;
    }

    if (options.status) {
      query.status = options.status;
    }

    if (options.exclude_statuses && options.exclude_statuses.length > 0) {
      query.status = {
        $nin: options.exclude_statuses,
      };
    }

    const warehouseVal = options.warehouse_id ?? options.warehouseId;
    if (warehouseVal) {
      query.warehouse_id = warehouseVal;
    }

    if (options.q?.trim()) {
      const regex = new RegExp(options.q.trim(), 'i');
      query.$or = [
        { lot_id: regex },
        { material_id: regex },
        { manufacturer_lot: regex },
      ];
    }

    // If pagination not provided => return all matching documents
    if (page === undefined || limit === undefined) {
      const data = await this.inventoryLotModel
        .find(query)
        .sort({ lot_id: 1 })
        .exec();
      return { data, total: data.length };
    }

    const skip = (page - 1) * limit;
    const data = await this.inventoryLotModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort({ lot_id: 1 })
      .exec();
    const total = await this.inventoryLotModel.countDocuments(query).exec();
    return { data, total };
  }

  async update(
    lot_id: string,
    updateDto: Partial<UpdateInventoryLotDto>,
  ): Promise<InventoryLotDocument | null> {
    return this.inventoryLotModel
      .findOneAndUpdate({ lot_id }, updateDto, { new: true })
      .exec();
  }

  async updateStatus(
    lot_id: string,
    status: string,
  ): Promise<InventoryLotDocument | null> {
    return this.inventoryLotModel
      .findOneAndUpdate({ lot_id }, { status }, { new: true })
      .exec();
  }

  async updateQuantity(
    lot_id: string,
    quantityDelta: number | string,
  ): Promise<InventoryLotDocument | null> {
    const delta = Number(quantityDelta) || 0;
    return this.inventoryLotModel
      .findOneAndUpdate(
        { lot_id },
        { $inc: { quantity: delta } },
        { new: true },
      )
      .exec();
  }

  async delete(lot_id: string): Promise<InventoryLotDocument | null> {
    return this.inventoryLotModel.findOneAndDelete({ lot_id }).exec();
  }

  async getLotsByMaterialAndStatus(
    material_id: string,
    status: string,
  ): Promise<InventoryLotDocument[]> {
    return this.inventoryLotModel
      .find({ material_id, status })
      .sort({ received_date: 1 })
      .exec();
  }

  async countByStatus(status: string): Promise<number> {
    return this.inventoryLotModel.countDocuments({ status }).exec();
  }

  async checkLotExists(lot_id: string): Promise<boolean> {
    const lot = await this.inventoryLotModel.findOne({ lot_id }).exec();
    return !!lot;
  }

  async findExpiringSoon(days: number = 30): Promise<InventoryLotDocument[]> {
    const currentDate = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.inventoryLotModel
      .find({
        expiration_date: {
          $gte: currentDate,
          $lte: futureDate,
        },
        status: { $ne: 'Depleted' },
      })
      .sort({ expiration_date: 1 })
      .exec();
  }

  async findExpiredLots(): Promise<InventoryLotDocument[]> {
    const currentDate = new Date();
    return this.inventoryLotModel
      .find({
        expiration_date: { $lt: currentDate },
        status: { $ne: 'Depleted' },
      })
      .sort({ expiration_date: 1 })
      .exec();
  }

  async findByLotIds(lot_ids: string[]): Promise<InventoryLotDocument[]> {
    return this.inventoryLotModel
      .find({ lot_id: { $in: lot_ids } })
      .sort({ created_date: -1 })
      .exec();
  }

  async aggregate<T = any>(pipeline: any[]): Promise<T[]> {
    return this.inventoryLotModel.aggregate<T>(pipeline).exec();
  }

  async updateStatusByIds(
    lot_ids: string[],
    status: string,
  ): Promise<{ modifiedCount: number }> {
    const result = await this.inventoryLotModel
      .updateMany({ lot_id: { $in: lot_ids } }, { $set: { status } })
      .exec();
    return { modifiedCount: result.modifiedCount };
  }
}
