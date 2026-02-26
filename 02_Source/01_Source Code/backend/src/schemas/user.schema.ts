import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaOptions } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type UserDocument = User & Document;

// Trường thời gian (timestamp) được đổi tên để khớp với tên trong mô hình miền
const options: SchemaOptions = {
  timestamps: { createdAt: 'created_date', updatedAt: 'modified_date' },
};

/**
 * Người dùng hệ thống
 */
@Schema(options)
export class User {
  @Prop({ type: String, default: uuidv4, unique: true })
  user_id: string;

  @Prop({ type: String, required: true, unique: true, maxlength: 50 })
  username: string;

  @Prop({ type: String, required: true, unique: true, maxlength: 100 })
  email: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({
    type: String,
    enum: ['Manager', 'Operator', 'Quality Control Technician', 'IT Administrator'],
    default: 'Operator',
  })
  role: string;

  @Prop({ type: Boolean, default: true })
  is_active: boolean;

  @Prop({ type: Date, default: null })
  last_login?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
