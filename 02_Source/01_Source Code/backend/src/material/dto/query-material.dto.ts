import {
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsString,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MaterialType, MATERIAL_QUERY_DEFAULTS } from '../material.constants';

export class QueryMaterialDto {
  @ApiPropertyOptional({
    description: 'Search term for material name or part number',
    example: 'vitamin',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: MaterialType,
    description: 'Filter by material type',
  })
  @IsOptional()
  @IsEnum(MaterialType)
  material_type?: MaterialType;

  @ApiPropertyOptional({
    description: 'Filter by storage conditions (partial match)',
    example: '2-8°C',
  })
  @IsOptional()
  @IsString()
  storage_conditions?: string;

  @ApiPropertyOptional({
    description: 'Page number',
    default: MATERIAL_QUERY_DEFAULTS.PAGE,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = MATERIAL_QUERY_DEFAULTS.PAGE;

  @ApiPropertyOptional({
    description: 'Items per page',
    default: MATERIAL_QUERY_DEFAULTS.LIMIT,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = MATERIAL_QUERY_DEFAULTS.LIMIT;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    default: MATERIAL_QUERY_DEFAULTS.SORT_BY,
    enum: ['createdAt', 'updatedAt', 'material_name', 'part_number'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['createdAt', 'updatedAt', 'material_name', 'part_number'])
  sortBy?: string = MATERIAL_QUERY_DEFAULTS.SORT_BY;

  @ApiPropertyOptional({
    description: 'Sort order',
    default: MATERIAL_QUERY_DEFAULTS.SORT_ORDER,
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = MATERIAL_QUERY_DEFAULTS.SORT_ORDER;
}
