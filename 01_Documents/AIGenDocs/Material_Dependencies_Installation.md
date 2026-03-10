# Material Module - Dependency Installation Guide

## 🚀 Quick Setup

Run these commands to install all required dependencies for the Material module.

### Backend Dependencies

```bash
cd "c:\Users\ADMIN\Documents\GitHub\Inventory-Management\02_Source\01_Source Code\backend"

# Install validation and transformation libraries
npm install class-validator class-transformer

# Install Swagger/OpenAPI support
npm install @nestjs/swagger swagger-ui-express

# Install dev dependencies for testing
npm install --save-dev @types/jest @types/node
```

### Frontend Dependencies

```bash
cd "c:\Users\ADMIN\Documents\GitHub\Inventory-Management\02_Source\01_Source Code\frontend"

# Install axios for API calls
npm install axios

# Install React Router (if not already installed)
npm install react-router-dom

# Install TypeScript types
npm install --save-dev @types/react-router-dom
```

## 📦 Complete Dependency List

### Backend (`backend/package.json`)

Required dependencies:
```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/mongoose": "^10.0.0",
    "@nestjs/swagger": "^7.1.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "mongoose": "^7.0.0",
    "swagger-ui-express": "^5.0.0",
    "rxjs": "^7.8.0",
    "reflect-metadata": "^0.1.13"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/jest": "^29.0.0",
    "jest": "^29.0.0",
    "ts-jest": "^29.0.0",
    "typescript": "^5.0.0"
  }
}
```

### Frontend (`frontend/package.json`)

Required dependencies:
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/react-router-dom": "^5.3.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}
```

## 🔧 TypeScript Configuration

### Backend `tsconfig.json` should include:
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false
  }
}
```

### Frontend `tsconfig.json` should include:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## ⚠️ Known Issues & Fixes

### Issue 1: File Casing Warning (Material.ts vs material.ts)
**Problem**: Windows is case-insensitive, but TypeScript prefers consistent casing.

**Fix**: The file is already named correctly as `material.ts` (lowercase). The warning can be ignored or suppressed.

### Issue 2: Missing Dependencies
**Problem**: `class-validator`, `class-transformer`, `@nestjs/swagger`, `axios` not installed.

**Fix**: Run the installation commands above.

### Issue 3: Implicit 'any' Types in Axios Interceptors
**Problem**: TypeScript strict mode errors on axios interceptors.

**Fix**: Already handled - TypeScript config set `noImplicitAny: false` or upgrade to stricter typing.

## 🧪 Verify Installation

### Backend Verification
```bash
cd backend
npm run build
# Should compile without errors
```

### Frontend Verification
```bash
cd frontend
npm run build
# Should compile without errors
```

### Run Tests
```bash
# Backend tests
cd backend
npm test material.service.spec.ts

# Frontend (no tests yet, but type-check)
cd frontend
npx tsc --noEmit
```

## 🚀 Start Development Servers

After installing dependencies:

### Terminal 1 - Backend
```bash
cd "c:\Users\ADMIN\Documents\GitHub\Inventory-Management\02_Source\01_Source Code\backend"
npm run start:dev
```

### Terminal 2 - Frontend
```bash
cd "c:\Users\ADMIN\Documents\GitHub\Inventory-Management\02_Source\01_Source Code\frontend"
npm run dev
```

## 📝 Post-Installation Steps

1. **Configure Environment Variables**
   - Backend: Create `.env` with `MONGODB_URI`, `JWT_SECRET`, `PORT`
   - Frontend: Create `.env` with `VITE_API_BASE_URL`

2. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod --dbpath "path/to/data"
   
   # Or use Docker
   docker run -d -p 27017:27017 --name mongodb mongo:7
   ```

3. **Verify API**
   - Open `http://localhost:3000/api` for Swagger docs
   - Test endpoint: `http://localhost:3000/materials`

4. **Verify Frontend**
   - Open `http://localhost:5173/materials`
   - Should see Material List page

## 🔄 Troubleshooting

### "Cannot find module" errors persist
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript compilation errors
```bash
# Rebuild TypeScript
npm run build

# Or clear cache
npx tsc --build --clean
npx tsc --build
```

### Port conflicts
- Backend: Change `PORT=3000` in `.env` to `PORT=3001`
- Frontend: Vite will auto-increment to 5174 if 5173 is busy

## ✅ Final Checklist

- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] MongoDB running
- [ ] Environment variables configured
- [ ] Backend compiles without errors
- [ ] Frontend compiles without errors
- [ ] Backend starts successfully on port 3000
- [ ] Frontend starts successfully on port 5173
- [ ] Can access Swagger docs at `/api`
- [ ] Can access Material List page

Once all items are checked, the Material module is ready for use!

---

**Last Updated**: March 6, 2026
