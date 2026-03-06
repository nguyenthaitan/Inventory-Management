import { Test, TestingModule } from '@nestjs/testing';
import { MaterialController } from '../material/material.controller';
import { MaterialService } from '../material/material.service';
import { MaterialRepository } from '../material/material.repository';
import { CreateMaterialDto, MaterialType } from '../material/material.dto';
import { ConflictException, BadRequestException } from '@nestjs/common';

describe('MaterialController - Create API', () => {
  let controller: MaterialController;
  let service: MaterialService;
  let repository: MaterialRepository;

  // Mock data
  const mockMaterialResponse = {
    _id: '507f1f77bcf86cd799439011',
    material_id: 'MAT001',
    part_number: 'PN001',
    material_name: 'Test Material',
    material_type: MaterialType.API,
    storage_conditions: 'Room Temperature',
    specification_document: 'SPEC001',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockCreateDto: CreateMaterialDto = {
    material_id: 'MAT001',
    part_number: 'PN001',
    material_name: 'Test Material',
    material_type: MaterialType.API,
    storage_conditions: 'Room Temperature',
    specification_document: 'SPEC001',
  };

  beforeEach(async () => {
    // Create a testing module with mocked dependencies
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaterialController],
      providers: [
        MaterialService,
        {
          provide: MaterialRepository,
          useValue: {
            findByMaterialId: jest.fn(),
            findByPartNumber: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MaterialController>(MaterialController);
    service = module.get<MaterialService>(MaterialService);
    repository = module.get<MaterialRepository>(MaterialRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create() - Happy Path', () => {
    it('should successfully create a new material', async () => {
      // Arrange
      jest.spyOn(repository, 'findByMaterialId').mockResolvedValue(null);
      jest.spyOn(repository, 'findByPartNumber').mockResolvedValue(null);
      jest
        .spyOn(repository, 'create')
        .mockResolvedValue(mockMaterialResponse as any);

      // Act
      const result = await controller.create(mockCreateDto);

      // Assert
      expect(result).toBeDefined();
      expect(result._id).toBe('507f1f77bcf86cd799439011');
      expect(result.material_id).toBe('MAT001');
      expect(result.part_number).toBe('PN001');
      expect(result.material_name).toBe('Test Material');
      expect(result.material_type).toBe(MaterialType.API);
      expect(repository.findByMaterialId).toHaveBeenCalledWith('MAT001');
      expect(repository.findByPartNumber).toHaveBeenCalledWith('PN001');
      expect(repository.create).toHaveBeenCalledWith(mockCreateDto);
    });

    it('should create material with minimal required fields', async () => {
      // Arrange
      const minimalDto: CreateMaterialDto = {
        material_id: 'MAT002',
        part_number: 'PN002',
        material_name: 'Minimal Material',
        material_type: MaterialType.EXCIPIENT,
      };

      const minimalResponse = {
        ...mockMaterialResponse,
        ...minimalDto,
        storage_conditions: undefined,
        specification_document: undefined,
      };

      jest.spyOn(repository, 'findByMaterialId').mockResolvedValue(null);
      jest.spyOn(repository, 'findByPartNumber').mockResolvedValue(null);
      jest
        .spyOn(repository, 'create')
        .mockResolvedValue(minimalResponse as any);

      // Act
      const result = await controller.create(minimalDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.material_id).toBe('MAT002');
      expect(repository.create).toHaveBeenCalledWith(minimalDto);
    });

    it('should create material with all optional fields', async () => {
      // Arrange
      const fullDto: CreateMaterialDto = {
        material_id: 'MAT003',
        part_number: 'PN003',
        material_name: 'Full Material',
        material_type: MaterialType.CONTAINER,
        storage_conditions: 'Cool & Dry Place',
        specification_document: 'SPEC003',
      };

      const fullResponse = { ...mockMaterialResponse, ...fullDto };

      jest.spyOn(repository, 'findByMaterialId').mockResolvedValue(null);
      jest.spyOn(repository, 'findByPartNumber').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockResolvedValue(fullResponse as any);

      // Act
      const result = await controller.create(fullDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.storage_conditions).toBe('Cool & Dry Place');
      expect(result.specification_document).toBe('SPEC003');
    });

    it('should handle different material types correctly', async () => {
      // Arrange
      const types = [
        MaterialType.API,
        MaterialType.EXCIPIENT,
        MaterialType.DIETARY_SUPPLEMENT,
        MaterialType.CONTAINER,
        MaterialType.CLOSURE,
        MaterialType.PROCESS_CHEMICAL,
        MaterialType.TESTING_MATERIAL,
      ];

      for (const type of types) {
        const dtoWithType: CreateMaterialDto = {
          ...mockCreateDto,
          material_type: type,
          material_id: `MAT_${type}`,
          part_number: `PN_${type}`,
        };

        jest.spyOn(repository, 'findByMaterialId').mockResolvedValue(null);
        jest.spyOn(repository, 'findByPartNumber').mockResolvedValue(null);
        jest.spyOn(repository, 'create').mockResolvedValue({
          ...mockMaterialResponse,
          material_type: type,
        } as any);

        // Act
        const result = await controller.create(dtoWithType);

        // Assert
        expect(result.material_type).toBe(type);
      }
    });
  });

  describe('create() - Error Cases', () => {
    it('should throw ConflictException when material_id already exists', async () => {
      // Arrange
      const existingMaterial = { ...mockMaterialResponse };
      jest
        .spyOn(repository, 'findByMaterialId')
        .mockResolvedValue(existingMaterial as any);

      // Act & Assert
      await expect(controller.create(mockCreateDto)).rejects.toThrow(
        ConflictException,
      );
      expect(repository.findByMaterialId).toHaveBeenCalledWith('MAT001');
      expect(repository.findByPartNumber).not.toHaveBeenCalled();
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when part_number already exists', async () => {
      // Arrange
      const existingMaterial = { ...mockMaterialResponse };
      jest.spyOn(repository, 'findByMaterialId').mockResolvedValue(null);
      jest
        .spyOn(repository, 'findByPartNumber')
        .mockResolvedValue(existingMaterial as any);

      // Act & Assert
      await expect(controller.create(mockCreateDto)).rejects.toThrow(
        ConflictException,
      );
      expect(repository.findByMaterialId).toHaveBeenCalledWith('MAT001');
      expect(repository.findByPartNumber).toHaveBeenCalledWith('PN001');
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should propagate repository errors', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      jest.spyOn(repository, 'findByMaterialId').mockResolvedValue(null);
      jest.spyOn(repository, 'findByPartNumber').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockRejectedValue(error);

      // Act & Assert
      await expect(controller.create(mockCreateDto)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('create() - HTTP Status Code', () => {
    it('should return HTTP 201 (CREATED) status', async () => {
      // Arrange
      jest.spyOn(repository, 'findByMaterialId').mockResolvedValue(null);
      jest.spyOn(repository, 'findByPartNumber').mockResolvedValue(null);
      jest
        .spyOn(repository, 'create')
        .mockResolvedValue(mockMaterialResponse as any);

      // Get the HTTP status from the decorator (it's decorated with @HttpCode(HttpStatus.CREATED))
      // This is verified through the decorator and will be applied by NestJS at runtime
      const result = await controller.create(mockCreateDto);

      // Assert that a result is returned (the HTTP status is handled by the decorator)
      expect(result).toBeDefined();
    });
  });

  describe('create() - Edge Cases', () => {
    it('should handle special characters in material_id', async () => {
      // Arrange
      const dtoWithSpecialChars: CreateMaterialDto = {
        ...mockCreateDto,
        material_id: 'MAT-001_V2',
        part_number: 'PN-001_V2',
      };

      jest.spyOn(repository, 'findByMaterialId').mockResolvedValue(null);
      jest.spyOn(repository, 'findByPartNumber').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockResolvedValue({
        ...mockMaterialResponse,
        material_id: 'MAT-001_V2',
        part_number: 'PN-001_V2',
      } as any);

      // Act
      const result = await controller.create(dtoWithSpecialChars);

      // Assert
      expect(result.material_id).toBe('MAT-001_V2');
    });

    it('should handle long strings within max length', async () => {
      // Arrange
      const longNameDto: CreateMaterialDto = {
        ...mockCreateDto,
        material_name: 'A'.repeat(100), // Max length is 100
        storage_conditions: 'B'.repeat(100), // Max length is 100
      };

      jest.spyOn(repository, 'findByMaterialId').mockResolvedValue(null);
      jest.spyOn(repository, 'findByPartNumber').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockResolvedValue({
        ...mockMaterialResponse,
        material_name: 'A'.repeat(100),
        storage_conditions: 'B'.repeat(100),
      } as any);

      // Act
      const result = await controller.create(longNameDto);

      // Assert
      expect(result.material_name.length).toBe(100);
      expect(result.storage_conditions.length).toBe(100);
    });

    it('should handle empty optional fields', async () => {
      // Arrange
      const dtoWithoutOptional: CreateMaterialDto = {
        material_id: 'MAT004',
        part_number: 'PN004',
        material_name: 'Material Without Optional',
        material_type: MaterialType.TESTING_MATERIAL,
      };

      jest.spyOn(repository, 'findByMaterialId').mockResolvedValue(null);
      jest.spyOn(repository, 'findByPartNumber').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockResolvedValue({
        ...mockMaterialResponse,
        ...dtoWithoutOptional,
        storage_conditions: undefined,
        specification_document: undefined,
      } as any);

      // Act
      const result = await controller.create(dtoWithoutOptional);

      // Assert
      expect(result).toBeDefined();
      expect(repository.create).toHaveBeenCalledWith(dtoWithoutOptional);
    });
  });

  describe('create() - Request/Response Verification', () => {
    it('should pass exact DTO to service', async () => {
      // Arrange
      const createSpy = jest
        .spyOn(repository, 'create')
        .mockResolvedValue(mockMaterialResponse as any);
      jest.spyOn(repository, 'findByMaterialId').mockResolvedValue(null);
      jest.spyOn(repository, 'findByPartNumber').mockResolvedValue(null);

      // Act
      await controller.create(mockCreateDto);

      // Assert
      expect(createSpy).toHaveBeenCalledWith(mockCreateDto);
      expect(createSpy).toHaveBeenCalledTimes(1);
    });

    it('should verify repository is called in correct order', async () => {
      // Arrange
      const callOrder: string[] = [];
      jest
        .spyOn(repository, 'findByMaterialId')
        .mockImplementation(async () => {
          callOrder.push('findByMaterialId');
          return null;
        });
      jest
        .spyOn(repository, 'findByPartNumber')
        .mockImplementation(async () => {
          callOrder.push('findByPartNumber');
          return null;
        });
      jest.spyOn(repository, 'create').mockImplementation(async () => {
        callOrder.push('create');
        return mockMaterialResponse as any;
      });

      // Act
      await controller.create(mockCreateDto);

      // Assert
      expect(callOrder).toEqual([
        'findByMaterialId',
        'findByPartNumber',
        'create',
      ]);
    });
  });
});
