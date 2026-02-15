import { Controller, Get } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { Material } from './schemas/material.schema';

@Controller('materials')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  async getMaterials(): Promise<Material[]> {
    return this.catalogService.findAll();
  }
}
