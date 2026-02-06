import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI') || 'mongodb+srv://admin:123@inventorymanagement.kbyjdmp.mongodb.net/inventory_management_db?appName=InventoryManagement',
      }),
      inject: [ConfigService],
    }),
  ],
})
export class MongoModule {}
