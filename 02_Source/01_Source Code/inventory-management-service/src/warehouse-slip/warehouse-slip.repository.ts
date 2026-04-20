import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  WarehouseSlip,
  WarehouseSlipDocument,
} from '../schemas/warehouse-slip.schema';
import { Warehouse, WarehouseDocument } from '../schemas/warehouse.schema';
import { MaterialRepository } from '../material/material.repository';

export interface WarehouseSlipFilterOptions {
  status?: string;
  created_by?: string;
  from?: Date;
  to?: Date;
  warehouse_id?: string;
  type?: string;
}

export interface WarehouseSlipPaginationOptions {
  page?: number;
  limit?: number;
}

@Injectable()
export class WarehouseSlipRepository {
  private readonly logger = new Logger(WarehouseSlipRepository.name);

  constructor(
    @InjectModel(WarehouseSlip.name)
    private readonly model: Model<WarehouseSlipDocument>,
    @InjectModel(Warehouse.name)
    private readonly warehouseModel: Model<WarehouseDocument>,
    private readonly materialRepository: MaterialRepository,
  ) {}

  async findMaterialById(materialId: string) {
    // Delegate to MaterialRepository for encapsulation
    return this.materialRepository.findByMaterialId(materialId);
  }

  async create(dto: Partial<WarehouseSlip>) {
    // Provide sensible defaults for fields required by schema when tests
    // or callers omit them.
    const payload: any = { ...dto };
    if (!payload.type) payload.type = 'IN';
    if (!payload.slip_number && payload.slip_id)
      payload.slip_number = String(payload.slip_id);
    const doc = new this.model(payload);
    return doc.save();
  }

  async findAll(
    filters: WarehouseSlipFilterOptions = {},
    pagination?: WarehouseSlipPaginationOptions,
  ) {
    const mongoQuery: any = {};

    if (filters.status) mongoQuery.status = filters.status;
    if (filters.type) mongoQuery.type = filters.type;
    if (filters.created_by) mongoQuery.created_by = filters.created_by;
    if (filters.warehouse_id) mongoQuery.warehouse_id = filters.warehouse_id;

    if (filters.from || filters.to) {
      // For confirmed slips, date range should apply to `confirmed_at`.
      // For other statuses use `created_date` as the default.
      const dateField =
        filters.status === 'CONFIRMED' ? 'confirmed_at' : 'created_date';
      mongoQuery[dateField] = {};
      if (filters.from) mongoQuery[dateField].$gte = filters.from;
      if (filters.to) mongoQuery[dateField].$lte = filters.to;
    }

    // If pagination not provided => return all matching slips
    if (
      !pagination ||
      pagination.page === undefined ||
      pagination.limit === undefined
    ) {
      const items = await this.model
        .find(mongoQuery)
        .sort({ created_date: -1 })
        .exec();
      const total = await this.model.countDocuments(mongoQuery).exec();
      return { items, total };
    }
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.model
        .find(mongoQuery)
        .sort({ created_date: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.model.countDocuments(mongoQuery).exec(),
    ]);

    return { items, total, page, limit };
  }

  async findOneBySlipId(slipId: string) {
    return this.model.findOne({ slip_id: slipId }).exec();
  }

  async updateBySlipId(slipId: string, dto: Partial<WarehouseSlip>) {
    return this.model
      .findOneAndUpdate({ slip_id: slipId }, dto, { new: true })
      .exec();
  }

  async appendAttachment(slipId: string, attachment: any) {
    return this.model
      .findOneAndUpdate(
        { slip_id: slipId },
        { $push: { attachments: attachment } },
        { new: true },
      )
      .exec();
  }

  async findWarehouseById(warehouseId: string) {
    return this.warehouseModel
      .findOne({ warehouse_id: warehouseId })
      .lean()
      .exec();
  }
}
