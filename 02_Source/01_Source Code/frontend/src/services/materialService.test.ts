/// <reference types="jest" />
/**
 * Unit Tests for materialService.ts (Jest)
 *
 * Key patterns used:
 * 1. jest.mock() is hoisted to top by babel-jest, so the factory CANNOT reference
 *    outer let/const variables (they're undefined at hoist time).
 * 2. We define mock functions INSIDE the factory and expose via axios.create mock.
 * 3. __esModule: true prevents babel interop from double-wrapping the mock.
 */

import { MaterialType } from '../types/material';
import type {
  Material,
  CreateMaterialRequest,
  UpdateMaterialRequest,
  MaterialQueryParams,
  MaterialQueryResult,
  MaterialStatistics,
} from '../types/material';

// ─────────────────────────────────────────────────────────────────────────────
// Axios mock — ALL jest.fn() calls live INSIDE the factory (no outer refs)
// __esModule: true prevents babel interop from double-wrapping {default: ...}
// ─────────────────────────────────────────────────────────────────────────────
jest.mock('axios', () => {
  const instance = {
    get:    jest.fn(),
    post:   jest.fn(),
    patch:  jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request:  { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  };
  return {
    __esModule: true,
    default: {
      create: jest.fn(() => instance),
      _mockInstance: instance,   // ← stable reference, survives clearAllMocks()
    },
  };
});

import axios from 'axios';
import { materialService } from './materialService';

// ─────────────────────────────────────────────────────────────────────────────
// Stable reference to the axios instance materialService.ts uses.
// We grab it once via the exposed _mockInstance so it survives clearAllMocks().
// ─────────────────────────────────────────────────────────────────────────────
const http = (axios as any)._mockInstance as {
  get:    jest.Mock;
  post:   jest.Mock;
  patch:  jest.Mock;
  delete: jest.Mock;
  interceptors: {
    request:  { use: jest.Mock; eject: jest.Mock };
    response: { use: jest.Mock; eject: jest.Mock };
  };
};

// Shared fixtures
const mockMaterial: Material = {
  _id: '507f1f77bcf86cd799439011',
  material_id: 'MAT-1234567890-ABC123',
  part_number: 'PART-10001',
  material_name: 'Ascorbic Acid (Vitamin C)',
  material_type: MaterialType.API,
  storage_conditions: '2-8 degrees C, protected from light',
  specification_document: 'SPEC-VC-2025-01',
  default_label_template_id: 'TPL-RM-01',
  created_by: 'test-user',
  is_active: true,
  metadata: { manufacturer: 'ABC Pharma', cas_number: '50-81-7' },
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

const mockQueryResult: MaterialQueryResult = {
  data: [mockMaterial],
  pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
};

const mockStatistics: MaterialStatistics = {
  total: 100, active: 95, inactive: 5,
  byType: {
    [MaterialType.API]: 30, [MaterialType.EXCIPIENT]: 40,
    [MaterialType.DIETARY_SUPPLEMENT]: 15, [MaterialType.CONTAINER]: 10,
    [MaterialType.CLOSURE]: 3, [MaterialType.PROCESS_CHEMICAL]: 1,
    [MaterialType.TESTING_MATERIAL]: 1,
  },
};

beforeEach(() => {
  localStorage.clear();

  jest.clearAllMocks();
});

describe('materialService', () => {
  it('should be defined', () => {
    expect(materialService).toBeDefined();
  });

  // getAllMaterials
  describe('getAllMaterials', () => {
    it('should fetch all materials with no params', async () => {
      http.get.mockResolvedValueOnce({ data: mockQueryResult });
      const result = await materialService.getAllMaterials();
      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });

    it('should return empty result', async () => {
      const empty: MaterialQueryResult = { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
      http.get.mockResolvedValueOnce({ data: empty });
      const result = await materialService.getAllMaterials();
      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });

    it('should pass query params', async () => {
      const params: MaterialQueryParams = { search: 'Ascorbic', material_type: MaterialType.API, page: 2, limit: 10 };
      http.get.mockResolvedValueOnce({ data: mockQueryResult });
      const result = await materialService.getAllMaterials(params);
      expect(result).toEqual(mockQueryResult);
    });

    it('should filter by material_type', async () => {
      const params: MaterialQueryParams = { material_type: MaterialType.EXCIPIENT };
      http.get.mockResolvedValueOnce({ data: mockQueryResult });
      const result = await materialService.getAllMaterials(params);
      expect(result).toEqual(mockQueryResult);
    });

    it('should handle multi-page pagination', async () => {
      const paged: MaterialQueryResult = { data: [mockMaterial], pagination: { page: 3, limit: 10, total: 25, totalPages: 3 } };
      http.get.mockResolvedValueOnce({ data: paged });
      const result = await materialService.getAllMaterials({ page: 3, limit: 10 });
      expect(result.pagination.page).toBe(3);
      expect(result.pagination.totalPages).toBe(3);
    });
  });

  // getMaterialById
  describe('getMaterialById', () => {
    it('should fetch material by id', async () => {
      http.get.mockResolvedValueOnce({ data: mockMaterial });
      const result = await materialService.getMaterialById('507f1f77bcf86cd799439011');
      expect(result._id).toBe('507f1f77bcf86cd799439011');
    });

    it('should reject with 404 when not found', async () => {
      http.get.mockRejectedValueOnce({ response: { status: 404 } });
      await expect(materialService.getMaterialById('bad-id')).rejects.toMatchObject({ response: { status: 404 } });
    });
  });

  // getMaterialByPartNumber
  describe('getMaterialByPartNumber', () => {
    it('should fetch by part number', async () => {
      http.get.mockResolvedValueOnce({ data: mockMaterial });
      const result = await materialService.getMaterialByPartNumber('PART-10001');
      expect(result.part_number).toBe('PART-10001');
    });

    it('should reject with 404 for unknown part number', async () => {
      http.get.mockRejectedValueOnce({ response: { status: 404 } });
      await expect(materialService.getMaterialByPartNumber('INVALID')).rejects.toMatchObject({ response: { status: 404 } });
    });
  });

  // getMaterialByMaterialId
  describe('getMaterialByMaterialId', () => {
    it('should fetch by material_id', async () => {
      http.get.mockResolvedValueOnce({ data: mockMaterial });
      const result = await materialService.getMaterialByMaterialId('MAT-1234567890-ABC123');
      expect(result.material_id).toBe('MAT-1234567890-ABC123');
    });
  });

  // createMaterial
  describe('createMaterial', () => {
    it('should create a new material', async () => {
      const dto: CreateMaterialRequest = { part_number: 'PART-10002', material_name: 'New Material', material_type: MaterialType.EXCIPIENT };
      http.post.mockResolvedValueOnce({ data: { ...mockMaterial, ...dto } });
      const result = await materialService.createMaterial(dto);
      expect(result.part_number).toBe('PART-10002');
    });

    it('should reject 400 on validation failure', async () => {
      http.post.mockRejectedValueOnce({ response: { status: 400 } });
      await expect(
        materialService.createMaterial({ part_number: '', material_name: '', material_type: MaterialType.API }),
      ).rejects.toMatchObject({ response: { status: 400 } });
    });

    it('should reject 409 on duplicate part_number', async () => {
      http.post.mockRejectedValueOnce({ response: { status: 409 } });
      await expect(
        materialService.createMaterial({ part_number: 'PART-10001', material_name: 'Dup', material_type: MaterialType.API }),
      ).rejects.toMatchObject({ response: { status: 409 } });
    });
  });

  // updateMaterial
  describe('updateMaterial', () => {
    it('should update material', async () => {
      const dto: UpdateMaterialRequest = { material_name: 'Updated Name' };
      http.patch.mockResolvedValueOnce({ data: { ...mockMaterial, ...dto } });
      const result = await materialService.updateMaterial('507f1f77bcf86cd799439011', dto);
      expect(result.material_name).toBe('Updated Name');
    });

    it('should support partial update', async () => {
      const dto: UpdateMaterialRequest = { storage_conditions: 'Updated storage' };
      http.patch.mockResolvedValueOnce({ data: { ...mockMaterial, ...dto } });
      const result = await materialService.updateMaterial('507f1f77bcf86cd799439011', dto);
      expect(result.storage_conditions).toBe('Updated storage');
    });

    it('should reject 404 if not found', async () => {
      http.patch.mockRejectedValueOnce({ response: { status: 404 } });
      await expect(materialService.updateMaterial('bad-id', { material_name: 'X' })).rejects.toMatchObject({ response: { status: 404 } });
    });
  });

  // deleteMaterial
  describe('deleteMaterial', () => {
    it('should soft-delete material', async () => {
      http.delete.mockResolvedValueOnce({ data: null });
      await materialService.deleteMaterial('507f1f77bcf86cd799439011');
      expect(http.delete).toHaveBeenCalled();
    });

    it('should reject 404 if not found', async () => {
      http.delete.mockRejectedValueOnce({ response: { status: 404 } });
      await expect(materialService.deleteMaterial('bad-id')).rejects.toMatchObject({ response: { status: 404 } });
    });
  });

  // getStatistics
  describe('getStatistics', () => {
    it('should return statistics', async () => {
      http.get.mockResolvedValueOnce({ data: mockStatistics });
      const result = await materialService.getStatistics();
      expect(result.total).toBe(100);
      expect(result.active).toBe(95);
      expect(result.inactive).toBe(5);
      expect(result.byType[MaterialType.API]).toBe(30);
    });

    it('should handle empty statistics', async () => {
      const empty: MaterialStatistics = { total: 0, active: 0, inactive: 0, byType: {} };
      http.get.mockResolvedValueOnce({ data: empty });
      const result = await materialService.getStatistics();
      expect(result.total).toBe(0);
      expect(Object.keys(result.byType)).toHaveLength(0);
    });
  });

  // bulkCreateMaterials
  describe('bulkCreateMaterials', () => {
    it('should create multiple materials', async () => {
      const materials: CreateMaterialRequest[] = [
        { part_number: 'PART-20001', material_name: 'Bulk 1', material_type: MaterialType.API },
        { part_number: 'PART-20002', material_name: 'Bulk 2', material_type: MaterialType.EXCIPIENT },
      ];
      http.post.mockResolvedValueOnce({ data: { created: 2, errors: [] } });
      const result = await materialService.bulkCreateMaterials(materials);
      expect(result.created).toBe(2);
      expect(result.errors).toHaveLength(0);
    });

    it('should report partial failures', async () => {
      http.post.mockResolvedValueOnce({ data: { created: 1, errors: [{ index: 0, part_number: 'PART-10001', error: 'Duplicate' }] } });
      const result = await materialService.bulkCreateMaterials([
        { part_number: 'PART-10001', material_name: 'Dup', material_type: MaterialType.API },
        { part_number: 'PART-20003', material_name: 'OK', material_type: MaterialType.API },
      ]);
      expect(result.created).toBe(1);
      expect(result.errors).toHaveLength(1);
    });

    it('should handle empty array', async () => {
      http.post.mockResolvedValueOnce({ data: { created: 0, errors: [] } });
      const result = await materialService.bulkCreateMaterials([]);
      expect(result.created).toBe(0);
    });
  });

  // exportToCSV
  describe('exportToCSV', () => {
    it('should return a CSV blob', async () => {
      const blob = new Blob(['col1,col2\nval1,val2'], { type: 'text/csv' });
      http.get.mockResolvedValueOnce({ data: blob });
      const result = await materialService.exportToCSV();
      expect(result).toBeInstanceOf(Blob);
    });

    it('should pass filter params to export', async () => {
      const params: MaterialQueryParams = { material_type: MaterialType.API };
      const blob = new Blob(['data'], { type: 'text/csv' });
      http.get.mockResolvedValueOnce({ data: blob });
      await materialService.exportToCSV(params);
      expect(http.get).toHaveBeenCalled();
    });
  });

  // Error Handling
  describe('Error Handling', () => {
    it('should propagate network error', async () => {
      http.get.mockRejectedValueOnce({ message: 'Network Error', code: 'ECONNREFUSED' });
      await expect(materialService.getAllMaterials()).rejects.toMatchObject({ message: 'Network Error' });
    });

    it('should propagate timeout error', async () => {
      http.get.mockRejectedValueOnce({ message: 'Timeout', code: 'ECONNABORTED' });
      await expect(materialService.getMaterialById('123')).rejects.toMatchObject({ message: 'Timeout' });
    });

    it('should propagate 500 server error', async () => {
      http.get.mockRejectedValueOnce({ response: { status: 500 } });
      await expect(materialService.getAllMaterials()).rejects.toMatchObject({ response: { status: 500 } });
    });

    it('should propagate 401 unauthorized', async () => {
      http.get.mockRejectedValueOnce({ response: { status: 401 } });
      await expect(materialService.getAllMaterials()).rejects.toMatchObject({ response: { status: 401 } });
    });

    it('should propagate 403 forbidden', async () => {
      http.post.mockRejectedValueOnce({ response: { status: 403 } });
      await expect(
        materialService.createMaterial({ part_number: 'T', material_name: 'T', material_type: MaterialType.API }),
      ).rejects.toMatchObject({ response: { status: 403 } });
    });
  });
});
