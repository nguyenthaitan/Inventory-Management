export type BatchStatus = 'planned' | 'in_progress' | 'complete' | 'rejected';

export interface ProductionBatch {
  _id: string;
  product_id: string;
  batch_number: string;
  batch_size: number;
  status: BatchStatus;
  manufacture_date: string;
  created_at: string;
  updated_at: string;
}

export interface BatchComponent {
  _id: string;
  batch_id: string;
  lot_id: string;
  planned_qty: number;
  actual_qty?: number;
}