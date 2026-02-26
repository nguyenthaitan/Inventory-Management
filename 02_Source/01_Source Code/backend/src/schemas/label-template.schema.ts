import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaOptions, Types, Schema as MongooseSchema } from 'mongoose';
import type { Decimal128 } from 'mongoose';

export type LabelTemplateDocument = LabelTemplate & Document;

// Timestamps đồng bộ với model
const options: SchemaOptions = {
  timestamps: { createdAt: 'created_date', updatedAt: 'modified_date' },
};

/**
 * Template nhãn in cho nhiều loại sản phẩm/lô hàng
 */
@Schema(options)
export class LabelTemplate {
  @Prop({ type: String, required: true, unique: true, maxlength: 20 })
  template_id: string;

  @Prop({ type: String, required: true, maxlength: 100 })
  template_name: string;

  @Prop({
    type: String,
    enum: ['Raw Material', 'Sample', 'Intermediate', 'Finished Product', 'API', 'Status'],
    required: true,
  })
  label_type: string;

  @Prop({ type: String, required: true })
  template_content: string;

  // sử dụng Decimal128 vì mongoose không có kiểu decimal25
  @Prop({ type: MongooseSchema.Types.Decimal128, required: true })
  width: Decimal128;

  @Prop({ type: MongooseSchema.Types.Decimal128, required: true })
  height: Decimal128;
}

export const LabelTemplateSchema = SchemaFactory.createForClass(LabelTemplate);
