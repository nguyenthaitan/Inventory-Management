// Import các module cần thiết cho việc test
import { Test, TestingModule } from '@nestjs/testing';
import { MaterialService } from '../material/material.service';
import { MaterialRepository } from '../material/material.repository';
import { ConflictException, NotFoundException } from '@nestjs/common';
import {
  CreateMaterialDto,
  MaterialType,
} from '../material/dto/create-material.dto';
import { UpdateMaterialDto } from '../material/dto/update-material.dto';

// Một đối tượng mẫu dùng lại trong nhiều trường hợp kiểm thử
const sample: any = {
  _id: '1',
  part_number: 'P1',
  material_name: 'M1',
  material_type: MaterialType.API,
};

describe('MaterialService', () => {
  // các biến dùng chung trong toàn bộ suite
  let service: MaterialService;
  let repo: Record<keyof MaterialRepository, jest.Mock>;

  // trước mỗi test case, khởi tạo lại instance và mock repository
  beforeEach(async () => {
    repo = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaterialService,
        { provide: MaterialRepository, useValue: repo },
      ],
    }).compile();

    service = module.get<MaterialService>(MaterialService);
  });

  // kiểm tra dịch vụ trả về danh sách đầy đủ
  it('should return all materials', async () => {
    repo.findAll.mockResolvedValue([sample]);
    expect(await service.findAll()).toEqual([sample]);
    expect(repo.findAll).toHaveBeenCalled();
  });

  // lấy về một bản ghi theo id
  it('should return one material', async () => {
    repo.findOne.mockResolvedValue(sample);
    expect(await service.findOne('1')).toEqual(sample);
  });

  // nếu không tìm thấy thì ném lỗi 404
  it('should throw NotFoundException when findOne misses', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne('x')).rejects.toThrow(NotFoundException);
  });

  // tạo mới bản ghi khi không có xung đột part_number
  it('should create material', async () => {
    repo.findAll.mockResolvedValue([]);
    repo.create.mockResolvedValue(sample);
    const dto: CreateMaterialDto = {
      part_number: 'P1',
      material_name: 'M1',
      material_type: MaterialType.API,
    };
    expect(await service.create(dto)).toEqual(sample);
  });

  // kiểm tra xung đột unique khi tạo
  it('should conflict on duplicate part_number create', async () => {
    repo.findAll.mockResolvedValue([sample]);
    const dto: CreateMaterialDto = {
      part_number: 'P1',
      material_name: 'M2',
      material_type: MaterialType.API,
    };
    await expect(service.create(dto)).rejects.toThrow(ConflictException);
  });

  // cập nhật bình thường khi bản ghi tồn tại
  it('should update existing material', async () => {
    repo.findAll.mockResolvedValue([sample]);
    const updated = { ...sample, material_name: 'M2' };
    repo.update.mockResolvedValue(updated);
    const dto: UpdateMaterialDto = { material_name: 'M2' };
    expect(await service.update('1', dto)).toEqual(updated);
  });

  // xung đột unique khi cập nhật part_number của bản khác
  it('should conflict on duplicate part_number update', async () => {
    const other = { ...sample, _id: '2', part_number: 'X' };
    repo.findAll.mockResolvedValue([sample, other]);
    const dto: UpdateMaterialDto = { part_number: 'P1' };
    await expect(service.update('2', dto)).rejects.toThrow(ConflictException);
  });

  // ném lỗi khi update trên bản ghi không tồn tại
  it('should throw NotFoundException on update missing', async () => {
    repo.findAll.mockResolvedValue([]);
    repo.update.mockResolvedValue(null);
    await expect(service.update('1', {} as any)).rejects.toThrow(
      NotFoundException,
    );
  });

  // xoá thành công khi có bản ghi
  it('should remove material', async () => {
    repo.remove.mockResolvedValue({ deleted: true });
    expect(await service.remove('1')).toEqual({ deleted: true });
  });

  // xoá không tồn tại => lỗi 404
  it('should throw NotFoundException when remove missing', async () => {
    repo.remove.mockResolvedValue({ deleted: false });
    await expect(service.remove('1')).rejects.toThrow(NotFoundException);
  });
});
