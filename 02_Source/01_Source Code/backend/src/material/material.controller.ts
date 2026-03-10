import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MaterialService } from './material.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { QueryMaterialDto } from './dto/query-material.dto';

@ApiTags('materials')
@Controller('materials')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Post()
  @ApiOperation({ summary: 'Create new material' })
  @ApiResponse({
    status: 201,
    description: 'Material created successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Material with part number already exists',
  })
  create(
    @Body() createMaterialDto: CreateMaterialDto,
    @Request() req: any,
  ) {
    // For now, use a mock user ID. Replace with actual user from JWT when auth is implemented
    const userId = req.user?.userId || 'system';
    return this.materialService.create(createMaterialDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all materials with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Materials retrieved successfully',
  })
  findAll(@Query() query: QueryMaterialDto) {
    return this.materialService.findAll(query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get material statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  getStatistics() {
    return this.materialService.getStatistics();
  }

  @Get('part-number/:partNumber')
  @ApiOperation({ summary: 'Get material by part number' })
  @ApiResponse({
    status: 200,
    description: 'Material found',
  })
  @ApiResponse({
    status: 404,
    description: 'Material not found',
  })
  findByPartNumber(@Param('partNumber') partNumber: string) {
    return this.materialService.findByPartNumber(partNumber);
  }

  @Get('material-id/:materialId')
  @ApiOperation({ summary: 'Get material by material_id' })
  @ApiResponse({
    status: 200,
    description: 'Material found',
  })
  @ApiResponse({
    status: 404,
    description: 'Material not found',
  })
  findByMaterialId(@Param('materialId') materialId: string) {
    return this.materialService.findByMaterialId(materialId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get material by ID' })
  @ApiResponse({
    status: 200,
    description: 'Material found',
  })
  @ApiResponse({
    status: 404,
    description: 'Material not found',
  })
  findOne(@Param('id') id: string) {
    return this.materialService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update material' })
  @ApiResponse({
    status: 200,
    description: 'Material updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Material not found',
  })
  update(@Param('id') id: string, @Body() updateMaterialDto: UpdateMaterialDto) {
    return this.materialService.update(id, updateMaterialDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete material' })
  @ApiResponse({
    status: 204,
    description: 'Material deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Material not found',
  })
  async remove(@Param('id') id: string) {
    await this.materialService.softDelete(id);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk create materials' })
  @ApiResponse({
    status: 201,
    description: 'Bulk create completed',
  })
  bulkCreate(@Body() materials: CreateMaterialDto[], @Request() req: any) {
    const userId = req.user?.userId || 'system';
    return this.materialService.bulkCreate(materials, userId);
  }
}
