import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaOptions, Types, Schema as MongooseSchema } from 'mongoose';
import type { Decimal128 } from 'mongoose';

export type InventoryLotDocument = InventoryLot & Document;

const options: SchemaOptions = {
  timestamps: { createdAt: 'created_date', updatedAt: 'modified_date' },
};

@Schema(options)
export class InventoryLot {
  @Prop({ type: String, required: true, unique: true, maxlength: 36 })
  lot_id: string;

  @Prop({ type: String, required: true, maxlength: 20 })
  material_id: string;

  @Prop({ type: String, required: true, maxlength: 100 })
  manufacturer_name: string;

  @Prop({ type: String, required: true, maxlength: 50 })
  manufacturer_lot: string;

  @Prop({ type: String, maxlength: 100, required: false })
  supplier_name?: string;

  @Prop({ type: Date, required: true })
  received_date: Date;

  @Prop({ type: Date, required: true })
  expiration_date: Date;

  @Prop({ type: Date, required: false })
  in_use_expiration_date?: Date;

  @Prop({
    type: String,
    enum: ['Quarantine', 'Accepted', 'Rejected', 'Depleted'],
    required: true,
  })
  status: string;

  @Prop({ type: MongooseSchema.Types.Decimal128, required: true })
  quantity: Decimal128;

  @Prop({ type: String, required: true, maxlength: 10 })
  unit_of_measure: string;

  @Prop({ type: String, maxlength: 100, required: false })
  storage_location?: string;

  @Prop({ type: Boolean, default: false })
  is_sample: boolean;

  @Prop({ type: String, maxlength: 36, required: false })
  parent_lot_id?: string;

  @Prop({ type: String, required: false })
  notes?: string;
}

export const InventoryLotSchema = SchemaFactory.createForClass(InventoryLot);
