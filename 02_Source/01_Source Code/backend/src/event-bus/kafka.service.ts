import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { type Producer, RecordMetadata } from 'kafkajs';

// Service tiện ích xử lý publish message lên Kafka.
// Đóng gói producer dùng chung và cung cấp API đơn giản cho các module khác.
// Khi ứng dụng tắt, producer sẽ được disconnect tự động (OnModuleDestroy).
@Injectable()
export class KafkaService implements OnModuleDestroy {
  // inject producer đã được tạo trong KafkaModule
  constructor(@Inject('KAFKA_PRODUCER') private readonly producer: Producer) {}

  /**
   * Gửi một hoặc nhiều message tới topic.
   * @param topic tên topic Kafka
   * @param messages danh sách object chứa key (tuỳ chọn) và value (có thể là bất kỳ, sẽ stringify nếu không phải string)
   * @returns metadata của các bản ghi đã gửi
   */
  async publish(topic: string, messages: Array<{ key?: string; value: any }>) {
    // kafkajs yêu cầu value phải là Buffer hoặc string
    const kafkaMsgs = messages.map((m) => ({
      key: m.key,
      value: typeof m.value === 'string' ? m.value : JSON.stringify(m.value),
    }));
    const result: RecordMetadata[] = await this.producer.send({
      topic,
      messages: kafkaMsgs,
    });
    return result;
  }

  // khi module bị hủy (ứng dụng shutdown) sẽ ngắt kết nối producer
  async onModuleDestroy() {
    await this.producer.disconnect();
  }
}
