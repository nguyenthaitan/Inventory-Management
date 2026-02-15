import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { Material, MaterialSchema } from './schemas/material.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Material.name, schema: MaterialSchema }]),
  ],
  controllers: [CatalogController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
