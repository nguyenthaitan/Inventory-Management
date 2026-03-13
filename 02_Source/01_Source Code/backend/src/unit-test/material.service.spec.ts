import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { MaterialService } from '../material/material.service';
import { MaterialRepository } from '../material/material.repository';
import {
  CreateMaterialDto,
  MaterialType,
  UpdateMaterialDto,
} from '../material/material.dto';

type MaterialLike = {
  _id: { toString: () => string };
  material_id: string;
  part_number: string;
  material_name: string;
  material_type: string;
  storage_conditions?: string;
  specification_document?: string;
  created_date: Date;
  modified_date: Date;
};

type MockedRepository = {
  create: jest.Mock;
  findAll: jest.Mock;
  findById: jest.Mock;
  findByMaterialId: jest.Mock;
  findByPartNumber: jest.Mock;
  search: jest.Mock;
  filterByType: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  getDistinctTypes: jest.Mock;
};

describe('MaterialService', () => {
  let service: MaterialService;
  let repository: MockedRepository;

  const now = new Date('2026-03-15T11:45:00.000Z');
  const materialDoc: MaterialLike = {
    _id: { toString: () => '507f1f77bcf86cd799439011' },
    material_id: 'MAT-001',
    part_number: 'PN-001',
    material_name: 'Acetaminophen',
    material_type: MaterialType.API,
    storage_conditions: 'Store below 25C',
    specification_document: 'SPEC-API-001',
    created_date: now,
    modified_date: now,
  };

  const createDto: CreateMaterialDto = {
    material_id: 'MAT-001',
    part_number: 'PN-001',
    material_name: 'Acetaminophen',
    material_type: MaterialType.API,
    storage_conditions: 'Store below 25C',
    specification_document: 'SPEC-API-001',
  };

  beforeEach(async () => {
    const mockRepository: MockedRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByMaterialId: jest.fn(),
      findByPartNumber: jest.fn(),
      search: jest.fn(),
      filterByType: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getDistinctTypes: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaterialService,
        {
          provide: MaterialRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<MaterialService>(MaterialService);
    repository = module.get<MockedRepository>(MaterialRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create material when business keys are unique', async () => {
      repository.findByMaterialId.mockResolvedValue(null);
      repository.findByPartNumber.mockResolvedValue(null);
      repository.create.mockResolvedValue(materialDoc);

      const result = await service.create(createDto);

      expect(result).toEqual({
        _id: '507f1f77bcf86cd799439011',
        material_id: 'MAT-001',
        part_number: 'PN-001',
        material_name: 'Acetaminophen',
        material_type: MaterialType.API,
        storage_conditions: 'Store below 25C',
        specification_document: 'SPEC-API-001',
        created_date: now,
        modified_date: now,
      });
      expect(repository.findByMaterialId).toHaveBeenCalledWith('MAT-001');
      expect(repository.findByPartNumber).toHaveBeenCalledWith('PN-001');
      expect(repository.create).toHaveBeenCalledWith(createDto);

      const [materialIdCallOrder] =
        repository.findByMaterialId.mock.invocationCallOrder;
      const [partNumberCallOrder] =
        repository.findByPartNumber.mock.invocationCallOrder;
      const [createCallOrder] = repository.create.mock.invocationCallOrder;
      expect(materialIdCallOrder).toBeLessThan(partNumberCallOrder);
      expect(partNumberCallOrder).toBeLessThan(createCallOrder);
    });

    it('should throw ConflictException if material_id already exists', async () => {
      repository.findByMaterialId.mockResolvedValue(materialDoc);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      expect(repository.findByMaterialId).toHaveBeenCalledWith('MAT-001');
      expect(repository.findByPartNumber).not.toHaveBeenCalled();
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if part_number already exists', async () => {
      repository.findByMaterialId.mockResolvedValue(null);
      repository.findByPartNumber.mockResolvedValue(materialDoc);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it.each([0, -1])('should reject invalid page (%s)', async (page) => {
      await expect(service.findAll(page, 20)).rejects.toThrow(
        BadRequestException,
      );
    });

    it.each([0, -5])('should reject invalid limit (%s)', async (limit) => {
      await expect(service.findAll(1, limit)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should cap limit to 100 and compute pagination from repository response', async () => {
      repository.findAll.mockResolvedValue({
        data: [materialDoc],
        total: 230,
        page: 1,
        limit: 100,
      });

      const result = await service.findAll(1, 999);

      expect(repository.findAll).toHaveBeenCalledWith(1, 100);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 100,
        total: 230,
        totalPages: 3,
      });
      expect(result.data[0]?._id).toBe('507f1f77bcf86cd799439011');
    });

    it('should return mapped records with calculated totalPages', async () => {
      repository.findAll.mockResolvedValue({
        data: [materialDoc],
        total: 25,
        page: 2,
        limit: 10,
      });

      const result = await service.findAll(2, 10);

      expect(result.data).toHaveLength(1);
      expect(result.pagination.totalPages).toBe(3);
      expect(result.pagination.page).toBe(2);
    });
  });

  describe('findById', () => {
    it('should return mapped material when found', async () => {
      repository.findById.mockResolvedValue(materialDoc);

      const result = await service.findById('507f1f77bcf86cd799439011');

      expect(result._id).toBe('507f1f77bcf86cd799439011');
      expect(result.material_name).toBe('Acetaminophen');
      expect(repository.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should throw NotFoundException when material does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('missing-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('search', () => {
    it.each(['', '   '])('should reject empty query "%s"', async (query) => {
      await expect(service.search(query, 1, 20)).rejects.toThrow(
        BadRequestException,
      );
    });

    it.each(['a', ' z '])(
      'should reject too-short query "%s"',
      async (query) => {
        await expect(service.search(query, 1, 20)).rejects.toThrow(
          BadRequestException,
        );
      },
    );

    it.each([
      { page: 0, limit: 20 },
      { page: 1, limit: 0 },
    ])('should reject invalid pagination %#', async ({ page, limit }) => {
      await expect(service.search('api', page, limit)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should trim query before searching and return paginated response', async () => {
      repository.search.mockResolvedValue({
        data: [materialDoc],
        total: 21,
      });

      const result = await service.search('  api  ', 2, 5);

      expect(repository.search).toHaveBeenCalledWith('api', 2, 5);
      expect(result.pagination).toEqual({
        page: 2,
        limit: 5,
        total: 21,
        totalPages: 5,
      });
    });
  });

  describe('filterByType', () => {
    it('should reject invalid material type', async () => {
      await expect(service.filterByType('Invalid Type', 1, 20)).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.filterByType).not.toHaveBeenCalled();
    });

    it.each([
      { page: 0, limit: 20 },
      { page: 1, limit: 0 },
    ])(
      'should reject invalid pagination for type filter %#',
      async ({ page, limit }) => {
        await expect(
          service.filterByType(MaterialType.API, page, limit),
        ).rejects.toThrow(BadRequestException);
      },
    );

    it.each(Object.values(MaterialType))(
      'should allow valid type "%s" and forward to repository',
      async (type) => {
        repository.filterByType.mockResolvedValue({ data: [], total: 0 });

        const result = await service.filterByType(type, 1, 20);

        expect(repository.filterByType).toHaveBeenCalledWith(type, 1, 20);
        expect(result.data).toEqual([]);
      },
    );

    it('should return mapped filtered data with computed totalPages', async () => {
      repository.filterByType.mockResolvedValue({
        data: [materialDoc],
        total: 6,
      });

      const result = await service.filterByType(MaterialType.API, 1, 4);

      expect(result.data).toHaveLength(1);
      expect(result.pagination.totalPages).toBe(2);
    });
  });

  describe('update', () => {
    const updateDto: UpdateMaterialDto = {
      material_name: 'Acetaminophen Updated',
      storage_conditions: 'Store below 20C',
    };

    it('should throw NotFoundException when material is missing', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.update('missing-id', updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should update and return mapped material data', async () => {
      repository.findById.mockResolvedValue(materialDoc);
      repository.update.mockResolvedValue({
        ...materialDoc,
        material_name: 'Acetaminophen Updated',
        storage_conditions: 'Store below 20C',
      });

      const result = await service.update(
        '507f1f77bcf86cd799439011',
        updateDto,
      );

      expect(repository.update).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        updateDto,
      );
      expect(result.material_name).toBe('Acetaminophen Updated');
      expect(result.storage_conditions).toBe('Store below 20C');
    });
  });

  describe('delete', () => {
    it('should throw NotFoundException if material does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.delete('missing-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('should delete material and return success message', async () => {
      repository.findById.mockResolvedValue(materialDoc);
      repository.delete.mockResolvedValue(materialDoc);

      const result = await service.delete('507f1f77bcf86cd799439011');

      expect(repository.delete).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(result).toEqual({
        message: "Material '507f1f77bcf86cd799439011' deleted successfully",
      });
    });
  });

  describe('getDistinctTypes', () => {
    it('should return distinct material types from repository', async () => {
      repository.getDistinctTypes.mockResolvedValue([
        MaterialType.API,
        MaterialType.EXCIPIENT,
      ]);

      const result = await service.getDistinctTypes();

      expect(repository.getDistinctTypes).toHaveBeenCalledTimes(1);
      expect(result).toEqual([MaterialType.API, MaterialType.EXCIPIENT]);
    });
  });
});
