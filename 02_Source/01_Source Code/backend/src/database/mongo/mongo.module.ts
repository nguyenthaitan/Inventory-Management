import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://admin:password123@localhost:27017/inventory_management_db?authSource=admin'),
  ],
})
export class MongoModule {}
