import { Module } from '@nestjs/common';
import { MongoModule } from './database/mongo/mongo.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [MongoModule, CatalogModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
