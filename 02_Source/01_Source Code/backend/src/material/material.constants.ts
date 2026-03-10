/**
 * Material Module Constants
 * Defines enums, validation rules, and constants for Material management
 */

export enum MaterialType {
  API = 'API',
  EXCIPIENT = 'Excipient',
  DIETARY_SUPPLEMENT = 'Dietary Supplement',
  CONTAINER = 'Container',
  CLOSURE = 'Closure',
  PROCESS_CHEMICAL = 'Process Chemical',
  TESTING_MATERIAL = 'Testing Material',
}

export const MATERIAL_TYPE_VALUES = Object.values(MaterialType);

export const MATERIAL_VALIDATION = {
  PART_NUMBER: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    PATTERN: /^[A-Z0-9-]+$/,
  },
  MATERIAL_NAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
  },
  STORAGE_CONDITIONS: {
    MAX_LENGTH: 200,
  },
  SPECIFICATION_DOCUMENT: {
    MAX_LENGTH: 50,
  },
};

export const MATERIAL_QUERY_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  SORT_BY: 'createdAt',
  SORT_ORDER: 'desc' as const,
};

export const MATERIAL_ID_PREFIX = 'MAT';

export const ERROR_MESSAGES = {
  PART_NUMBER_EXISTS: 'Material with this part number already exists',
  MATERIAL_NOT_FOUND: 'Material not found',
  CANNOT_CHANGE_PART_NUMBER: 'Cannot change part number of existing material',
  MATERIAL_HAS_REFERENCES: 'Cannot delete material that is referenced by inventory lots',
};
