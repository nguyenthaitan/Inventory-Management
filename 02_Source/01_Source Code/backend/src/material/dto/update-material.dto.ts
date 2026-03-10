import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateMaterialDto } from './create-material.dto';

// Omit part_number from update as it's immutable
export class UpdateMaterialDto extends PartialType(
  OmitType(CreateMaterialDto, ['part_number'] as const),
) {}
