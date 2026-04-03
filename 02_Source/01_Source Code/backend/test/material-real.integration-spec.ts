import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  HttpStatus,
  ValidationPipe,
  ExecutionContext,
} from '@nestjs/common';
import request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MaterialModule } from '../src/material/material.module';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/auth/guards/roles.guard';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { MaterialType, MaterialStatus } from '../src/material/material.dto';

// Không dùng AppModule để tránh APP_GUARD toàn cục.
// Chỉ import các module thực sự cần thiết để test MaterialModule.
describe('MaterialController (Real Integration)', () => {
  let app: INestApplication;
  let connection: Connection;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        // Load biến môi trường (đọc .env tại thư mục backend)
        ConfigModule.forRoot({ isGlobal: true }),
        // Kết nối MongoDB thật
        MongooseModule.forRoot(
          process.env.MONGODB_URI ||
            'mongodb://admin:password123@localhost:27017/inventory_db?authSource=admin',
        ),
        // Module cần test (Service + Repository thật)
        MaterialModule,
      ],
    })
      // Ghi đè guard ở cấp Controller - cách này hoạt động đúng vì
      // không có APP_GUARD nào chạy song song
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();

    connection = moduleFixture.get<Connection>(getConnectionToken());
  });

  afterAll(async () => {
    // Cleanup database after all tests
    if (connection) {
      await connection.close();
    }
    await app.close();
  });

  beforeEach(async () => {
    // Clear the materials collection before each test to ensure isolation
    if (connection && connection.collections['materials']) {
      await connection.collections['materials'].deleteMany({});
    }
  });

  const createMaterialDto = {
    material_id: 'MAT-TEST-001',
    part_number: 'PN-TEST-001',
    material_name: 'Real Integration Test Material',
    material_type: MaterialType.API,
    status: MaterialStatus.PENDING,
    storage_conditions: 'Room temperature',
  };

  describe('Integrated Material Lifecycle', () => {
    it('should create, find, update and delete a material in the REAL database', async () => {
      // 1. Create - POST /materials
      const postResponse = await request(app.getHttpServer())
        .post('/materials')
        .set('Authorization', 'Bearer dummy_token')
        .send(createMaterialDto);

      if (postResponse.status === 401) {
        console.log('UNAUTHORIZED DETAIL:', postResponse.body);
      }

      expect(postResponse.status).toBe(HttpStatus.CREATED);

      expect(postResponse.body).toHaveProperty('_id');
      expect(postResponse.body.material_id).toBe(createMaterialDto.material_id);
      const insertedId = postResponse.body._id;

      // 2. Read - GET /materials/:id
      const getResponse = await request(app.getHttpServer())
        .get(`/materials/${insertedId}`)
        .set('Authorization', 'Bearer dummy_token')
        .expect(HttpStatus.OK);

      expect(getResponse.body.material_name).toBe(
        createMaterialDto.material_name,
      );

      // 3. Update - PUT /materials/:id
      const updateDto = { material_name: 'Updated via Real Integration Test' };
      const putResponse = await request(app.getHttpServer())
        .put(`/materials/${insertedId}`)
        .set('Authorization', 'Bearer dummy_token')
        .send(updateDto)
        .expect(HttpStatus.OK);

      expect(putResponse.body.material_name).toBe(updateDto.material_name);

      // 4. Verify update - GET /materials/:id again
      const verifyResponse = await request(app.getHttpServer())
        .get(`/materials/${insertedId}`)
        .set('Authorization', 'Bearer dummy_token')
        .expect(HttpStatus.OK);

      expect(verifyResponse.body.material_name).toBe(updateDto.material_name);

      // 5. Delete - DELETE /materials/:id
      await request(app.getHttpServer())
        .delete(`/materials/${insertedId}`)
        .set('Authorization', 'Bearer dummy_token')
        .expect(HttpStatus.OK);

      // 6. Verify deletion - GET /materials/:id should return 404 after deletion
      await request(app.getHttpServer())
        .get(`/materials/${insertedId}`)
        .set('Authorization', 'Bearer dummy_token')
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return paginated list from database - GET /materials', async () => {
      // Seed some data directly into DB
      await connection.collection('materials').insertMany([
        { ...createMaterialDto, material_id: 'MAT-001', part_number: 'PN-1' },
        { ...createMaterialDto, material_id: 'MAT-002', part_number: 'PN-2' },
        { ...createMaterialDto, material_id: 'MAT-003', part_number: 'PN-3' },
      ]);

      const response = await request(app.getHttpServer())
        .get('/materials')
        .set('Authorization', 'Bearer dummy_token')
        .query({ page: 1, limit: 10 })
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(3);
    });
  });

  // ─────────────────────────────────────────────
  // Validation & Error Handling
  // ─────────────────────────────────────────────
  describe('POST /materials - Validation', () => {
    it('should return 400 when required fields are missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/materials')
        .set('Authorization', 'Bearer dummy_token')
        .send({ material_name: 'Missing required fields' })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 when material_type has invalid enum value', async () => {
      const invalidDto = {
        ...createMaterialDto,
        material_type: 'INVALID_TYPE',
      };
      const response = await request(app.getHttpServer())
        .post('/materials')
        .set('Authorization', 'Bearer dummy_token')
        .send(invalidDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toBeDefined();
    });

    it('should return 400 when material_id exceeds max length (20 chars)', async () => {
      const invalidDto = { ...createMaterialDto, material_id: 'A'.repeat(21) };
      const response = await request(app.getHttpServer())
        .post('/materials')
        .set('Authorization', 'Bearer dummy_token')
        .send(invalidDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toBeDefined();
    });

    it('should not include extra fields in response (whitelist)', async () => {
      const dtoWithExtra = {
        ...createMaterialDto,
        material_id: 'MAT-EXTRA',
        part_number: 'PN-EXTRA',
        unknownField: 'this should be stripped',
      };

      const response = await request(app.getHttpServer())
        .post('/materials')
        .set('Authorization', 'Bearer dummy_token')
        .send(dtoWithExtra)
        .expect(HttpStatus.CREATED);

      expect(response.body).not.toHaveProperty('unknownField');
    });

    it('should return 409 when creating material with duplicate material_id', async () => {
      // Tạo material lần đầu
      await request(app.getHttpServer())
        .post('/materials')
        .set('Authorization', 'Bearer dummy_token')
        .send(createMaterialDto)
        .expect(HttpStatus.CREATED);

      // Tạo lần hai với cùng material_id
      const response = await request(app.getHttpServer())
        .post('/materials')
        .set('Authorization', 'Bearer dummy_token')
        .send({ ...createMaterialDto, part_number: 'PN-OTHER' })
        .expect(HttpStatus.CONFLICT);

      expect(response.body.message).toContain(createMaterialDto.material_id);
    });

    it('should return 409 when creating material with duplicate part_number', async () => {
      await request(app.getHttpServer())
        .post('/materials')
        .set('Authorization', 'Bearer dummy_token')
        .send(createMaterialDto)
        .expect(HttpStatus.CREATED);

      const response = await request(app.getHttpServer())
        .post('/materials')
        .set('Authorization', 'Bearer dummy_token')
        .send({ ...createMaterialDto, material_id: 'MAT-OTHER' })
        .expect(HttpStatus.CONFLICT);

      expect(response.body.message).toContain(createMaterialDto.part_number);
    });
  });

  // ─────────────────────────────────────────────
  // Search
  // ─────────────────────────────────────────────
  describe('GET /materials/search', () => {
    beforeEach(async () => {
      await connection.collection('materials').insertMany([
        {
          ...createMaterialDto,
          material_id: 'MAT-S01',
          part_number: 'PN-S1',
          material_name: 'Alpha Extract',
        },
        {
          ...createMaterialDto,
          material_id: 'MAT-S02',
          part_number: 'PN-S2',
          material_name: 'Beta Compound',
        },
        {
          ...createMaterialDto,
          material_id: 'MAT-S03',
          part_number: 'PN-S3',
          material_name: 'Alpha Plus',
        },
      ]);
    });

    it('should return matched materials when searching by name', async () => {
      const response = await request(app.getHttpServer())
        .get('/materials/search')
        .set('Authorization', 'Bearer dummy_token')
        .query({ q: 'Alpha' })
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      response.body.data.forEach((item: any) => {
        expect(item.material_name).toMatch(/Alpha/i);
      });
    });

    it('should return 400 when search query is missing', async () => {
      const response = await request(app.getHttpServer())
        .get('/materials/search')
        .set('Authorization', 'Bearer dummy_token')
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toContain('required');
    });

    it('should return empty results when no match found', async () => {
      const response = await request(app.getHttpServer())
        .get('/materials/search')
        .set('Authorization', 'Bearer dummy_token')
        .query({ q: 'NonExistentMaterialXYZ' })
        .expect(HttpStatus.OK);

      expect(response.body.data).toHaveLength(0);
    });

    it('should return 400 when search query is less than 2 characters', async () => {
      const response = await request(app.getHttpServer())
        .get('/materials/search')
        .set('Authorization', 'Bearer dummy_token')
        .query({ q: 'A' })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toBeDefined();
    });
  });

  // ─────────────────────────────────────────────
  // Filter by Type
  // ─────────────────────────────────────────────
  describe('GET /materials/type/:type', () => {
    beforeEach(async () => {
      await connection.collection('materials').insertMany([
        {
          ...createMaterialDto,
          material_id: 'MAT-T01',
          part_number: 'PN-T1',
          material_type: MaterialType.API,
        },
        {
          ...createMaterialDto,
          material_id: 'MAT-T02',
          part_number: 'PN-T2',
          material_type: MaterialType.EXCIPIENT,
        },
        {
          ...createMaterialDto,
          material_id: 'MAT-T03',
          part_number: 'PN-T3',
          material_type: MaterialType.API,
        },
      ]);
    });

    it('should return only materials of the specified type', async () => {
      const response = await request(app.getHttpServer())
        .get(`/materials/type/${MaterialType.API}`)
        .set('Authorization', 'Bearer dummy_token')
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('data');
      response.body.data.forEach((item: any) => {
        expect(item.material_type).toBe(MaterialType.API);
      });
    });

    it('should return 400 when filter type is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/materials/type/INVALID_TYPE')
        .set('Authorization', 'Bearer dummy_token')
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toBeDefined();
    });
  });

  // ─────────────────────────────────────────────
  // Pagination
  // ─────────────────────────────────────────────
  describe('GET /materials - Pagination', () => {
    beforeEach(async () => {
      const docs = Array.from({ length: 15 }, (_, i) => ({
        ...createMaterialDto,
        material_id: `MAT-P${String(i + 1).padStart(2, '0')}`,
        part_number: `PN-P${i + 1}`,
      }));
      await connection.collection('materials').insertMany(docs);
    });

    it('should return correct number of items per page', async () => {
      const response = await request(app.getHttpServer())
        .get('/materials')
        .set('Authorization', 'Bearer dummy_token')
        .query({ page: 1, limit: 5 })
        .expect(HttpStatus.OK);

      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });

    it('should return different data on different pages', async () => {
      const page1 = await request(app.getHttpServer())
        .get('/materials')
        .set('Authorization', 'Bearer dummy_token')
        .query({ page: 1, limit: 5 })
        .expect(HttpStatus.OK);

      const page2 = await request(app.getHttpServer())
        .get('/materials')
        .set('Authorization', 'Bearer dummy_token')
        .query({ page: 2, limit: 5 })
        .expect(HttpStatus.OK);

      const page1Ids = page1.body.data.map((m: any) => m._id);
      const page2Ids = page2.body.data.map((m: any) => m._id);

      // Hai trang phải có dữ liệu khác nhau
      const hasOverlap = page1Ids.some((id: string) => page2Ids.includes(id));
      expect(hasOverlap).toBe(false);
    });

    it('should return total count in response', async () => {
      const response = await request(app.getHttpServer())
        .get('/materials')
        .set('Authorization', 'Bearer dummy_token')
        .query({ page: 1, limit: 5 })
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('total');
      expect(response.body.total).toBeGreaterThanOrEqual(15);
    });

    it('should return 400 when page is less than 1', async () => {
      const response = await request(app.getHttpServer())
        .get('/materials')
        .set('Authorization', 'Bearer dummy_token')
        .query({ page: 0, limit: 10 })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toBeDefined();
    });

    it('should return 400 when limit is less than 1', async () => {
      const response = await request(app.getHttpServer())
        .get('/materials')
        .set('Authorization', 'Bearer dummy_token')
        .query({ page: 1, limit: 0 })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toBeDefined();
    });

    it('should cap results at 100 when limit exceeds maximum', async () => {
      const response = await request(app.getHttpServer())
        .get('/materials')
        .set('Authorization', 'Bearer dummy_token')
        .query({ page: 1, limit: 999 })
        .expect(HttpStatus.OK);

      expect(response.body.data.length).toBeLessThanOrEqual(100);
    });
  });

  // ─────────────────────────────────────────────
  // Not Found
  // ─────────────────────────────────────────────
  describe('GET /materials/:id - Not Found', () => {
    it('should return 404 for a non-existent MongoDB ObjectId', async () => {
      const fakeId = '000000000000000000000001';
      await request(app.getHttpServer())
        .get(`/materials/${fakeId}`)
        .set('Authorization', 'Bearer dummy_token')
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  // ─────────────────────────────────────────────
  // Update
  // ─────────────────────────────────────────────
  describe('PUT /materials/:id', () => {
    it('should update material fields and return updated document', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/materials')
        .set('Authorization', 'Bearer dummy_token')
        .send(createMaterialDto)
        .expect(HttpStatus.CREATED);

      const materialId = createResponse.body._id;

      const updateResponse = await request(app.getHttpServer())
        .put(`/materials/${materialId}`)
        .set('Authorization', 'Bearer dummy_token')
        .send({ material_name: 'Updated Material Name' })
        .expect(HttpStatus.OK);

      expect(updateResponse.body.material_name).toBe('Updated Material Name');
    });

    it('should return 404 when updating non-existent material', async () => {
      const fakeId = '000000000000000000000001';
      await request(app.getHttpServer())
        .put(`/materials/${fakeId}`)
        .set('Authorization', 'Bearer dummy_token')
        .send({ material_name: 'Ghost' })
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  // ─────────────────────────────────────────────
  // Delete
  // ─────────────────────────────────────────────
  describe('DELETE /materials/:id', () => {
    it('should delete an existing material and return 200', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/materials')
        .set('Authorization', 'Bearer dummy_token')
        .send(createMaterialDto)
        .expect(HttpStatus.CREATED);

      const materialId = createResponse.body._id;

      await request(app.getHttpServer())
        .delete(`/materials/${materialId}`)
        .set('Authorization', 'Bearer dummy_token')
        .expect(HttpStatus.OK);

      // Xác nhận đã xóa
      await request(app.getHttpServer())
        .get(`/materials/${materialId}`)
        .set('Authorization', 'Bearer dummy_token')
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return 404 when deleting non-existent material', async () => {
      const fakeId = '000000000000000000000001';
      await request(app.getHttpServer())
        .delete(`/materials/${fakeId}`)
        .set('Authorization', 'Bearer dummy_token')
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
