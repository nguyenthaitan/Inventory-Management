import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Material, MaterialDocument } from '../schemas/material.schema';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { QueryMaterialDto } from './dto/query-material.dto';
import {
  IMaterialQueryResult,
  IMaterialStatistics,
} from './interfaces/material.interface';
import { ERROR_MESSAGES } from './material.constants';

@Injectable()
export class MaterialService {
  constructor(
    @InjectModel(Material.name)
    private readonly materialModel: Model<MaterialDocument>,
  ) {}

  /**
   * Create a new material
   */
  async create(
    createMaterialDto: CreateMaterialDto,
    userId: string,
  ): Promise<Material> {
    // Check for duplicate part_number
    const existing = await this.materialModel
      .findOne({
        part_number: createMaterialDto.part_number.toUpperCase(),
      })
      .exec();

    if (existing) {
      throw new ConflictException(ERROR_MESSAGES.PART_NUMBER_EXISTS);
    }

    const material = new this.materialModel({
      ...createMaterialDto,
      created_by: userId,
      is_active: true,
    });

    return material.save();
  }

  /**
   * Find all materials with filtering and pagination
   */
  async findAll(query: QueryMaterialDto): Promise<IMaterialQueryResult> {
    const {
      search,
      material_type,
      storage_conditions,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    // Build filter
    const filter: any = { is_active: true };

    // Text search
    if (search) {
      filter.$or = [
        { material_name: { $regex: search, $options: 'i' } },
        { part_number: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by type
    if (material_type) {
      filter.material_type = material_type;
    }

    // Filter by storage conditions
    if (storage_conditions) {
      filter.storage_conditions = { $regex: storage_conditions, $options: 'i' };
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const sortOptions: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [materials, total] = await Promise.all([
      this.materialModel
        .find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.materialModel.countDocuments(filter),
    ]);

    return {
      data: materials,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find one material by ID
   */
  async findOne(id: string): Promise<MaterialDocument> {
    const material = await this.materialModel.findById(id).exec();

    if (!material || !material.is_active) {
      throw new NotFoundException(ERROR_MESSAGES.MATERIAL_NOT_FOUND);
    }

    return material;
  }

  /**
   * Find material by part number
   */
  async findByPartNumber(partNumber: string): Promise<MaterialDocument> {
    const material = await this.materialModel
      .findOne({
        part_number: partNumber.toUpperCase(),
        is_active: true,
      })
      .exec();

    if (!material) {
      throw new NotFoundException(ERROR_MESSAGES.MATERIAL_NOT_FOUND);
    }

    return material;
  }

  /**
   * Find material by material_id
   */
  async findByMaterialId(materialId: string): Promise<MaterialDocument> {
    const material = await this.materialModel
      .findOne({
        material_id: materialId.toUpperCase(),
        is_active: true,
      })
      .exec();

    if (!material) {
      throw new NotFoundException(ERROR_MESSAGES.MATERIAL_NOT_FOUND);
    }

    return material;
  }

  /**
   * Update a material
   */
  async update(id: string, updateMaterialDto: UpdateMaterialDto): Promise<MaterialDocument> {
    const material = await this.findOne(id);

    // Apply updates
    Object.assign(material, updateMaterialDto);

    return material.save();
  }

  /**
   * Soft delete a material
   */
  async softDelete(id: string): Promise<MaterialDocument> {
    const material = await this.findOne(id);

    // TODO: Check if material is referenced by inventory_lots
    // This should be implemented when inventory_lots module is ready
    // const hasReferences = await this.checkReferences(id);
    // if (hasReferences) {
    //   throw new BadRequestException(ERROR_MESSAGES.MATERIAL_HAS_REFERENCES);
    // }

    material.is_active = false;
    return material.save();
  }

  /**
   * Hard delete a material (for testing/admin only)
   */
  async hardDelete(id: string): Promise<void> {
    const result = await this.materialModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(ERROR_MESSAGES.MATERIAL_NOT_FOUND);
    }
  }

  /**
   * Get material statistics
   */
  async getStatistics(): Promise<IMaterialStatistics> {
    const [total, active, inactive, byTypeStats] = await Promise.all([
      this.materialModel.countDocuments(),
      this.materialModel.countDocuments({ is_active: true }),
      this.materialModel.countDocuments({ is_active: false }),
      this.materialModel.aggregate([
        { $match: { is_active: true } },
        {
          $group: {
            _id: '$material_type',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const byType = byTypeStats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      active,
      inactive,
      byType,
    };
  }

  /**
   * Check if part_number exists
   */
  async partNumberExists(partNumber: string): Promise<boolean> {
    const count = await this.materialModel
      .countDocuments({
        part_number: partNumber.toUpperCase(),
      })
      .exec();
    return count > 0;
  }

  /**
   * Bulk create materials (for import)
   */
  async bulkCreate(
    materials: CreateMaterialDto[],
    userId: string,
  ): Promise<{ created: number; errors: any[] }> {
    const errors: any[] = [];
    let created = 0;

    for (const materialDto of materials) {
      try {
        await this.create(materialDto, userId);
        created++;
      } catch (error) {
        errors.push({
          part_number: materialDto.part_number,
          error: error.message,
        });
      }
    }

    return { created, errors };
  }
}
