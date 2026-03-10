import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MaterialType, MATERIAL_ID_PREFIX } from '../material/material.constants';

export type MaterialDocument = Material & Document;

@Schema({
  timestamps: true,
  collection: 'materials',
})
export class Material {
  @Prop({
    required: true,
    unique: true,
    index: true,
    uppercase: true,
  })
  material_id: string;

  @Prop({
    required: true,
    unique: true,
    index: true,
    uppercase: true,
  })
  part_number: string;

  @Prop({
    required: true,
    minlength: 3,
    maxlength: 100,
    trim: true,
  })
  material_name: string;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(MaterialType),
    index: true,
  })
  material_type: MaterialType;

  @Prop({
    maxlength: 200,
    trim: true,
  })
  storage_conditions?: string;

  @Prop({
    maxlength: 50,
    trim: true,
  })
  specification_document?: string;

  @Prop({
    trim: true,
  })
  default_label_template_id?: string;

  @Prop({
    required: true,
  })
  created_by: string;

  @Prop({
    default: true,
    index: true,
  })
  is_active: boolean;

  @Prop({
    type: Object,
    default: {},
  })
  metadata?: Record<string, any>;
}

export const MaterialSchema = SchemaFactory.createForClass(Material);

// Create text index for search
MaterialSchema.index({ material_name: 'text', part_number: 'text' });

// Pre-save hook to generate material_id if not provided
MaterialSchema.pre('save', function () {
  if (!this.material_id) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9).toUpperCase();
    this.material_id = `${MATERIAL_ID_PREFIX}-${timestamp}-${random}`;
  }
});

// Pre-save hook to uppercase part_number
MaterialSchema.pre('save', function () {
  if (this.part_number) {
    this.part_number = this.part_number.toUpperCase();
  }
});
