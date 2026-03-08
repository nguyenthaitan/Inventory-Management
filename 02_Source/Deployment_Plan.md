# Inventory Management System - Deployment Plan

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Backend Deployment (Render)](#backend-deployment-render)
4. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
5. [Environment Variables](#environment-variables)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Troubleshooting](#troubleshooting)
8. [Rollback Procedures](#rollback-procedures)
9. [Deployment Checklist](#deployment-checklist)

---

## Architecture Overview

```
┌─────────────────────────┐
│   Vercel Frontend       │
│   (Static + Functions)  │
│   React + Vite          │
│   https://vercel.app    │
└────────────┬────────────┘
             │ HTTP/REST
             ▼
┌─────────────────────────┐
│   Render Backend        │
│   (Node.js Web Service) │
│   NestJS                │
│   https://render.com    │
└────────────┬────────────┘
             │ TCP
             ▼
┌─────────────────────────┐
│  MongoDB Atlas Cloud    │
│  (Managed Database)     │
│  MongoDB 5.0+           │
└─────────────────────────┘
```

**Data Flow:**

1. User accesses Vercel frontend (CDN-distributed globally)
2. React app makes API calls to Render backend (`/api/*` endpoints)
3. Backend connects to MongoDB Atlas (IPv6/IPv4 support)
4. Response returns through same path

**Benefits:**

- **Frontend:** Auto-scaling, global CDN, free tier included
- **Backend:** Auto-restart on failure, environment variable management, Docker support
- **Database:** Automatic backups, role-based access control, built-in monitoring

---

## Prerequisites

**Required Accounts:**

- [ ] GitHub account with repository access
- [ ] Render.com account (free tier available)
- [ ] Vercel.com account (free tier available)
- [ ] MongoDB Atlas account (already configured with cluster)

**Local Requirements:**

- Node.js 18+ installed
- npm or yarn package manager
- Git CLI configured with GitHub credentials

**Code Requirements:**

- Backend pushed to GitHub main branch
- Frontend pushed to GitHub main branch
- `.env` files for local development (not in git)
- `.env.production` for production settings

---

## Backend Deployment (Render)

### Step 1: Prepare Backend Repository

1. Ensure all backend code is committed and pushed to GitHub:

   ```bash
   cd 02_Source/01_Source\ Code/backend
   git add .
   git commit -m "Prepare backend for deployment"
   git push origin main
   ```

2. Verify `package.json` has correct build scripts:

   ```json
   {
     "scripts": {
       "build": "nest build",
       "start": "nest start",
       "start:dev": "nest start --watch",
       "start:prod": "node dist/main"
     }
   }
   ```

3. Create `.env.production` (do not commit):
   ```env
   NODE_ENV=production
   MONGO_URI=mongodb+srv://admin:123@inventorymanagement.kbyjdmp.mongodb.net/inventory_management_db
   JWT_SECRET=your-secret-key-min-32-chars-recommended
   FRONTEND_URL=https://your-vercel-app.vercel.app
   LOG_LEVEL=info
   ```

### Step 2: Create Render Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)

2. Click **"New +"** → **"Web Service"**

3. Connect GitHub repository:
   - Select your GitHub repository containing the backend
   - Authorize Render to access GitHub
   - Branch: `main`

4. Configure service settings:

   ```
   Name: inventory-mgmt-api
   Root Directory: 02_Source/01_Source Code/backend
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm run start:prod
   Instance Type: Free
   Autodeply: Yes (from main branch)
   ```

5. Click **"Create Web Service"**

### Step 3: Configure Environment Variables

1. In Render dashboard, go to your service → **"Environment"**

2. Add the following environment variables:

   ```
   NODE_ENV = production
   MONGO_URI = mongodb+srv://admin:123@inventorymanagement.kbyjdmp.mongodb.net/inventory_management_db
   JWT_SECRET = your-production-jwt-secret-key-at-least-32-chars
   FRONTEND_URL = https://your-vercel-frontend-url.vercel.app
   LOG_LEVEL = info
   ```

3. Click **"Save"** - service will auto-redeploy with new variables

### Step 4: Monitor Deployment

1. Check **"Logs"** tab for build and startup messages
2. Look for: `[Nest] 123 - 03/06/2026, 2:34:56 PM LOG [NestFactory] Starting Nest application...`
3. Service is ready when status shows **"Live"** (green indicator)

### Step 5: Get Backend URL

- Render assigns URL: `https://inventory-mgmt-api.onrender.com`
- (Actual URL differs; check Render dashboard)
- Test endpoint: `curl https://inventory-mgmt-api.onrender.com/api/materials`
- Expected: `{"data":[],"total":0,"page":1,"limit":10}`

---

## Frontend Deployment (Vercel)

### Step 1: Prepare Frontend Repository

1. Ensure all frontend code is committed and pushed:

   ```bash
   cd 02_Source/01_Source\ Code/frontend
   git add .
   git commit -m "Prepare frontend for deployment"
   git push origin main
   ```

2. Create `.env.production` (do not commit):

   ```env
   VITE_API_URL=https://inventory-mgmt-api.onrender.com/api
   ```

   Replace with actual Render backend URL from Step 5 above.

3. Verify `package.json` build script:
   ```json
   {
     "scripts": {
       "build": "tsc -b && vite build",
       "preview": "vite preview"
     }
   }
   ```

### Step 2: Connect Vercel to GitHub

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)

2. Click **"Add New..."** → **"Project"**

3. Select **"Import Git Repository"**
   - Find your GitHub repo with frontend code
   - Click **"Import"**

4. Configure project settings:

   ```
   Project Name: inventory-management
   Framework: Vite (auto-detected)
   Root Directory: ./02_Source/01_Source Code/frontend
   Build Command: npm run build
   Output Directory: dist
   ```

5. Click **"Deploy"**

### Step 3: Configure Environment Variables

1. After import, go to project **"Settings"** → **"Environment Variables"**

2. Add production variable:

   ```
   Name: VITE_API_URL
   Value: https://inventory-mgmt-api.onrender.com/api
   Environment: Production
   ```

3. Click **"Save"** - this will auto-redeploy

### Step 4: Complete Deployment

- Vercel automatically deploys when you push to main branch
- Watch deployment progress in Vercel console
- Project is live when status shows **"Ready for inspection"**
- Vercel assigns URL: `https://inventory-management-xyz.vercel.app`

---

## Environment Variables

### Backend (Render)

| Variable     | Example                                                        | Purpose                                      | Required |
| ------------ | -------------------------------------------------------------- | -------------------------------------------- | -------- |
| NODE_ENV     | production                                                     | Node.js environment flag                     | Yes      |
| MONGO_URI    | mongodb+srv://admin:123@...mongodb.net/inventory_management_db | MongoDB connection string                    | Yes      |
| JWT_SECRET   | abc123def456ghi789jkl...                                       | Token signing key (min 32 chars)             | Yes      |
| FRONTEND_URL | https://app.vercel.app                                         | CORS allowed origin                          | Yes      |
| LOG_LEVEL    | info                                                           | Logging verbosity (error\|warn\|info\|debug) | No       |

### Frontend (Vercel)

| Variable     | Example                      | Purpose              | Required |
| ------------ | ---------------------------- | -------------------- | -------- |
| VITE_API_URL | https://api.onrender.com/api | Backend API base URL | Yes      |

**Security Notes:**

- Never commit `.env.production` files to GitHub
- Use Render/Vercel's dashboard for secrets management
- Rotate JWT_SECRET quarterly
- Use strong random strings for sensitive variables

---

## Post-Deployment Verification

### 1. Backend Health Check

```bash
# Check if backend is running
curl -X GET https://inventory-mgmt-api.onrender.com/api/materials

# Expected response:
{
  "data": [],
  "total": 0,
  "page": 1,
  "limit": 10
}
```

### 2. Frontend Access

1. Open browser and visit Vercel frontend URL
2. Verify page loads without CORS errors
3. Check browser console (F12) for any errors

### 3. API Connectivity Test

1. In frontend, open browser DevTools → Network tab
2. Click "New Material" button
3. Verify API calls go to Render backend (not localhost)
4. Verify responses contain correct data

### 4. CRUD Operations Test

**Create Material:**

```bash
curl -X POST https://inventory-mgmt-api.onrender.com/api/materials \
  -H "Content-Type: application/json" \
  -d '{
    "material_id": "MAT-001",
    "part_number": "PN-001",
    "material_name": "Test Material",
    "material_type": "API"
  }'
```

**List Materials:**

```bash
curl -X GET https://inventory-mgmt-api.onrender.com/api/materials
```

**Search Materials:**

```bash
curl -X GET "https://inventory-mgmt-api.onrender.com/api/materials/search?q=test"
```

**Get Single Material:**

```bash
curl -X GET https://inventory-mgmt-api.onrender.com/api/materials/{id}
```

**Update Material:**

```bash
curl -X PUT https://inventory-mgmt-api.onrender.com/api/materials/{id} \
  -H "Content-Type: application/json" \
  -d '{"material_name": "Updated Name"}'
```

**Delete Material:**

```bash
curl -X DELETE https://inventory-mgmt-api.onrender.com/api/materials/{id}
```

### 5. Performance Check

1. Run Lighthouse audit in Chrome DevTools
2. Target Mobile: 90+ Performance score
3. Target Mobile: 90+ Accessibility score
4. Check load time < 3 seconds

---

## Troubleshooting

### Common Issues & Solutions

#### Issue: Backend returns 503 Service Unavailable

**Cause:** Service still starting up (Render free tier cold start ~30 seconds)

**Solution:**

1. Wait 30-60 seconds for service to fully initialize
2. Check Render logs: Dashboard → Logs tab
3. Look for errors in log output
4. If still failing, redeploy: Dashboard → Manual Deploy

#### Issue: Frontend CORS errors

**Symptoms:** Browser console shows "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solution:**

1. Verify `FRONTEND_URL` environment variable in Render backend matches deployed Vercel URL
2. Backend must have CORS configuration accepting the Vercel domain
3. Redeploy backend after updating environment variable

**Backend CORS Configuration (NestJS):**

```typescript
// In main.ts or app module
app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
});
```

#### Issue: Cannot connect to MongoDB

**Symptoms:** Backend crashes with "MongoServerError" or "ECONNREFUSED"

**Cause:** MongoDB URI incorrect or whitelist missing

**Solution:**

1. Verify MONGO_URI environment variable (check for typos)
2. In MongoDB Atlas, go to Security → Network Access
3. Add Render IP to whitelist:
   - Click "Add IP Address"
   - Select "Allow access from anywhere" (0.0.0.0/0)
   - OR add specific Render egress IPs (check Render docs)
4. Restart backend service

#### Issue: Frontend and backend URLs don't match

**Symptoms:** Deployment works locally but fails in production

**Solution:**

1. Get actual Render backend URL from Render dashboard (not localhost:3000)
2. Create `.env.production` in frontend with correct URL
3. Commit and push changes
4. Vercel auto-redeploys
5. Clear browser cache (Ctrl+Shift+Delete)

#### Issue: Package import errors after deployment

**Symptoms:** Frontend shows "Module not found" errors for packages

**Solution:**

1. Ensure all dependencies are in `package.json` (not just devDependencies)
2. Check: `npm ls <package-name>` locally
3. If missing, run: `npm install <package-name>`
4. Commit `package-lock.json`
5. Push changes; both services auto-deploy

#### Issue: Vercel build fails

**Symptoms:** Build status shows failed, deployment halted

**Solution:**

1. Check Vercel Build Logs (Dashboard → Deployments → Failed → Logs)
2. Common issues:
   - TypeScript compilation errors (check output for line numbers)
   - Missing environment variables in Vercel settings
   - Incorrect root directory configuration
   - Node.js version mismatch
3. Fix locally and push; Vercel retries automatically

#### Issue: Render deployment fails

**Symptoms:** Render shows failed deployment, service won't start

**Solution:**

1. Check Render logs for specific error messages
2. Common issues:
   - Missing build command or start command
   - Node version incompatible (check .nvmrc if present)
   - Environment variables not set
3. Fix in Render dashboard or locally, then redeploy

---

## Rollback Procedures

### Rollback Backend (Render)

**Option 1: Revert to Previous Deployment (Recommended)**

1. Go to Render Dashboard → Select service
2. Click **"Deployments"** tab
3. Find previous successful deployment
4. Click three dots → **"Redeploy"**
5. Service reverts to previous version automatically

**Option 2: Manual Rollback via Git**

1. Locally, reset Git to previous commit:
   ```bash
   git log --oneline | head -20
   git revert <commit-hash>
   git push origin main
   ```
2. Render automatically redeploys from new commit

### Rollback Frontend (Vercel)

**Option 1: Revert to Previous Deployment**

1. Go to Vercel Dashboard → Project
2. Click **"Deployments"**
3. Find previous successful deployment
4. Click on it → **"Promote to Production"**

**Option 2: Revert via Git**

1. Locally, revert changes:
   ```bash
   git revert <commit-hash>
   git push origin main
   ```
2. Vercel automatically redeploys

### Rollback Database (MongoDB Atlas)

**Note:** Data cannot be rolled back, but backups exist

1. Go to MongoDB Atlas Dashboard
2. Click **"Backup"** option in left menu
3. Restore from earlier snapshot if data corruption occurred
4. This creates new DB, update `MONGO_URI` if different

---

## Deployment Checklist

### Pre-Deployment

- [ ] All code committed and pushed to GitHub main branch
- [ ] Local testing passed (no errors in dev server)
- [ ] npm build succeeds locally (`npm run build`)
- [ ] Environment variables prepared (.env.production files)
- [ ] Backend `.env.production` has valid MONGO_URI
- [ ] Frontend `.env.production` has correct backend API URL
- [ ] No API secrets committed to GitHub
- [ ] MongoDB whitelist includes Render IP (0.0.0.0/0)
- [ ] Git remotes point to correct GitHub repository

### Backend Deployment (Render)

- [ ] Render account created and email verified
- [ ] GitHub repository connected to Render
- [ ] Web service created with correct root directory
- [ ] Build command: `npm install && npm run build`
- [ ] Start command: `npm run start:prod`
- [ ] All environment variables configured in Render dashboard
- [ ] Service status shows "Live" (green)
- [ ] Logs show successful startup (search for "listening on port")
- [ ] Backend URL noted (e.g., https://inventory-mgmt-api.onrender.com)

### Frontend Deployment (Vercel)

- [ ] Vercel account created
- [ ] GitHub repository imported into Vercel
- [ ] Framework detected as "Vite"
- [ ] Root directory correct: `./02_Source/01_Source Code/frontend`
- [ ] `VITE_API_URL` environment variable set to Render backend URL
- [ ] Build succeeds (check Logs)
- [ ] Deployment status shows "Ready"
- [ ] Frontend URL noted (e.g., https://inventory-management-xyz.vercel.app)

### Post-Deployment Testing

- [ ] Frontend loads in browser without errors
- [ ] Browser console has no CORS warnings
- [ ] API calls show correct base URL (Render, not localhost)
- [ ] GET /api/materials returns data (may be empty)
- [ ] Create material test succeeds
- [ ] Search materials test succeeds
- [ ] Update material test succeeds
- [ ] Delete material test succeeds
- [ ] Network tab shows all requests returning 2xx status codes
- [ ] Responsive design works on mobile (F12 → Toggle Device Toolbar)

### Post-Deployment Monitoring

- [ ] Set up Render error notifications (optional)
- [ ] Monitor Render logs for errors (daily check first week)
- [ ] Monitor Vercel analytics (Dashboard → Analytics)
- [ ] Test at least once daily for first week
- [ ] Document any issues and resolutions
- [ ] Inform team of production URLs

---

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
- [NestJS Deployment Guide](https://docs.nestjs.com/deployment)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

---

## Contact & Support

For deployment issues:

1. Check **[Troubleshooting](#troubleshooting)** section above
2. Check service logs (Render/Vercel dashboards)
3. Review environment variables configuration
4. Ask in project team chatroom with:
   - Error message (full copy from logs)
   - Steps to reproduce
   - What worked locally vs. what fails in production
