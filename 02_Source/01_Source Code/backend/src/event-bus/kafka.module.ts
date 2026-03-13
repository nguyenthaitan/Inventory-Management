import { Global, Module } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { KafkaConfigService } from './kafka.config';
import { KafkaService } from './kafka.service';
import { Dispatcher } from './dispatcher';
import { KafkaConsumerService } from './kafka.consumer.service';

// Module toàn cục chứa các provider liên quan đến Kafka.
// Bất kỳ module nào import AppModule sẽ có thể inject các
// provider này mà không cần import lại KafkaModule.

@Global()
@Module({
  providers: [
    // config lấy từ biến môi trường qua ConfigService
    KafkaConfigService,
    // tạo Kafka client chung (kafkajs.Kafka) sử dụng cấu hình phía trên
    {
      provide: 'KAFKA_CLIENT',
      useFactory: (cfg: KafkaConfigService) => {
        const config: any = {
          clientId: cfg.clientId,
          brokers: cfg.brokers,
        };
        // nếu bật ssl thì thêm option
        if (cfg.ssl) {
          config.ssl = true;
        }
        // nếu cần SASL credentials thì ghép vào
        if (cfg.sasl) {
          config.sasl = cfg.sasl;
        }
        return new Kafka(config);
      },
      inject: [KafkaConfigService],
    },
    // tạo producer singleton và kết nối ngay khi module khởi tạo
    {
      provide: 'KAFKA_PRODUCER',
      useFactory: async (client: Kafka) => {
        const producer = client.producer();
        // kết nối đến broker khi ứng dụng khởi động
        await producer.connect();
        return producer;
      },
      inject: ['KAFKA_CLIENT'],
    },
    // dịch vụ tiện ích bọc producer để dùng tại các service khác
    KafkaService,
    // bộ điều phối nội bộ, đăng ký handler bởi các module khác
    Dispatcher,
    // consumer chạy background để lắng nghe các topic
    KafkaConsumerService,
  ],
  // xuất producer, dispatcher và service ra toàn bộ ứng dụng
  exports: ['KAFKA_PRODUCER', KafkaService, Dispatcher],
})
export class KafkaModule {}
