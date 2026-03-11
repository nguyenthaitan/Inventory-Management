import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KafkaConfigService {
  constructor(private readonly config: ConfigService) {}

  /** danh sách brokers phân cách bằng dấu phẩy hoặc lấy từ biến môi trường */
  get brokers(): string[] {
    return this.config
      .get<string>('KAFKA_BROKERS', 'localhost:9092')
      .split(',');
  }

  get clientId(): string {
    return this.config.get<string>('KAFKA_CLIENT_ID', 'inventory-app');
  }

  /** các cấu hình thêm tùy chọn */
  get ssl(): boolean {
    return this.config.get<string>('KAFKA_SSL', 'false') === 'true';
  }

  // chỉ trả lại thông tin SASL khi cơ chế được thiết lập; đảm bảo giá trị là chuỗi
  get sasl():
    | { mechanism: string; username: string; password: string }
    | undefined {
    const mech = this.config.get<string>('KAFKA_SASL_MECHANISM');
    if (mech) {
      return {
        mechanism: mech,
        username: this.config.get<string>('KAFKA_SASL_USERNAME', ''),
        password: this.config.get<string>('KAFKA_SASL_PASSWORD', ''),
      };
    }
    return undefined;
  }
}
