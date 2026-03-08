import { Injectable, NotFoundException } from '@nestjs/common';
import { InventoryLotRepository } from './inventory-lot.repository';
import {
  InventoryLot,
  InventoryLotDocument,
} from '../schemas/inventory-lot.schema';

@Injectable()
export class InventoryLotService {
  constructor(private readonly repository: InventoryLotRepository) {}

  findAll(status?: string) {
    return this.repository.findAll(status ? { status } : undefined);
  }

  findOne(id: string) {
    return this.repository.findByLotId(id);
  }

  create(dto: any) {
    return this.repository.create(dto);
  }

  update(id: string, dto: any) {
    return this.repository.updateByLotId(id, dto);
  }

  remove(id: string) {
    return { deleted: true };
  }

  async getLotById(lot_id: string): Promise<InventoryLotDocument> {
    const lot = await this.repository.findByLotId(lot_id);
    if (!lot) {
      throw new NotFoundException(`InventoryLot '${lot_id}' not found`);
    }
    return lot;
  }

  async getLotsByIds(lot_ids: string[]): Promise<InventoryLotDocument[]> {
    return this.repository.findByLotIds(lot_ids);
  }

  async updateLotStatus(
    lot_id: string,
    status: string,
  ): Promise<InventoryLotDocument> {
    const lot = await this.repository.updateByLotId(lot_id, {
      status,
    } as Partial<InventoryLot>);
    if (!lot) {
      throw new NotFoundException(`InventoryLot '${lot_id}' not found`);
    }
    return lot;
  }

  async updateLot(
    lot_id: string,
    data: Partial<InventoryLot>,
  ): Promise<InventoryLotDocument> {
    const lot = await this.repository.updateByLotId(lot_id, data);
    if (!lot) {
      throw new NotFoundException(`InventoryLot '${lot_id}' not found`);
    }
    return lot;
  }

  getLotsByStatus(status: string): Promise<InventoryLotDocument[]> {
    return this.repository.findByStatus(status);
  }

  createLot(dto: any): Promise<InventoryLotDocument> {
    return this.repository.create(dto);
  }

  async bulkQuarantine(lot_ids: string[]): Promise<{ updated: number }> {
    const count = await this.repository.updateManyStatus(lot_ids, 'Quarantine');
    return { updated: count };
  }
}

