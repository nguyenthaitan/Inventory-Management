import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { InventoryLotService } from './inventory-lot.service';

@Controller('inventory-lots')
export class InventoryLotController {
  constructor(private readonly inventoryLotService: InventoryLotService) {}

  @Get()
  findAll(@Query('status') status?: string) {
    return this.inventoryLotService.findAll(status);
  }

  @Post('bulk-quarantine')
  bulkQuarantine(@Body() dto: { lot_ids: string[] }) {
    return this.inventoryLotService.bulkQuarantine(dto.lot_ids);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventoryLotService.getLotById(id);
  }

  @Post()
  create(@Body() dto: any) {
    return this.inventoryLotService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.inventoryLotService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inventoryLotService.remove(id);
  }
}

