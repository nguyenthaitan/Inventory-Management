import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { MaterialService } from './material.service';

@Controller('materials')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  // example CRUD endpoints (to be implemented)
  @Get()
  findAll() {
    return this.materialService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.materialService.findOne(id);
  }

  @Post()
  create(@Body() createDto: any) {
    return this.materialService.create(createDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.materialService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.materialService.remove(id);
  }
}
