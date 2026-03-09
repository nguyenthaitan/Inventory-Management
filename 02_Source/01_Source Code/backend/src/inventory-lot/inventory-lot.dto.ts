import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDate,
  IsBoolean,
  MaxLength,
  IsDecimal,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum InventoryLotStatus {
  QUARANTINE = 'Quarantine',
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected',
  DEPLETED = 'Depleted',
  HOLD = 'Hold',
}

export class CreateInventoryLotDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  material_id: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  manufacturer_name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  manufacturer_lot: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  supplier_name?: string;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  received_date: Date;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  expiration_date: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  in_use_expiration_date?: Date;

  @IsDecimal({ decimal_digits: '1,3', force_decimal: true })
  @IsNotEmpty()
  quantity: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  unit_of_measure: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  storage_location?: string;

  @IsBoolean()
  @IsOptional()
  is_sample?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(36)
  parent_lot_id?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateInventoryLotDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  manufacturer_name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  manufacturer_lot?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  supplier_name?: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  received_date?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  expiration_date?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  in_use_expiration_date?: Date;

  @IsEnum(InventoryLotStatus)
  @IsOptional()
  status?: InventoryLotStatus;

  @IsDecimal({ decimal_digits: '1,3', force_decimal: true })
  @IsOptional()
  quantity?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  unit_of_measure?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  storage_location?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class InventoryLotResponseDto {
  lot_id: string;
  material_id: string;
  manufacturer_name: string;
  manufacturer_lot: string;
  supplier_name?: string;
  received_date: Date;
  expiration_date: Date;
  in_use_expiration_date?: Date;
  status: InventoryLotStatus;
  quantity: string;
  unit_of_measure: string;
  storage_location?: string;
  is_sample: boolean;
  parent_lot_id?: string;
  notes?: string;
  created_date: Date;
  modified_date: Date;
}

export class PaginatedInventoryLotResponse {
  data: InventoryLotResponseDto[];
  total: number;
  page: number;
  limit: number;
}

export class InventoryLotSearchParams {
  material_id?: string;
  status?: InventoryLotStatus;
  is_sample?: boolean;
  manufacturer_name?: string;
}
