import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const uri =
          configService.get<string>('MONGO_URI') ||
          'mongodb://localhost:27017/mydatabase';

        console.log('--- Database URI:', uri);

        return { uri };
      },
      inject: [ConfigService],
    }),
  ],
})
export class MongoModule {}
