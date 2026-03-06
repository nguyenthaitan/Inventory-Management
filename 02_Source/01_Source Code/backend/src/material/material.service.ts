import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { MaterialRepository } from './material.repository';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { Material } from '../schemas/material.schema';

@Injectable()
export class MaterialService {
  constructor(private readonly repository: MaterialRepository) {}

  async findAll(): Promise<Material[]> {
    return this.repository.findAll();
  }

  async findOne(id: string): Promise<Material> {
    const material = await this.repository.findOne(id);
    if (!material) {
      throw new NotFoundException(`Material with id ${id} not found`);
    }
    return material;
  }

  async create(dto: CreateMaterialDto): Promise<Material> {
    // ensure part_number unique
    const existing = await this.repository.findAll();
    if (existing.find(m => m.part_number === dto.part_number)) {
      throw new ConflictException('part_number already exists');
    }
    return this.repository.create(dto as any);
  }

  async update(id: string, dto: UpdateMaterialDto): Promise<Material> {
    // if part_number is being changed ensure uniqueness
    if (dto.part_number) {
      const all = await this.repository.findAll();
      const conflict = all.find(
        m => m.part_number === dto.part_number && (m as any)._id?.toString() !== id,
      );
      if (conflict) {
        throw new ConflictException('part_number already exists');
      }
    }
    const updated = await this.repository.update(id, dto as any);
    if (!updated) {
      throw new NotFoundException(`Material with id ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const res = await this.repository.remove(id);
    if (!res.deleted) {
      throw new NotFoundException(`Material with id ${id} not found`);
    }
    return res;
  }
}
