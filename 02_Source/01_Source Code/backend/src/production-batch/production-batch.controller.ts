import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ProductionBatchService } from './production-batch.service';

@Controller('production-batches')
export class ProductionBatchController {
  constructor(private readonly productionBatchService: ProductionBatchService) {}

  @Get()
  findAll() {
    return this.productionBatchService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productionBatchService.findOne(id);
  }

  @Post()
  create(@Body() dto: any) {
    return this.productionBatchService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.productionBatchService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productionBatchService.remove(id);
  }
}
