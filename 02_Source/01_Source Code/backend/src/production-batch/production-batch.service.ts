import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Material, MaterialDocument } from '../schemas/material.schema';
import { ProductionBatchRepository } from './production-batch.repository';
import {
  CreateProductionBatchDto,
  BatchStatus,
} from './dto/create-production-batch.dto';
import { UpdateProductionBatchDto } from './dto/update-production-batch.dto';
import { QCTestService } from '../qc-test/qc-test.service';
import {
  ProductionBatchResponseDto,
  PaginatedProductionBatchResponseDto,
} from './production-batch.dto';

// Valid status transitions: current status -> allowed next statuses
const STATUS_TRANSITIONS: Record<string, string[]> = {
  [BatchStatus.InProgress]: [
    BatchStatus.Complete,
    BatchStatus.OnHold,
    BatchStatus.Cancelled,
  ],
  [BatchStatus.OnHold]: [BatchStatus.InProgress, BatchStatus.Cancelled],
  [BatchStatus.Complete]: [],
  [BatchStatus.Cancelled]: [],
};

/**
 * ProductionBatch Service
 * Contains business logic for ProductionBatch operations
 */
@Injectable()
export class ProductionBatchService {
  private readonly logger = new Logger(ProductionBatchService.name);

  constructor(
    private readonly repository: ProductionBatchRepository,
    @InjectModel(Material.name)
    private readonly materialModel: Model<MaterialDocument>,
    @Inject(forwardRef(() => QCTestService))
    private readonly qcTestService: QCTestService,
  ) {}

  /**
   * Create a new production batch
   * Validates: batch_number unique, expiration_date > manufacture_date, product_id exists
   * @param createDto - Batch creation data
   * @returns Created batch response
   * @throws ConflictException - If batch_number already exists
   * @throws BadRequestException - If date range invalid
   * @throws NotFoundException - If product_id does not exist in Materials
   */
  async create(
    createDto: CreateProductionBatchDto,
  ): Promise<ProductionBatchResponseDto> {
    this.logger.log(`Creating production batch: ${createDto.batch_number}`);

    // Check batch_number uniqueness
    const existingBatch = await this.repository.findByBatchNumber(
      createDto.batch_number,
    );
    if (existingBatch) {
      this.logger.warn(
        `Duplicate batch_number attempted: ${createDto.batch_number}`,
      );
      throw new ConflictException(
        `Batch number '${createDto.batch_number}' already exists`,
      );
    }

    // Validate date range: expiration_date must be after manufacture_date
    const manufactureDate = new Date(createDto.manufacture_date);
    const expirationDate = new Date(createDto.expiration_date);
    if (expirationDate <= manufactureDate) {
      throw new BadRequestException(
        'expiration_date must be after manufacture_date',
      );
    }

    // Validate product_id exists in Materials
    const product = await this.materialModel
      .findOne({ material_id: createDto.product_id })
      .exec();
    if (!product) {
      throw new NotFoundException(
        `Product (material) with ID '${createDto.product_id}' not found`,
      );
    }

    const batch = await this.repository.create(createDto);
    this.logger.log(`Production batch created successfully: ${batch.batch_id}`);

    return this.toResponseDto(batch);
  }

  /**
   * Get all production batches with pagination
   * @param page - Page number (1-indexed)
   * @param limit - Records per page
   * @returns Paginated batch response
   */
  async findAll(
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedProductionBatchResponseDto> {
    if (page < 1) throw new BadRequestException('Page must be >= 1');
    if (limit < 1) throw new BadRequestException('Limit must be >= 1');
    if (limit > 100) {
      this.logger.warn(`Limit capped at 100, requested: ${limit}`);
      limit = 100;
    }

    this.logger.debug(
      `Finding all production batches - page: ${page}, limit: ${limit}`,
    );

    const result = await this.repository.findAll(page, limit);

    return {
      data: result.data.map((b) => this.toResponseDto(b)),
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  /**
   * Get a single production batch by batch_id
   * @param batchId - Batch UUID
   * @returns Batch response
   * @throws NotFoundException - If batch not found
   */
  async findOne(batchId: string): Promise<ProductionBatchResponseDto> {
    this.logger.debug(`Finding production batch: ${batchId}`);

    const batch = await this.repository.findOne(batchId);
    if (!batch) {
      throw new NotFoundException(
        `Production batch with ID '${batchId}' not found`,
      );
    }

    return this.toResponseDto(batch);
  }

  /**
   * Get all batches for a given product (material)
   * @param productId - Material product_id
   * @param page - Page number
   * @param limit - Records per page
   * @returns Paginated batch response
   */
  async findByProductId(
    productId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedProductionBatchResponseDto> {
    if (page < 1) throw new BadRequestException('Page must be >= 1');
    if (limit < 1) throw new BadRequestException('Limit must be >= 1');

    this.logger.debug(`Finding batches for product_id: ${productId}`);

    const result = await this.repository.findByProductId(
      productId,
      page,
      limit,
    );

    return {
      data: result.data.map((b) => this.toResponseDto(b)),
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  /**
   * Get all batches with a given status
   * @param status - BatchStatus value
   * @param page - Page number
   * @param limit - Records per page
   * @returns Paginated batch response
   */
  async findByStatus(
    status: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedProductionBatchResponseDto> {
    const validStatuses = Object.values(BatchStatus) as string[];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(
        `Invalid status '${status}'. Must be one of: ${validStatuses.join(', ')}`,
      );
    }
    if (page < 1) throw new BadRequestException('Page must be >= 1');
    if (limit < 1) throw new BadRequestException('Limit must be >= 1');

    this.logger.debug(`Finding batches by status: ${status}`);

    const result = await this.repository.findByStatus(status, page, limit);

    return {
      data: result.data.map((b) => this.toResponseDto(b)),
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  /**
   * Update a production batch
   * Validates status state-machine transitions if status is being changed
   * @param batchId - Batch UUID
   * @param updateDto - Fields to update
   * @returns Updated batch response
   * @throws NotFoundException - If batch not found
   * @throws BadRequestException - If status transition is invalid or date range invalid
   */
  async update(
    batchId: string,
    updateDto: UpdateProductionBatchDto,
  ): Promise<ProductionBatchResponseDto> {
    this.logger.log(`Updating production batch: ${batchId}`);

    const existing = await this.repository.findOne(batchId);
    if (!existing) {
      throw new NotFoundException(
        `Production batch with ID '${batchId}' not found`,
      );
    }

    // Validate status transition if status is being changed
    if (updateDto.status && updateDto.status !== (existing.status as string)) {
      const allowed = STATUS_TRANSITIONS[existing.status] ?? [];
      if (!allowed.includes(updateDto.status)) {
        throw new BadRequestException(
          `Cannot transition status from '${existing.status}' to '${updateDto.status}'. ` +
            `Allowed transitions: ${allowed.length ? allowed.join(', ') : 'none'}`,
        );
      }
    }

    // Validate date range if either date is being updated
    const manufactureDate = new Date(
      updateDto.manufacture_date ?? existing.manufacture_date,
    );
    const expirationDate = new Date(
      updateDto.expiration_date ?? existing.expiration_date,
    );
    if (expirationDate <= manufactureDate) {
      throw new BadRequestException(
        'expiration_date must be after manufacture_date',
      );
    }

    const updated = await this.repository.update(batchId, updateDto);
    this.logger.log(`Production batch updated successfully: ${batchId}`);

    // Phase 3 - QC Integration: Auto-create InventoryLot when batch is Complete
    // Reference: QC_INTEGRATION_NEEDS.md section 2.1
    if (
      updateDto.status === BatchStatus.Complete &&
      (updated?.status as string) === BatchStatus.Complete
    ) {
      try {
        await this.qcTestService.createLotFromProdBatch(batchId);
        this.logger.log(`Inventory lot auto-created from batch ${batchId}`);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.warn(
          `Failed to auto-create inventory lot for batch ${batchId}: ${errorMessage}`,
        );
        // Don't throw — batch completion is independent of inventory lot creation
      }
    }

    return this.toResponseDto(updated);
  }

  /**
   * Delete a production batch
   * Batches with status 'In Progress' cannot be deleted
   * @param batchId - Batch UUID
   * @returns Deletion confirmation message
   * @throws NotFoundException - If batch not found
   * @throws BadRequestException - If batch is In Progress
   */
  async remove(batchId: string): Promise<{ message: string }> {
    this.logger.log(`Deleting production batch: ${batchId}`);

    const existing = await this.repository.findOne(batchId);
    if (!existing) {
      throw new NotFoundException(
        `Production batch with ID '${batchId}' not found`,
      );
    }

    if ((existing.status as string) === BatchStatus.InProgress) {
      throw new BadRequestException(
        `Cannot delete a production batch with status 'In Progress'. ` +
          `Please cancel or complete the batch first.`,
      );
    }

    await this.repository.remove(batchId);
    this.logger.log(`Production batch deleted successfully: ${batchId}`);

    return { message: `Production batch '${batchId}' deleted successfully` };
  }

  /**
   * Convert a ProductionBatch document to response DTO
   * Handles Decimal128 → string serialization for batch_size
   */
  private toResponseDto(batch: any): ProductionBatchResponseDto {
    return {
      _id: batch._id?.toString() ?? '',
      batch_id: batch.batch_id,
      product_id: batch.product_id,
      batch_number: batch.batch_number,
      unit_of_measure: batch.unit_of_measure,
      manufacture_date: batch.manufacture_date,
      expiration_date: batch.expiration_date,
      status: batch.status,
      batch_size: batch.batch_size?.toString() ?? '0',
      created_date: batch.created_date,
      modified_date: batch.modified_date,
    };
  }
}
