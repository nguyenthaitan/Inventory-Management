import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MaterialService } from './material.service';
import { Material, MaterialDocument } from '../schemas/material.schema';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { MaterialType } from './material.constants';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('MaterialService', () => {
  let service: MaterialService;
  let model: Model<MaterialDocument>;

  const mockMaterial = {
    _id: '507f1f77bcf86cd799439011',
    material_id: 'MAT-1234567890-ABC123',
    part_number: 'PART-10001',
    material_name: 'Ascorbic Acid (Vitamin C)',
    material_type: MaterialType.API,
    storage_conditions: '2-8°C, protected from light',
    specification_document: 'SPEC-VC-2025-01',
    default_label_template_id: 'TPL-RM-01',
    created_by: 'test-user',
    is_active: true,
    metadata: { manufacturer: 'ABC Pharma', cas_number: '50-81-7' },
    createdAt: new Date(),
    updatedAt: new Date(),
    save: jest.fn().mockResolvedValue(this),
  };

  const mockMaterialModel = Object.assign(
    jest.fn().mockImplementation((dto) => ({
      ...mockMaterial,
      ...dto,
      save: jest.fn().mockResolvedValue({ ...mockMaterial, ...dto }),
    })),
    {
      find: jest.fn(),
      findOne: jest.fn(),
      findById: jest.fn(),
      findByIdAndDelete: jest.fn(),
      countDocuments: jest.fn(),
      aggregate: jest.fn(),
      exec: jest.fn(),
      create: jest.fn(),
    },
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaterialService,
        {
          provide: getModelToken(Material.name),
          useValue: mockMaterialModel,
        },
      ],
    }).compile();

    service = module.get<MaterialService>(MaterialService);
    model = module.get<Model<MaterialDocument>>(getModelToken(Material.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new material', async () => {
      const createDto: CreateMaterialDto = {
        part_number: 'PART-10001',
        material_name: 'Ascorbic Acid (Vitamin C)',
        material_type: MaterialType.API,
        storage_conditions: '2-8°C, protected from light',
        specification_document: 'SPEC-VC-2025-01',
      };

      mockMaterialModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.create(createDto, 'test-user');

      expect(result).toBeDefined();
      expect(mockMaterialModel.findOne).toHaveBeenCalledWith({
        part_number: 'PART-10001',
      });
    });

    it('should throw ConflictException if part_number already exists', async () => {
      const createDto: CreateMaterialDto = {
        part_number: 'PART-10001',
        material_name: 'Ascorbic Acid (Vitamin C)',
        material_type: MaterialType.API,
      };

      mockMaterialModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockMaterial),
      });

      await expect(service.create(createDto, 'test-user')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated materials', async () => {
      const queryDto = { page: 1, limit: 20 };

      mockMaterialModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockMaterial]),
      });

      mockMaterialModel.countDocuments.mockResolvedValue(1);

      const result = await service.findAll(queryDto);

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });

    it('should filter materials by type', async () => {
      const queryDto = {
        page: 1,
        limit: 20,
        material_type: MaterialType.API,
      };

      mockMaterialModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockMaterial]),
      });

      mockMaterialModel.countDocuments.mockResolvedValue(1);

      const result = await service.findAll(queryDto);

      expect(mockMaterialModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ material_type: MaterialType.API }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a material by id', async () => {
      mockMaterialModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockMaterial),
      });

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockMaterial);
      expect(mockMaterialModel.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should throw NotFoundException if material not found', async () => {
      mockMaterialModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.findOne('507f1f77bcf86cd799439011'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByPartNumber', () => {
    it('should return a material by part number', async () => {
      mockMaterialModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockMaterial),
      });

      const result = await service.findByPartNumber('PART-10001');

      expect(result).toEqual(mockMaterial);
      expect(mockMaterialModel.findOne).toHaveBeenCalledWith({
        part_number: 'PART-10001',
        is_active: true,
      });
    });
  });

  describe('update', () => {
    it('should update a material', async () => {
      const updateDto: UpdateMaterialDto = {
        material_name: 'Updated Name',
      };

      const updatedMaterial = {
        ...mockMaterial,
        ...updateDto,
        save: jest.fn().mockResolvedValue({ ...mockMaterial, ...updateDto }),
      };

      mockMaterialModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedMaterial),
      });

      const result = await service.update(
        '507f1f77bcf86cd799439011',
        updateDto,
      );

      expect(result).toBeDefined();
      expect(updatedMaterial.save).toHaveBeenCalled();
    });
  });

  describe('softDelete', () => {
    it('should soft delete a material', async () => {
      const materialToDelete = {
        ...mockMaterial,
        save: jest.fn().mockResolvedValue({ ...mockMaterial, is_active: false }),
      };

      mockMaterialModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(materialToDelete),
      });

      const result = await service.softDelete('507f1f77bcf86cd799439011');

      expect(materialToDelete.save).toHaveBeenCalled();
      expect(result.is_active).toBe(false);
    });
  });

  describe('getStatistics', () => {
    it('should return material statistics', async () => {
      mockMaterialModel.countDocuments
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(95) // active
        .mockResolvedValueOnce(5); // inactive

      mockMaterialModel.aggregate.mockResolvedValue([
        { _id: MaterialType.API, count: 30 },
        { _id: MaterialType.EXCIPIENT, count: 40 },
      ]);

      const result = await service.getStatistics();

      expect(result.total).toBe(100);
      expect(result.active).toBe(95);
      expect(result.inactive).toBe(5);
      expect(result.byType).toEqual({
        [MaterialType.API]: 30,
        [MaterialType.EXCIPIENT]: 40,
      });
    });
  });

  describe('bulkCreate', () => {
    it('should create multiple materials', async () => {
      const materials: CreateMaterialDto[] = [
        {
          part_number: 'PART-10001',
          material_name: 'Material 1',
          material_type: MaterialType.API,
        },
        {
          part_number: 'PART-10002',
          material_name: 'Material 2',
          material_type: MaterialType.EXCIPIENT,
        },
      ];

      mockMaterialModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const materialInstance = {
        ...mockMaterial,
        save: jest.fn().mockResolvedValue(mockMaterial),
      };

      jest.spyOn(model, 'create' as any).mockReturnValue(materialInstance);

      const result = await service.bulkCreate(materials, 'test-user');

      expect(result.created).toBe(2);
      expect(result.errors).toHaveLength(0);
    });
  });
});
