# Material Module Implementation Plan

**Document Version:** 1.0  
**Created Date:** March 6, 2026  
**Target System:** Inventory Management System  
**Module:** Material Management (Core Foundation Module)

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Requirements Analysis](#requirements-analysis)
3. [Database Schema Design](#database-schema-design)
4. [Backend Implementation Plan](#backend-implementation-plan)
5. [Frontend Implementation Plan](#frontend-implementation-plan)
6. [Testing Strategy](#testing-strategy)
7. [Integration Points](#integration-points)
8. [Implementation Phases](#implementation-phases)
9. [Acceptance Criteria](#acceptance-criteria)
10. [Rollout Plan](#rollout-plan)

---

## 1. Executive Summary

### Overview
The Material module is the **foundational master data module** for the Inventory Management System. It manages information about raw materials, APIs, excipients, containers, closures, process chemicals, and testing materials.

### Priority: **P0 - Critical**
This module must be implemented first as it is a dependency for:
- InventoryLots (references material_id)
- ProductionBatches (references product_id which is a Material)
- QC Testing (tests are performed on materials)
- Label Generation (labels are generated for materials)

### Estimated Effort
- **Backend Development:** 5 person-days
- **Frontend Development:** 5 person-days
- **Testing & Integration:** 3 person-days
- **Documentation:** 1 person-day
- **Total:** 14 person-days

### Key Stakeholders
- **Primary Users:** Manager (CRUD operations), Operator (view & request new materials)
- **Secondary Users:** QC Technician (reference material specs), IT Administrator (data import/export)

---

## 2. Requirements Analysis

### 2.1 Functional Requirements

#### FR-MAT-001: Create Material
- **Actor:** Manager
- **Description:** Create new material master data with all required attributes
- **Acceptance Criteria:**
  - Material must have unique `part_number`
  - Material type must be validated against enum values
  - Storage conditions can be optional but recommended
  - System generates unique `material_id` (UUID or custom format)
  - Created date/time automatically recorded

#### FR-MAT-002: Read/View Material
- **Actor:** All roles
- **Description:** View material details and specifications
- **Acceptance Criteria:**
  - Support search by material_id, part_number, or material_name
  - Display all material attributes including audit fields
  - Show related records (inventory lots, usage history)

#### FR-MAT-003: Update Material
- **Actor:** Manager
- **Description:** Modify material attributes
- **Acceptance Criteria:**
  - Cannot change material_id or part_number (immutable)
  - All changes logged in audit trail
  - Modified date/time automatically updated
  - Validation same as create operation

#### FR-MAT-004: List Materials with Filtering
- **Actor:** All roles
- **Description:** Browse materials with search and filter capabilities
- **Acceptance Criteria:**
  - Support pagination (default: 20 items per page)
  - Filter by material_type, storage_conditions
  - Search by name or part_number (fuzzy search)
  - Sort by name, part_number, created_date

#### FR-MAT-005: Request New Material (Operator)
- **Actor:** Operator
- **Description:** Submit request for new material to be approved by Manager
- **Acceptance Criteria:**
  - Operator fills form with proposed material details
  - Request stored with status='Pending'
  - Manager receives notification
  - Manager can Approve/Reject with reason

#### FR-MAT-006: Import/Export Materials
- **Actor:** Manager, IT Administrator
- **Description:** Bulk import materials from CSV/Excel and export existing data
- **Acceptance Criteria:**
  - Import validates all fields before inserting
  - Export includes all fields in CSV/Excel format
  - Error report generated for failed imports
  - Support template download for import

### 2.2 Non-Functional Requirements

#### NFR-MAT-001: Performance
- List query response time: < 2 seconds for 10,000 records
- Create/Update operation: < 500ms
- Search query: < 1 second with indexed fields

#### NFR-MAT-002: Data Integrity
- Enforce unique constraint on part_number
- Cascade rules: Cannot delete material if referenced by inventory_lots
- Audit trail for all create/update/delete operations

#### NFR-MAT-003: Security
- Role-based access control (RBAC)
  - Manager: Full CRUD access
  - Operator: Read + Request new material
  - QC Technician: Read only
  - IT Administrator: Full CRUD + Import/Export
- All API endpoints require authentication (JWT)

#### NFR-MAT-004: Validation
- part_number: 3-20 characters, alphanumeric + hyphen
- material_name: 3-100 characters, required
- material_type: Must be one of predefined enum values
- storage_conditions: Max 200 characters, optional
- specification_document: Max 50 characters, optional

---

## 3. Database Schema Design

### 3.1 MongoDB Schema (Primary Implementation)

```javascript
// materials collection
{
  _id: ObjectId("..."),                          // MongoDB auto-generated
  material_id: "MAT-VC-500",                     // Custom business ID
  part_number: "PART-10001",                      // Unique, indexed
  material_name: "Ascorbic Acid (Vitamin C)",    // Required
  material_type: "API",                           // Enum, indexed
  storage_conditions: "2-8°C, protected from light", // Optional
  specification_document: "SPEC-VC-2025-01",     // Optional
  default_label_template_id: "TPL-RM-01",        // Reference to label_templates
  created_date: ISODate("2026-03-06T10:30:00Z"), // Auto-generated
  modified_date: ISODate("2026-03-06T10:30:00Z"), // Auto-updated
  created_by: "manager_user1",                    // User reference
  is_active: true,                                // Soft delete flag
  metadata: {                                     // Flexible additional data
    manufacturer: "ABC Pharma",
    cas_number: "50-81-7",
    molecular_weight: 176.12,
    tags: ["vitamin", "antioxidant"]
  }
}

// Indexes
db.materials.createIndex({ "part_number": 1 }, { unique: true })
db.materials.createIndex({ "material_name": "text" })
db.materials.createIndex({ "material_type": 1 })
db.materials.createIndex({ "created_date": -1 })
```

### 3.2 Material Type Enum

```typescript
export enum MaterialType {
  API = 'API',                          // Active Pharmaceutical Ingredient
  EXCIPIENT = 'Excipient',              // Inactive ingredient
  DIETARY_SUPPLEMENT = 'Dietary Supplement',
  CONTAINER = 'Container',              // Packaging material
  CLOSURE = 'Closure',                  // Caps, lids
  PROCESS_CHEMICAL = 'Process Chemical', // Solvents, reagents
  TESTING_MATERIAL = 'Testing Material'  // Lab supplies
}
```

### 3.3 Relationships

```
materials (1) -----> (*) inventory_lots
    |
    +-------------> (*) production_batches (as product_id)
    |
    +-------------> (1) label_templates (default template)
```

---

## 4. Backend Implementation Plan (NestJS)

### 4.1 Project Structure

```
backend/src/
├── material/
│   ├── material.module.ts           # Module definition
│   ├── material.controller.ts       # HTTP endpoints
│   ├── material.service.ts          # Business logic
│   ├── material.repository.ts       # Database access
│   ├── schemas/
│   │   └── material.schema.ts       # Mongoose schema
│   ├── dto/
│   │   ├── create-material.dto.ts   # Request validation
│   │   ├── update-material.dto.ts   # Update validation
│   │   ├── query-material.dto.ts    # Query params validation
│   │   └── material-response.dto.ts # Response format
│   ├── interfaces/
│   │   └── material.interface.ts    # TypeScript interfaces
│   ├── guards/
│   │   └── material-access.guard.ts # Authorization logic
│   └── material.constants.ts        # Constants & enums
```

### 4.2 Implementation Steps

#### Step 1: Create Material Schema (material.schema.ts)

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Material extends Document {
  @Prop({ required: true, unique: true, index: true })
  material_id: string;

  @Prop({ required: true, unique: true, index: true })
  part_number: string;

  @Prop({ required: true, minlength: 3, maxlength: 100 })
  material_name: string;

  @Prop({ 
    required: true, 
    enum: ['API', 'Excipient', 'Dietary Supplement', 'Container', 'Closure', 'Process Chemical', 'Testing Material'],
    index: true 
  })
  material_type: string;

  @Prop({ maxlength: 200 })
  storage_conditions?: string;

  @Prop({ maxlength: 50 })
  specification_document?: string;

  @Prop()
  default_label_template_id?: string;

  @Prop({ required: true })
  created_by: string;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const MaterialSchema = SchemaFactory.createForClass(Material);

// Add indexes
MaterialSchema.index({ material_name: 'text' });

// Pre-save hook to generate material_id if not provided
MaterialSchema.pre('save', function(next) {
  if (!this.material_id) {
    this.material_id = `MAT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});
```

#### Step 2: Create DTOs

**create-material.dto.ts:**
```typescript
import { IsString, IsEnum, IsOptional, Length, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MaterialType } from '../material.constants';

export class CreateMaterialDto {
  @ApiProperty({ example: 'PART-10001', description: 'Unique part number' })
  @IsString()
  @Length(3, 20)
  @Matches(/^[A-Z0-9-]+$/, { message: 'Part number must contain only uppercase letters, numbers, and hyphens' })
  part_number: string;

  @ApiProperty({ example: 'Ascorbic Acid (Vitamin C)', description: 'Material name' })
  @IsString()
  @Length(3, 100)
  material_name: string;

  @ApiProperty({ enum: MaterialType, example: MaterialType.API })
  @IsEnum(MaterialType)
  material_type: MaterialType;

  @ApiPropertyOptional({ example: '2-8°C, protected from light' })
  @IsOptional()
  @IsString()
  @Length(0, 200)
  storage_conditions?: string;

  @ApiPropertyOptional({ example: 'SPEC-VC-2025-01' })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  specification_document?: string;

  @ApiPropertyOptional({ example: 'TPL-RM-01' })
  @IsOptional()
  @IsString()
  default_label_template_id?: string;

  @ApiPropertyOptional({ example: { manufacturer: 'ABC Pharma' } })
  @IsOptional()
  metadata?: Record<string, any>;
}
```

**query-material.dto.ts:**
```typescript
import { IsOptional, IsEnum, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { MaterialType } from '../material.constants';

export class QueryMaterialDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(MaterialType)
  material_type?: MaterialType;

  @IsOptional()
  @IsString()
  storage_conditions?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string = 'created_date';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
```

#### Step 3: Create Service with Business Logic (material.service.ts)

```typescript
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Material } from './schemas/material.schema';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { QueryMaterialDto } from './dto/query-material.dto';

@Injectable()
export class MaterialService {
  constructor(
    @InjectModel(Material.name) private materialModel: Model<Material>,
  ) {}

  async create(createMaterialDto: CreateMaterialDto, userId: string): Promise<Material> {
    // Check for duplicate part_number
    const existing = await this.materialModel.findOne({ 
      part_number: createMaterialDto.part_number 
    });
    
    if (existing) {
      throw new ConflictException(`Material with part number ${createMaterialDto.part_number} already exists`);
    }

    const material = new this.materialModel({
      ...createMaterialDto,
      created_by: userId,
      is_active: true,
    });

    return material.save();
  }

  async findAll(query: QueryMaterialDto) {
    const { search, material_type, page = 1, limit = 20, sortBy = 'created_date', sortOrder = 'desc' } = query;
    
    // Build filter
    const filter: any = { is_active: true };
    
    if (search) {
      filter.$or = [
        { material_name: { $regex: search, $options: 'i' } },
        { part_number: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (material_type) {
      filter.material_type = material_type;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    
    const [materials, total] = await Promise.all([
      this.materialModel
        .find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.materialModel.countDocuments(filter),
    ]);

    return {
      data: materials,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Material> {
    const material = await this.materialModel.findById(id).exec();
    
    if (!material || !material.is_active) {
      throw new NotFoundException(`Material with ID ${id} not found`);
    }
    
    return material;
  }

  async findByPartNumber(partNumber: string): Promise<Material> {
    const material = await this.materialModel.findOne({ 
      part_number: partNumber, 
      is_active: true 
    }).exec();
    
    if (!material) {
      throw new NotFoundException(`Material with part number ${partNumber} not found`);
    }
    
    return material;
  }

  async update(id: string, updateMaterialDto: UpdateMaterialDto): Promise<Material> {
    const material = await this.findOne(id);

    // Prevent changing immutable fields
    if (updateMaterialDto['part_number'] && updateMaterialDto['part_number'] !== material.part_number) {
      throw new ConflictException('Cannot change part_number of existing material');
    }

    Object.assign(material, updateMaterialDto);
    return material.save();
  }

  async softDelete(id: string): Promise<Material> {
    const material = await this.findOne(id);
    
    // Check if material is referenced by inventory_lots
    // TODO: Add check against inventory_lots collection
    
    material.is_active = false;
    return material.save();
  }

  async getStatistics() {
    const stats = await this.materialModel.aggregate([
      { $match: { is_active: true } },
      {
        $group: {
          _id: '$material_type',
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      total: await this.materialModel.countDocuments({ is_active: true }),
      byType: stats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
    };
  }
}
```

#### Step 4: Create Controller with Endpoints (material.controller.ts)

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MaterialService } from './material.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { QueryMaterialDto } from './dto/query-material.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('materials')
@ApiBearerAuth()
@Controller('materials')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Post()
  @Roles('Manager', 'IT Administrator')
  @ApiOperation({ summary: 'Create new material' })
  @ApiResponse({ status: 201, description: 'Material created successfully' })
  @ApiResponse({ status: 409, description: 'Material with part number already exists' })
  create(@Body() createMaterialDto: CreateMaterialDto, @Request() req) {
    return this.materialService.create(createMaterialDto, req.user.userId);
  }

  @Get()
  @Roles('Manager', 'Operator', 'Quality Control Technician', 'IT Administrator')
  @ApiOperation({ summary: 'Get all materials with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Materials retrieved successfully' })
  findAll(@Query() query: QueryMaterialDto) {
    return this.materialService.findAll(query);
  }

  @Get('statistics')
  @Roles('Manager', 'IT Administrator')
  @ApiOperation({ summary: 'Get material statistics' })
  getStatistics() {
    return this.materialService.getStatistics();
  }

  @Get(':id')
  @Roles('Manager', 'Operator', 'Quality Control Technician', 'IT Administrator')
  @ApiOperation({ summary: 'Get material by ID' })
  @ApiResponse({ status: 200, description: 'Material found' })
  @ApiResponse({ status: 404, description: 'Material not found' })
  findOne(@Param('id') id: string) {
    return this.materialService.findOne(id);
  }

  @Get('part-number/:partNumber')
  @Roles('Manager', 'Operator', 'Quality Control Technician', 'IT Administrator')
  @ApiOperation({ summary: 'Get material by part number' })
  findByPartNumber(@Param('partNumber') partNumber: string) {
    return this.materialService.findByPartNumber(partNumber);
  }

  @Patch(':id')
  @Roles('Manager', 'IT Administrator')
  @ApiOperation({ summary: 'Update material' })
  @ApiResponse({ status: 200, description: 'Material updated successfully' })
  @ApiResponse({ status: 404, description: 'Material not found' })
  update(@Param('id') id: string, @Body() updateMaterialDto: UpdateMaterialDto) {
    return this.materialService.update(id, updateMaterialDto);
  }

  @Delete(':id')
  @Roles('Manager', 'IT Administrator')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete material' })
  @ApiResponse({ status: 204, description: 'Material deleted successfully' })
  remove(@Param('id') id: string) {
    return this.materialService.softDelete(id);
  }
}
```

#### Step 5: Create Module (material.module.ts)

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MaterialService } from './material.service';
import { MaterialController } from './material.controller';
import { Material, MaterialSchema } from './schemas/material.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Material.name, schema: MaterialSchema }
    ]),
  ],
  controllers: [MaterialController],
  providers: [MaterialService],
  exports: [MaterialService], // Export for use in other modules
})
export class MaterialModule {}
```

#### Step 6: Register Module in App Module

```typescript
// app.module.ts
import { MaterialModule } from './material/material.module';

@Module({
  imports: [
    // ... other imports
    MaterialModule,
  ],
})
export class AppModule {}
```

---

## 5. Frontend Implementation Plan (React + TypeScript)

### 5.1 Project Structure

```
frontend/src/
├── components/
│   └── Material/
│       ├── MaterialList.tsx        # List view with filters
│       ├── MaterialDetail.tsx      # View single material
│       ├── MaterialForm.tsx        # Create/Edit form
│       ├── MaterialSearch.tsx      # Search component
│       └── index.ts                # Export all components
├── pages/
│   └── MaterialPage.tsx            # Main page container
├── services/
│   └── materialService.ts          # API calls
├── types/
│   └── material.ts                 # TypeScript interfaces
└── hooks/
    └── useMaterial.ts              # Custom React hook
```

### 5.2 Implementation Steps

#### Step 1: Define TypeScript Types (types/material.ts)

```typescript
export enum MaterialType {
  API = 'API',
  EXCIPIENT = 'Excipient',
  DIETARY_SUPPLEMENT = 'Dietary Supplement',
  CONTAINER = 'Container',
  CLOSURE = 'Closure',
  PROCESS_CHEMICAL = 'Process Chemical',
  TESTING_MATERIAL = 'Testing Material',
}

export interface Material {
  _id: string;
  material_id: string;
  part_number: string;
  material_name: string;
  material_type: MaterialType;
  storage_conditions?: string;
  specification_document?: string;
  default_label_template_id?: string;
  created_by: string;
  is_active: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMaterialInput {
  part_number: string;
  material_name: string;
  material_type: MaterialType;
  storage_conditions?: string;
  specification_document?: string;
  default_label_template_id?: string;
  metadata?: Record<string, any>;
}

export interface QueryMaterialParams {
  search?: string;
  material_type?: MaterialType;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface MaterialListResponse {
  data: Material[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

#### Step 2: Create API Service (services/materialService.ts)

```typescript
import axios from 'axios';
import { Material, CreateMaterialInput, QueryMaterialParams, MaterialListResponse } from '../types/material';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/materials`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const materialService = {
  async getAll(params?: QueryMaterialParams): Promise<MaterialListResponse> {
    const response = await api.get('/', { params });
    return response.data;
  },

  async getById(id: string): Promise<Material> {
    const response = await api.get(`/${id}`);
    return response.data;
  },

  async getByPartNumber(partNumber: string): Promise<Material> {
    const response = await api.get(`/part-number/${partNumber}`);
    return response.data;
  },

  async create(data: CreateMaterialInput): Promise<Material> {
    const response = await api.post('/', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateMaterialInput>): Promise<Material> {
    const response = await api.patch(`/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/${id}`);
  },

  async getStatistics(): Promise<any> {
    const response = await api.get('/statistics');
    return response.data;
  },
};
```

#### Step 3: Create Material List Component (components/Material/MaterialList.tsx)

```typescript
import React, { useState, useEffect } from 'react';
import { materialService } from '../../services/materialService';
import { Material, MaterialType, QueryMaterialParams } from '../../types/material';
import { MaterialSearch } from './MaterialSearch';
import './MaterialList.css';

export const MaterialList: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const [filters, setFilters] = useState<QueryMaterialParams>({
    page: 1,
    limit: 20,
    sortBy: 'created_date',
    sortOrder: 'desc',
  });

  const fetchMaterials = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await materialService.getAll(filters);
      setMaterials(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [filters]);

  const handleSearch = (searchTerm: string) => {
    setFilters({ ...filters, search: searchTerm, page: 1 });
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
  };

  const getMaterialTypeColor = (type: MaterialType): string => {
    const colors: Record<MaterialType, string> = {
      [MaterialType.API]: '#8b5cf6',
      [MaterialType.EXCIPIENT]: '#3b82f6',
      [MaterialType.DIETARY_SUPPLEMENT]: '#10b981',
      [MaterialType.CONTAINER]: '#f59e0b',
      [MaterialType.CLOSURE]: '#ef4444',
      [MaterialType.PROCESS_CHEMICAL]: '#ec4899',
      [MaterialType.TESTING_MATERIAL]: '#6366f1',
    };
    return colors[type] || '#6b7280';
  };

  return (
    <div className="material-list-container">
      <div className="material-list-header">
        <h1>Quản lý Nguyên liệu (Materials)</h1>
        <button className="btn-create" onClick={() => {/* Navigate to create form */}}>
          + Tạo nguyên liệu mới
        </button>
      </div>

      <MaterialSearch onSearch={handleSearch} />

      <div className="material-filters">
        <select 
          value={filters.material_type || ''} 
          onChange={(e) => handleFilterChange('material_type', e.target.value || undefined)}
        >
          <option value="">Tất cả loại vật liệu</option>
          {Object.values(MaterialType).map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <select 
          value={filters.sortBy} 
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
        >
          <option value="created_date">Ngày tạo</option>
          <option value="material_name">Tên nguyên liệu</option>
          <option value="part_number">Mã part number</option>
        </select>

        <select 
          value={filters.sortOrder} 
          onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
        >
          <option value="desc">Giảm dần</option>
          <option value="asc">Tăng dần</option>
        </select>
      </div>

      {loading && <div className="loading">Đang tải dữ liệu...</div>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && (
        <>
          <div className="material-table">
            <table>
              <thead>
                <tr>
                  <th>Material ID</th>
                  <th>Part Number</th>
                  <th>Tên nguyên liệu</th>
                  <th>Loại</th>
                  <th>Điều kiện bảo quản</th>
                  <th>Ngày tạo</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((material) => (
                  <tr key={material._id}>
                    <td>{material.material_id}</td>
                    <td><strong>{material.part_number}</strong></td>
                    <td>{material.material_name}</td>
                    <td>
                      <span 
                        className="material-type-badge" 
                        style={{ backgroundColor: getMaterialTypeColor(material.material_type) }}
                      >
                        {material.material_type}
                      </span>
                    </td>
                    <td>{material.storage_conditions || 'N/A'}</td>
                    <td>{new Date(material.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <button className="btn-view" onClick={() => {/* View details */}}>
                        👁️
                      </button>
                      <button className="btn-edit" onClick={() => {/* Edit */}}>
                        ✏️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button 
              disabled={pagination.page === 1} 
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              Trước
            </button>
            <span>
              Trang {pagination.page} / {pagination.totalPages} 
              (Tổng: {pagination.total} nguyên liệu)
            </span>
            <button 
              disabled={pagination.page === pagination.totalPages} 
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Sau
            </button>
          </div>
        </>
      )}
    </div>
  );
};
```

#### Step 4: Create Material Form Component (components/Material/MaterialForm.tsx)

```typescript
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { materialService } from '../../services/materialService';
import { CreateMaterialInput, MaterialType } from '../../types/material';
import './MaterialForm.css';

interface MaterialFormProps {
  materialId?: string; // If editing existing material
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const MaterialForm: React.FC<MaterialFormProps> = ({ materialId, onSuccess, onCancel }) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<CreateMaterialInput>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (materialId) {
      // Fetch existing material for editing
      materialService.getById(materialId).then((material) => {
        setValue('part_number', material.part_number);
        setValue('material_name', material.material_name);
        setValue('material_type', material.material_type);
        setValue('storage_conditions', material.storage_conditions);
        setValue('specification_document', material.specification_document);
        setValue('default_label_template_id', material.default_label_template_id);
      });
    }
  }, [materialId]);

  const onSubmit = async (data: CreateMaterialInput) => {
    setLoading(true);
    setError(null);
    try {
      if (materialId) {
        await materialService.update(materialId, data);
      } else {
        await materialService.create(data);
      }
      onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save material');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="material-form-container">
      <h2>{materialId ? 'Chỉnh sửa nguyên liệu' : 'Tạo nguyên liệu mới'}</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label htmlFor="part_number">Part Number *</label>
          <input
            id="part_number"
            type="text"
            {...register('part_number', {
              required: 'Part number là bắt buộc',
              minLength: { value: 3, message: 'Part number tối thiểu 3 ký tự' },
              maxLength: { value: 20, message: 'Part number tối đa 20 ký tự' },
              pattern: { value: /^[A-Z0-9-]+$/, message: 'Part number chỉ chứa chữ in hoa, số và dấu gạch ngang' },
            })}
            disabled={!!materialId} // Cannot change part_number when editing
            placeholder="PART-10001"
          />
          {errors.part_number && <span className="error">{errors.part_number.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="material_name">Tên nguyên liệu *</label>
          <input
            id="material_name"
            type="text"
            {...register('material_name', {
              required: 'Tên nguyên liệu là bắt buộc',
              minLength: { value: 3, message: 'Tên tối thiểu 3 ký tự' },
              maxLength: { value: 100, message: 'Tên tối đa 100 ký tự' },
            })}
            placeholder="Ascorbic Acid (Vitamin C)"
          />
          {errors.material_name && <span className="error">{errors.material_name.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="material_type">Loại nguyên liệu *</label>
          <select
            id="material_type"
            {...register('material_type', { required: 'Loại nguyên liệu là bắt buộc' })}
          >
            <option value="">-- Chọn loại --</option>
            {Object.values(MaterialType).map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {errors.material_type && <span className="error">{errors.material_type.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="storage_conditions">Điều kiện bảo quản</label>
          <textarea
            id="storage_conditions"
            {...register('storage_conditions', {
              maxLength: { value: 200, message: 'Tối đa 200 ký tự' },
            })}
            placeholder="2-8°C, protected from light"
            rows={3}
          />
          {errors.storage_conditions && <span className="error">{errors.storage_conditions.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="specification_document">Tài liệu quy cách</label>
          <input
            id="specification_document"
            type="text"
            {...register('specification_document', {
              maxLength: { value: 50, message: 'Tối đa 50 ký tự' },
            })}
            placeholder="SPEC-VC-2025-01"
          />
          {errors.specification_document && <span className="error">{errors.specification_document.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="default_label_template_id">Template nhãn mặc định</label>
          <input
            id="default_label_template_id"
            type="text"
            {...register('default_label_template_id')}
            placeholder="TPL-RM-01"
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-cancel">
            Hủy
          </button>
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Đang lưu...' : materialId ? 'Cập nhật' : 'Tạo mới'}
          </button>
        </div>
      </form>
    </div>
  );
};
```

---

## 6. Testing Strategy

### 6.1 Backend Testing

#### Unit Tests (material.service.spec.ts)
```typescript
describe('MaterialService', () => {
  let service: MaterialService;
  let model: Model<Material>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaterialService,
        {
          provide: getModelToken(Material.name),
          useValue: mockMaterialModel,
        },
      ],
    }).compile();

    service = module.get<MaterialService>(MaterialService);
    model = module.get<Model<Material>>(getModelToken(Material.name));
  });

  describe('create', () => {
    it('should create a new material successfully', async () => {
      const dto = {
        part_number: 'PART-10001',
        material_name: 'Test Material',
        material_type: MaterialType.API,
      };
      
      const result = await service.create(dto, 'user123');
      
      expect(result).toBeDefined();
      expect(result.part_number).toBe(dto.part_number);
    });

    it('should throw ConflictException if part_number exists', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValue({} as Material);
      
      await expect(service.create(dto, 'user123')).rejects.toThrow(ConflictException);
    });
  });

  // Add more tests for findAll, findOne, update, delete...
});
```

#### Integration Tests (material.e2e-spec.ts)
```typescript
describe('MaterialController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    // Setup test module and authenticate
  });

  it('/materials (POST) - should create material', () => {
    return request(app.getHttpServer())
      .post('/materials')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        part_number: 'PART-TEST-001',
        material_name: 'E2E Test Material',
        material_type: 'API',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.material_id).toBeDefined();
        expect(res.body.part_number).toBe('PART-TEST-001');
      });
  });

  // Add more e2e tests...
});
```

### 6.2 Frontend Testing

#### Component Tests (MaterialList.test.tsx)
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { MaterialList } from './MaterialList';
import { materialService } from '../../services/materialService';

jest.mock('../../services/materialService');

describe('MaterialList', () => {
  it('should render materials list', async () => {
    const mockMaterials = {
      data: [
        {
          _id: '1',
          material_id: 'MAT-001',
          part_number: 'PART-001',
          material_name: 'Test Material',
          material_type: 'API',
        },
      ],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    };

    (materialService.getAll as jest.Mock).mockResolvedValue(mockMaterials);

    render(<MaterialList />);

    await waitFor(() => {
      expect(screen.getByText('Test Material')).toBeInTheDocument();
    });
  });
});
```

---

## 7. Integration Points

### 7.1 Dependencies (What Material needs)

1. **Authentication Service**
   - JWT token validation
   - User ID extraction for audit fields
   - Role-based access control

2. **Label Template Service** (optional)
   - Reference to default_label_template_id
   - May need to validate template exists

### 7.2 Dependents (What depends on Material)

1. **InventoryLot Module**
   - References material_id
   - Must validate material exists before creating lot

2. **ProductionBatch Module**
   - References material_id as product_id
   - Material must be finished product type

3. **QC Test Module**
   - Needs material specifications
   - References material through inventory_lot

---

## 8. Implementation Phases

### Phase 1: Foundation (Week 1, Days 1-3)
**Goal:** Database schema, basic backend CRUD

- [x] Day 1: Design and create MongoDB schema
- [x] Day 1: Create Material entity and DTOs
- [x] Day 2: Implement MaterialService (CRUD operations)
- [x] Day 2: Implement MaterialController with basic endpoints
- [x] Day 3: Write unit tests for service
- [x] Day 3: Manual testing with Postman/curl

**Deliverable:** Functional backend API with CRUD operations

### Phase 2: Advanced Features (Week 1, Days 4-5)
**Goal:** Search, filtering, pagination, statistics

- [ ] Day 4: Implement search and filtering logic
- [ ] Day 4: Add pagination support
- [ ] Day 4: Implement statistics endpoint
- [ ] Day 5: Add integration tests
- [ ] Day 5: Implement soft delete logic

**Deliverable:** Complete backend with all features

### Phase 3: Frontend Core (Week 2, Days 1-3)
**Goal:** Basic UI components

- [ ] Day 1: Create TypeScript types and API service
- [ ] Day 1: Implement MaterialList component
- [ ] Day 2: Implement MaterialForm component (create/edit)
- [ ] Day 2: Implement MaterialDetail component
- [ ] Day 3: Add search and filter UI
- [ ] Day 3: Wire up all components with API

**Deliverable:** Functional UI for material management

### Phase 4: Polish & Integration (Week 2, Days 4-5)
**Goal:** UI/UX improvements, testing, integration

- [ ] Day 4: Add loading states and error handling
- [ ] Day 4: Implement confirmation dialogs
- [ ] Day 4: Add toast notifications
- [ ] Day 5: Component testing
- [ ] Day 5: Integration testing with backend

**Deliverable:** Production-ready material module

### Phase 5: Documentation & Deployment (Day 14)
**Goal:** Final documentation and deployment

- [ ] Update API documentation (Swagger)
- [ ] Write user guide for Material module
- [ ] Deploy to staging environment
- [ ] Perform UAT (User Acceptance Testing)
- [ ] Fix any bugs found during UAT
- [ ] Deploy to production

**Deliverable:** Deployed and documented module

---

## 9. Acceptance Criteria

### 9.1 Backend Acceptance Criteria

✅ **AC-BE-001:** All CRUD operations work correctly
- Create material with valid data returns 201 Created
- Duplicate part_number returns 409 Conflict
- Get material by ID returns correct data
- Update material updates only allowed fields
- Delete material performs soft delete

✅ **AC-BE-002:** Search and filtering work as expected
- Search by name and part_number returns relevant results
- Filter by material_type returns only matching records
- Pagination returns correct page size and total count

✅ **AC-BE-003:** Validation enforces business rules
- Required fields cannot be empty
- part_number format validated
- material_type must be valid enum value
- Cannot change part_number when updating

✅ **AC-BE-004:** Authorization enforced
- Endpoints require valid JWT token
- Only Manager/IT Admin can create/update/delete
- All roles can read materials

✅ **AC-BE-005:** Performance meets requirements
- List query responds in < 2 seconds for 10,000 records
- Create/Update operations complete in < 500ms

### 9.2 Frontend Acceptance Criteria

✅ **AC-FE-001:** Material list displays correctly
- Table shows all material fields
- Pagination works and displays page info
- Search updates results immediately
- Filter dropdown filters correctly

✅ **AC-FE-002:** Create/Edit form works
- All required fields validated before submit
- Validation errors displayed clearly
- Success message shown after save
- Form resets after successful create

✅ **AC-FE-003:** Error handling is user-friendly
- API errors displayed with clear messages
- Loading states shown during API calls
- Retry option provided for failed requests

✅ **AC-FE-004:** Responsive design
- UI works on desktop (1920x1080)
- UI works on tablet (768x1024)
- Mobile view is functional (375x667)

---

## 10. Rollout Plan

### 10.1 Pre-Deployment Checklist

- [ ] All unit tests passing (100% coverage on service)
- [ ] All integration tests passing
- [ ] API documentation updated in Swagger
- [ ] Environment variables configured (.env files)
- [ ] Database indexes created
- [ ] Backup strategy in place
- [ ] Rollback plan documented
- [ ] Monitoring alerts configured

### 10.2 Deployment Steps

**Step 1: Deploy Backend (Staging)**
```bash
# Build backend
cd backend
npm run build

# Run database migrations (if needed)
npm run migrate

# Deploy to staging
npm run deploy:staging
```

**Step 2: Deploy Frontend (Staging)**
```bash
# Build frontend
cd frontend
npm run build

# Deploy to staging (Vercel)
vercel --prod
```

**Step 3: Staging Validation**
- [ ] Smoke tests pass
- [ ] Manual testing by QA team
- [ ] UAT by Manager role
- [ ] Performance testing
- [ ] Security scan passes

**Step 4: Production Deployment**
- [ ] Deploy backend to production (Render)
- [ ] Deploy frontend to production (Vercel)
- [ ] Verify production deployment
- [ ] Monitor logs for errors
- [ ] Notify stakeholders

### 10.3 Post-Deployment

**Day 1:** Monitor closely for errors
- Check logs every 2 hours
- Monitor API response times
- Check error rates in monitoring dashboard

**Day 2-7:** Reduced monitoring
- Daily log review
- Weekly performance report
- Gather user feedback

**Week 2:** Retrospective
- Review what went well
- Identify improvements
- Plan next module (InventoryLot)

---

## 11. Risk Mitigation

### Risk 1: Database Performance Degradation
**Mitigation:** 
- Create indexes on frequently queried fields
- Implement caching for read-heavy operations
- Use MongoDB aggregation pipeline for statistics

### Risk 2: Frontend-Backend API Mismatch
**Mitigation:**
- Use Swagger/OpenAPI for API documentation
- Generate TypeScript types from backend DTOs
- Implement comprehensive integration tests

### Risk 3: User Adoption Issues
**Mitigation:**
- Provide training sessions for Managers and Operators
- Create video tutorials
- Implement tooltips and help text in UI

### Risk 4: Data Migration from Legacy System
**Mitigation:**
- Create bulk import tool with validation
- Run parallel systems during transition period
- Implement data reconciliation reports

---

## 12. Success Metrics

### Technical Metrics
- API response time < 500ms (P95)
- Zero critical bugs in production
- Test coverage > 80%
- Uptime > 99.9%

### Business Metrics
- 100% of materials migrated from legacy system
- 90% user satisfaction score
- 50% reduction in time to create new material
- Zero data integrity issues

---

## 13. Next Steps

After Material module is complete, proceed to:
1. **InventoryLot Module** - Depends on Material
2. **InventoryTransaction Module** - Depends on InventoryLot
3. **QC Test Module** - Depends on InventoryLot
4. **Production Batch Module** - Depends on Material and InventoryLot

---

## Appendix A: API Endpoint Summary

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| POST | /materials | Create material | JWT | Manager, IT Admin |
| GET | /materials | List with filters | JWT | All |
| GET | /materials/:id | Get by ID | JWT | All |
| GET | /materials/part-number/:pn | Get by part number | JWT | All |
| PATCH | /materials/:id | Update material | JWT | Manager, IT Admin |
| DELETE | /materials/:id | Soft delete | JWT | Manager, IT Admin |
| GET | /materials/statistics | Get statistics | JWT | Manager, IT Admin |

---

## Appendix B: Sample Test Data

```json
{
  "part_number": "PART-VC-500",
  "material_name": "Ascorbic Acid (Vitamin C)",
  "material_type": "API",
  "storage_conditions": "2-8°C, protected from light",
  "specification_document": "SPEC-VC-2025-01",
  "default_label_template_id": "TPL-RM-01",
  "metadata": {
    "manufacturer": "ABC Pharma",
    "cas_number": "50-81-7",
    "molecular_weight": 176.12,
    "tags": ["vitamin", "antioxidant"]
  }
}
```

---

**Document Owner:** AI Implementation Agent  
**Review Status:** Ready for Implementation  
**Last Updated:** March 6, 2026

---

**READY TO START IMPLEMENTATION!** 🚀
