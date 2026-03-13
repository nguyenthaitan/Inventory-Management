# 🏗️ Inventory Management System - Architecture Document v1.0

**System Name:** Inventory Management System for Pharmaceutical/Manufacturing  
**Version:** 1.0  
**Last Updated:** March 13, 2026  
**Environment:** Development/MVP Phase

---

## 📋 Executive Summary

The Inventory Management System is a comprehensive, role-based warehouse management solution designed for pharmaceutical and manufacturing enterprises. It provides real-time inventory tracking, quality control management, cycle counting, and advanced audit capabilities.

**Key Goals:**
- Real-time inventory visibility and control
- Multi-tier quality assurance workflow
- Comprehensive audit and traceability
- Scalable, secure, and maintainable architecture
- Role-based access control with enterprise security

---

## 🏛️ High-Level Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  Manager  │  Operator  │  QC Technician  │  IT Administrator    │
└──────────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER (React/TypeScript)         │
├──────────────────────────────────────────────────────────────────┤
│  Dashboard │ Material Mgmt │ Inventory │ QC │ Reports │ Admin   │
└──────────────────────────────────────────────────────────────────┘
                           ↓ (REST/GraphQL)
┌──────────────────────────────────────────────────────────────────┐
│              API GATEWAY & AUTHENTICATION LAYER                  │
├──────────────────────────────────────────────────────────────────┤
│  JWT Token Validation │ Role-based Access Control │ CORS Policy │
│                  (Keycloak Integration)                          │
└──────────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────────┐
│           APPLICATION LAYER (Node.js/NestJS Backend)             │
├──────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌──────────────┐ ┌─────────────┐               │
│  │   Material  │ │  Inventory   │ │ Production  │               │
│  │   Module    │ │    Module    │ │   Module    │  ... More     │
│  └─────────────┘ └──────────────┘ └─────────────┘               │
│  ┌─────────────┐ ┌──────────────┐ ┌─────────────┐               │
│  │     QC      │ │    User      │ │   Audit     │               │
│  │   Module    │ │   Module     │ │   Module    │               │
│  └─────────────┘ └──────────────┘ └─────────────┘               │
│         ↓                ↓                ↓                      │
│  ┌────────────────────────────────────────────────┐              │
│  │      Business Logic & Validation Layer        │              │
│  │   (Services, Guards, Interceptors)            │              │
│  └────────────────────────────────────────────────┘              │
└──────────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────────┐
│           DATA ACCESS LAYER (TypeORM, Mongoose)                  │
├──────────────────────────────────────────────────────────────────┤
│  Repository Pattern │ ORM Abstraction │ Query Optimization       │
└──────────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────────┐
│        PERSISTENCE LAYER (MongoDB, Redis, Elasticsearch)         │
├──────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐ ┌────────────┐ ┌────────────────────────┐ │
│  │  MongoDB (Hot)   │ │   Redis    │ │  Elasticsearch (Logs)  │ │
│  │  - Transactional │ │  - Cache   │ │  - Full-text search    │ │
│  │  - Audit logs    │ │  - Locks   │ │  - Analytics           │ │
│  └──────────────────┘ └────────────┘ └────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────────┐
│         INFRASTRUCTURE LAYER (Docker, Kubernetes, DevOps)        │
├──────────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────────┐│
│  │  Docker  │ │Kubernetes│ │ Jenkins/ │ │  GitHub Actions CI/CD││
│  │Containers│ │ Orchestr.│ │GitHub Act│ │    Pipeline          ││
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────────┐
│      OBSERVABILITY LAYER (Logging, Monitoring, Tracing)          │
├──────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  ELK Stack          Prometheus & Grafana    Distributed   │  │
│  │  - Logs aggregation - Metrics collection   Tracing        │  │
│  │  - Indexing         - Real-time dashboards (Optional)     │  │
│  │  - Analytics        - Alerting system                     │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack Detailed

### Frontend
| Component | Technology | Purpose | Version |
|-----------|-----------|---------|---------|
| **Framework** | React 18+ | UI framework | Latest |
| **Language** | TypeScript | Type safety & development productivity | Latest |
| **Build Tool** | Vite | Fast build & HMR | Latest |
| **UI Library** | TailwindCSS | Utility-first CSS | 3.x |
| **State Management** | React Context / Zustand | Global state | Context API + Custom Hooks |
| **HTTP Client** | Axios | API communication | 1.x |
| **Routing** | React Router v6 | Client-side routing | 6.x |
| **Forms** | React Hook Form | Form state management | Latest |
| **Data Tables** | TanStack Table | Advanced table features | v8+ |
| **Charts** | Chart.js / Recharts | Data visualization | Latest |
| **Date/Time** | Day.js | Date manipulation | 1.x |
| **Notifications** | React Toastify | Toast notifications | Latest |
| **PDF Generation** | react-pdf / jsPDF | Report export | Latest |

**Frontend Folder Structure:**
```
frontend/src/
├── pages/              # Route-based page components
│   ├── manager/        # Manager role pages
│   ├── operator/       # Operator role pages
│   ├── qc/             # QC technician pages
│   ├── admin/          # IT administrator pages
│   └── auth/           # Auth pages
├── components/         # Reusable UI components
├── services/           # API service calls
├── hooks/              # Custom React hooks
├── context/            # React Context definitions
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── constants/          # App constants
├── layouts/            # Page layout templates
└── styles/             # Global styles
```

### Backend
| Component | Technology | Purpose | Version |
|-----------|-----------|---------|---------|
| **Framework** | NestJS | Server-side framework | 10.x |
| **Language** | TypeScript | Type safety | Latest |
| **Database ORM** | Mongoose | MongoDB ODM | 7.x / 8.x |
| **Authentication** | Passport.js + JWT | Auth strategy | Latest |
| **SSO/IdP** | Keycloak | Enterprise authentication | 23.x |
| **Validation** | class-validator | DTO validation | Latest |
| **Caching** | Redis | In-memory cache & locking | 7.x |
| **Event Bus** | EventEmitter2 | Async event handling | Latest |
| **Serialization** | class-transformer | DTO transformation | Latest |
| **Logging** | Winston / Pino | Structured logging | Latest |

**Backend Module Structure:**
```
backend/src/
├── auth/               # Authentication & authorization
│   ├── strategies/     # JWT, Keycloak strategies
│   ├── guards/         # Auth guards, role guards
│   └── keycloak/       # Keycloak integration
├── modules/
│   ├── material/       # Material management
│   ├── inventory-lot/  # Lot management
│   ├── inventory-transaction/  # Transactions
│   ├── production-batch/       # Production planning
│   ├── qc-test/        # QC operations
│   ├── label-template/ # Label printing
│   ├── user/           # User management
│   └── audit-log/      # Audit trail
├── common/
│   ├── decorators/     # Custom decorators
│   ├── filters/        # Exception filters
│   ├── interceptors/   # HTTP interceptors
│   ├── middlewares/    # Custom middleware
│   └── pipes/          # Custom pipes
├── database/           # DB connections & config
├── schemas/            # Data models / entities
└── utils/              # Utility functions
```

### Database

#### MongoDB
**Purpose:** Primary transactional database

**Collections:**
| Collection | Purpose | Indexes |
|-----------|---------|---------|
| materials | Raw material & product definitions | material_code, name |
| inventory_lots | Lot tracking with quantity & status | lot_code, material_id, status, expiry_date |
| inventory_transactions | All stock movements | lot_id, type, created_at, performed_by |
| production_batches | Manufacturing batch records | batch_code, product_id, status |
| batch_components | Lot allocation for production | batch_id, inventory_lot_id |
| qc_tests | Quality control test records | lot_id, test_type, status, created_at |
| label_templates | Label format definitions | template_code, label_type |
| labels | Generated labels | lot_id, template_id, created_at |
| users | User accounts (sync with Keycloak) | username, email, role_id |
| audit_logs | Complete audit trail | user_id, entity_type, entity_id, created_at |

**Data Relationships:**
```
materials (1) ──→ (n) inventory_lots
materials (1) ──→ (n) production_batches
inventory_lots (1) ──→ (n) inventory_transactions
inventory_lots (1) ──→ (n) qc_tests
inventory_lots (1) ──→ (n) batch_components
production_batches (1) ──→ (n) batch_components
label_templates (1) ──→ (n) labels
inventory_lots (1) ──→ (n) labels
users (1) ──→ (n) audit_logs
```

#### Redis
**Purpose:** Caching, distributed locking, session management

**Key Patterns:**
- `auth:token:{userId}` → JWT token cache
- `lock:inventory-lot:{lotId}` → Optimistic lock for concurrent updates
- `cache:material:{materialId}` → Material data cache (TTL: 1 hour)
- `cache:inventory-lot:{lotId}` → Lot data cache (TTL: 30 min)
- `cache:transaction:summary` → Aggregated transaction data (TTL: 5 min)

#### Elasticsearch
**Purpose:** Centralized logging and full-text search

**Index Patterns:**
- `inventory-logs-{YYYY.MM.DD}` → Daily log index
- `audit-logs-{YYYY.MM.DD}` → Audit trail index
- `transaction-logs-{YYYY.MM.DD}` → Transaction logs
- `error-logs-{YYYY.MM.DD}` → Error tracking

---

## 🔐 Security Architecture

### Authentication Flow
```
User Login
    ↓
┌─────────────────────────────────┐
│  Keycloak OAuth2/OpenID Connect │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  JWT Token Generation           │
│  - Header: Authorization        │
│  - Payload: {userId, role, exp} │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  Frontend: Store in Secure      │
│  HttpOnly Cookie / Session      │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  Backend: Validate JWT Token    │
│  - Check signature              │
│  - Verify expiration            │
│  - Extract user identity        │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  Role-Based Access Control      │
│  - Check user role              │
│  - Apply resource guards        │
│  - Audit log access             │
└─────────────────────────────────┘
```

### Authorization Model (RBAC)

**Roles:**
1. **Manager** - Full inventory control, approvals, user management
2. **Operator** - Daily operations, stock transfers, data entry
3. **Quality Control Technician** - QC test execution, lot evaluation
4. **IT Administrator** - System monitoring, backup, configuration

**Permission Matrix:**

| Feature | Manager | Operator | QC Tech | IT Admin |
|---------|---------|----------|---------|----------|
| Material CRUD | ✅ Full | ⚠️ Read | ❌ | ❌ |
| Inventory View | ✅ Full | ✅ Own | ⚠️ Read | ❌ |
| QC Approval | ✅ | ❌ | ✅ Execute | ❌ |
| User Management | ✅ | ❌ | ❌ | ✅ |
| Audit Logs | ✅ Full | ⚠️ Own | ⚠️ Own | ✅ Full |
| System Monitoring | ❌ | ❌ | ❌ | ✅ |
| Reports | ✅ Full | ⚠️ Limited | ⚠️ Limited | ✅ Full |

### Security Measures

| Layer | Measure | Implementation |
|-------|---------|-----------------|
| **Transport** | TLS/SSL 1.3 | HTTPS only, certificate validation |
| **Authentication** | JWT + OAuth2 | Keycloak integration, secure token exchange |
| **Authorization** | RBAC + ABAC | Role guards, resource-level access control |
| **Data** | Encryption | Sensitive fields encrypted at rest |
| **Input** | Validation | DTO validation, sanitization |
| **Audit** | Complete Trail | All operations logged with user/timestamp |
| **CORS** | Controlled Origins | Frontend origin from env config |
| **Rate Limiting** | Per-user/IP | Express rate limiter middleware |

---

## 📊 Data Model Overview

### Core Entities

#### Materials
```typescript
{
  _id: ObjectId,
  material_code: string,        // Unique SKU
  name: string,
  unit: string,                 // kg, liter, box, etc.
  category: string,
  specifications: Object,       // JSON spec limits
  default_label_template_id: ObjectId,
  is_active: boolean,
  created_at: Date,
  updated_at: Date,
  created_by: ObjectId
}
```

#### InventoryLots
```typescript
{
  _id: ObjectId,
  lot_code: string,             // Unique lot identifier
  material_id: ObjectId,
  quantity: number,
  available_quantity: number,
  is_sample: boolean,
  parent_lot_id: ObjectId,      // For sample lots
  manufacturer_lot_code: string,
  manufacture_date: Date,
  expiry_date: Date,
  location_id: string,
  status: 'Quarantine' | 'Accepted' | 'Rejected' | 'On Hold',
  created_at: Date,
  updated_at: Date,
  created_by: ObjectId
}
```

#### InventoryTransactions
```typescript
{
  _id: ObjectId,
  inventory_lot_id: ObjectId,
  type: 'RECEIPT' | 'ISSUE' | 'SPLIT' | 'ADJUSTMENT' | 'RETURN',
  quantity: number,
  location_id: string,
  reference_id: string,         // PO#, DO#, etc.
  status: 'Pending' | 'Confirmed' | 'Cancelled',
  notes: string,
  performed_by: ObjectId,
  created_at: Date,
  updated_at: Date
}
```

#### QCTests
```typescript
{
  _id: ObjectId,
  inventory_lot_id: ObjectId,
  test_type: string,            // Identity, Assay, etc.
  test_results: Object,         // JSON test data
  status: 'Pending' | 'Pass' | 'Fail' | 'On Hold',
  verified_by: ObjectId,
  verified_at: Date,
  created_at: Date,
  created_by: ObjectId
}
```

#### ProductionBatches
```typescript
{
  _id: ObjectId,
  batch_code: string,
  product_id: ObjectId,         // Reference to finished product
  planned_quantity: number,
  produced_quantity: number,
  status: 'Planning' | 'In Progress' | 'Completed' | 'Rejected',
  started_at: Date,
  finished_at: Date,
  created_at: Date,
  created_by: ObjectId
}
```

#### AuditLogs
```typescript
{
  _id: ObjectId,
  user_id: ObjectId,
  action: string,               // 'CREATE', 'UPDATE', 'DELETE', 'APPROVE'
  entity_type: string,          // 'Material', 'InventoryLot', etc.
  entity_id: ObjectId,
  details: Object,              // { before: {}, after: {} }
  ip_address: string,
  user_agent: string,
  timestamp: Date
}
```

---

## 🔄 API Architecture

### RESTful Endpoints Structure

```
/api/v1/
├── /auth
│   ├── POST   /login
│   ├── POST   /logout
│   ├── POST   /refresh-token
│   └── GET    /profile
├── /materials
│   ├── GET    /                    (List, search, filter)
│   ├── POST   /                    (Create)
│   ├── GET    /:id                 (Read)
│   ├── PUT    /:id                 (Update)
│   └── DELETE /:id                 (Soft delete)
├── /inventory-lots
│   ├── GET    /                    (List with filters)
│   ├── POST   /                    (Create new lot)
│   ├── GET    /:id                 (Lot details)
│   ├── PUT    /:id/status          (Update status)
│   └── POST   /:id/adjust          (Quantity adjustment)
├── /inventory-transactions
│   ├── GET    /                    (List/search)
│   ├── POST   /receipt             (Stock receipt)
│   ├── POST   /issue               (Stock issue)
│   ├── POST   /adjustment          (Manual adjustment)
│   └── POST   /:id/confirm         (Confirm transaction)
├── /qc-tests
│   ├── GET    /                    (Pending QC list)
│   ├── POST   /:lot-id             (Create test)
│   ├── PUT    /:id/results         (Record results)
│   ├── POST   /:id/approve         (Approve lot)
│   └── POST   /:id/reject          (Reject lot)
├── /production-batches
│   ├── GET    /                    (List batches)
│   ├── POST   /                    (Create batch)
│   ├── GET    /:id/components      (Get components)
│   ├── POST   /:id/components      (Add components)
│   └── PUT    /:id/status          (Update batch status)
├── /labels
│   ├── GET    /templates           (Available templates)
│   ├── POST   /generate            (Generate label)
│   ├── GET    /:id/preview         (Preview label)
│   └── POST   /:id/print           (Send to printer)
├── /users
│   ├── GET    /                    (List users)
│   ├── POST   /                    (Create user)
│   ├── GET    /:id                 (User details)
│   ├── PUT    /:id                 (Update user)
│   └── PUT    /:id/status          (Activate/deactivate)
├── /audit-logs
│   ├── GET    /                    (Search logs)
│   ├── GET    /:entity/:id         (Entity history)
│   └── GET    /user/:user-id       (User activity)
└── /reports
    ├── GET    /inventory-valuation
    ├── GET    /stock-movement
    ├── GET    /qc-summary
    ├── POST   /export-pdf
    └── POST   /export-excel
```

### Request/Response Format

**Standard Request:**
```json
{
  "headers": {
    "Authorization": "Bearer {JWT_TOKEN}",
    "Content-Type": "application/json",
    "X-Request-ID": "{UUID}",
    "X-User-Role": "{role}"
  },
  "body": {
    "data": {}
  }
}
```

**Standard Response (Success):**
```json
{
  "success": true,
  "status": 200,
  "data": {},
  "message": "Operation successful",
  "timestamp": "2026-03-13T10:30:00Z",
  "request_id": "{UUID}"
}
```

**Standard Response (Error):**
```json
{
  "success": false,
  "status": 400,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": []
  },
  "timestamp": "2026-03-13T10:30:00Z",
  "request_id": "{UUID}"
}
```

---

## 🔄 Workflow Process Flows

### Stock Receipt Workflow
```
Operator Creates Receipt
    ↓
Scan/Upload Receiving Docs
    ↓
Create InventoryLot
    ↓
Generate Raw Material Label
    ↓
Insert InventoryTransaction (RECEIPT)
    ↓
Notify QC Technician
    ↓
QC Executes Tests
    ├─→ PASS → Update lot.status = 'Accepted'
    ├─→ FAIL → Update lot.status = 'Rejected'
    │          Create RETURN InventoryTransaction
    │          Generate Status Label
    └─→ ON_HOLD → Manual Manager Review
    ↓
Update available_quantity (if Accepted)
    ↓
Complete Transaction
    ↓
Log to AuditLog
```

### Production Batch Workflow
```
Planner Creates ProductionBatch
    ↓
Add BatchComponents (link InventoryLots)
    ↓
Manager Approves
    ↓
Operator Starts Batch
    ↓
Reserve InventoryLot quantities
    ↓
Create USAGE InventoryTransactions
    ↓
During Production:
├─→ Record actual consumption
├─→ Handle split/waste
└─→ Adjust quantities
    ↓
Production Complete
    ↓
Close Production Batch
    ↓
Final Reconciliation
    ↓
Create Finished Product Lot
    ↓
Update Status Labels
```

### QC Test Workflow
```
Lot Received (status = Quarantine)
    ↓
Create QCTest Records (Identity, Assay, Purity, etc.)
    ↓
Assign to QC Technician
    ↓
QC Performs Tests
    ├─→ Record Results
    ├─→ Compare with Specifications
    └─→ Generate Report
    ↓
Determine Outcome:
├─→ All Pass → Approve Lot
│   └─→ status = Accepted
│   └─→ available_quantity = quantity
├─→ Any Fail → Reject Lot
│   └─→ status = Rejected
│   └─→ Create Return Transaction
│   └─→ Generate COA (Certificate of Analysis)
└─→ Some On Hold → Flag for Manager Review
    ↓
Update AuditLog
    ↓
Notify Relevant Users
```

---

## 🚀 Deployment Architecture

### Development Environment
```
Local Development
├── Docker Compose Services:
│   ├── Backend (NestJS) - Port 3000
│   ├── Frontend (React) - Port 5173
│   ├── MongoDB - Port 27017
│   ├── Redis - Port 6379
│   ├── Keycloak - Port 8080
│   └── Elasticsearch - Port 9200
└── Environment Files: .env, .env.development
```

### Container Strategy

**Docker Images:**

| Service | Base Image | Purpose |
|---------|-----------|---------|
| Backend | node:20-alpine | NestJS application |
| Frontend | node:20-alpine (build) + nginx (serve) | React SPA |
| MongoDB | mongo:7 | Database |
| Redis | redis:7-alpine | Cache & lock |
| Keycloak | quay.io/keycloak/keycloak:23 | Auth service |
| Elasticsearch | docker.elastic.co/elasticsearch/elasticsearch:8 | Logging |
| Kibana | docker.elastic.co/kibana/kibana:8 | Log visualization |

**Docker Compose File Structure:**
```yaml
services:
  backend:
    image: inventory-backend:latest
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/inventory
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - KEYCLOAK_URL=http://keycloak:8080
    depends_on:
      - mongo
      - redis
      - keycloak
    ports:
      - "3000:3000"
    
  frontend:
    image: inventory-frontend:latest
    environment:
      - VITE_API_URL=http://backend:3000/api/v1
      - VITE_KEYCLOAK_URL=http://keycloak:8080
    ports:
      - "5173:5173"
    depends_on:
      - backend
  
  mongo:
    image: mongo:7
    volumes:
      - mongo_data:/data/db
    ports:
      - "27017:27017"
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
  
  keycloak:
    image: quay.io/keycloak/keycloak:23
    environment:
      - KEYCLOAK_ADMIN=admin
      - KEYCLOAK_ADMIN_PASSWORD=${KEYCLOAK_ADMIN_PASSWORD}
    ports:
      - "8080:8080"
    
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"

volumes:
  mongo_data:
```

### Kubernetes Deployment

**Namespace Strategy:**
```
inventory-management/
├── inventory-backend (Deployment)
├── inventory-frontend (Deployment)
├── mongodb (StatefulSet)
├── redis (StatefulSet)
├── elasticsearch (StatefulSet)
└── keycloak (Deployment)
```

**K8s Resources:**

**Backend Deployment:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: inventory-backend
  namespace: inventory-management
spec:
  replicas: 3
  selector:
    matchLabels:
      app: inventory-backend
  template:
    metadata:
      labels:
        app: inventory-backend
    spec:
      containers:
      - name: backend
        image: inventory-backend:1.0
        ports:
        - containerPort: 3000
        env:
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: mongodb-uri
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: cache-credentials
              key: redis-url
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
```

**Service:**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: inventory-backend-service
  namespace: inventory-management
spec:
  selector:
    app: inventory-backend
  ports:
  - protocol: TCP
    port: 3000
    targetPort: 3000
  type: ClusterIP
```

### CI/CD Pipeline (GitHub Actions)

**Pipeline Stages:**

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  # Test Stage
  test:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:7
        options: >-
          --health-cmd mongosh
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies (Backend)
        run: cd backend && npm ci
      - name: Run backend tests
        run: cd backend && npm run test
      - name: Install dependencies (Frontend)
        run: cd frontend && npm ci
      - name: Run frontend tests
        run: cd frontend && npm run test
  
  # Build Stage
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build backend Docker image
        run: docker build -t inventory-backend:${{ github.sha }} ./backend
      - name: Build frontend Docker image
        run: docker build -t inventory-frontend:${{ github.sha }} ./frontend
      - name: Push to registry
        run: |
          docker tag inventory-backend:${{ github.sha }} inventory-backend:latest
          docker tag inventory-frontend:${{ github.sha }} inventory-frontend:latest
          # Push to registry (e.g., DockerHub, ECR)
  
  # Deploy Stage
  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Kubernetes
        run: |
          kubectl apply -f k8s/deployment.yaml
          kubectl set image deployment/inventory-backend \
            inventory-backend=inventory-backend:${{ github.sha }}
```

---

## 📊 Monitoring & Observability

### Prometheus Metrics

**Key Metrics to Collect:**

| Metric | Type | Labels | Threshold |
|--------|------|--------|-----------|
| http_requests_total | Counter | method, endpoint, status | N/A |
| http_request_duration_seconds | Histogram | endpoint | p95 < 2s |
| mongodb_operations | Counter | operation, collection, status | N/A |
| redis_operations | Counter | command, status | N/A |
| inventory_lot_count | Gauge | status | N/A |
| qc_test_pending | Gauge | test_type | Alert > 100 |
| jwt_validation_failures | Counter | reason | Alert > 10/min |
| database_pool_connections | Gauge | pool | Alert > 80 |

**Prometheus Configuration:**
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'backend'
    static_configs:
      - targets: ['localhost:3000/metrics']
  
  - job_name: 'mongodb'
    static_configs:
      - targets: ['localhost:27017']
  
  - job_name: 'redis'
    static_configs:
      - targets: ['localhost:6379']
```

### Grafana Dashboards

**Standard Dashboards:**
1. **System Health** - CPU, Memory, Disk, Network
2. **API Performance** - Request latency, throughput, errors
3. **Database Performance** - Query latency, connections, transactions
4. **Business Metrics** - Inventory levels, QC pass rate, production rate
5. **Error Tracking** - 5xx errors, validation failures, exceptions

### ELK Stack Configuration

**Logstash Pipeline:**
```
input {
  tcp {
    port => 5000
    codec => json
  }
}

filter {
  if [@timestamp] {
    date {
      match => [ "@timestamp", "ISO8601" ]
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "inventory-logs-%{+YYYY.MM.dd}"
  }
}
```

### Alerting Rules

**Alert Examples:**

```yaml
groups:
  - name: inventory_alerts
    rules:
      - alert: HighAPILatency
        expr: histogram_quantile(0.95, http_request_duration_seconds) > 2
        for: 5m
        annotations:
          summary: "API response time is high"
      
      - alert: QCBacklog
        expr: qc_test_pending > 100
        for: 1h
        annotations:
          summary: "QC test backlog exceeds 100 pending tests"
      
      - alert: InventoryDiscrepancy
        expr: abs(inventory_system - inventory_physical) > 5
        for: 10m
        annotations:
          summary: "Inventory discrepancy detected"
      
      - alert: DatabaseConnectionPoolExhausted
        expr: database_pool_connections > 0.8 * database_pool_max
        for: 5m
        annotations:
          summary: "Database connection pool usage > 80%"
```

---

## 🔄 Data Flow Examples

### Example 1: Stock Receipt Flow

```
Operator Input
└─→ POST /api/v1/inventory-lots (create lot)
    └─→ Validate material exists
    └─→ Generate unique lot_code
    └─→ Insert into inventory_lots (status='Quarantine', available=0)
    └─→ POST /api/v1/inventory-transactions (create RECEIPT tx)
        └─→ Insert tx (type='RECEIPT', status='Pending')
        └─→ Generate label from template
        └─→ Cache lot data in Redis
        └─→ Create QCTest records
        └─→ Emit 'lot.created' event
        └─→ Log to audit_logs
        └─→ Response to Operator
        └─→ Notify QC Technician
    └─→ QC Executes Test
        └─→ POST /api/v1/qc-tests/:id/results
            └─→ Update qc_tests.test_results
            └─→ Compare with specifications
            └─→ Decision: PASS/FAIL/HOLD
            └─→ If PASS:
                └─→ Update inventory_lots.status='Accepted'
                └─→ Update available_quantity = quantity
                └─→ POST /api/v1/inventory-transactions/confirm
                    └─→ Update tx.status='Confirmed'
                    └─→ Invalidate Redis cache
                    └─→ Emit 'lot.accepted' event
                    └─→ Log to audit_logs
            └─→ If FAIL:
                └─→ Update inventory_lots.status='Rejected'
                └─→ Create RETURN InventoryTransaction
                └─→ Emit 'lot.rejected' event
                └─→ Notify Manager
```

### Example 2: Production Batch Flow

```
Planner Input
└─→ POST /api/v1/production-batches (create batch)
    └─→ Validate product exists
    └─→ Generate batch_code
    └─→ Insert into production_batches (status='Planning')
    └─→ POST /api/v1/production-batches/:id/components (add components)
        └─→ Link InventoryLots to batch
        └─→ Reserve quantities using Redis lock
        └─→ Insert into batch_components
        └─→ Update inventory_lots.available_quantity
        └─→ Log to audit_logs
        └─→ Cache batch data
    └─→ Manager Approves
        └─→ PUT /api/v1/production-batches/:id/status (start)
            └─→ Update batch.status='In Progress'
            └─→ Lock inventory_lots from other operations
            └─→ Create initial USAGE InventoryTransactions
            └─→ Emit 'batch.started' event
            └─→ Log to audit_logs
    └─→ During Production:
        └─→ POST /api/v1/inventory-transactions/adjust
            └─→ Record actual consumption
            └─→ Update batch_components.actual_quantity
            └─→ Update inventory_lots.available_quantity
            └─→ Create adjustment transactions
    └─→ Production Complete
        └─→ PUT /api/v1/production-batches/:id/status (finish)
            └─→ Update batch.status='Completed'
            └─→ Release locks on inventory_lots
            └─→ Calculate produced_quantity
            └─→ Create finished product lot
            └─→ Emit 'batch.completed' event
            └─→ Log to audit_logs
            └─→ Generate production report
```

---

## 🛡️ Error Handling & Resilience

### Exception Hierarchy

```
BaseException
├── ValidationException
│   ├── DuplicateKeyException
│   ├── NotFoundExce ption
│   └── InvalidStateException
├── AuthenticationException
│   ├── TokenExpiredException
│   ├── InvalidTokenException
│   └── UnauthorizedException
├── AuthorizationException
│   └── InsufficientPermissionException
├── BusinessLogicException
│   ├── InsufficientInventoryException
│   ├── QCFailureException
│   └── ConflictingTransactionException
├── ExternalServiceException
│   ├── KeycloakException
│   ├── DatabaseException
│   └── CacheException
└── InfrastructureException
    ├── ServiceUnavailableException
    └── TimeoutException
```

### Retry Strategy

| Operation | Retry Count | Backoff Strategy |
|-----------|-------------|------------------|
| Database query | 3 | Exponential (100ms → 500ms) |
| Redis operation | 2 | Linear (50ms) |
| External API | 2 | Exponential (100ms) |
| Keycloak auth | 1 | None (fail fast) |

### Circuit Breaker Pattern

```
CLOSED (normal) 
  ├─→ Request success → stay CLOSED
  └─→ Request fails (threshold) → OPEN

OPEN (fail-fast)
  ├─→ After timeout (30s) → HALF_OPEN
  └─→ Return error immediately

HALF_OPEN (test)
  ├─→ Single test request
  ├─→ Success → CLOSED
  └─→ Failure → OPEN
```

---

## 📈 Scalability Considerations

### Horizontal Scaling

**Backend Pods:**
- Auto-scale based on CPU > 70% or Memory > 80%
- Min replicas: 2, Max replicas: 10
- Rolling deployment with 25% surge

**Database Sharding:**
- Shard key: `lot_code` or `material_id`
- 3-5 shards depending on volume

**Cache Distribution:**
- Redis Cluster with 3+ nodes
- Replication factor: 2

### Vertical Scaling

**Pod Resource Limits:**
```yaml
resources:
  requests:
    memory: "512Mi"
    cpu: "250m"
  limits:
    memory: "2Gi"
    cpu: "1000m"
```

### Database Indexing Strategy

```mongodb
// Materials
db.materials.createIndex({ material_code: 1 })
db.materials.createIndex({ name: "text" })

// InventoryLots
db.inventory_lots.createIndex({ lot_code: 1 })
db.inventory_lots.createIndex({ material_id: 1, status: 1 })
db.inventory_lots.createIndex({ expiry_date: 1 })

// InventoryTransactions
db.inventory_transactions.createIndex({ lot_id: 1, created_at: -1 })
db.inventory_transactions.createIndex({ type: 1, status: 1 })

// QCTests
db.qc_tests.createIndex({ lot_id: 1, status: 1 })
db.qc_tests.createIndex({ created_at: -1 })

// AuditLogs
db.audit_logs.createIndex({ user_id: 1, timestamp: -1 })
db.audit_logs.createIndex({ entity_type: 1, entity_id: 1 })
```

---

## 🔍 Testing Strategy

### Testing Pyramid

```
                △
               / \
              /   \ Unit Tests (50%)
             /     \
            /-------\ Integration (30%)
           /         \
          /-----------\ E2E Tests (20%)
         /             \
        /_____________\
```

### Test Coverage Goals

| Layer | Coverage Target | Tools |
|-------|-----------------|-------|
| Unit (Backend) | 80% | Jest, Supertest |
| Unit (Frontend) | 70% | Vitest, @testing-library |
| Integration | 60% | Jest with test containers |
| E2E | 40% | Playwright, Cypress |

### Test Example (Backend)

```typescript
describe('Material Service', () => {
  describe('createMaterial', () => {
    it('should create a new material with valid input', async () => {
      const input = {
        material_code: 'MAT-001',
        name: 'Test Material',
        unit: 'kg'
      };
      
      const result = await materialService.create(input);
      
      expect(result).toHaveProperty('_id');
      expect(result.material_code).toBe('MAT-001');
      expect(result.is_active).toBe(true);
    });
    
    it('should throw error for duplicate material_code', async () => {
      await materialService.create({ material_code: 'DUP-001' });
      
      await expect(
        materialService.create({ material_code: 'DUP-001' })
      ).rejects.toThrow(DuplicateKeyException);
    });
  });
});
```

---

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing (unit, integration, E2E)
- [ ] Code review completed
- [ ] Security scan passed
- [ ] Database migrations prepared
- [ ] Configuration reviewed
- [ ] Backup taken
- [ ] Rollback plan documented

### Deployment
- [ ] Health checks configured
- [ ] Load balancer updated
- [ ] Rolling deployment started
- [ ] Pod logs monitored
- [ ] Metrics monitored
- [ ] Error rates < 0.1%

### Post-Deployment
- [ ] Smoke tests passed
- [ ] Database consistency verified
- [ ] Audit logs verified
- [ ] Performance baselines met
- [ ] Stakeholders notified

---

## 🔗 References & Standards

### Coding Standards
- Backend: NestJS Style Guide
- Frontend: React Best Practices, TypeScript Strict Mode
- Database: MongoDB Schema Design Best Practices
- API: RESTful API Design Standards (RFC 7231)

### Documentation
- API: OpenAPI/Swagger documentation
- Database: Schema documentation in MongoDB Compass
- Deployment: Kubernetes documentation
- Security: OWASP Top 10

### Code Repository Structure
```
Inventory-Management/
├── backend/                 # NestJS application
│   ├── src/
│   ├── test/
│   ├── docker/
│   ├── Dockerfile
│   └── package.json
├── frontend/                # React application
│   ├── src/
│   ├── public/
│   ├── docker/
│   ├── Dockerfile
│   └── package.json
├── database/                # Database setup scripts
│   ├── mongodb/
│   ├── migrations/
│   └── seeds/
├── infra/                   # Infrastructure as Code
│   ├── k8s/                # Kubernetes manifests
│   ├── terraform/          # Terraform configs
│   └── docker-compose.yml
├── docs/                    # Documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── DEPLOYMENT.md
└── CI-CD/                   # Pipeline configs
    ├── .github/workflows/
    └── Jenkinsfile
```

---

## 📞 Support & Escalation

### Support Channels
- **Bug Reports:** GitHub Issues
- **Feature Requests:** GitHub Discussions
- **Security Issues:** security@company.com
- **Performance Issues:** devops-team@company.com

### On-Call Escalation
1. **Tier 1:** Development team (incident response)
2. **Tier 2:** DevOps/Infrastructure team (infrastructure issues)
3. **Tier 3:** Product/Architecture team (design decisions)

---

**Document Status:** DRAFT v1.0  
**Last Review:** March 13, 2026  
**Next Review:** Q2 2026  
**Version Control:** Git  
**Location:** `/01_Documents/ARCHITECTURE_01.md`
