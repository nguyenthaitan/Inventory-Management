import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  MaxLength,
} from 'class-validator';

export class CreateQCTestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(36)
  lot_id: string;

  @IsEnum(['Identity', 'Potency', 'Microbial', 'Growth Promotion', 'Physical', 'Chemical'])
  test_type: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  test_method: string;

  @IsDateString()
  test_date: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  test_result: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  acceptance_criteria?: string;

  @IsEnum(['Pass', 'Fail', 'Pending'])
  result_status: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  performed_by: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  verified_by?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reject_reason?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  label_id?: string;
}
