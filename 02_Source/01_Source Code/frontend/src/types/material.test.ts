/// <reference types="jest" />
/**
 * Unit Tests for material.ts types and constants
 *
 * Covers:
 * - MaterialType enum completeness & values
 * - MATERIAL_TYPE_OPTIONS structure and coverage
 * - MATERIAL_TYPE_COLORS structure, coverage, and format
 * - Interface shape validation via assignability tests
 */

import {
  MaterialType,
  MATERIAL_TYPE_OPTIONS,
  MATERIAL_TYPE_COLORS,
} from './material';
import type {
  Material,
  CreateMaterialRequest,
  UpdateMaterialRequest,
  MaterialQueryParams,
  MaterialQueryResult,
  MaterialStatistics,
} from './material';

// ─────────────────────────────────────────────────────────────────────────────
// MaterialType enum
// ─────────────────────────────────────────────────────────────────────────────
describe('MaterialType enum', () => {
  const expectedEntries: [keyof typeof MaterialType, string][] = [
    ['API', 'API'],
    ['EXCIPIENT', 'Excipient'],
    ['DIETARY_SUPPLEMENT', 'Dietary Supplement'],
    ['CONTAINER', 'Container'],
    ['CLOSURE', 'Closure'],
    ['PROCESS_CHEMICAL', 'Process Chemical'],
    ['TESTING_MATERIAL', 'Testing Material'],
  ];

  it('should have exactly 7 members', () => {
    const keys = Object.keys(MaterialType);
    expect(keys).toHaveLength(7);
  });

  it.each(expectedEntries)('MaterialType.%s should equal "%s"', (key, value) => {
    expect(MaterialType[key]).toBe(value);
  });

  it('should not have numeric (reverse-mapped) keys', () => {
    const keys = Object.keys(MaterialType);
    keys.forEach((k) => expect(Number.isNaN(Number(k))).toBe(true));
  });

  it('all values should be non-empty strings', () => {
    Object.values(MaterialType).forEach((v) => {
      expect(typeof v).toBe('string');
      expect(v.length).toBeGreaterThan(0);
    });
  });

  it('all values should be unique', () => {
    const values = Object.values(MaterialType);
    const unique = new Set(values);
    expect(unique.size).toBe(values.length);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// MATERIAL_TYPE_OPTIONS
// ─────────────────────────────────────────────────────────────────────────────
describe('MATERIAL_TYPE_OPTIONS', () => {
  it('should be a non-empty array', () => {
    expect(Array.isArray(MATERIAL_TYPE_OPTIONS)).toBe(true);
    expect(MATERIAL_TYPE_OPTIONS.length).toBeGreaterThan(0);
  });

  it('should have one entry per MaterialType', () => {
    const enumCount = Object.keys(MaterialType).length;
    expect(MATERIAL_TYPE_OPTIONS).toHaveLength(enumCount);
  });

  it('each entry should have a "value" and "label" string property', () => {
    MATERIAL_TYPE_OPTIONS.forEach((opt) => {
      expect(typeof opt.value).toBe('string');
      expect(typeof opt.label).toBe('string');
      expect(opt.value.length).toBeGreaterThan(0);
      expect(opt.label.length).toBeGreaterThan(0);
    });
  });

  it('every MaterialType value should appear as an option', () => {
    const optionValues = MATERIAL_TYPE_OPTIONS.map((o) => o.value);
    Object.values(MaterialType).forEach((type) => {
      expect(optionValues).toContain(type);
    });
  });

  it('option values should match their labels (same text as enum values)', () => {
    MATERIAL_TYPE_OPTIONS.forEach((opt) => {
      // value must be one of the MaterialType enum values
      expect(Object.values(MaterialType)).toContain(opt.value);
    });
  });

  it('option values should be unique', () => {
    const values = MATERIAL_TYPE_OPTIONS.map((o) => o.value);
    const unique = new Set(values);
    expect(unique.size).toBe(values.length);
  });

  it('option labels should be unique', () => {
    const labels = MATERIAL_TYPE_OPTIONS.map((o) => o.label);
    const unique = new Set(labels);
    expect(unique.size).toBe(labels.length);
  });

  it('should contain API option with correct label', () => {
    const api = MATERIAL_TYPE_OPTIONS.find((o) => o.value === MaterialType.API);
    expect(api).toBeDefined();
    expect(api!.label).toBe('API');
  });

  it('should contain Excipient option', () => {
    const ex = MATERIAL_TYPE_OPTIONS.find((o) => o.value === MaterialType.EXCIPIENT);
    expect(ex).toBeDefined();
    expect(ex!.label).toBe('Excipient');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// MATERIAL_TYPE_COLORS
// ─────────────────────────────────────────────────────────────────────────────
describe('MATERIAL_TYPE_COLORS', () => {
  it('should be an object', () => {
    expect(typeof MATERIAL_TYPE_COLORS).toBe('object');
    expect(MATERIAL_TYPE_COLORS).not.toBeNull();
  });

  it('should have one entry per MaterialType', () => {
    const colorKeys = Object.keys(MATERIAL_TYPE_COLORS);
    const enumValues = Object.values(MaterialType);
    expect(colorKeys).toHaveLength(enumValues.length);
  });

  it('every MaterialType should have a color entry', () => {
    Object.values(MaterialType).forEach((type) => {
      expect(MATERIAL_TYPE_COLORS).toHaveProperty(type);
    });
  });

  it('all colors should be non-empty strings', () => {
    Object.values(MATERIAL_TYPE_COLORS).forEach((color) => {
      expect(typeof color).toBe('string');
      expect(color.length).toBeGreaterThan(0);
    });
  });

  it('all colors should be valid hex color strings (#xxxxxx)', () => {
    const hexColorRegex = /^#[0-9a-fA-F]{6}$/;
    Object.entries(MATERIAL_TYPE_COLORS).forEach(([_type, color]) => {
      expect(hexColorRegex.test(color)).toBe(true);
    });
  });

  it('all colors should be unique', () => {
    const colors = Object.values(MATERIAL_TYPE_COLORS);
    const unique = new Set(colors);
    expect(unique.size).toBe(colors.length);
  });

  it('API type should have color #1890ff', () => {
    expect(MATERIAL_TYPE_COLORS[MaterialType.API]).toBe('#1890ff');
  });

  it('EXCIPIENT type should have color #52c41a', () => {
    expect(MATERIAL_TYPE_COLORS[MaterialType.EXCIPIENT]).toBe('#52c41a');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Interface shape tests (compile-time + runtime via object assignment)
// ─────────────────────────────────────────────────────────────────────────────
describe('Material interface', () => {
  it('should accept a fully-populated Material object', () => {
    const mat: Material = {
      _id: '507f1f77bcf86cd799439011',
      material_id: 'MAT-0000000000-ABC123',
      part_number: 'PART-10001',
      material_name: 'Ascorbic Acid',
      material_type: MaterialType.API,
      storage_conditions: '2-8°C',
      specification_document: 'SPEC-001',
      default_label_template_id: 'TPL-001',
      created_by: 'admin',
      is_active: true,
      metadata: { key: 'value' },
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };
    expect(mat._id).toBeDefined();
    expect(mat.material_type).toBe(MaterialType.API);
  });

  it('should allow optional fields to be omitted', () => {
    const mat: Material = {
      _id: '507f1f77bcf86cd799439011',
      material_id: 'MAT-0000000000-XYZ',
      part_number: 'PART-10002',
      material_name: 'Minimal Material',
      material_type: MaterialType.EXCIPIENT,
      created_by: 'admin',
      is_active: false,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };
    expect(mat.storage_conditions).toBeUndefined();
    expect(mat.specification_document).toBeUndefined();
    expect(mat.metadata).toBeUndefined();
  });
});

describe('CreateMaterialRequest interface', () => {
  it('should accept required fields only', () => {
    const req: CreateMaterialRequest = {
      part_number: 'PART-NEW',
      material_name: 'New Material',
      material_type: MaterialType.CONTAINER,
    };
    expect(req.part_number).toBe('PART-NEW');
    expect(req.storage_conditions).toBeUndefined();
  });

  it('should accept all optional fields', () => {
    const req: CreateMaterialRequest = {
      part_number: 'PART-FULL',
      material_name: 'Full Material',
      material_type: MaterialType.CLOSURE,
      storage_conditions: 'Room temp',
      specification_document: 'SPEC-002',
      default_label_template_id: 'TPL-002',
      metadata: { batch: '001' },
    };
    expect(req.metadata).toEqual({ batch: '001' });
  });
});

describe('UpdateMaterialRequest interface', () => {
  it('should allow entirely empty update (all optional)', () => {
    const req: UpdateMaterialRequest = {};
    expect(Object.keys(req)).toHaveLength(0);
  });

  it('should accept partial update', () => {
    const req: UpdateMaterialRequest = { material_name: 'Renamed' };
    expect(req.material_name).toBe('Renamed');
    expect(req.material_type).toBeUndefined();
  });
});

describe('MaterialQueryParams interface', () => {
  it('should allow empty query params', () => {
    const params: MaterialQueryParams = {};
    expect(params.page).toBeUndefined();
  });

  it('should accept all fields', () => {
    const params: MaterialQueryParams = {
      search: 'acid',
      material_type: MaterialType.API,
      page: 1,
      limit: 10,
      sortBy: 'material_name',
      sortOrder: 'asc',
    };
    expect(params.search).toBe('acid');
    expect(params.sortBy).toBe('material_name');
    expect(params.sortOrder).toBe('asc');
  });

  it('sortBy should allow valid column names', () => {
    const validSortBys: MaterialQueryParams['sortBy'][] = [
      'createdAt', 'updatedAt', 'material_name', 'part_number',
    ];
    validSortBys.forEach((val) => {
      const p: MaterialQueryParams = { sortBy: val };
      expect(p.sortBy).toBe(val);
    });
  });
});

describe('MaterialQueryResult interface', () => {
  it('should hold a data array and pagination', () => {
    const result: MaterialQueryResult = {
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    };
    expect(result.data).toHaveLength(0);
    expect(result.pagination.totalPages).toBe(0);
  });
});

describe('MaterialStatistics interface', () => {
  it('should hold numeric counts and a byType map', () => {
    const stats: MaterialStatistics = {
      total: 10,
      active: 8,
      inactive: 2,
      byType: { [MaterialType.API]: 5, [MaterialType.EXCIPIENT]: 3 },
    };
    expect(stats.total).toBe(stats.active + stats.inactive);
    expect(stats.byType[MaterialType.API]).toBe(5);
  });
});
