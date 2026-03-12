import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HfInference } from '@huggingface/inference';
import {
  SupplierPerformanceRecord,
  SupplierAnalysisResponseDto,
} from './dto/supplier-analysis.dto';

@Injectable()
export class AiSupplierService {
  private readonly logger = new Logger(AiSupplierService.name);
  private hf: HfInference;
  private model: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('HUGGINGFACE_API_KEY');
    this.model =
      this.configService.get<string>('HUGGINGFACE_MODEL') ||
      'Qwen/Qwen2.5-72B-Instruct';

    if (!apiKey) {
      this.logger.error('HUGGINGFACE_API_KEY is not configured');
      throw new Error('HuggingFace API key is required');
    }

    this.hf = new HfInference(apiKey);
    this.logger.log(
      `AI Supplier Service initialized with model: ${this.model}`,
    );
  }

  async analyzeSuppliers(
    suppliers: SupplierPerformanceRecord[],
  ): Promise<SupplierAnalysisResponseDto> {
    try {
      this.logger.log(`Analyzing ${suppliers.length} suppliers`);

      const systemPrompt = `Bạn là chuyên gia quản lý chuỗi cung ứng và kiểm soát chất lượng với hơn 10 năm kinh nghiệm trong ngành dược phẩm và thực phẩm chức năng. Nhiệm vụ của bạn là phân tích hiệu suất các nhà cung cấp dựa trên dữ liệu QC test và đưa ra:
1. Xếp hạng rủi ro (Thấp / Trung bình / Cao) cho từng nhà cung cấp
2. Nhận xét ngắn gọn điểm mạnh / yếu
3. Khuyến nghị hành động: tiếp tục hợp tác, tăng cường giám sát, hoặc xem xét thay thế
Trả lời bằng tiếng Việt, chuyên nghiệp, có cấu trúc rõ ràng theo từng nhà cung cấp.`;

      const tableRows = suppliers
        .map(
          (s, i) =>
            `${i + 1}. ${s.supplier_name} | Tổng lô: ${s.total_batches} | Đạt: ${s.approved} | Không đạt: ${s.rejected} | Tỷ lệ chất lượng: ${s.quality_rate}%`,
        )
        .join('\n');

      const userPrompt = `Phân tích hiệu suất các nhà cung cấp sau dựa trên dữ liệu QC test:

${tableRows}

Lưu ý: Tỷ lệ chất lượng < 80% được coi là rủi ro cao, 80-95% là trung bình, > 95% là thấp.

Hãy phân tích từng nhà cung cấp và đưa ra tổng kết cuối.`;

      const response = await this.hf.chatCompletion({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 600,
        temperature: 0.7,
      });

      const analysis =
        response.choices[0]?.message?.content || 'Không có phản hồi từ AI';

      this.logger.log('Supplier analysis completed successfully');

      return {
        success: true,
        analysis: analysis.trim(),
        suppliers_analyzed: suppliers.length,
        timestamp: new Date().toISOString(),
        model_used: this.model,
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Error analyzing suppliers: ${err.message}`, err.stack);
      return {
        success: false,
        analysis: `Lỗi khi phân tích: ${err.message}. Vui lòng kiểm tra lại cấu hình API hoặc thử lại sau.`,
        suppliers_analyzed: suppliers.length,
        timestamp: new Date().toISOString(),
        model_used: this.model,
      };
    }
  }

  async analyzeOneSupplier(
    supplier: SupplierPerformanceRecord,
  ): Promise<SupplierAnalysisResponseDto> {
    try {
      this.logger.log(`Analyzing supplier: ${supplier.supplier_name}`);

      const riskLevel =
        supplier.quality_rate < 80
          ? 'CAO'
          : supplier.quality_rate < 95
            ? 'TRUNG BÌNH'
            : 'THẤP';

      const systemPrompt = `Bạn là chuyên gia quản lý chuỗi cung ứng và kiểm soát chất lượng với hơn 10 năm kinh nghiệm trong ngành dược phẩm và thực phẩm chức năng. Nhiệm vụ của bạn là phân tích chi tiết hiệu suất một nhà cung cấp và đưa ra nhận xét chuyên sâu, khuyến nghị cụ thể. Trả lời bằng tiếng Việt, chuyên nghiệp.`;

      const userPrompt = `Phân tích chi tiết nhà cung cấp sau:

Tên nhà cung cấp: ${supplier.supplier_name}
Tổng số lô hàng: ${supplier.total_batches}
Số lô đạt QC: ${supplier.approved}
Số lô không đạt QC: ${supplier.rejected}
Tỷ lệ chất lượng: ${supplier.quality_rate}%
Mức rủi ro ước tính: ${riskLevel}

Yêu cầu phân tích:
1. Đánh giá tổng thể hiệu suất nhà cung cấp
2. Phân tích điểm mạnh và điểm yếu
3. Xác định rủi ro tiềm ẩn nếu có
4. Đưa ra khuyến nghị hành động cụ thể (ví dụ: tăng tần suất kiểm tra, yêu cầu cải thiện, hoặc xem xét chấm dứt hợp đồng)`;

      const response = await this.hf.chatCompletion({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 400,
        temperature: 0.7,
      });

      const analysis =
        response.choices[0]?.message?.content || 'Không có phản hồi từ AI';

      this.logger.log(
        `Single supplier analysis completed for: ${supplier.supplier_name}`,
      );

      return {
        success: true,
        analysis: analysis.trim(),
        suppliers_analyzed: 1,
        timestamp: new Date().toISOString(),
        model_used: this.model,
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `Error analyzing supplier ${supplier.supplier_name}: ${err.message}`,
        err.stack,
      );
      return {
        success: false,
        analysis: `Lỗi khi phân tích: ${err.message}. Vui lòng kiểm tra lại cấu hình API hoặc thử lại sau.`,
        suppliers_analyzed: 1,
        timestamp: new Date().toISOString(),
        model_used: this.model,
      };
    }
  }

  async testConnection(): Promise<{ connected: boolean; model: string }> {
    try {
      const testResponse = await this.hf.chatCompletion({
        model: this.model,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10,
      });

      return {
        connected: !!testResponse,
        model: this.model,
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Connection test failed: ${err.message}`);
      return {
        connected: false,
        model: this.model,
      };
    }
  }
}
