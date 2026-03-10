import {
  IsString,
  IsEnum,
  IsOptional,
  Length,
  Matches,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MaterialType, MATERIAL_VALIDATION } from '../material.constants';

export class CreateMaterialDto {
  @ApiProperty({
    example: 'PART-10001',
    description: 'Unique part number (uppercase alphanumeric with hyphens)',
    minLength: MATERIAL_VALIDATION.PART_NUMBER.MIN_LENGTH,
    maxLength: MATERIAL_VALIDATION.PART_NUMBER.MAX_LENGTH,
  })
  @IsString()
  @Length(
    MATERIAL_VALIDATION.PART_NUMBER.MIN_LENGTH,
    MATERIAL_VALIDATION.PART_NUMBER.MAX_LENGTH,
  )
  @Matches(MATERIAL_VALIDATION.PART_NUMBER.PATTERN, {
    message:
      'Part number must contain only uppercase letters, numbers, and hyphens',
  })
  part_number: string;

  @ApiProperty({
    example: 'Ascorbic Acid (Vitamin C)',
    description: 'Material name',
    minLength: MATERIAL_VALIDATION.MATERIAL_NAME.MIN_LENGTH,
    maxLength: MATERIAL_VALIDATION.MATERIAL_NAME.MAX_LENGTH,
  })
  @IsString()
  @Length(
    MATERIAL_VALIDATION.MATERIAL_NAME.MIN_LENGTH,
    MATERIAL_VALIDATION.MATERIAL_NAME.MAX_LENGTH,
  )
  material_name: string;

  @ApiProperty({
    enum: MaterialType,
    example: MaterialType.API,
    description: 'Type of material',
  })
  @IsEnum(MaterialType, {
    message: `Material type must be one of: ${Object.values(MaterialType).join(', ')}`,
  })
  material_type: MaterialType;

  @ApiPropertyOptional({
    example: '2-8°C, protected from light',
    description: 'Storage conditions',
    maxLength: MATERIAL_VALIDATION.STORAGE_CONDITIONS.MAX_LENGTH,
  })
  @IsOptional()
  @IsString()
  @Length(0, MATERIAL_VALIDATION.STORAGE_CONDITIONS.MAX_LENGTH)
  storage_conditions?: string;

  @ApiPropertyOptional({
    example: 'SPEC-VC-2025-01',
    description: 'Specification document reference',
    maxLength: MATERIAL_VALIDATION.SPECIFICATION_DOCUMENT.MAX_LENGTH,
  })
  @IsOptional()
  @IsString()
  @Length(0, MATERIAL_VALIDATION.SPECIFICATION_DOCUMENT.MAX_LENGTH)
  specification_document?: string;

  @ApiPropertyOptional({
    example: 'TPL-RM-01',
    description: 'Default label template ID',
  })
  @IsOptional()
  @IsString()
  default_label_template_id?: string;

  @ApiPropertyOptional({
    example: {
      manufacturer: 'ABC Pharma',
      cas_number: '50-81-7',
      molecular_weight: 176.12,
    },
    description: 'Additional metadata',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
