import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaOptions, Schema as MongooseSchema } from 'mongoose';
import type { Decimal128 } from 'mongoose';

export type BatchComponentDocument = BatchComponent & Document;

const options: SchemaOptions = {
  timestamps: { createdAt: 'created_date', updatedAt: 'modified_date' },
};

@Schema(options)
export class BatchComponent {
  @Prop({ type: String, required: true, unique: true, maxlength: 36 })
  component_id: string;

  @Prop({ type: String, required: true, maxlength: 36 })
  batch_id: string;

  @Prop({ type: String, required: true, maxlength: 36 })
  lot_id: string;

  @Prop({ type: MongooseSchema.Types.Decimal128, required: true })
  planned_quantity: Decimal128;

  @Prop({ type: MongooseSchema.Types.Decimal128, required: false })
  actual_quantity?: Decimal128;

  @Prop({ type: String, required: true, maxlength: 10 })
  unit_of_measure: string;

  @Prop({ type: Date, required: false })
  addition_date?: Date;

  @Prop({ type: String, maxlength: 50, required: false })
  added_by?: string;
}

export const BatchComponentSchema = SchemaFactory.createForClass(BatchComponent);
