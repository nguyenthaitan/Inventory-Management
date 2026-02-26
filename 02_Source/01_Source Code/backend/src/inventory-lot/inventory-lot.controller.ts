import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { InventoryLotService } from './inventory-lot.service';

@Controller('inventory-lots')
export class InventoryLotController {
  constructor(private readonly inventoryLotService: InventoryLotService) {}

  @Get()
  findAll() {
    return this.inventoryLotService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventoryLotService.findOne(id);
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
