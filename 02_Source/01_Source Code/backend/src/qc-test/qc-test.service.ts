import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { QCTestRepository } from './qc-test.repository';
import { InventoryLotService } from '../inventory-lot/inventory-lot.service';
import { QCTest, QCTestDocument } from '../schemas/qc-test.schema';
import { InventoryLotDocument } from '../schemas/inventory-lot.schema';
import { CreateQCTestDto } from './dto/create-qc-test.dto';
import { UpdateQCTestDto } from './dto/update-qc-test.dto';
import { QCDecisionDto } from './dto/qc-decision.dto';

// TODO [Workflow B]: After ProductionBatchModule is ready, inject ProductionBatchService
// and call QCTestService.createTest() after batch QC completes.
// Expected data mapping:
//   lot_id           ← uuidv4()
//   material_id      ← batch.product_id
//   manufacturer_name ← 'Internal Production'
//   manufacturer_lot  ← batch.batch_number
//   received_date    ← new Date()
//   expiration_date  ← batch.expiration_date
//   status           ← 'Accepted' | 'Rejected'
//   quantity         ← batch.batch_size (Decimal128 → number)
//   unit_of_measure  ← batch.unit_of_measure

@Injectable()
export class QCTestService {
  constructor(
    private readonly repository: QCTestRepository,
    private readonly inventoryLotService: InventoryLotService,
  ) {}

  // ─── CRUD ────────────────────────────────────────────────────────────────

  async getAllTests(filter?: {
    result_status?: string;
    test_type?: string;
  }): Promise<QCTestDocument[]> {
    return this.repository.findAll(filter);
  }

  async getTestById(test_id: string): Promise<QCTestDocument> {
    const test = await this.repository.findByTestId(test_id);
    if (!test) {
      throw new NotFoundException(`QCTest '${test_id}' not found`);
    }
    return test;
  }

  async getTestsByLotId(lot_id: string): Promise<QCTestDocument[]> {
    await this.inventoryLotService.getLotById(lot_id);
    return this.repository.findByLotId(lot_id);
  }

  async createTest(dto: CreateQCTestDto): Promise<QCTestDocument> {
    await this.inventoryLotService.getLotById(dto.lot_id);

    const data: Partial<QCTest> = {
      ...dto,
      test_id: uuidv4(),
      test_date: new Date(dto.test_date),
      result_status: dto.result_status ?? 'Pending',
    };

    return this.repository.create(data);
  }

  async updateTest(
    test_id: string,
    dto: UpdateQCTestDto,
  ): Promise<QCTestDocument> {
    const updated = await this.repository.updateByTestId(test_id, dto as Partial<QCTest>);
    if (!updated) {
      throw new NotFoundException(`QCTest '${test_id}' not found`);
    }
    return updated;
  }

  async deleteTest(test_id: string): Promise<{ deleted: boolean }> {
    const deleted = await this.repository.deleteByTestId(test_id);
    if (!deleted) {
      throw new NotFoundException(`QCTest '${test_id}' not found`);
    }
    return { deleted: true };
  }

  // ─── Workflow ────────────────────────────────────────────────────────────

  async submitDecision(
    lot_id: string,
    dto: QCDecisionDto,
  ): Promise<{ lot: InventoryLotDocument; tests: QCTestDocument[] }> {
    await this.inventoryLotService.getLotById(lot_id);

    if (dto.decision === 'Rejected' && !dto.reject_reason?.trim()) {
      throw new BadRequestException(
        'Lý do từ chối là bắt buộc khi quyết định là Rejected',
      );
    }

    const testResultStatus =
      dto.decision === 'Accepted'
        ? 'Pass'
        : dto.decision === 'Rejected'
          ? 'Fail'
          : 'Pending';

    const updateData: Partial<QCTest> = {
      result_status: testResultStatus,
      verified_by: dto.verified_by,
      ...(dto.reject_reason && { reject_reason: dto.reject_reason }),
      ...(dto.label_id && { label_id: dto.label_id }),
    };

    const tests = await this.repository.updateManyByLotId(
      lot_id,
      { result_status: 'Pending' },
      updateData,
    );

    const lotStatus =
      dto.decision === 'Accepted'
        ? 'Accepted'
        : dto.decision === 'Rejected'
          ? 'Rejected'
          : 'Hold';

    const lot = await this.inventoryLotService.updateLotStatus(lot_id, lotStatus);

    return { lot, tests };
  }

  async submitRetestDecision(
    lot_id: string,
    action: 'extend' | 'discard',
    dto: { new_expiry_date?: string; performed_by: string },
  ): Promise<InventoryLotDocument> {
    await this.inventoryLotService.getLotById(lot_id);

    if (action === 'extend') {
      if (!dto.new_expiry_date) {
        throw new BadRequestException(
          'new_expiry_date là bắt buộc khi action = extend',
        );
      }

      const lot = await this.inventoryLotService.updateLot(lot_id, {
        status: 'Accepted',
        expiration_date: new Date(dto.new_expiry_date),
      });

      await this.repository.create({
        test_id: uuidv4(),
        lot_id,
        test_type: 'Physical',
        test_method: 'Re-test',
        test_date: new Date(),
        test_result: 'Re-test after expiry extension',
        result_status: 'Pass',
        performed_by: dto.performed_by,
      });

      return lot;
    } else {
      const lot = await this.inventoryLotService.updateLotStatus(lot_id, 'Depleted');

      await this.repository.create({
        test_id: uuidv4(),
        lot_id,
        test_type: 'Physical',
        test_method: 'Re-test - Discard',
        test_date: new Date(),
        test_result: 'Discarded after re-test',
        result_status: 'Fail',
        performed_by: dto.performed_by,
      });

      return lot;
    }
  }

  // ─── Dashboard & Reporting ────────────────────────────────────────────────

  async getDashboardKPI(): Promise<{
    pending_count: number;
    approved_count: number;
    rejected_count: number;
    error_rate: number;
  }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [quarantineLots, approved_count, rejected_count] = await Promise.all([
      this.inventoryLotService.getLotsByStatus('Quarantine'),
      this.repository.countByResultStatus('Pass', startOfMonth, now),
      this.repository.countByResultStatus('Fail', startOfMonth, now),
    ]);

    const total = approved_count + rejected_count;
    const error_rate = total > 0 ? (rejected_count / total) * 100 : 0;

    return {
      pending_count: quarantineLots.length,
      approved_count,
      rejected_count,
      error_rate: Math.round(error_rate * 100) / 100,
    };
  }

  async getSupplierPerformance(filter?: {
    from?: string;
    to?: string;
  }): Promise<
    Array<{
      supplier_name: string;
      total_batches: number;
      approved: number;
      rejected: number;
      quality_rate: number;
    }>
  > {
    const from = filter?.from ? new Date(filter.from) : undefined;
    const to = filter?.to ? new Date(filter.to) : undefined;

    const tests = await this.repository.findInDateRange(from, to);
    if (tests.length === 0) return [];

    const uniqueLotIds = [...new Set(tests.map((t) => t.lot_id))];
    const lots = await this.inventoryLotService.getLotsByIds(uniqueLotIds);
    const lotMap = new Map(lots.map((l) => [l.lot_id, l]));

    const supplierMap = new Map<
      string,
      { total_batches: number; approved: number; rejected: number }
    >();

    for (const test of tests) {
      const lot = lotMap.get(test.lot_id);
      const name = lot?.supplier_name ?? lot?.manufacturer_name ?? 'Unknown';
      if (!supplierMap.has(name)) {
        supplierMap.set(name, { total_batches: 0, approved: 0, rejected: 0 });
      }
      const entry = supplierMap.get(name)!;
      entry.total_batches += 1;
      if (test.result_status === 'Pass') entry.approved += 1;
      if (test.result_status === 'Fail') entry.rejected += 1;
    }

    return Array.from(supplierMap.entries()).map(([supplier_name, data]) => {
      const total = data.approved + data.rejected;
      const quality_rate =
        total > 0
          ? Math.round((data.approved / total) * 100 * 100) / 100
          : 0;
      return { supplier_name, ...data, quality_rate };
    });
  }
}
