import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaOptions } from 'mongoose';

export type QCTestDocument = QCTest & Document;

const options: SchemaOptions = {
  timestamps: { createdAt: 'created_date', updatedAt: 'modified_date' },
};

@Schema(options)
export class QCTest {
  @Prop({ type: String, required: true, unique: true, maxlength: 36 })
  test_id: string;

  @Prop({ type: String, required: true, maxlength: 36 })
  lot_id: string;

  @Prop({
    type: String,
    enum: [
      'Identity',
      'Potency',
      'Microbial',
      'Growth Promotion',
      'Physical',
      'Chemical',
    ],
    required: true,
  })
  test_type: string;

  @Prop({ type: String, required: true, maxlength: 100 })
  test_method: string;

  @Prop({ type: Date, required: true })
  test_date: Date;

  @Prop({ type: String, required: true, maxlength: 100 })
  test_result: string;

  @Prop({ type: String, maxlength: 200, required: false })
  acceptance_criteria?: string;

  @Prop({
    type: String,
    enum: ['Pass', 'Fail', 'Pending'],
    required: true,
  })
  result_status: string;

  @Prop({ type: String, required: true, maxlength: 50 })
  performed_by: string;

  @Prop({ type: String, maxlength: 50, required: false })
  verified_by?: string;
}

export const QCTestSchema = SchemaFactory.createForClass(QCTest);
