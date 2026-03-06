/\*\*

- Material Management Integration Guide
- How to use the Material Management module in your app
  \*/

# Material Management Module - Integration Guide

## Overview

The Material Management module is a complete full-stack implementation for managing materials (pharmaceutical/food industry). It includes:

- **Backend (NestJS)**: REST API with 7 endpoints, MongoDB database, validation, error handling
- **Frontend (React)**: Components, hooks, services, and integrated Material Management page

## Backend Setup

### Prerequisites

```bash
# Backend dependencies (already installed)
npm install class-validator class-transformer
```

### Start Backend Server

```bash
cd backend
npm install
npm run start:dev  # Starts on http://localhost:3000
```

### Database

- MongoDB Atlas (Cloud)
- URI configured in `.env`: `MONGO_URI=mongodb+srv://admin:123@inventorymanagement.kbyjdmp.mongodb.net/inventory_management_db`
- Mongoose schema with 6 indexes for performance

### Backend API Endpoints

```
GET    /api/materials                    - List all materials (paginated, default: page=1, limit=20)
GET    /api/materials/search?q=query     - Search materials (min 2 chars)
GET    /api/materials/type/:type         - Filter by type
GET    /api/materials/:id                - Get material detail
POST   /api/materials                    - Create new material (201)
PUT    /api/materials/:id                - Update material
DELETE /api/materials/:id                - Delete material
```

## Frontend Setup

### Prerequisites

```bash
# Frontend is React 19.2 with TypeScript
cd frontend
npm install axios  # Already installed
```

### Environment Variables

Create a `.env` file in frontend root:

```bash
VITE_API_URL=http://localhost:3000/api
```

### Start Frontend Dev Server

```bash
cd frontend
npm run dev  # Starts on http://localhost:5173
```

### Frontend Structure

```
frontend/src/
├── pages/
│   └── MaterialManagement.tsx         # Main page with all components integrated
├── components/
│   ├── MaterialList.tsx               # Paginated list view
│   ├── MaterialSearch.tsx             # Search + filter by type
│   ├── MaterialForm.tsx               # Create/Edit form
│   └── MaterialDetail.tsx             # Single material view
├── hooks/
│   ├── useMaterialList.ts             # List state & pagination
│   ├── useMaterialSearch.ts           # Search with debounce
│   ├── useMaterialForm.ts             # Form state & validation
│   └── useMaterialDetail.ts           # Single material fetch
├── services/
│   └── material.service.ts            # API client
├── config/
│   └── api.config.ts                  # API configuration
└── types/
    └── Material.ts                    # TypeScript interfaces
```

## Using the Material Management Page

### Import and Use

```tsx
import { MaterialManagement } from "@/pages";

function App() {
  return <MaterialManagement />;
}
```

### Page Features

1. **Header**: Title + "New Material" button
2. **Search Section**: Search by name/ID/part number + Filter by 7 material types
3. **List View**: Paginated table with all materials (10/20/50/100 per page)
4. **Detail View**: Click "View" in list to see material details
5. **Form Modal**: Create new or edit existing materials
6. **Delete**: Risk confirmation before deletion

### Component Composition

```
MaterialManagement (Page)
├── MaterialSearch (search + filter)
├── MaterialList (paginated list)
├── MaterialForm (modal form for create/edit)
└── MaterialDetail (modal detail view)
```

## Material Data Model

```typescript
interface Material {
  _id: string; // MongoDB ID
  material_id: string; // Business ID (unique, max 20 chars)
  part_number: string; // Supplier part number (unique, max 20 chars)
  material_name: string; // Display name (max 100 chars)
  material_type: MaterialType; // One of 7 types
  storage_conditions?: string; // Optional, max 100 chars
  specification_document?: string; // Optional, max 50 chars
  created_date: string; // ISO timestamp
  modified_date?: string; // ISO timestamp
}

type MaterialType =
  | "API"
  | "Excipient"
  | "Dietary Supplement"
  | "Container"
  | "Closure"
  | "Process Chemical"
  | "Testing Material";
```

## API Service Usage

```typescript
import { materialService } from "@/services/material.service";

// List materials (page 1, 20 items)
const list = await materialService.findAll(1, 20);

// Find by ID
const material = await materialService.findById("60d5ec49f1b2c78a8c123456");

// Search (debounce 500ms recommended)
const results = await materialService.search("aspirin", 1, 20);

// Filter by type
const apis = await materialService.filterByType("API", 1, 20);

// Create
const created = await materialService.create({
  material_id: "MAT-001",
  part_number: "PN-2024-001",
  material_name: "Aspirin Powder",
  material_type: "API",
  storage_conditions: "2-8°C",
  specification_document: "SOP-2024-001",
});

// Update
const updated = await materialService.update("60d5ec49f1b2c78a8c123456", {
  material_name: "Aspirin Powder (Updated)",
  storage_conditions: "15-25°C",
});

// Delete
await materialService.delete("60d5ec49f1b2c78a8c123456");
```

## Custom Hooks

### useMaterialList

```typescript
const {
  materials,      // Material[]
  total,          // number
  page,           // current page
  limit,          // items per page
  loading,        // boolean
  error,          // Error | null
  hasNextPage,    // boolean
  hasPreviousPage, // boolean
  refetch,        // () => void
  nextPage,       // () => void
  previousPage,   // () => void
  goToPage: (page: number) => void,
  setLimit: (limit: number) => void
} = useMaterialList(1, 20);
```

### useMaterialSearch

```typescript
const {
  results,        // Material[]
  total,          // number
  loading,        // boolean
  error,          // Error | null
  search: (query: string) => void,        // Debounced search
  filterByType: (type: MaterialType) => void,
  clear: () => void,
  // ... pagination methods
} = useMaterialSearch(500);  // debounce ms
```

### useMaterialForm

```typescript
const {
  formData, // CreateMaterialRequest
  errors, // Record<string, string>
  loading, // boolean
  error, // Error | null
  success, // boolean
  setFieldValue, // (field, value) => void
  submit, // () => Promise<Material | null>
  submitUpdate, // (id) => Promise<Material | null>
  resetForm, // () => void,
  clearSuccess, // () => void
} = useMaterialForm((material) => {
  // Optional onSuccess callback
  console.log("Material created:", material);
});
```

### useMaterialDetail

```typescript
const {
  material, // Material | null
  loading, // boolean
  error, // Error | null
  refetch, // () => void
} = useMaterialDetail(materialId);
```

## Error Handling

### Backend Error Codes

- **400 Bad Request**: Validation failure (field errors in response)
- **404 Not Found**: Material not found
- **409 Conflict**: Duplicate material_id or part_number

### Frontend Error Handling

All hooks and services include error states that components display as user-friendly messages.

## Testing with cURL

```bash
# List materials (page 1, 20 per page)
curl http://localhost:3000/api/materials?page=1&limit=20

# Search
curl "http://localhost:3000/api/materials/search?q=aspirin&page=1&limit=20"

# Filter by type
curl http://localhost:3000/api/materials/type/API?page=1&limit=20

# Get one
curl http://localhost:3000/api/materials/60d5ec49f1b2c78a8c123456

# Create
curl -X POST http://localhost:3000/api/materials \
  -H "Content-Type: application/json" \
  -d '{
    "material_id": "MAT-001",
    "part_number": "PN-2024-001",
    "material_name": "Aspirin Powder",
    "material_type": "API"
  }'

# Update
curl -X PUT http://localhost:3000/api/materials/60d5ec49f1b2c78a8c123456 \
  -H "Content-Type: application/json" \
  -d '{
    "material_name": "Aspirin Powder (Updated)"
  }'

# Delete
curl -X DELETE http://localhost:3000/api/materials/60d5ec49f1b2c78a8c123456
```

## Next Steps

### Phase 3: Role-Based Access Control (RBAC)

- Add JWT auth guards to backend endpoints
- Implement @Roles decorators
- Frontend: Add auth interceptor to axios

### Phase 4: Additional Modules

- Inventory Management (stock levels, warehouse locations)
- Production Batch Management (batch tracking, QC results)
- System integration (Elasticsearch sync, audit logs)

## Troubleshooting

### Frontend Can't Connect to Backend

1. Check backend is running: `npm run start:dev` in backend folder
2. Check API_URL in frontend .env matches backend (http://localhost:3000/api)
3. Check CORS: Backend should allow http://localhost:5173

### Database Connection Fails

1. Verify MONGO_URI in .env is correct
2. Check MongoDB Atlas cluster network access (add IP 0.0.0.0/0 for dev)
3. Test connection: `mongodb+srv://admin:123@inventorymanagement.kbyjdmp.mongodb.net/inventory_management_db`

### UI Doesn't Update After Actions

1. Check browser console for API errors
2. Verify hook's refetch() is being called
3. Check Network tab to see actual API responses

## Performance Considerations

- **Search Debounce**: 500ms default (prevents excessive API calls as user types)
- **Pagination**: Default 20 items, max 100 (prevents DOS via huge result sets)
- **Database Indexes**: 6 indexes on Material collection (unique, text, compound)
- **Lazy Loading**: Components load data on mount, not all at once

## Security Notes

- ⚠️ Backend API currently has no authentication - add JWT guards
- ⚠️ Frontend sends plain HTTP - use HTTPS in production
- ⚠️ MongoDB credentials in .env - use Azure Key Vault in production
- ⚠️ No rate limiting - add in production
