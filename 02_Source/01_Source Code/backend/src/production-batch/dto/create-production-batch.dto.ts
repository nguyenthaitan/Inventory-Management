import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsDateString,
  IsNumber,
  IsPositive,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum BatchStatus {
  InProgress = 'In Progress',
  Complete = 'Complete',
  OnHold = 'On Hold',
  Cancelled = 'Cancelled',
}

/**
 * DTO for creating a new production batch
 * Used for POST /production-batches endpoint
 */
export class CreateProductionBatchDto {
  @IsUUID('4', { message: 'batch_id must be a valid UUID v4' })
  @IsString()
  @IsNotEmpty({ message: 'batch_id is required' })
  @MaxLength(36, { message: 'batch_id must not exceed 36 characters' })
  batch_id: string;

  @IsString({ message: 'product_id must be a string' })
  @IsNotEmpty({ message: 'product_id is required' })
  @MaxLength(20, { message: 'product_id must not exceed 20 characters' })
  product_id: string;

  @IsString({ message: 'batch_number must be a string' })
  @IsNotEmpty({ message: 'batch_number is required' })
  @MaxLength(50, { message: 'batch_number must not exceed 50 characters' })
  batch_number: string;

  @IsString({ message: 'unit_of_measure must be a string' })
  @IsNotEmpty({ message: 'unit_of_measure is required' })
  @MaxLength(10, { message: 'unit_of_measure must not exceed 10 characters' })
  unit_of_measure: string;

  @IsDateString({}, { message: 'manufacture_date must be a valid ISO 8601 date string' })
  manufacture_date: string;

  @IsDateString({}, { message: 'expiration_date must be a valid ISO 8601 date string' })
  expiration_date: string;

  @IsEnum(BatchStatus, {
    message: `status must be one of: ${Object.values(BatchStatus).join(', ')}`,
  })
  @IsNotEmpty({ message: 'status is required' })
  status: BatchStatus;

  @IsNumber({}, { message: 'batch_size must be a number' })
  @IsPositive({ message: 'batch_size must be a positive number' })
  @Type(() => Number)
  batch_size: number;
}
