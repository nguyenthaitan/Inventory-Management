import { Injectable } from '@nestjs/common';

@Injectable()
export class InventoryLotService {
  findAll() {
    return [];
  }

  findOne(id: string) {
    return { id };
  }

  create(dto: any) {
    return dto;
  }

  update(id: string, dto: any) {
    return { id, ...dto };
  }

  remove(id: string) {
    return { deleted: true };
  }
}
