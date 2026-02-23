export type QCStatus = 'pass' | 'fail' | 'pending';

export interface QCTest {
  _id: string;
  lot_id: string;
  test_type: string;
  result: {
    value: string | number;
    unit: string;
    method: string;
  };
  status: QCStatus;
  verified_by: string;
  tested_at: string;
}