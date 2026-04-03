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
});
