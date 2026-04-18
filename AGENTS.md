# AGENTS.md - Inventory Management System

## Key Facts

- **Stack**: NestJS (backend) + React/Vite (frontend) + MongoDB
- **CI location**: `.github/workflows/ci.yml` lives in `02_Source/01_Source Code/`, not root
- **Reference**: `SYSTEM.md`

## Developer Commands

### Backend

```bash
cd 02_Source/01_Source Code/backend
npm install
npm run start:dev      # Dev server on localhost:3000
npm test               # Run unit tests
npm run lint           # Lint + fix
npm run kafka:up       # Start Kafka (for integration tests)
npm run kafka:down     # Stop Kafka
```

### Frontend

```bash
cd 02_Source/01_Source Code/frontend
npm install
npm run dev            # Dev server on localhost:5173
npm run build          # Build for production
npm run lint           # Lint
```

### Database (Docker)

```bash
docker-compose -f 02_Source/01_Source Code/docker-compose-mongo.yml up -d
# Credentials: admin / password123
# Connection: mongodb://admin:password123@localhost:27017/inventory_db?authSource=admin
```

## Architecture

- **Backend entry**: `backend/src/main.ts`
- **Frontend entry**: `frontend/src/main.tsx`
- **API routes**: `backend/src/` (NestJS modules by domain)
- **UI components**: `frontend/src/` (React components)
- **Env file**: `02_Source/01_Source Code/backend/.env` (not `.env.example`)

## Design System

### New UI Components

Location: `frontend/src/components/ui/`

| Component           | File                 | Purpose                                    |
| ------------------- | -------------------- | ------------------------------------------ |
| Button              | `Button.tsx`         | Primary/secondary/ghost/danger variants    |
| Badge               | `Badge.tsx`          | Status badges (success/warning/error/info) |
| Card                | `Card.tsx`           | Card wrapper with hover effects            |
| PageWrapper         | `Layout.tsx`         | Page container with animations             |
| StatsGrid, StatCard | `Layout.tsx`         | Dashboard stat cards                       |
| LoadingSkeleton     | `PageTransition.tsx` | Loading placeholders                       |
| TableSkeleton       | `PageTransition.tsx` | Table loading state                        |
| PageTransition      | `PageTransition.tsx` | Page animations                            |

### Design Tokens

Location: `frontend/src/styles/`

| File             | Purpose                              |
| ---------------- | ------------------------------------ |
| `tokens.css`     | Colors, spacing, shadows, typography |
| `animations.css` | Keyframes (fadeInUp, stagger, etc.)  |

### Usage Example

```tsx
import {
  Button,
  Badge,
  Card,
  PageWrapper,
  StatsGrid,
  StatCard,
} from "./components/ui";
import { LoadingSkeleton, TableSkeleton } from "./components/ui";

// Dashboard page
<PageWrapper>
  <StatsGrid cols={4}>
    <StatCard label="Total" value={42} icon={<Package />} />
  </StatsGrid>
  <Card>
    <Table />
  </Card>
</PageWrapper>;
```

## Edit-Verify Workflow

**CRITICAL**: Always verify code after each edit to catch errors early.

### Workflow

```
1. Edit file(s)
2. Run verification command
3. If error: Fix and repeat step 2
4. If success: Continue to next task
```

### Verification Commands

#### Frontend

```bash
# TypeScript check
cd 02_Source/01_Source Code/frontend
npm run build          # Build + type check

# Or faster check
npx tsc --noEmit       # Type check only

# Lint
npm run lint
```

#### Backend

```bash
cd 02_Source/01_Source Code/backend
npm run build           # Build + type check

# Or
npx tsc --noEmit       # Type check only

# Run tests
npm test
```

#### Full Project

```bash
# Backend
cd 02_Source/01_Source Code/backend && npm run build

# Frontend
cd 02_Source/01_Source Code/frontend && npm run build
```

### Common Error Fixes

| Error                       | Fix                                           |
| --------------------------- | --------------------------------------------- |
| Module not found            | Check import path, run `npm install`          |
| TypeScript error            | Fix type annotation or add type ignore        |
| TailwindCSS class not found | Ensure @import "tailwindcss" in CSS           |
| Animation not working       | Check animations.css is imported in index.css |
| Component not rendering     | Check react key, parent is rendering          |

## Common Issues

- **Port conflicts**: Check ports 3000, 5173, 27017 are free
- **MongoDB connection**: Ensure container is running before backend
- **TailwindCSS v4**: Uses `@tailwindcss/vite` plugin, not the classic PostCSS setup
- **Vite override**: Frontend uses `rolldown-vite` (see `package.json` overrides)
- **Animation not working**: Ensure `index.css` imports `./styles/animations.css`
- **Design tokens not working**: Ensure `index.css` imports `./styles/tokens.css`

## Key Files Modified (Recent)

| File                                                   | Change                         |
| ------------------------------------------------------ | ------------------------------ |
| `frontend/src/styles/tokens.css`                       | NEW - Design tokens            |
| `frontend/src/styles/animations.css`                   | NEW - Animations               |
| `frontend/src/components/ui/*.tsx`                     | NEW - UI components            |
| `frontend/src/index.css`                               | Updated - Import design system |
| `frontend/src/pages/manager/Dashboard.tsx`             | Added stats, animations        |
| `frontend/src/pages/operator/DashboardOperator.tsx`    | Added stats, animations        |
| `frontend/src/pages/qc/DashboardQC.tsx`                | Added stats, animations        |
| `frontend/src/pages/admin/DashboardIT.tsx`             | Added stats, animations        |
| `frontend/src/components/manager/TransactionTable.tsx` | Added badges, skeletons        |
| `frontend/src/components/Sidebar.tsx`                  | Added collapse animation       |
| `frontend/src/pages/auth/Login.tsx`                    | New login design               |
