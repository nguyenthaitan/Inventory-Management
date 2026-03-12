import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { BatchComponentService } from './batch-component.service';
import { BatchComponentRepository } from './batch-component.repository';
import { ProductionBatchRepository } from './production-batch.repository';
import { InventoryLot } from '../schemas/inventory-lot.schema';
import { CreateBatchComponentDto } from './dto/create-batch-component.dto';
import { UpdateBatchComponentDto } from './dto/update-batch-component.dto';

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockBatchDoc: any = {
  batch_id: 'batch-uuid-1',
  batch_number: 'BATCH-2026-001',
  status: 'In Progress',
};

const mockLotDoc: any = {
  lot_id: 'lot-uuid-1',
  lot_number: 'LOT-2026-001',
};

const mockComponentDoc: any = {
  component_id: 'comp-uuid-1',
  batch_id: 'batch-uuid-1',
  lot_id: 'lot-uuid-1',
  planned_quantity: { toString: () => '100' },
  actual_quantity: { toString: () => '95' },
  unit_of_measure: 'kg',
  addition_date: new Date('2026-01-15'),
  added_by: 'operator-01',
};

const mockCreateDto: CreateBatchComponentDto = {
  lot_id: 'lot-uuid-1',
  planned_quantity: 100,
  actual_quantity: 95,
  unit_of_measure: 'kg',
  addition_date: '2026-01-15',
  added_by: 'operator-01',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildMockBatchComponentRepository() {
  return {
    create: jest.fn(),
    findByBatchId: jest.fn(),
    findOne: jest.fn(),
    findOneByBatch: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
}

function buildMockProductionBatchRepository() {
  return {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByBatchNumber: jest.fn(),
    findByProductId: jest.fn(),
    findByStatus: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
}

function buildMockLotModel() {
  const execMock = jest.fn();
  const findOneMock = jest.fn().mockReturnValue({ exec: execMock });
  return { findOne: findOneMock, _exec: execMock };
}

// ─── Test suite ───────────────────────────────────────────────────────────────

describe('BatchComponentService', () => {
  let service: BatchComponentService;
  let componentRepo: ReturnType<typeof buildMockBatchComponentRepository>;
  let batchRepo: ReturnType<typeof buildMockProductionBatchRepository>;
  let lotModel: ReturnType<typeof buildMockLotModel>;

  beforeEach(async () => {
    componentRepo = buildMockBatchComponentRepository();
    batchRepo = buildMockProductionBatchRepository();
    lotModel = buildMockLotModel();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BatchComponentService,
        { provide: BatchComponentRepository, useValue: componentRepo },
        { provide: ProductionBatchRepository, useValue: batchRepo },
        { provide: getModelToken(InventoryLot.name), useValue: lotModel },
      ],
    }).compile();

    service = module.get<BatchComponentService>(BatchComponentService);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── create() ───────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('happy path — should create component, auto-fill addition_date, and return response', async () => {
      batchRepo.findOne.mockResolvedValue(mockBatchDoc);
      lotModel._exec.mockResolvedValue(mockLotDoc);
      componentRepo.create.mockResolvedValue(mockComponentDoc);

      const result = await service.create('batch-uuid-1', mockCreateDto);

      expect(result.component_id).toBe('comp-uuid-1');
      expect(result.lot_id).toBe('lot-uuid-1');
      expect(result.planned_quantity).toBe('100');
      expect(batchRepo.findOne).toHaveBeenCalledWith('batch-uuid-1');
      expect(lotModel.findOne).toHaveBeenCalledWith({ lot_id: 'lot-uuid-1' });
      expect(componentRepo.create).toHaveBeenCalled();
    });

    it('happy path — should auto-fill addition_date when not provided', async () => {
      batchRepo.findOne.mockResolvedValue(mockBatchDoc);
      lotModel._exec.mockResolvedValue(mockLotDoc);
      componentRepo.create.mockResolvedValue(mockComponentDoc);

      const dtoWithoutDate: CreateBatchComponentDto = {
        lot_id: 'lot-uuid-1',
        planned_quantity: 100,
        unit_of_measure: 'kg',
      };

      await service.create('batch-uuid-1', dtoWithoutDate);

      const createCallArgs = componentRepo.create.mock.calls[0][0];
      expect(createCallArgs.addition_date).toBeDefined();
    });

    it('happy path — should generate a component_id (UUID) automatically', async () => {
      batchRepo.findOne.mockResolvedValue(mockBatchDoc);
      lotModel._exec.mockResolvedValue(mockLotDoc);
      componentRepo.create.mockResolvedValue(mockComponentDoc);

      await service.create('batch-uuid-1', mockCreateDto);

      const createCallArgs = componentRepo.create.mock.calls[0][0];
      expect(createCallArgs.component_id).toBeDefined();
      // UUID v4 pattern
      expect(createCallArgs.component_id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('should throw NotFoundException when parent batch does not exist', async () => {
      batchRepo.findOne.mockResolvedValue(null);

      await expect(service.create('non-existent-batch', mockCreateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(componentRepo.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when lot_id does not exist', async () => {
      batchRepo.findOne.mockResolvedValue(mockBatchDoc);
      lotModel._exec.mockResolvedValue(null); // lot not found

      await expect(service.create('batch-uuid-1', mockCreateDto)).rejects.toThrow(NotFoundException);
      expect(componentRepo.create).not.toHaveBeenCalled();
    });
  });

  // ─── findByBatchId() ────────────────────────────────────────────────────────

  describe('findByBatchId()', () => {
    it('should return list of components for an existing batch', async () => {
      batchRepo.findOne.mockResolvedValue(mockBatchDoc);
      componentRepo.findByBatchId.mockResolvedValue([mockComponentDoc]);

      const result = await service.findByBatchId('batch-uuid-1');

      expect(result).toHaveLength(1);
      expect(result[0].component_id).toBe('comp-uuid-1');
    });

    it('should return empty array when batch has no components', async () => {
      batchRepo.findOne.mockResolvedValue(mockBatchDoc);
      componentRepo.findByBatchId.mockResolvedValue([]);

      const result = await service.findByBatchId('batch-uuid-1');

      expect(result).toHaveLength(0);
    });

    it('should throw NotFoundException when batch does not exist', async () => {
      batchRepo.findOne.mockResolvedValue(null);

      await expect(service.findByBatchId('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── findOne() ──────────────────────────────────────────────────────────────

  describe('findOne()', () => {
    it('should return a component when batch and component both exist', async () => {
      batchRepo.findOne.mockResolvedValue(mockBatchDoc);
      componentRepo.findOneByBatch.mockResolvedValue(mockComponentDoc);

      const result = await service.findOne('batch-uuid-1', 'comp-uuid-1');

      expect(result.component_id).toBe('comp-uuid-1');
    });

    it('should throw NotFoundException when batch does not exist', async () => {
      batchRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-batch', 'comp-uuid-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when component does not belong to batch', async () => {
      batchRepo.findOne.mockResolvedValue(mockBatchDoc);
      componentRepo.findOneByBatch.mockResolvedValue(null);

      await expect(service.findOne('batch-uuid-1', 'wrong-comp-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── update() ───────────────────────────────────────────────────────────────

  describe('update()', () => {
    it('should update component when it belongs to the batch', async () => {
      batchRepo.findOne.mockResolvedValue(mockBatchDoc);
      componentRepo.findOneByBatch.mockResolvedValue(mockComponentDoc);
      const updatedDoc = { ...mockComponentDoc, unit_of_measure: 'g' };
      componentRepo.update.mockResolvedValue(updatedDoc);

      const dto: UpdateBatchComponentDto = { unit_of_measure: 'g' };
      const result = await service.update('batch-uuid-1', 'comp-uuid-1', dto);

      expect(result.unit_of_measure).toBe('g');
    });

    it('should re-validate lot_id if it changes', async () => {
      batchRepo.findOne.mockResolvedValue(mockBatchDoc);
      componentRepo.findOneByBatch.mockResolvedValue(mockComponentDoc);
      lotModel._exec.mockResolvedValue(null); // new lot not found

      const dto: UpdateBatchComponentDto = { lot_id: 'non-existent-lot' };

      await expect(service.update('batch-uuid-1', 'comp-uuid-1', dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when component does not belong to batch', async () => {
      batchRepo.findOne.mockResolvedValue(mockBatchDoc);
      componentRepo.findOneByBatch.mockResolvedValue(null);

      await expect(
        service.update('batch-uuid-1', 'wrong-comp', {}),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── remove() ───────────────────────────────────────────────────────────────

  describe('remove()', () => {
    it('should remove component when it belongs to the batch', async () => {
      batchRepo.findOne.mockResolvedValue(mockBatchDoc);
      componentRepo.findOneByBatch.mockResolvedValue(mockComponentDoc);
      componentRepo.remove.mockResolvedValue(mockComponentDoc);

      const result = await service.remove('batch-uuid-1', 'comp-uuid-1');

      expect(result.message).toContain('comp-uuid-1');
      expect(componentRepo.remove).toHaveBeenCalledWith('comp-uuid-1');
    });

    it('should throw NotFoundException when batch does not exist', async () => {
      batchRepo.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-batch', 'comp-uuid-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when component does not belong to batch', async () => {
      batchRepo.findOne.mockResolvedValue(mockBatchDoc);
      componentRepo.findOneByBatch.mockResolvedValue(null);

      await expect(service.remove('batch-uuid-1', 'wrong-comp')).rejects.toThrow(NotFoundException);
      expect(componentRepo.remove).not.toHaveBeenCalled();
    });
  });
});
