import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { InventoryLotService } from './inventory-lot.service';
import {
  CreateInventoryLotDto,
  UpdateInventoryLotDto,
  InventoryLotSearchParams,
} from './inventory-lot.dto';

@Controller('inventory-lots')
export class InventoryLotController {
  constructor(private readonly inventoryLotService: InventoryLotService) {}

  // ==================== CRUD Operations ====================

  @Post()
  async create(@Body(ValidationPipe) dto: CreateInventoryLotDto) {
    return await this.inventoryLotService.create(dto);
  }

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return await this.inventoryLotService.findAll(
      parseInt(page, 10),
      parseInt(limit, 10),
    );
  }

  @Get('statistics')
  async getStatistics() {
    return await this.inventoryLotService.getLotsStatistics();
  }

  @Get('expiring-soon')
  async getExpiringSoon(@Query('days') days: string = '30') {
    return await this.inventoryLotService.getExpiringSoon(parseInt(days, 10));
  }

  @Get('expired')
  async getExpiredLots() {
    return await this.inventoryLotService.getExpiredLots();
  }

  @Get('samples')
  async findSampleLots(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return await this.inventoryLotService.findSampleLots(
      parseInt(page, 10),
      parseInt(limit, 10),
    );
  }

  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    if (!query) {
      return { data: [], total: 0, page: 1, limit };
    }
    return await this.inventoryLotService.searchByManufacturer(
      query,
      parseInt(page, 10),
      parseInt(limit, 10),
    );
  }

  @Get('filter')
  async filter(
    @Query('material_id') material_id?: string,
    @Query('status') status?: string,
    @Query('is_sample') is_sample?: string,
    @Query('manufacturer_name') manufacturer_name?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const filter: InventoryLotSearchParams = {};
    if (material_id) filter.material_id = material_id;
    if (status) filter.status = status as any;
    if (is_sample) filter.is_sample = is_sample === 'true';
    if (manufacturer_name) filter.manufacturer_name = manufacturer_name;

    return await this.inventoryLotService.filterLots(
      filter,
      parseInt(page, 10),
      parseInt(limit, 10),
    );
  }

  @Get('material/:material_id')
  async findByMaterialId(
    @Param('material_id') material_id: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return await this.inventoryLotService.findByMaterialId(
      material_id,
      parseInt(page, 10),
      parseInt(limit, 10),
    );
  }

  @Get('status/:status')
  async findByStatus(
    @Param('status') status: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return await this.inventoryLotService.findByStatus(
      status,
      parseInt(page, 10),
      parseInt(limit, 10),
    );
  }

  @Get('samples/:parent_lot_id')
  async findSamplesByParentLot(@Param('parent_lot_id') parent_lot_id: string) {
    return await this.inventoryLotService.findSamplesByParentLot(parent_lot_id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.inventoryLotService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) dto: UpdateInventoryLotDto,
  ) {
    return await this.inventoryLotService.update(id, dto);
  }

  @Put(':id/status/:status')
  async updateStatus(@Param('id') id: string, @Param('status') status: string) {
    return await this.inventoryLotService.updateStatus(id, status);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.inventoryLotService.delete(id);
  }
}
