# 🚀 Material Module Deployment Plan

**Project:** Inventory Management System - Material Module  
**Date:** March 6, 2026  
**Version:** 1.0.0  
**Status:** Ready for Deployment (with MongoDB configuration pending)

---

## 📋 Table of Contents
1. [Current Status](#current-status)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Deployment Strategies](#deployment-strategies)
4. [Step-by-Step Deployment](#step-by-step-deployment)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Rollback Plan](#rollback-plan)
7. [Troubleshooting](#troubleshooting)

---

## 1. Current Status

### ✅ Completed Components

#### Backend (NestJS)
- ✅ Material Schema with 7 material types
- ✅ Full CRUD operations with soft delete
- ✅ Material Service with 15 methods
- ✅ Material Controller with 9 REST endpoints
- ✅ DTOs with validation (class-validator)
- ✅ Unit tests: **12/12 passing (100%)**
- ✅ TypeScript compilation: **0 errors**
- ✅ Dependencies installed:
  - class-validator
  - class-transformer
  - @nestjs/swagger

#### Frontend (React + TypeScript)
- ✅ Material types and interfaces
- ✅ Material service (API client with axios)
- ✅ MaterialList component with pagination
- ✅ MaterialForm component (create/edit)
- ✅ MaterialDetail component
- ✅ Routing configuration
- ✅ Build successful: **0 errors**
- ✅ Dependencies installed:
  - axios
  - react-router-dom

#### Documentation
- ✅ Implementation summary
- ✅ Testing guide
- ✅ MongoDB setup guide
- ✅ This deployment plan

### ⚠️ Pending Issues

#### MongoDB Connection
- **Status:** MongoDB Atlas SSL/TLS handshake error
- **Error:** `MongoNetworkError: ssl3_read_bytes:tlsv1 alert internal error`
- **Impact:** Backend cannot connect to database
- **Priority:** **HIGH** - Must resolve before deployment

#### Environment Configuration
- **Recent Fix:** Consolidated from 2 MongoDB URIs to 1
- **Current DB Name:** `inventory_management_db` (standardized)
- **Current Config:** Atlas connection string with TLS bypass

---

## 2. Pre-Deployment Checklist

### Environment Requirements
- [ ] Node.js v18+ installed (Current: v22.16.0) ✅
- [ ] npm v8+ installed (Current: v11.8.0) ✅
- [ ] MongoDB accessible (Atlas/Local/Docker) ⚠️
- [ ] Port 3000 available (Backend)
- [ ] Port 5173/5174 available (Frontend)

### Database Setup
Choose ONE option:

#### Option A: MongoDB Atlas (Cloud) - Current Configuration
- [ ] Verify cluster is active
- [ ] Add current IP to whitelist: Network Access → Add IP Address
- [ ] Verify credentials: Database Access → pvminh1024_db_user
- [ ] Test connection with MongoDB Compass
- [ ] Update `.env` if needed

#### Option B: Docker MongoDB (Recommended for Development)
- [ ] Docker Desktop installed
- [ ] Pull MongoDB image: `docker pull mongo:latest`
- [ ] Run container (see Section 3.2)
- [ ] Update `.env` to local connection

#### Option C: Local MongoDB Installation
- [ ] Download MongoDB Community Server
- [ ] Install and start mongod service
- [ ] Update `.env` to localhost connection

### Code Verification
- [✅] Backend unit tests passing (12/12)
- [✅] Frontend builds without errors
- [✅] No TypeScript compilation errors
- [ ] Environment variables configured
- [ ] CORS configured for frontend domain

---

## 3. Deployment Strategies

### 3.1 Strategy A: MongoDB Atlas (Production-Ready)

**Best for:** Production deployment, team collaboration

**Pros:**
- ✅ Zero infrastructure management
- ✅ Automatic backups
- ✅ High availability
- ✅ Free tier available

**Cons:**
- ⚠️ Network/SSL configuration required
- ⚠️ IP whitelist management
- ⚠️ Currently blocked by SSL error

**Resolution Steps:**

1. **Fix Atlas Connection:**
   ```bash
   # Test current IP
   curl https://api.ipify.org
   ```
   
2. **Update Atlas Whitelist:**
   - Go to https://cloud.mongodb.com
   - Select your cluster → Network Access
   - Add Current IP Address
   - OR add `0.0.0.0/0` (allow all - for testing only)

3. **Verify Credentials:**
   - Database Access → Check user: `pvminh1024_db_user`
   - Password: `admin123`
   - Built-in Role: atlasAdmin or readWriteAnyDatabase

4. **Alternative Connection String:**
   ```env
   # If SSL error persists, try standard connection:
   MONGODB_URI=mongodb://pvminh1024_db_user:admin123@cluster0-shard-00-00.igdv7pj.mongodb.net:27017,cluster0-shard-00-01.igdv7pj.mongodb.net:27017,cluster0-shard-00-02.igdv7pj.mongodb.net:27017/inventory_management_db?ssl=true&replicaSet=atlas-xxxxx-shard-0&authSource=admin&retryWrites=true&w=majority
   ```

### 3.2 Strategy B: Docker MongoDB (Recommended for Local Development)

**Best for:** Local development, testing, avoiding Atlas issues

**Pros:**
- ✅ Fast setup (2 minutes)
- ✅ No network issues
- ✅ Full control
- ✅ Works offline

**Setup:**

```powershell
# 1. Pull MongoDB image
docker pull mongo:latest

# 2. Run MongoDB container
docker run -d `
  --name inventory-mongodb `
  -p 27017:27017 `
  -e MONGO_INITDB_ROOT_USERNAME=admin `
  -e MONGO_INITDB_ROOT_PASSWORD=password123 `
  -e MONGO_INITDB_DATABASE=inventory_management_db `
  mongo:latest

# 3. Verify container is running
docker ps

# 4. View logs
docker logs inventory-mongodb

# Container management:
docker stop inventory-mongodb    # Stop container
docker start inventory-mongodb   # Start container
docker rm inventory-mongodb      # Remove container
```

**Update `.env`:**
```env
# MongoDB Local Configuration
MONGODB_URI=mongodb://admin:password123@localhost:27017/inventory_management_db?authSource=admin

# Application Configuration
PORT=3000
NODE_ENV=development
```

### 3.3 Strategy C: Local MongoDB Installation

**Best for:** Teams without Docker

**Installation:**
1. Download: https://www.mongodb.com/try/download/community
2. Install with default settings
3. Start service:
   ```powershell
   net start MongoDB
   ```

**Update `.env`:**
```env
MONGODB_URI=mongodb://localhost:27017/inventory_management_db
PORT=3000
NODE_ENV=development
```

---

## 4. Step-by-Step Deployment

### Phase 1: Database Setup (Choose Strategy from Section 3)

**If using Docker (Recommended):**
```powershell
# Navigate to project root
cd C:\Users\ADMIN\Documents\GitHub\Inventory-Management

# Run Docker MongoDB
docker run -d `
  --name inventory-mongodb `
  -p 27017:27017 `
  -e MONGO_INITDB_ROOT_USERNAME=admin `
  -e MONGO_INITDB_ROOT_PASSWORD=password123 `
  mongo:latest

# Wait 10 seconds for startup
Start-Sleep -Seconds 10

# Verify
docker logs inventory-mongodb
```

**Update Backend `.env`:**
```powershell
cd "02_Source\01_Source Code\backend"

# Edit .env file to:
# MONGODB_URI=mongodb://admin:password123@localhost:27017/inventory_management_db?authSource=admin
# PORT=3000
# NODE_ENV=development
```

### Phase 2: Backend Deployment

```powershell
# 1. Navigate to backend directory
cd "C:\Users\ADMIN\Documents\GitHub\Inventory-Management\02_Source\01_Source Code\backend"

# 2. Install dependencies (if not done)
npm install

# 3. Run unit tests (verify)
npm test -- material.service.spec.ts
# Expected: 12 passed

# 4. Clean and build
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
npm run build

# 5. Start development server
npm run start:dev

# OR for production mode:
npm run start:prod
```

**Expected Output:**
```
[Nest] Starting Nest application...
[Nest] InstanceLoader DatabaseModule dependencies initialized +44ms
[Nest] MongooseModule dependencies initialized +1ms
[Nest] MaterialModule dependencies initialized +5ms
[Nest] Nest application successfully started +120ms
[Nest] Application is running on: http://localhost:3000
```

**Verify Backend:**
```powershell
# Open new PowerShell terminal

# Test health endpoint
curl http://localhost:3000

# Test materials endpoint
curl http://localhost:3000/materials

# View Swagger API docs
Start-Process "http://localhost:3000/api"
```

### Phase 3: Frontend Deployment

```powershell
# 1. Open new PowerShell terminal
cd "C:\Users\ADMIN\Documents\GitHub\Inventory-Management\02_Source\01_Source Code\frontend"

# 2. Install dependencies (if not done)
npm install

# 3. Update API base URL (if needed)
# Check src/services/materialService.ts
# Ensure baseURL matches backend: http://localhost:3000

# 4. Start development server
npm run dev

# OR build for production:
npm run build
npm run preview
```

**Expected Output:**
```
ROLLDOWN-VITE ready in 2453 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Verify Frontend:**
- Open browser → http://localhost:5173
- Navigate to Materials page
- Should see Material list interface

### Phase 4: Integration Testing

**Test Workflow:**

1. **Create Material:**
   - Navigate to http://localhost:5173/materials/new
   - Fill form:
     - Part Number: TEST-001
     - Material Name: Test Material
     - Type: API
     - Storage: 2-8°C
   - Click "Create"
   - Should redirect to list

2. **View List:**
   - http://localhost:5173/materials
   - Should see TEST-001 in table
   - Verify pagination, search, filter

3. **View Detail:**
   - Click on TEST-001
   - Should show full material details

4. **Edit Material:**
   - Click "Edit" button
   - Modify Material Name → "Updated Test Material"
   - Click "Update"
   - Should reflect changes

5. **Delete Material:**
   - Click "Delete" button
   - Confirm deletion
   - Material should disappear from list (soft delete)

**API Testing:**
```powershell
# Create material
$body = @{
    part_number = "API-001"
    material_name = "Ascorbic Acid"
    material_type = "API"
    storage_conditions = "2-8°C"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/materials" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body

# Get all materials
Invoke-RestMethod -Uri "http://localhost:3000/materials" -Method GET

# Get by part number
Invoke-RestMethod -Uri "http://localhost:3000/materials/part-number/API-001" -Method GET

# Get statistics
Invoke-RestMethod -Uri "http://localhost:3000/materials/statistics" -Method GET
```

---

## 5. Post-Deployment Verification

### Backend Health Check
- [ ] Server starts without errors
- [ ] MongoDB connection successful
- [ ] Swagger docs accessible: http://localhost:3000/api
- [ ] All 9 endpoints respond:
  - GET /materials
  - POST /materials
  - GET /materials/statistics
  - GET /materials/part-number/:num
  - GET /materials/material-id/:id
  - GET /materials/:id
  - PATCH /materials/:id
  - DELETE /materials/:id
  - POST /materials/bulk

### Frontend Health Check
- [ ] Application loads without console errors
- [ ] Material list page renders
- [ ] Navigation works (list → detail → form)
- [ ] Search/filter functional
- [ ] Pagination works
- [ ] Forms submit successfully
- [ ] Error handling displays properly

### Database Verification
```powershell
# If using Docker:
docker exec -it inventory-mongodb mongosh

# Inside MongoDB shell:
use inventory_management_db
show collections
db.materials.countDocuments()
db.materials.find().limit(5)
exit
```

### Performance Check
- [ ] Backend response time < 200ms for GET requests
- [ ] Frontend initial load < 3 seconds
- [ ] No memory leaks (monitor for 10 minutes)
- [ ] No console errors or warnings

---

## 6. Rollback Plan

### If Deployment Fails:

**Backend Rollback:**
```powershell
# 1. Stop current server (Ctrl + C in terminal)

# 2. Revert .env changes
cd "C:\Users\ADMIN\Documents\GitHub\Inventory-Management\02_Source\01_Source Code\backend"
git checkout .env

# 3. Restore previous build
git checkout dist/

# 4. Restart
npm run start:dev
```

**Frontend Rollback:**
```powershell
# 1. Stop current server (Ctrl + C)

# 2. Revert changes
cd "C:\Users\ADMIN\Documents\GitHub\Inventory-Management\02_Source\01_Source Code\frontend"
git checkout src/

# 3. Restart
npm run dev
```

**Database Rollback:**
```powershell
# If using Docker and need fresh start:
docker stop inventory-mongodb
docker rm inventory-mongodb

# Re-run setup from Phase 1
```

---

## 7. Troubleshooting

### Issue 1: MongoDB Connection Failed

**Symptoms:**
```
[MongooseModule] Unable to connect to the database
MongoNetworkError: connect ECONNREFUSED
```

**Solutions:**

A. **For Atlas:**
```powershell
# Test your IP
curl https://api.ipify.org

# Add this IP to Atlas Network Access
# Or temporarily allow all: 0.0.0.0/0
```

B. **For Docker:**
```powershell
# Check if container is running
docker ps

# If not, start it
docker start inventory-mongodb

# Check logs
docker logs inventory-mongodb

# If still failing, recreate
docker stop inventory-mongodb
docker rm inventory-mongodb
# Then run docker run command from Phase 1
```

C. **For Local MongoDB:**
```powershell
# Check if service is running
Get-Service MongoDB

# If not, start it
net start MongoDB

# Or use MongoDB Compass to verify
```

### Issue 2: SSL/TLS Error (Current Issue)

**Symptoms:**
```
MongoNetworkError: ssl3_read_bytes:tlsv1 alert internal error
```

**Solutions (in order):**

1. **Switch to Docker (Fastest):**
   - Follow Strategy B in Section 3.2
   - Update `.env` to local connection
   - Restart backend

2. **Fix Atlas Whitelist:**
   - Get your IP: https://www.whatismyip.com
   - Atlas → Network Access → Add IP Address
   - Wait 2-3 minutes for propagation

3. **Downgrade MongoDB Driver:**
   ```powershell
   cd backend
   npm install mongodb@5.9.0
   npm install @nestjs/mongoose@10.0.2
   npm run start:dev
   ```

4. **Use Standard Connection (not SRV):**
   - Get standard connection string from Atlas
   - Replace `mongodb+srv://` with `mongodb://`
   - Update `.env`

### Issue 3: Port Already in Use

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions:**
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or change port in .env
# PORT=3001
```

### Issue 4: Frontend Cannot Connect to Backend

**Symptoms:**
- Network errors in browser console
- "Failed to fetch" errors
- CORS errors

**Solutions:**

A. **Check Backend CORS:**
```typescript
// In backend/src/main.ts
app.enableCors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
});
```

B. **Update Frontend API URL:**
```typescript
// In frontend/src/services/materialService.ts
const API_BASE_URL = 'http://localhost:3000';
```

C. **Verify Backend is Running:**
```powershell
curl http://localhost:3000/materials
```

### Issue 5: Build Errors

**TypeScript Errors:**
```powershell
# Backend
cd backend
npm run build

# If errors, check:
# - tsconfig.json settings
# - Missing type definitions
# - Import statements
```

**Frontend Build Errors:**
```powershell
cd frontend
npm run build

# Common fixes:
# - Update dependencies: npm update
# - Clear cache: rm -rf node_modules package-lock.json; npm install
# - Check for type errors in components
```

### Issue 6: Unit Tests Failing

**If tests fail after deployment:**
```powershell
cd backend
npm test -- material.service.spec.ts --verbose

# Check for:
# - Mock setup issues
# - Environment variable changes
# - Schema changes not reflected in tests
```

---

## 8. Production Deployment Considerations

### Environment Variables

**Backend `.env.production`:**
```env
MONGODB_URI=mongodb+srv://prod_user:SECURE_PASSWORD@cluster0.igdv7pj.mongodb.net/inventory_management_prod?retryWrites=true&w=majority
PORT=3000
NODE_ENV=production
JWT_SECRET=your-secure-jwt-secret-here
CORS_ORIGIN=https://your-frontend-domain.com
```

**Frontend `.env.production`:**
```env
VITE_API_BASE_URL=https://api.your-backend-domain.com
```

### Security Checklist
- [ ] Change all default passwords
- [ ] Use environment-specific credentials
- [ ] Enable HTTPS/TLS
- [ ] Configure proper CORS origins
- [ ] Add rate limiting
- [ ] Enable authentication/authorization
- [ ] Set up logging and monitoring
- [ ] Configure firewall rules
- [ ] Regular security audits

### Deployment Platforms

**Backend Options:**
- **Heroku:** Easy deployment, free tier available
- **AWS EC2:** Full control, scalable
- **Google Cloud Run:** Containerized, auto-scaling
- **DigitalOcean:** Simple, cost-effective
- **Azure App Service:** Enterprise-ready

**Frontend Options:**
- **Vercel:** Optimized for Vite/React
- **Netlify:** Easy CI/CD integration
- **GitHub Pages:** Free hosting
- **AWS S3 + CloudFront:** Scalable CDN
- **Azure Static Web Apps:** Integrated with backend

### Monitoring and Logging

**Recommended Tools:**
- **Backend Monitoring:** PM2, New Relic, Datadog
- **Frontend Monitoring:** Sentry, LogRocket
- **Database Monitoring:** MongoDB Atlas Charts, Prometheus
- **Uptime Monitoring:** Pingdom, UptimeRobot

---

## 9. Quick Start Commands

### Development Mode (Local - Recommended)

**Terminal 1 - Database:**
```powershell
docker run -d --name inventory-mongodb -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password123 mongo:latest
```

**Terminal 2 - Backend:**
```powershell
cd "C:\Users\ADMIN\Documents\GitHub\Inventory-Management\02_Source\01_Source Code\backend"
# Update .env: MONGODB_URI=mongodb://admin:password123@localhost:27017/inventory_management_db?authSource=admin
npm run start:dev
```

**Terminal 3 - Frontend:**
```powershell
cd "C:\Users\ADMIN\Documents\GitHub\Inventory-Management\02_Source\01_Source Code\frontend"
npm run dev
```

**Access:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Swagger Docs: http://localhost:3000/api

### Production Mode

```powershell
# Backend
cd backend
npm run build
npm run start:prod

# Frontend
cd frontend
npm run build
# Serve dist/ folder with nginx or serve
```

---

## 10. Support and Resources

### Documentation
- [Material Implementation Guide](../01_Documents/Material_Implementation_Complete_Summary.md)
- [Testing Guide](../01_Documents/Material_Implementation_Testing_Guide.md)
- [MongoDB Setup Guide](../01_Documents/MONGODB_SETUP.md)

### External Resources
- **NestJS Docs:** https://docs.nestjs.com
- **React Docs:** https://react.dev
- **MongoDB Atlas:** https://docs.atlas.mongodb.com
- **Docker Docs:** https://docs.docker.com

### Common Commands Reference

```powershell
# Backend
npm run start:dev        # Development mode with watch
npm run start:prod       # Production mode
npm run build            # Compile TypeScript
npm test                 # Run all tests
npm run test:watch       # Watch mode for tests
npm run lint             # Check code style

# Frontend
npm run dev              # Development server
npm run build            # Production build
npm run preview          # Preview production build
npm run lint             # Check code style

# Docker
docker ps                # List running containers
docker logs CONTAINER    # View container logs
docker stop CONTAINER    # Stop container
docker start CONTAINER   # Start container
docker restart CONTAINER # Restart container

# MongoDB
mongosh                  # Connect to MongoDB shell
mongodump                # Backup database
mongorestore             # Restore database
```

---

## 📝 Deployment Log Template

**Deployment Date:** _____________  
**Deployed By:** _____________  
**Strategy Used:** □ Atlas  □ Docker  □ Local MongoDB

**Pre-Deployment:**
- [ ] Unit tests passed (12/12)
- [ ] Build successful
- [ ] Environment variables configured
- [ ] Database accessible

**Deployment Steps:**
- [ ] Phase 1: Database setup completed at __:__
- [ ] Phase 2: Backend deployed at __:__
- [ ] Phase 3: Frontend deployed at __:__
- [ ] Phase 4: Integration tests passed at __:__

**Post-Deployment:**
- [ ] All endpoints responding
- [ ] Frontend accessible
- [ ] No errors in logs
- [ ] Performance acceptable

**Notes:**
_________________________________________________________________
_________________________________________________________________

**Rollback Required:** □ Yes  □ No  
**Reason:** _______________________________________________________

---

## ✅ Deployment Success Criteria

**Deployment is considered successful when:**
1. ✅ Backend server starts and connects to database
2. ✅ All 12 unit tests pass
3. ✅ All 9 API endpoints respond correctly
4. ✅ Swagger documentation accessible
5. ✅ Frontend application loads without errors
6. ✅ Can create, read, update, delete materials
7. ✅ Search and filter functionality works
8. ✅ No console errors or warnings
9. ✅ Application runs stable for 10+ minutes
10. ✅ Performance meets requirements (<200ms API, <3s page load)

---

**End of Deployment Plan**

**Next Steps:** Choose deployment strategy (recommend Docker for development), execute Phase 1-4, verify all criteria, then proceed to production deployment if needed.
