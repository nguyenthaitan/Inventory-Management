import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { InventoryTransactionService } from './inventory-transaction.service';
import { CreateInventoryTransactionDto } from './dto/create-inventory-transaction.dto';
import { UpdateInventoryTransactionDto } from './dto/update-inventory-transaction.dto';

@Controller('transactions')
export class InventoryTransactionController {
  constructor(private readonly service: InventoryTransactionService) {}

  // danh sách với filter & paging
  @Get()
  async findAll(
    @Query('lot_id') lot_id?: string,
    @Query('transaction_type') transaction_type?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const filters: any = {};
    if (lot_id) filters.lot_id = lot_id;
    if (transaction_type) filters.transaction_type = transaction_type;
    if (from) filters.from = new Date(from);
    if (to) filters.to = new Date(to);

    const paging = { page: parseInt(page, 10), limit: parseInt(limit, 10) };
    return this.service.getAll(filters, paging);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getOne(id);
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() dto: CreateInventoryTransactionDto) {
    return this.service.create(dto);
  }

  @Post('bulk')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async createBulk(@Body() dtos: CreateInventoryTransactionDto[]) {
    return this.service.createMany(dtos);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInventoryTransactionDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
