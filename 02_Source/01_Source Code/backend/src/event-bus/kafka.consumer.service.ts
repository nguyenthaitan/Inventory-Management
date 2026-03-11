import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Kafka, Consumer } from 'kafkajs';
import { Topics } from './topics.enum';
import { Dispatcher } from './dispatcher';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private consumer: Consumer;

  constructor(
    @Inject('KAFKA_CLIENT') private readonly kafka: Kafka,
    private readonly dispatcher: Dispatcher,
  ) {
    // groupId nên được cấu hình theo môi trường hoặc constant
    this.consumer = this.kafka.consumer({ groupId: 'inventory-group' });
  }

  async onModuleInit() {
    await this.consumer.connect();
    // đăng ký những topic cần đọc
    await this.consumer.subscribe({
      topic: Topics.InventoryTransactions,
      fromBeginning: false,
    });
    await this.consumer.subscribe({
      topic: Topics.AuditLogs,
      fromBeginning: false,
    });

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const value = message.value?.toString() || '';
        try {
          const event = JSON.parse(value);
          await this.dispatcher.dispatch(event);
        } catch (err) {
          // handle parse error / logging
          console.error('failed to process message', err);
        }
      },
    });
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }
}
