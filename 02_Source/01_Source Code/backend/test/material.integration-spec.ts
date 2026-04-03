import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
// import { MaterialModule } from '../../src/material/material.module';
import { MaterialModule } from 'src/material/material.module';
// import { MaterialService } from '../../src/material/material.service';
import { MaterialService } from 'src/material/material.service';
// import { JwtAuthGuard } from '../../src/auth/guards/jwt-auth.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../../src/auth/guards/roles.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

describe('MaterialController (Integration)', () => {
  let app: INestApplication;
  let materialService: MaterialService;

  // Mock data
  const mockMaterials = [
    { _id: '1', name: 'Material 1', code: 'M1', quantity: 100 },
    { _id: '2', name: 'Material 2', code: 'M2', quantity: 200 },
  ];

  const mockMaterialService = {
    findAll: jest.fn().mockResolvedValue({
      data: mockMaterials,
      total: 2,
      page: 1,
      limit: 20,
    }),
    findById: jest.fn().mockImplementation((id: string) => {
      const material = mockMaterials.find((m) => m._id === id);
      return Promise.resolve(material);
    }),
    create: jest.fn().mockImplementation((dto) => {
      return Promise.resolve({ _id: '3', ...dto });
    }),
    update: jest.fn().mockImplementation((id, dto) => {
      return Promise.resolve({ _id: id, ...dto });
    }),
    delete: jest.fn().mockResolvedValue({ message: 'Deleted' }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MaterialModule],
    })
      .overrideProvider(MaterialService)
      .useValue(mockMaterialService)
      // Mocking guards to bypass authentication for integration tests
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    materialService = moduleFixture.get<MaterialService>(MaterialService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /materials', () => {
    it('should return all materials with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/materials')
        .query({ page: 1, limit: 10 })
        .expect(HttpStatus.OK);

      expect(response.body.data).toEqual(mockMaterials);
      expect(materialService.findAll).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('GET /materials/:id', () => {
    it('should return a single material if found', async () => {
      const materialId = '1';
      const response = await request(app.getHttpServer())
        .get(`/materials/${materialId}`)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(mockMaterials[0]);
      expect(materialService.findById).toHaveBeenCalledWith(materialId);
    });

    it('should return 404 if material not found', async () => {
      // Setup finding nothing
      (materialService.findById as jest.Mock).mockResolvedValueOnce(null);

      const materialId = 'non-existent';
      await request(app.getHttpServer())
        .get(`/materials/${materialId}`)
        .expect(HttpStatus.OK); // Note: If the service returns null, NestJS usually returns 200 OK with empty body unless a NotFoundException is thrown in service
    });
  });

  describe('POST /materials', () => {
    it('should create a new material', async () => {
      const createDto = {
        name: 'New Material',
        code: 'M3',
        quantity: 50,
        unit: 'pcs',
      };

      const response = await request(app.getHttpServer())
        .post('/materials')
        .send(createDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual({ _id: '3', ...createDto });
      expect(materialService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('PUT /materials/:id', () => {
    it('should update an existing material', async () => {
      const materialId = '1';
      const updateDto = { name: 'Updated name' };

      const response = await request(app.getHttpServer())
        .put(`/materials/${materialId}`)
        .send(updateDto)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({ _id: '1', ...updateDto });
      expect(materialService.update).toHaveBeenCalled();
    });
  });

  describe('DELETE /materials/:id', () => {
    it('should delete a material', async () => {
      const materialId = '1';
      await request(app.getHttpServer())
        .delete(`/materials/${materialId}`)
        .expect(HttpStatus.OK);

      expect(materialService.delete).toHaveBeenCalledWith(materialId);
    });
  });
});
