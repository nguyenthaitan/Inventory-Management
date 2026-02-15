import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Material, MaterialDocument } from './schemas/material.schema';

@Injectable()
export class CatalogService {
  constructor(
    @InjectModel(Material.name) private materialModel: Model<MaterialDocument>,
  ) {}

  async findAll(): Promise<Material[]> {
    return this.materialModel.find().exec();
  }
}
