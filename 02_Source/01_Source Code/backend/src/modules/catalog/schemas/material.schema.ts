import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MaterialDocument = HydratedDocument<Material>;

@Schema({ collection: 'materials' })
export class Material {
  @Prop({ required: true, unique: true })
  material_id: string;

  @Prop({ required: true })
  part_number: string;

  @Prop({ required: true })
  material_name: string;

  @Prop({ required: true })
  material_type: string;

  @Prop()
  storage_conditions: string;

  @Prop()
  specification_document: string;

  @Prop({ default: Date.now })
  created_date: Date;
}

export const MaterialSchema = SchemaFactory.createForClass(Material);
