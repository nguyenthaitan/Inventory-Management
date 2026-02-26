import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaOptions } from 'mongoose';

export type MaterialDocument = Material & Document;

// Các trường thời gian đồng nhất với domain model
const options: SchemaOptions = {
  timestamps: { createdAt: 'created_date', updatedAt: 'modified_date' },
};

/**
 * Master data cho vật tư/khoáng chất
 */
@Schema(options)
export class Material {
  @Prop({ type: String, required: true, unique: true, maxlength: 20 })
  material_id: string;

  @Prop({ type: String, required: true, unique: true, maxlength: 20 })
  part_number: string;

  @Prop({ type: String, required: true, maxlength: 100 })
  material_name: string;

  @Prop({
    type: String,
    enum: [
      'API',
      'Excipient',
      'Dietary Supplement',
      'Container',
      'Closure',
      'Process Chemical',
      'Testing Material',
    ],
    required: true,
  })
  material_type: string;

  @Prop({ type: String, maxlength: 100, default: null })
  storage_conditions?: string;

  @Prop({ type: String, maxlength: 50, default: null })
  specification_document?: string;
}

export const MaterialSchema = SchemaFactory.createForClass(Material);
