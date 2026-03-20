import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ProductionBatchService } from './production-batch.service';
import { ProductionBatchRepository } from './production-batch.repository';
import { BatchComponentRepository } from './batch-component.repository';
import { InventoryLotRepository } from '../inventory-lot/inventory-lot.repository';
import { Material } from '../schemas/material.schema';
import { InventoryLot } from '../schemas/inventory-lot.schema';
import { InventoryTransaction } from '../schemas/inventory-transaction.schema';
import {
  CreateProductionBatchDto,
  BatchStatus,
} from './dto/create-production-batch.dto';
import { UpdateProductionBatchDto } from './dto/update-production-batch.dto';

jest.mock('uuid', () => ({
  v4: () => '00000000-0000-4000-8000-000000000003',
}));

type BatchFixture = {
  _id: string;
  batch_id: string;
  product_id: string;
  batch_number: string;
  unit_of_measure: string;
  shelf_life_value: number;
  shelf_life_unit: string;
  status: BatchStatus;
  batch_size: { toString: () => string };
  created_date: Date;
  modified_date: Date;
  created_by?: string;
  approved_by?: string;
  completed_by?: string;
};

type MockRepository = {
  findAll: jest.Mock;
  findByIdOrNumber: jest.Mock;
  findByBatchNumber: jest.Mock;
  findByProductId: jest.Mock;
  findByStatus: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  remove: jest.Mock;
};

type MockBatchComponentRepository = {
  findByBatchId: jest.Mock;
};

type MockInventoryLotRepository = {
  findById: jest.Mock;
  updateQuantity: jest.Mock;
};

type MockMaterialModel = {
  findOne: jest.Mock;
  exec: jest.Mock;
};

const mockBatchDoc: BatchFixture = {
  _id: 'mongo-id-1',
  batch_id: 'batch-uuid-1',
  product_id: 'MAT-001',
  batch_number: 'BATCH-2026-001',
  unit_of_measure: 'kg',
  shelf_life_value: 24,
  shelf_life_unit: 'month',
  status: BatchStatus.InProgress,
  batch_size: { toString: () => '500' },
  created_date: new Date('2026-01-01T00:00:00.000Z'),
  modified_date: new Date('2026-01-01T00:00:00.000Z'),
};

const mockCreateDto: CreateProductionBatchDto = {
  batch_id: 'batch-uuid-1',
  product_id: 'MAT-001',
  batch_number: 'BATCH-2026-001',
  unit_of_measure: 'kg',
  shelf_life_value: 24,
  shelf_life_unit: 'month',
  status: BatchStatus.InProgress,
  batch_size: 500,
};

const mockMaterialDoc = {
  material_id: 'MAT-001',
  material_name: 'Test API',
};

function buildMockRepository(): MockRepository {
  return {
    findAll: jest.fn(),
    findByIdOrNumber: jest.fn(),
    findByBatchNumber: jest.fn(),
    findByProductId: jest.fn(),
    findByStatus: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
}

function buildMockMaterialModel(): MockMaterialModel {
  const exec = jest.fn();
  const findOne = jest.fn().mockReturnValue({ exec });
  return { findOne, exec };
}

describe('ProductionBatchService', () => {
  let service: ProductionBatchService;
  let repository: MockRepository;
  let materialModel: MockMaterialModel;
  let batchComponentRepository: MockBatchComponentRepository;
  let inventoryLotRepository: MockInventoryLotRepository;

  beforeEach(async () => {
    repository = buildMockRepository();
    materialModel = buildMockMaterialModel();

    batchComponentRepository = {
      findByBatchId: jest.fn(),
    };

    inventoryLotRepository = {
      findById: jest.fn(),
      updateQuantity: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductionBatchService,
        { provide: ProductionBatchRepository, useValue: repository },
        {
          provide: BatchComponentRepository,
          useValue: batchComponentRepository,
        },
        { provide: InventoryLotRepository, useValue: inventoryLotRepository },
        { provide: getModelToken(Material.name), useValue: materialModel },
        { provide: getModelToken(InventoryLot.name), useValue: {} },
        { provide: getModelToken(InventoryTransaction.name), useValue: {} },
      ],
    }).compile();

    service = module.get<ProductionBatchService>(ProductionBatchService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create()', () => {
    it('creates and returns a batch response', async () => {
      repository.findByBatchNumber.mockResolvedValue(null);
      materialModel.exec.mockResolvedValue(mockMaterialDoc);
      repository.create.mockResolvedValue(mockBatchDoc);

      const result = await service.create(mockCreateDto);

      expect(repository.findByBatchNumber).toHaveBeenCalledWith(
        'BATCH-2026-001',
      );
      expect(materialModel.findOne).toHaveBeenCalledWith({
        material_id: 'MAT-001',
      });
      expect(repository.create).toHaveBeenCalledWith(mockCreateDto);
      expect(result.batch_id).toBe('batch-uuid-1');
      expect(result.batch_size).toBe('500');
    });

    it('throws ConflictException when batch_number already exists', async () => {
      repository.findByBatchNumber.mockResolvedValue(mockBatchDoc);

      await expect(service.create(mockCreateDto)).rejects.toThrow(
        ConflictException,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when product does not exist', async () => {
      repository.findByBatchNumber.mockResolvedValue(null);
      materialModel.exec.mockResolvedValue(null);

      await expect(service.create(mockCreateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when shelf_life_value is invalid', async () => {
      repository.findByBatchNumber.mockResolvedValue(null);
      materialModel.exec.mockResolvedValue(mockMaterialDoc);

      const invalidDto: CreateProductionBatchDto = {
        ...mockCreateDto,
        shelf_life_value: 0,
      };

      await expect(service.create(invalidDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when shelf_life_unit is invalid', async () => {
      repository.findByBatchNumber.mockResolvedValue(null);
      materialModel.exec.mockResolvedValue(mockMaterialDoc);

      const invalidDto: CreateProductionBatchDto = {
        ...mockCreateDto,
        shelf_life_unit: 'weeks',
      };

      await expect(service.create(invalidDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('findOne()', () => {
    it('returns batch response when found', async () => {
      repository.findByIdOrNumber.mockResolvedValue(mockBatchDoc);

      const result = await service.findOne('batch-uuid-1');

      expect(repository.findByIdOrNumber).toHaveBeenCalledWith('batch-uuid-1');
      expect(result.batch_id).toBe('batch-uuid-1');
    });

    it('throws NotFoundException when batch does not exist', async () => {
      repository.findByIdOrNumber.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll()', () => {
    it('returns paginated batches', async () => {
      repository.findAll.mockResolvedValue({
        data: [mockBatchDoc],
        total: 1,
        page: 1,
        limit: 20,
      });

      const result = await service.findAll(1, 20);

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('throws BadRequestException when page < 1', async () => {
      await expect(service.findAll(0, 20)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when limit < 1', async () => {
      await expect(service.findAll(1, 0)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update()', () => {
    it('allows valid transition: In Progress -> On Hold', async () => {
      repository.findByIdOrNumber.mockResolvedValue(mockBatchDoc);
      repository.update.mockResolvedValue({
        ...mockBatchDoc,
        status: BatchStatus.OnHold,
      });

      const dto: UpdateProductionBatchDto = { status: BatchStatus.OnHold };
      const result = await service.update('batch-uuid-1', dto);

      expect(repository.findByIdOrNumber).toHaveBeenCalledWith('batch-uuid-1');
      expect(repository.update).toHaveBeenCalledWith('batch-uuid-1', dto);
      expect(result.status).toBe(BatchStatus.OnHold);
    });

    it('throws BadRequestException for invalid transition', async () => {
      repository.findByIdOrNumber.mockResolvedValue({
        ...mockBatchDoc,
        status: BatchStatus.Complete,
      });

      await expect(
        service.update('batch-uuid-1', { status: BatchStatus.InProgress }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when updating missing batch', async () => {
      repository.findByIdOrNumber.mockResolvedValue(null);

      await expect(
        service.update('non-existent', { status: BatchStatus.OnHold }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove()', () => {
    it('deletes a batch that is not In Progress', async () => {
      repository.findByIdOrNumber.mockResolvedValue({
        ...mockBatchDoc,
        status: BatchStatus.Complete,
      });
      repository.remove.mockResolvedValue(mockBatchDoc);

      const result = await service.remove('batch-uuid-1');

      expect(result.message).toContain('batch-uuid-1');
      expect(repository.remove).toHaveBeenCalledWith('batch-uuid-1');
    });

    it('throws BadRequestException when deleting In Progress batch', async () => {
      repository.findByIdOrNumber.mockResolvedValue(mockBatchDoc);

      await expect(service.remove('batch-uuid-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.remove).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when batch does not exist', async () => {
      repository.findByIdOrNumber.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
