import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MaterialService } from './material.service';
import { MaterialController } from './material.controller';
import { Material, MaterialSchema } from '../schemas/material.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Material.name, schema: MaterialSchema },
    ]),
  ],
  controllers: [MaterialController],
  providers: [MaterialService],
  exports: [MaterialService], // Export for use in other modules
})
export class MaterialModule {}
