import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Material, MaterialDocument } from '../schemas/material.schema';

@Injectable()
export class MaterialRepository {
  constructor(
    @InjectModel(Material.name) private materialModel: Model<MaterialDocument>,
  ) {}

  async findAll(): Promise<Material[]> {
    return this.materialModel.find().exec();
  }

  async findOne(id: string): Promise<Material | null> {
    return this.materialModel.findById(id).exec();
  }

  async create(data: Partial<Material>): Promise<Material> {
    const created = new this.materialModel(data);
    return created.save();
  }

  async update(id: string, data: Partial<Material>): Promise<Material | null> {
    return this.materialModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const res = await this.materialModel.findByIdAndDelete(id).exec();
    return { deleted: !!res };
  }
}
