import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ProductionBatchService } from './production-batch.service';
import { ProductionBatchRepository } from './production-batch.repository';
import { Material } from '../schemas/material.schema';
import {
  BatchStatus,
  CreateProductionBatchDto,
} from './dto/create-production-batch.dto';
import { UpdateProductionBatchDto } from './dto/update-production-batch.dto';

type ProductionBatchLike = {
  _id: { toString: () => string };
  batch_id: string;
  product_id: string;
  batch_number: string;
  unit_of_measure: string;
  manufacture_date: Date;
  expiration_date: Date;
  status: BatchStatus;
  batch_size: { toString: () => string };
  created_date: Date;
  modified_date: Date;
};

type PagedBatches = {
  data: ProductionBatchLike[];
  total: number;
  page: number;
  limit: number;
};

type MockedRepository = {
  create: jest.Mock;
  findAll: jest.Mock;
  findOne: jest.Mock;
  findByBatchNumber: jest.Mock;
  findByProductId: jest.Mock;
  findByStatus: jest.Mock;
  update: jest.Mock;
  remove: jest.Mock;
};

type MockedMaterialModel = {
  findOne: jest.Mock;
};

function buildBatchDoc(
  overrides: Partial<ProductionBatchLike> = {},
): ProductionBatchLike {
  const now = new Date('2026-01-10T10:00:00.000Z');

  return {
    _id: { toString: () => '507f1f77bcf86cd799439011' },
    batch_id: '3d594650-3436-453f-901f-f7f66f18f8eb',
    product_id: 'MAT-001',
    batch_number: 'BATCH-2026-001',
    unit_of_measure: 'kg',
    manufacture_date: new Date('2026-01-01T00:00:00.000Z'),
    expiration_date: new Date('2028-01-01T00:00:00.000Z'),
    status: BatchStatus.InProgress,
    batch_size: { toString: () => '500' },
    created_date: now,
    modified_date: now,
    ...overrides,
  };
}

function buildCreateDto(
  overrides: Partial<CreateProductionBatchDto> = {},
): CreateProductionBatchDto {
  return {
    batch_id: '3d594650-3436-453f-901f-f7f66f18f8eb',
    product_id: 'MAT-001',
    batch_number: 'BATCH-2026-001',
    unit_of_measure: 'kg',
    manufacture_date: '2026-01-01T00:00:00.000Z',
    expiration_date: '2028-01-01T00:00:00.000Z',
    status: BatchStatus.InProgress,
    batch_size: 500,
    ...overrides,
  };
}

function mockExec<T>(value: T): { exec: jest.Mock } {
  return {
    exec: jest.fn().mockResolvedValue(value),
  };
}

describe('ProductionBatchService', () => {
  let service: ProductionBatchService;
  let repository: MockedRepository;
  let materialModel: MockedMaterialModel;

  beforeEach(async () => {
    const repositoryMock: MockedRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByBatchNumber: jest.fn(),
      findByProductId: jest.fn(),
      findByStatus: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const materialModelMock: MockedMaterialModel = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductionBatchService,
        {
          provide: ProductionBatchRepository,
          useValue: repositoryMock,
        },
        {
          provide: getModelToken(Material.name),
          useValue: materialModelMock,
        },
      ],
    }).compile();

    service = module.get<ProductionBatchService>(ProductionBatchService);
    repository = module.get<MockedRepository>(ProductionBatchRepository);
    materialModel = module.get<MockedMaterialModel>(
      getModelToken(Material.name),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create batch when business rules are satisfied', async () => {
      const createDto = buildCreateDto();
      const batchDoc = buildBatchDoc();
      repository.findByBatchNumber.mockResolvedValue(null);
      materialModel.findOne.mockReturnValue(
        mockExec({ material_id: 'MAT-001' }),
      );
      repository.create.mockResolvedValue(batchDoc);

      const result = await service.create(createDto);

      expect(repository.findByBatchNumber).toHaveBeenCalledWith(
        'BATCH-2026-001',
      );
      expect(materialModel.findOne).toHaveBeenCalledWith({
        material_id: 'MAT-001',
      });
      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual({
        _id: '507f1f77bcf86cd799439011',
        batch_id: '3d594650-3436-453f-901f-f7f66f18f8eb',
        product_id: 'MAT-001',
        batch_number: 'BATCH-2026-001',
        unit_of_measure: 'kg',
        manufacture_date: new Date('2026-01-01T00:00:00.000Z'),
        expiration_date: new Date('2028-01-01T00:00:00.000Z'),
        status: BatchStatus.InProgress,
        batch_size: '500',
        created_date: batchDoc.created_date,
        modified_date: batchDoc.modified_date,
      });
    });

    it('should reject duplicate batch_number', async () => {
      repository.findByBatchNumber.mockResolvedValue(buildBatchDoc());

      await expect(service.create(buildCreateDto())).rejects.toThrow(
        ConflictException,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });

    it.each([
      {
        manufacture_date: '2026-02-01T00:00:00.000Z',
        expiration_date: '2026-01-01T00:00:00.000Z',
      },
      {
        manufacture_date: '2026-02-01T00:00:00.000Z',
        expiration_date: '2026-02-01T00:00:00.000Z',
      },
    ])('should reject invalid date range %#', async (dates) => {
      repository.findByBatchNumber.mockResolvedValue(null);

      await expect(service.create(buildCreateDto(dates))).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should reject when product_id does not exist', async () => {
      repository.findByBatchNumber.mockResolvedValue(null);
      materialModel.findOne.mockReturnValue(mockExec(null));

      await expect(service.create(buildCreateDto())).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it.each([
      { page: 0, limit: 20 },
      { page: 1, limit: 0 },
      { page: -1, limit: 20 },
      { page: 1, limit: -5 },
    ])('should reject invalid pagination %#', async ({ page, limit }) => {
      await expect(service.findAll(page, limit)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should cap limit to 100 and compute total pages from repository data', async () => {
      const paged: PagedBatches = {
        data: [buildBatchDoc()],
        total: 240,
        page: 1,
        limit: 100,
      };
      repository.findAll.mockResolvedValue(paged);

      const result = await service.findAll(1, 999);

      expect(repository.findAll).toHaveBeenCalledWith(1, 100);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 100,
        total: 240,
        totalPages: 3,
      });
      expect(result.data[0]?.batch_size).toBe('500');
    });
  });

  describe('findOne', () => {
    it('should return batch response when found', async () => {
      repository.findOne.mockResolvedValue(buildBatchDoc());

      const result = await service.findOne(
        '3d594650-3436-453f-901f-f7f66f18f8eb',
      );

      expect(repository.findOne).toHaveBeenCalledWith(
        '3d594650-3436-453f-901f-f7f66f18f8eb',
      );
      expect(result.batch_number).toBe('BATCH-2026-001');
    });

    it('should throw NotFoundException when batch does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('missing-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByProductId', () => {
    it.each([
      { page: 0, limit: 20 },
      { page: 1, limit: 0 },
    ])('should reject invalid pagination %#', async ({ page, limit }) => {
      await expect(
        service.findByProductId('MAT-001', page, limit),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return paged batches for product_id', async () => {
      repository.findByProductId.mockResolvedValue({
        data: [buildBatchDoc({ product_id: 'MAT-777' })],
        total: 6,
      });

      const result = await service.findByProductId('MAT-777', 2, 3);

      expect(repository.findByProductId).toHaveBeenCalledWith('MAT-777', 2, 3);
      expect(result.pagination.totalPages).toBe(2);
      expect(result.data[0]?.product_id).toBe('MAT-777');
    });
  });

  describe('findByStatus', () => {
    it('should reject invalid status', async () => {
      await expect(service.findByStatus('Invalid', 1, 20)).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.findByStatus).not.toHaveBeenCalled();
    });

    it.each(Object.values(BatchStatus))(
      'should return paged data for valid status "%s"',
      async (status) => {
        repository.findByStatus.mockResolvedValue({
          data: [buildBatchDoc({ status })],
          total: 1,
        });

        const result = await service.findByStatus(status, 1, 20);

        expect(repository.findByStatus).toHaveBeenCalledWith(status, 1, 20);
        expect(result.data[0]?.status).toBe(status);
      },
    );
  });

  describe('update', () => {
    it('should reject update when batch does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.update('missing-id', {
          status: BatchStatus.Complete,
        } as UpdateProductionBatchDto),
      ).rejects.toThrow(NotFoundException);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it.each([
      {
        current: BatchStatus.Complete,
        next: BatchStatus.InProgress,
      },
      {
        current: BatchStatus.Cancelled,
        next: BatchStatus.InProgress,
      },
      {
        current: BatchStatus.OnHold,
        next: BatchStatus.Complete,
      },
    ])(
      'should reject invalid status transition %#',
      async ({ current, next }) => {
        repository.findOne.mockResolvedValue(
          buildBatchDoc({ status: current }),
        );

        await expect(
          service.update('3d594650-3436-453f-901f-f7f66f18f8eb', {
            status: next,
          } as UpdateProductionBatchDto),
        ).rejects.toThrow(BadRequestException);
        expect(repository.update).not.toHaveBeenCalled();
      },
    );

    it('should allow valid transition In Progress -> Complete', async () => {
      repository.findOne.mockResolvedValue(
        buildBatchDoc({ status: BatchStatus.InProgress }),
      );
      repository.update.mockResolvedValue(
        buildBatchDoc({ status: BatchStatus.Complete }),
      );

      const result = await service.update(
        '3d594650-3436-453f-901f-f7f66f18f8eb',
        {
          status: BatchStatus.Complete,
        } as UpdateProductionBatchDto,
      );

      expect(repository.update).toHaveBeenCalledWith(
        '3d594650-3436-453f-901f-f7f66f18f8eb',
        expect.objectContaining({ status: BatchStatus.Complete }),
      );
      expect(result.status).toBe(BatchStatus.Complete);
    });

    it('should reject invalid date range based on mixed existing/new values', async () => {
      repository.findOne.mockResolvedValue(
        buildBatchDoc({
          manufacture_date: new Date('2026-02-01T00:00:00.000Z'),
          expiration_date: new Date('2026-12-01T00:00:00.000Z'),
        }),
      );

      await expect(
        service.update('3d594650-3436-453f-901f-f7f66f18f8eb', {
          expiration_date: '2026-01-15T00:00:00.000Z',
        } as UpdateProductionBatchDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should reject remove when batch does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove('missing-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.remove).not.toHaveBeenCalled();
    });

    it('should reject removing In Progress batch', async () => {
      repository.findOne.mockResolvedValue(
        buildBatchDoc({ status: BatchStatus.InProgress }),
      );

      await expect(
        service.remove('3d594650-3436-453f-901f-f7f66f18f8eb'),
      ).rejects.toThrow(BadRequestException);
      expect(repository.remove).not.toHaveBeenCalled();
    });

    it.each([BatchStatus.Complete, BatchStatus.OnHold, BatchStatus.Cancelled])(
      'should remove batch for allowed status "%s"',
      async (status) => {
        repository.findOne.mockResolvedValue(buildBatchDoc({ status }));
        repository.remove.mockResolvedValue(buildBatchDoc({ status }));

        const result = await service.remove(
          '3d594650-3436-453f-901f-f7f66f18f8eb',
        );

        expect(repository.remove).toHaveBeenCalledWith(
          '3d594650-3436-453f-901f-f7f66f18f8eb',
        );
        expect(result.message).toContain(
          '3d594650-3436-453f-901f-f7f66f18f8eb',
        );
      },
    );
  });
});
