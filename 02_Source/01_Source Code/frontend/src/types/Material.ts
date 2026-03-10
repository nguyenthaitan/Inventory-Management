/**
 * Material Module TypeScript Types
 */

export const MaterialType = {
  API: 'API',
  EXCIPIENT: 'Excipient',
  DIETARY_SUPPLEMENT: 'Dietary Supplement',
  CONTAINER: 'Container',
  CLOSURE: 'Closure',
  PROCESS_CHEMICAL: 'Process Chemical',
  TESTING_MATERIAL: 'Testing Material',
} as const;

export type MaterialType = (typeof MaterialType)[keyof typeof MaterialType];

export interface Material {
  _id: string;
  material_id: string;
  part_number: string;
  material_name: string;
  material_type: MaterialType;
  storage_conditions?: string;
  specification_document?: string;
  default_label_template_id?: string;
  created_by: string;
  is_active: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMaterialRequest {
  part_number: string;
  material_name: string;
  material_type: MaterialType;
  storage_conditions?: string;
  specification_document?: string;
  default_label_template_id?: string;
  metadata?: Record<string, any>;
}

export interface UpdateMaterialRequest {
  material_name?: string;
  material_type?: MaterialType;
  storage_conditions?: string;
  specification_document?: string;
  default_label_template_id?: string;
  metadata?: Record<string, any>;
}

export interface MaterialQueryParams {
  search?: string;
  material_type?: MaterialType;
  storage_conditions?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'material_name' | 'part_number';
  sortOrder?: 'asc' | 'desc';
}

export interface MaterialQueryResult {
  data: Material[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MaterialStatistics {
  total: number;
  active: number;
  inactive: number;
  byType: Record<string, number>;
}

export const MATERIAL_TYPE_OPTIONS = [
  { value: MaterialType.API, label: 'API' },
  { value: MaterialType.EXCIPIENT, label: 'Excipient' },
  { value: MaterialType.DIETARY_SUPPLEMENT, label: 'Dietary Supplement' },
  { value: MaterialType.CONTAINER, label: 'Container' },
  { value: MaterialType.CLOSURE, label: 'Closure' },
  { value: MaterialType.PROCESS_CHEMICAL, label: 'Process Chemical' },
  { value: MaterialType.TESTING_MATERIAL, label: 'Testing Material' },
];

export const MATERIAL_TYPE_COLORS: Record<MaterialType, string> = {
  [MaterialType.API]: '#1890ff',
  [MaterialType.EXCIPIENT]: '#52c41a',
  [MaterialType.DIETARY_SUPPLEMENT]: '#faad14',
  [MaterialType.CONTAINER]: '#722ed1',
  [MaterialType.CLOSURE]: '#eb2f96',
  [MaterialType.PROCESS_CHEMICAL]: '#13c2c2',
  [MaterialType.TESTING_MATERIAL]: '#fa541c',
};
