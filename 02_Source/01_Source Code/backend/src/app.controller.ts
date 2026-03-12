import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getApiInfo() {
    return {
      name: 'Inventory Management API',
      version: '1.0.0',
      status: 'running',
      endpoints: ['/materials', '/inventory-lots', '/production-batches', '/label-templates'],
    };
  }
}
