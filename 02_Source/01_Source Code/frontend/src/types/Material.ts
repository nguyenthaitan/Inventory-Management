export type MaterialType = 'API' | 'Excipient' | 'Container' | 'FinishedProduct' | 'Intermediate';

export interface Material {
  _id: string;
  material_id: string;
  part_number: string;
  material_name: string;
  material_type: MaterialType | string;
  storage_conditions?: string;
  specification_document?: string;
  created_date: string;
}