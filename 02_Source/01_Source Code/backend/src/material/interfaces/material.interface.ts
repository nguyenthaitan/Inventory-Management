import { MaterialType } from '../material.constants';
import { Types } from 'mongoose';

export interface IMaterial {
  _id?: Types.ObjectId | string;
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
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMaterialQueryResult {
  data: IMaterial[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IMaterialStatistics {
  total: number;
  byType: Record<string, number>;
  active: number;
  inactive: number;
}
