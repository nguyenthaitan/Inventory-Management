import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaOptions } from 'mongoose';

export type ProductionBatchDocument = ProductionBatch & Document;

const options: SchemaOptions = {
  timestamps: { createdAt: 'created_date', updatedAt: 'modified_date' },
};

@Schema(options)
export class ProductionBatch {
  @Prop({ type: String, required: true, unique: true, maxlength: 36 })
  batch_id: string;

  @Prop({ type: String, required: true, maxlength: 20 })
  product_id: string;

  @Prop({ type: String, required: true, unique: true, maxlength: 50 })
  batch_number: string;

  @Prop({ type: String, required: true, maxlength: 10 })
  unit_of_measure: string;

  @Prop({ type: Date, required: true })
  manufacture_date: Date;

  @Prop({ type: Date, required: true })
  expiration_date: Date;

  @Prop({
    type: String,
    enum: ['In Progress', 'Complete', 'On Hold', 'Cancelled'],
    required: true,
  })
  status: string;

  @Prop({ type: 'Decimal128', required: true })
  batch_size: any; // Decimal128 will be cast by Mongoose
}

export const ProductionBatchSchema = SchemaFactory.createForClass(ProductionBatch);
