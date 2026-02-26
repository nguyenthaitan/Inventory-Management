import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MaterialModule } from './material/material.module';
import { InventoryLotModule } from './inventory-lot/inventory-lot.module';

@Module({
  imports: [MaterialModule, InventoryLotModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
