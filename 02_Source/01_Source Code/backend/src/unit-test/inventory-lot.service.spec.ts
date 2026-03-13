import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InventoryLotService } from '../inventory-lot/inventory-lot.service';
import { InventoryLotRepository } from '../inventory-lot/inventory-lot.repository';
import {
  CreateInventoryLotDto,
  InventoryLotSearchParams,
  InventoryLotStatus,
  UpdateInventoryLotDto,
} from '../inventory-lot/inventory-lot.dto';

jest.mock(
  'src/inventory-lot/inventory-lot.dto',
  () => ({
    InventoryLotStatus: {
      QUARANTINE: 'Quarantine',
      ACCEPTED: 'Accepted',
      REJECTED: 'Rejected',
      DEPLETED: 'Depleted',
    },
  }),
  { virtual: true },
);

type InventoryLotLike = {
  lot_id: string;
  material_id: string;
  manufacturer_name: string;
  manufacturer_lot: string;
  supplier_name?: string;
  received_date: Date;
  expiration_date: Date;
  in_use_expiration_date?: Date;
  status: InventoryLotStatus;
  quantity: number;
  unit_of_measure: string;
  storage_location?: string;
  is_sample: boolean;
  parent_lot_id?: string;
  notes?: string;
  created_date: Date;
  modified_date: Date;
};

type PagedLots = {
  data: InventoryLotLike[];
  total: number;
};

type MockedRepository = {
  create: jest.Mock;
  findAll: jest.Mock;
  findById: jest.Mock;
  findByMaterialId: jest.Mock;
  findByStatus: jest.Mock;
  findBySampleStatus: jest.Mock;
  findSamplesByParentLot: jest.Mock;
  searchByManufacturer: jest.Mock;
  findByFilter: jest.Mock;
  update: jest.Mock;
  updateStatus: jest.Mock;
  updateQuantity: jest.Mock;
  delete: jest.Mock;
  getLotsByMaterialAndStatus: jest.Mock;
  countByStatus: jest.Mock;
  checkLotExists: jest.Mock;
  findExpiringSoon: jest.Mock;
  findExpiredLots: jest.Mock;
};

function buildCreateDto(
  overrides: Partial<CreateInventoryLotDto> = {},
): CreateInventoryLotDto {
  return {
    lot_id: 'LOT-001',
    material_id: 'MAT-001',
    manufacturer_name: 'ABC Pharma',
    manufacturer_lot: 'MFG-LOT-001',
    supplier_name: 'Global Supplier',
    received_date: new Date('2025-01-01T00:00:00.000Z'),
    expiration_date: new Date('2026-01-01T00:00:00.000Z'),
    in_use_expiration_date: new Date('2025-08-01T00:00:00.000Z'),
    status: InventoryLotStatus.QUARANTINE,
    quantity: 100,
    unit_of_measure: 'kg',
    storage_location: 'A1-R1',
    is_sample: false,
    parent_lot_id: undefined,
    notes: 'Initial lot',
    ...overrides,
  };
}

function buildLotDoc(
  overrides: Partial<InventoryLotLike> = {},
): InventoryLotLike {
  return {
    lot_id: 'LOT-001',
    material_id: 'MAT-001',
    manufacturer_name: 'ABC Pharma',
    manufacturer_lot: 'MFG-LOT-001',
    supplier_name: 'Global Supplier',
    received_date: new Date('2025-01-01T00:00:00.000Z'),
    expiration_date: new Date('2026-01-01T00:00:00.000Z'),
    in_use_expiration_date: new Date('2025-08-01T00:00:00.000Z'),
    status: InventoryLotStatus.QUARANTINE,
    quantity: 100,
    unit_of_measure: 'kg',
    storage_location: 'A1-R1',
    is_sample: false,
    parent_lot_id: undefined,
    notes: 'Initial lot',
    created_date: new Date('2025-01-01T08:00:00.000Z'),
    modified_date: new Date('2025-01-01T08:00:00.000Z'),
    ...overrides,
  };
}

describe('InventoryLotService', () => {
  let service: InventoryLotService;
  let repository: MockedRepository;

  beforeEach(async () => {
    const mockRepository: MockedRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByMaterialId: jest.fn(),
      findByStatus: jest.fn(),
      findBySampleStatus: jest.fn(),
      findSamplesByParentLot: jest.fn(),
      searchByManufacturer: jest.fn(),
      findByFilter: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      updateQuantity: jest.fn(),
      delete: jest.fn(),
      getLotsByMaterialAndStatus: jest.fn(),
      countByStatus: jest.fn(),
      checkLotExists: jest.fn(),
      findExpiringSoon: jest.fn(),
      findExpiredLots: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryLotService,
        {
          provide: InventoryLotRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<InventoryLotService>(InventoryLotService);
    repository = module.get<MockedRepository>(InventoryLotRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and map a lot for valid input', async () => {
      const createDto = buildCreateDto();
      const lotDoc = buildLotDoc();
      repository.create.mockResolvedValue(lotDoc);

      const result = await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(result.lot_id).toBe('LOT-001');
      expect(result.status).toBe(InventoryLotStatus.QUARANTINE);
      expect(result.quantity).toBe(100);
    });

    it('should allow sample lot creation without parent_lot_id', async () => {
      const createDto = buildCreateDto({
        is_sample: true,
        parent_lot_id: undefined,
      });
      repository.create.mockResolvedValue(
        buildLotDoc({ is_sample: true, parent_lot_id: undefined }),
      );

      const result = await service.create(createDto);

      expect(result.is_sample).toBe(true);
      expect(repository.create).toHaveBeenCalledWith(createDto);
    });

    it('should reject when received_date is after expiration_date', async () => {
      const createDto = buildCreateDto({
        received_date: new Date('2026-01-02T00:00:00.000Z'),
        expiration_date: new Date('2026-01-01T00:00:00.000Z'),
      });

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });

    it.each([0, -1, -500])(
      'should reject non-positive quantity (%s)',
      async (quantity) => {
        const createDto = buildCreateDto({ quantity });

        await expect(service.create(createDto)).rejects.toThrow(
          BadRequestException,
        );
      },
    );
  });

  describe('findAll', () => {
    it.each([
      { page: 0, limit: 10 },
      { page: 1, limit: 0 },
      { page: -1, limit: 10 },
      { page: 1, limit: -1 },
    ])('should reject invalid pagination %#', async ({ page, limit }) => {
      await expect(service.findAll(page, limit)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return paged data for valid pagination', async () => {
      const paged: PagedLots = {
        data: [buildLotDoc()],
        total: 1,
      };
      repository.findAll.mockResolvedValue(paged);

      await service.findAll(2, 5);

      expect(repository.findAll).toHaveBeenCalledWith(2, 5);
    });
  });

  describe('findById', () => {
    it('should return mapped lot when found', async () => {
      repository.findById.mockResolvedValue(buildLotDoc());

      const result = await service.findById('LOT-001');

      expect(repository.findById).toHaveBeenCalledWith('LOT-001');
      expect(result.lot_id).toBe('LOT-001');
    });

    it('should throw NotFoundException for missing lot', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('LOT-404')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByMaterialId', () => {
    it.each([
      { page: 0, limit: 10 },
      { page: 1, limit: 0 },
    ])('should reject invalid pagination %#', async ({ page, limit }) => {
      await expect(
        service.findByMaterialId('MAT-001', page, limit),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return lots by material_id with pagination metadata', async () => {
      repository.findByMaterialId.mockResolvedValue({
        data: [buildLotDoc({ material_id: 'MAT-777' })],
        total: 7,
      });

      const result = await service.findByMaterialId('MAT-777', 1, 3);

      expect(repository.findByMaterialId).toHaveBeenCalledWith('MAT-777', 1, 3);
      expect(result.total).toBe(7);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(3);
      expect(result.data[0]?.material_id).toBe('MAT-777');
    });
  });

  describe('findByStatus', () => {
    it.each(Object.values(InventoryLotStatus))(
      'should return lots for valid status "%s"',
      async (status) => {
        repository.findByStatus.mockResolvedValue({
          data: [buildLotDoc({ status })],
          total: 3,
        });

        const result = await service.findByStatus(status, 1, 10);

        expect(repository.findByStatus).toHaveBeenCalledWith(status, 1, 10);
        expect(result.data[0]?.status).toBe(status);
      },
    );

    it('should reject invalid status', async () => {
      await expect(service.findByStatus('Unknown', 1, 10)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findSampleLots and findSamplesByParentLot', () => {
    it('should return sample lots', async () => {
      repository.findBySampleStatus.mockResolvedValue({
        data: [buildLotDoc({ is_sample: true, lot_id: 'LOT-SAMPLE' })],
        total: 1,
      });

      const result = await service.findSampleLots(1, 10);

      expect(repository.findBySampleStatus).toHaveBeenCalledWith(true, 1, 10);
      expect(result.data[0]?.is_sample).toBe(true);
    });

    it('should return sample children for parent lot', async () => {
      repository.findSamplesByParentLot.mockResolvedValue([
        buildLotDoc({
          lot_id: 'LOT-SAMPLE-1',
          is_sample: true,
          parent_lot_id: 'LOT-PARENT-1',
        }),
      ]);

      const result = await service.findSamplesByParentLot('LOT-PARENT-1');

      expect(repository.findSamplesByParentLot).toHaveBeenCalledWith(
        'LOT-PARENT-1',
      );
      expect(result[0]?.parent_lot_id).toBe('LOT-PARENT-1');
    });
  });

  describe('searchByManufacturer', () => {
    it.each(['', ' ', 'a'])(
      'should reject short/empty query "%s"',
      async (query) => {
        await expect(
          service.searchByManufacturer(query, 1, 10),
        ).rejects.toThrow(BadRequestException);
      },
    );

    it('should return search results for valid query', async () => {
      repository.searchByManufacturer.mockResolvedValue({
        data: [buildLotDoc({ manufacturer_name: 'ABC Pharma Co' })],
        total: 4,
      });

      const result = await service.searchByManufacturer('AB', 2, 2);

      expect(repository.searchByManufacturer).toHaveBeenCalledWith('AB', 2, 2);
      expect(result.total).toBe(4);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(2);
    });
  });

  describe('filterLots', () => {
    it('should reject invalid status in filter', async () => {
      const filter: InventoryLotSearchParams = {
        status: 'Invalid' as InventoryLotStatus,
      };

      await expect(service.filterLots(filter, 1, 10)).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.findByFilter).not.toHaveBeenCalled();
    });

    it('should pass filter to repository and map response', async () => {
      const filter: InventoryLotSearchParams = {
        material_id: 'MAT-001',
        manufacturer_name: 'ABC',
        is_sample: false,
        status: InventoryLotStatus.QUARANTINE,
      };
      repository.findByFilter.mockResolvedValue({
        data: [buildLotDoc()],
        total: 9,
      });

      const result = await service.filterLots(filter, 3, 7);

      expect(repository.findByFilter).toHaveBeenCalledWith(filter, 3, 7);
      expect(result.total).toBe(9);
      expect(result.page).toBe(3);
      expect(result.limit).toBe(7);
    });
  });

  describe('update', () => {
    it('should reject update when lot does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.update('LOT-404', {
          quantity: 1,
        } as UpdateInventoryLotDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject invalid date order on update when both dates are provided', async () => {
      repository.findById.mockResolvedValue(buildLotDoc());

      await expect(
        service.update('LOT-001', {
          received_date: new Date('2026-02-01T00:00:00.000Z'),
          expiration_date: new Date('2026-01-01T00:00:00.000Z'),
        } as UpdateInventoryLotDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject negative quantity on update', async () => {
      repository.findById.mockResolvedValue(buildLotDoc());

      await expect(
        service.update('LOT-001', {
          quantity: -5,
        } as UpdateInventoryLotDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should not auto-set status when quantity runtime value is string zero', async () => {
      repository.findById.mockResolvedValue(
        buildLotDoc({ status: InventoryLotStatus.ACCEPTED }),
      );
      let capturedUpdateDto: UpdateInventoryLotDto | undefined;
      repository.update.mockImplementation(
        (_lotId: string, dto: UpdateInventoryLotDto) => {
          capturedUpdateDto = dto;
          return Promise.resolve(
            buildLotDoc({ status: InventoryLotStatus.ACCEPTED, quantity: 0 }),
          );
        },
      );

      const updateDto = {
        quantity: '0',
      } as unknown as UpdateInventoryLotDto;

      const result = await service.update('LOT-001', updateDto);

      expect(repository.update).toHaveBeenCalledWith('LOT-001', updateDto);
      expect(capturedUpdateDto?.status).toBeUndefined();
      expect(result.status).toBe(InventoryLotStatus.ACCEPTED);
    });

    it('should reject invalid status transition in update', async () => {
      repository.findById.mockResolvedValue(
        buildLotDoc({ status: InventoryLotStatus.REJECTED }),
      );

      await expect(
        service.update('LOT-001', {
          status: InventoryLotStatus.ACCEPTED,
        } as UpdateInventoryLotDto),
      ).rejects.toThrow(ConflictException);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should update successfully with valid transition', async () => {
      repository.findById.mockResolvedValue(
        buildLotDoc({ status: InventoryLotStatus.ACCEPTED }),
      );
      repository.update.mockResolvedValue(
        buildLotDoc({ status: InventoryLotStatus.DEPLETED }),
      );

      const result = await service.update('LOT-001', {
        status: InventoryLotStatus.DEPLETED,
      } as UpdateInventoryLotDto);

      expect(result.status).toBe(InventoryLotStatus.DEPLETED);
      expect(repository.update).toHaveBeenCalledWith(
        'LOT-001',
        expect.objectContaining({ status: InventoryLotStatus.DEPLETED }),
      );
    });

    it('should throw NotFoundException if repository returns null after update', async () => {
      repository.findById.mockResolvedValue(buildLotDoc());
      repository.update.mockResolvedValue(null);

      await expect(
        service.update('LOT-001', {
          notes: 'updated',
        } as UpdateInventoryLotDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should reject when lot does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.updateStatus('LOT-404', InventoryLotStatus.ACCEPTED),
      ).rejects.toThrow(NotFoundException);
    });

    it('should allow same-status update', async () => {
      const lot = buildLotDoc({ status: InventoryLotStatus.QUARANTINE });
      repository.findById.mockResolvedValue(lot);
      repository.updateStatus.mockResolvedValue(lot);

      const result = await service.updateStatus(
        'LOT-001',
        InventoryLotStatus.QUARANTINE,
      );

      expect(result.status).toBe(InventoryLotStatus.QUARANTINE);
      expect(repository.updateStatus).toHaveBeenCalledWith(
        'LOT-001',
        InventoryLotStatus.QUARANTINE,
      );
    });

    it('should reject invalid transition from Depleted to Accepted', async () => {
      repository.findById.mockResolvedValue(
        buildLotDoc({ status: InventoryLotStatus.DEPLETED }),
      );

      await expect(
        service.updateStatus('LOT-001', InventoryLotStatus.ACCEPTED),
      ).rejects.toThrow(ConflictException);
      expect(repository.updateStatus).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if repository updateStatus returns null', async () => {
      repository.findById.mockResolvedValue(buildLotDoc());
      repository.updateStatus.mockResolvedValue(null);

      await expect(
        service.updateStatus('LOT-001', InventoryLotStatus.ACCEPTED),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should reject delete for non-Quarantine status', async () => {
      repository.findById.mockResolvedValue(
        buildLotDoc({ status: InventoryLotStatus.ACCEPTED }),
      );

      await expect(service.delete('LOT-001')).rejects.toThrow(
        ConflictException,
      );
      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when lot does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.delete('LOT-404')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should delete Quarantine lot and return confirmation', async () => {
      repository.findById.mockResolvedValue(
        buildLotDoc({ status: InventoryLotStatus.QUARANTINE }),
      );
      repository.delete.mockResolvedValue(buildLotDoc());

      const result = await service.delete('LOT-001');

      expect(repository.delete).toHaveBeenCalledWith('LOT-001');
      expect(result).toEqual({
        success: true,
        message: 'Inventory lot LOT-001 deleted successfully',
      });
    });
  });

  describe('expiry queries', () => {
    it.each([0, -1, 366, 1000])(
      'should reject invalid day range (%s) for getExpiringSoon',
      async (days) => {
        await expect(service.getExpiringSoon(days)).rejects.toThrow(
          BadRequestException,
        );
      },
    );

    it('should return mapped expiring lots', async () => {
      repository.findExpiringSoon.mockResolvedValue([buildLotDoc()]);

      const result = await service.getExpiringSoon(30);

      expect(repository.findExpiringSoon).toHaveBeenCalledWith(30);
      expect(result).toHaveLength(1);
      expect(result[0]?.lot_id).toBe('LOT-001');
    });

    it('should return mapped expired lots', async () => {
      repository.findExpiredLots.mockResolvedValue([buildLotDoc()]);

      const result = await service.getExpiredLots();

      expect(repository.findExpiredLots).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(1);
      expect(result[0]?.lot_id).toBe('LOT-001');
    });
  });

  describe('getLotsStatistics', () => {
    it('should aggregate totals, status distribution, expiring and expired counts', async () => {
      repository.findAll.mockResolvedValue({
        data: [buildLotDoc()],
        total: 123,
      });
      repository.findExpiringSoon.mockResolvedValue([
        buildLotDoc({ lot_id: 'LOT-E1' }),
        buildLotDoc({ lot_id: 'LOT-E2' }),
      ]);
      repository.findExpiredLots.mockResolvedValue([
        buildLotDoc({ lot_id: 'LOT-X1' }),
      ]);
      repository.countByStatus
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(20)
        .mockResolvedValueOnce(30)
        .mockResolvedValueOnce(40);

      const result = await service.getLotsStatistics();

      expect(repository.findAll).toHaveBeenCalledWith(1, 10000);
      expect(repository.countByStatus).toHaveBeenNthCalledWith(
        1,
        InventoryLotStatus.QUARANTINE,
      );
      expect(repository.countByStatus).toHaveBeenNthCalledWith(
        2,
        InventoryLotStatus.ACCEPTED,
      );
      expect(repository.countByStatus).toHaveBeenNthCalledWith(
        3,
        InventoryLotStatus.REJECTED,
      );
      expect(repository.countByStatus).toHaveBeenNthCalledWith(
        4,
        InventoryLotStatus.DEPLETED,
      );
      expect(result).toEqual({
        total: 123,
        byStatus: {
          [InventoryLotStatus.QUARANTINE]: 10,
          [InventoryLotStatus.ACCEPTED]: 20,
          [InventoryLotStatus.REJECTED]: 30,
          [InventoryLotStatus.DEPLETED]: 40,
        },
        expiringSoon: 2,
        expired: 1,
      });
    });
  });
});
