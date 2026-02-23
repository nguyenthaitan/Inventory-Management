export type LotStatus = 'Quarantine' | 'Accepted' | 'Rejected' | 'Depleted';

export interface InventoryLot {
  _id: string;
  material_id: string;
  lot_code: string;
  mfr_name: string;
  mfr_lot: string;
  status: LotStatus;
  quantity: number;
  uom: string;
  expiration_date: string;
  parent_lot_id?: string;
  is_sample: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type TransactionType = 'receipt' | 'usage' | 'split' | 'transfer' | 'adjustment';

export interface InventoryTransaction {
  _id: string;
  lot_id: string;
  type: TransactionType;
  quantity: number;
  performed_by: string;
  transaction_date: string;
  note?: string;
}