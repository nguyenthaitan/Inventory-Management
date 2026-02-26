import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaOptions, Types, Schema as MongooseSchema } from 'mongoose';
import type { Decimal128 } from 'mongoose';

export type InventoryTransactionDocument = InventoryTransaction & Document;

const options: SchemaOptions = {
  timestamps: { createdAt: 'created_date', updatedAt: 'modified_date' },
};

@Schema(options)
export class InventoryTransaction {
  @Prop({ type: String, required: true, unique: true, maxlength: 36 })
  transaction_id: string;

  @Prop({ type: String, required: true, maxlength: 36 })
  lot_id: string;

  @Prop({
    type: String,
    enum: ['Receipt', 'Usage', 'Split', 'Adjustment', 'Transfer', 'Disposal'],
    required: true,
  })
  transaction_type: string;

  @Prop({ type: MongooseSchema.Types.Decimal128, required: true })
  quantity: Decimal128;

  @Prop({ type: String, required: true, maxlength: 10 })
  unit_of_measure: string;

  @Prop({ type: Date, required: true })
  transaction_date: Date;

  @Prop({ type: String, maxlength: 50, required: false })
  reference_number?: string;

  @Prop({ type: String, required: true, maxlength: 50 })
  performed_by: string;

  @Prop({ type: String, required: false })
  notes?: string;
}

export const InventoryTransactionSchema = SchemaFactory.createForClass(InventoryTransaction);
