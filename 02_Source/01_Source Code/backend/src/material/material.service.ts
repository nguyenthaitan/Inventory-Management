import { Injectable } from '@nestjs/common';

@Injectable()
export class MaterialService {
  // service methods stubs
  findAll() {
    // TODO: return list of materials
    return [];
  }

  findOne(id: string) {
    // TODO: fetch single material by id
    return { id };
  }

  create(createDto: any) {
    // TODO: insert new material
    return createDto;
  }

  update(id: string, updateDto: any) {
    // TODO: update existing material
    return { id, ...updateDto };
  }

  remove(id: string) {
    // TODO: delete material
    return { deleted: true };
  }
}
