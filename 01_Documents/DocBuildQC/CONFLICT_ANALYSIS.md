# Conflict Analysis: `inventory-lot` vs `inventory-lot-2`

> **Context:** `inventory-lot/` was bootstrapped by QC team as a minimal scaffold to unblock the `qc-test` module. `inventory-lot-2/` is the full implementation by the Inventory team. Before merging, the conflicts below must be resolved to avoid breaking `qc-test`.

---

## Table of Contents

1. [Summary](#1-summary)
2. [DTOs — No Conflict](#2-dtos--no-conflict)
3. [Module — Minor Difference](#3-module--minor-difference)
4. [Critical Conflicts — Break qc-test](#4-critical-conflicts--break-qc-test)
5. [Controller Route Conflicts](#5-controller-route-conflicts)
6. [Service Method Conflicts](#6-service-method-conflicts)
7. [Repository Method Conflicts](#7-repository-method-conflicts)
8. [qc-test Dependency Map](#8-qc-test-dependency-map)
9. [Non-Breaking Additions in inventory-lot-2](#9-non-breaking-additions-in-inventory-lot-2)
10. [Recommended Resolution](#10-recommended-resolution)

---

## 1. Summary

| Category | Status |
|----------|--------|
| DTOs | ✅ Identical — no action needed |
| Module | ⚠️ Minor — only export difference |
| Controller routes | ❌ 1 route missing in team version |
| Service methods (qc-critical) | ❌ 5 methods renamed/missing |
| Repository methods | ❌ 4 methods renamed/missing |

**Bottom line:** If `inventory-lot-2/` replaces `inventory-lot/` directly, the `qc-test` module will fail to compile because it calls service methods that have been renamed or removed.

---

## 2. DTOs — No Conflict

Both versions share the **exact same** `inventory-lot.dto.ts`. No changes needed.

| Class | Status |
|-------|--------|
| `CreateInventoryLotDto` | ✅ Identical |
| `UpdateInventoryLotDto` | ✅ Identical |
| `InventoryLotResponseDto` | ✅ Identical |
| `PaginatedInventoryLotResponse` | ✅ Identical |
| `InventoryLotStatus` enum | ✅ Identical (`Quarantine`, `Accepted`, `Rejected`, `Depleted`) |

---

## 3. Module — Minor Difference

| Aspect | inventory-lot (mine) | inventory-lot-2 (team) |
|--------|---------------------|----------------------|
| Exports | `InventoryLotService` only | `InventoryLotService` **and** `InventoryLotRepository` |

**Impact:** Low. The `qc-test` module only injects `InventoryLotService`, not the repository directly. The team version is a superset — safe to adopt.

---

## 4. Critical Conflicts — Break qc-test

These are the **blocking issues**. Their resolution is mandatory before merging.

| ID | Where in qc-test | What qc-test calls | What team version provides | Action Required |
|----|-----------------|-------------------|--------------------------|-----------------|
| **C1** | `getTestsByLotId`, `createTest`, `submitDecision`, `submitRetestDecision` | `inventoryLotService.getLotById(lot_id)` | Method renamed to `findById(id)` | Add alias or update qc-test (×4 call sites) |
| **C2** | `submitDecision`, `submitRetestDecision` | `inventoryLotService.updateLotStatus(lot_id, status)` | Method renamed to `updateStatus(id, dto)` | Add alias or update qc-test (×2 call sites) |
| **C3** | `submitRetestDecision` | `inventoryLotService.updateLot(lot_id, { status, expiration_date })` | Method renamed to `update(id, UpdateInventoryLotDto)` | Alias or update qc-test (×1 call site) |
| **C4** | `getDashboardKPI` | `inventoryLotService.getLotsByStatus('Quarantine')` → returns `InventoryLotDocument[]` | `findByStatus(status, page, limit)` → returns `{ data[], total }` | Both signature AND return type changed |
| **C5** | `getSupplierPerformance` | `inventoryLotService.getLotsByIds(uniqueLotIds)` → returns `InventoryLot[]` | **Method does not exist** in team version | Must add this method |

---

## 5. Controller Route Conflicts

### Routes present in `inventory-lot` (mine) but missing in `inventory-lot-2` (team)

| Route | Purpose | Impact |
|-------|---------|--------|
| `POST /inventory-lot/bulk-quarantine` | Bulk set multiple lots to Quarantine status | Frontend QC pages call this endpoint directly |

### Routes present in `inventory-lot-2` but missing in `inventory-lot`

| Route | Notes |
|-------|-------|
| `GET /inventory-lot/statistics` | Lot count by status |
| `GET /inventory-lot/expiring-soon` | Lots expiring within threshold |
| `GET /inventory-lot/expired` | Expired lots |
| `GET /inventory-lot/search` | Search by manufacturer |
| `GET /inventory-lot/filter` | Filter by multiple criteria |
| `GET /inventory-lot/material/:material_id` | All lots for a material |
| `GET /inventory-lot/status/:status` | All lots for a status (paginated) |
| `GET /inventory-lot/samples` | All sample lots |
| `GET /inventory-lot/samples/:parent_lot_id` | Samples by parent lot |
| `PUT /inventory-lot/:id/status/:status` | Status transition endpoint |

**Action:** Must add `POST /bulk-quarantine` back to `inventory-lot-2` controller.

### Endpoint behavior differences

| Route | inventory-lot (mine) | inventory-lot-2 (team) |
|-------|---------------------|----------------------|
| `GET /` | `?status=` filter | `?page=` and `?limit=` pagination — **no status filter** |
| `GET /:id` | calls `getLotById(id)` | calls `findById(id)` |
| `PUT /:id` | accepts `dto: any` | accepts `UpdateInventoryLotDto` (validated) |
| `DELETE /:id` | calls `remove(id)` | calls `delete(id)` |

---

## 6. Service Method Conflicts

### Methods qc-test needs vs what team version provides

| qc-test calls | My version (`inventory-lot`) | Team version (`inventory-lot-2`) | Conflict |
|---------------|------------------------------|----------------------------------|---------|
| `getLotById(id)` | ✅ `getLotById(id): Promise<InventoryLotDocument>` | ❌ Renamed to `findById(id)` | **BREAKING** |
| `updateLotStatus(id, status)` | ✅ `updateLotStatus(id, status): Promise<InventoryLotDocument>` | ❌ Renamed to `updateStatus(id, UpdateInventoryLotStatusDto)` | **BREAKING** |
| `updateLot(id, Partial)` | ✅ `updateLot(id, data: Partial<InventoryLot>)` | ❌ Renamed to `update(id, UpdateInventoryLotDto)` | **BREAKING** |
| `getLotsByStatus(status)` → `[]` | ✅ Returns flat `InventoryLotDocument[]` | ❌ `findByStatus(status, page, limit)` → `{data, total}` | **BREAKING** |
| `getLotsByIds(ids[])` → `[]` | ✅ Returns `InventoryLotDocument[]` | ❌ **Does not exist** | **BREAKING** |

### Additional method differences (not directly called by qc-test)

| Aspect | inventory-lot (mine) | inventory-lot-2 (team) |
|--------|---------------------|----------------------|
| `findAll()` signature | `findAll(status?: string)` | `findAll(page: number, limit: number)` — no status filter |
| `remove(id)` | Stub — returns `{ deleted: true }` without DB operation | `delete(id)` — real logic with `ConflictException` guard |
| `bulkQuarantine(lot_ids[])` | ✅ Exists | ❌ Missing |
| `createLot(dto)` | ✅ Alias for `create` | ❌ Only `create(dto)` exists |
| Status validation | ❌ None | ✅ `validateStatusTransition()` enforces state machine |
| Response mapping | ❌ Returns raw Mongoose document | ✅ `convertToResponse()` returns `InventoryLotResponseDto` |

---

## 7. Repository Method Conflicts

| Method | inventory-lot (mine) | inventory-lot-2 (team) | Notes |
|--------|---------------------|----------------------|-------|
| `findByLotId(lot_id)` | ✅ Exists | ❌ Renamed to `findById(id)` | Internal chain for C1 |
| `findByLotIds(ids[])` | ✅ Exists | ❌ **Missing** | Internal chain for C5 |
| `updateByLotId(id, data)` | ✅ Uses `$set` | ❌ Renamed to `update(id, data)` — no `$set` | Internal chain for C2/C3 |
| `updateManyStatus(ids[], status)` | ✅ Exists (bulk quarantine) | ❌ **Missing** | Used by `bulkQuarantine` service method |
| `findAll(filter?)` | Returns flat `InventoryLotDocument[]` | Returns `{ data, total }` with pagination | Signature changed |
| `findByStatus(status)` | Returns flat `InventoryLotDocument[]` | Returns `{ data, total }` with pagination | Signature changed |
| `create(data)` | Simple `new Model(data).save()` | Auto-generates `lot_id` via `uuid` | Team version is better |
| Model injection name | `lotModel` | `inventoryLotModel` | Internal only, no external impact |

---

## 8. qc-test Dependency Map

Exact call sites in `qc-test.service.ts` that depend on `InventoryLotService`:

```
QCTestService.getTestsByLotId(lot_id)
  └─ inventoryLotService.getLotById(lot_id)           ← C1

QCTestService.createTest(dto)
  └─ inventoryLotService.getLotById(dto.lot_id)       ← C1

QCTestService.submitDecision(lot_id, dto)
  ├─ inventoryLotService.getLotById(lot_id)           ← C1
  └─ inventoryLotService.updateLotStatus(lot_id, ..)  ← C2

QCTestService.submitRetestDecision(lot_id, action, dto)
  ├─ inventoryLotService.getLotById(lot_id)           ← C1
  ├─ inventoryLotService.updateLot(lot_id, {...})     ← C3 (extend path)
  └─ inventoryLotService.updateLotStatus(lot_id, ..)  ← C2 (discard path)

QCTestService.getDashboardKPI()
  └─ inventoryLotService.getLotsByStatus('Quarantine')← C4 (uses .length)

QCTestService.getSupplierPerformance(filter?)
  └─ inventoryLotService.getLotsByIds(uniqueLotIds)   ← C5
```

---

## 9. Non-Breaking Additions in inventory-lot-2

These features exist only in the team version and are safe to adopt as they don't conflict:

- **Status state machine** — `validateStatusTransition()` prevents invalid status changes
- **UUID auto-generation** — `lot_id` auto-generated on create (no manual ID needed)
- **Typed DTO validation** — `CreateInventoryLotDto` / `UpdateInventoryLotDto` with `class-validator`
- **Response mapping** — `convertToResponse()` returning `InventoryLotResponseDto`
- **Pagination** on `findAll`, `findByStatus`
- **Statistics endpoint** — lot counts by status
- **Expiry tracking** — `getExpiringSoon()`, `getExpiredLots()`
- **Sample lot support** — `is_sample`, `parent_lot_id` fields
- **Proper delete** — with `ConflictException` guard when lot has active tests
- **Extended repository** — `countByStatus`, `checkLotExists`, `findByFilter`, `searchByManufacturer`

---

## 10. Recommended Resolution

### Option A: Add backward-compatible aliases to inventory-lot-2 (Recommended)

Add the following methods to `inventory-lot-2/inventory-lot.service.ts` as thin wrappers:

```typescript
// ─── QC-compatibility aliases ─────────────────────────────────────────────

/** Alias for findById — required by qc-test module */
async getLotById(lot_id: string): Promise<InventoryLotDocument> {
  return this.findById(lot_id);  // throws NotFoundException if not found
}

/** Required by qc-test — returns flat array for .length usage */
async getLotsByStatus(status: string): Promise<InventoryLotDocument[]> {
  const result = await this.repository.findByStatus(status, 1, 9999);
  return result.data;
}

/** Required by qc-test — batch lookup for supplier performance report */
async getLotsByIds(lot_ids: string[]): Promise<InventoryLotDocument[]> {
  return this.repository.findByLotIds(lot_ids);
}

/** Alias for updateStatus — required by qc-test module */
async updateLotStatus(lot_id: string, status: string): Promise<InventoryLotDocument> {
  return this.updateStatus(lot_id, status as InventoryLotStatus);
}

/** Alias for update — required by qc-test; accepts raw partial object */
async updateLot(lot_id: string, data: Partial<InventoryLotDocument>): Promise<InventoryLotDocument> {
  return this.update(lot_id, data as UpdateInventoryLotDto);
}

/** Required by qc-test bulk-quarantine endpoint */
async bulkQuarantine(lot_ids: string[]): Promise<InventoryLotDocument[]> {
  return this.repository.updateManyStatus(lot_ids, InventoryLotStatus.QUARANTINE);
}
```

Add the following to `inventory-lot-2/inventory-lot.repository.ts`:

```typescript
/** Required by getLotsByIds alias */
async findByLotIds(lot_ids: string[]): Promise<InventoryLotDocument[]> {
  return this.inventoryLotModel.find({ lot_id: { $in: lot_ids } }).exec();
}

/** Required by bulkQuarantine */
async updateManyStatus(lot_ids: string[], status: string): Promise<InventoryLotDocument[]> {
  await this.inventoryLotModel.updateMany(
    { lot_id: { $in: lot_ids } },
    { $set: { status } },
  ).exec();
  return this.inventoryLotModel.find({ lot_id: { $in: lot_ids } }).exec();
}
```

Add `POST /bulk-quarantine` back to `inventory-lot-2/inventory-lot.controller.ts`:

```typescript
@Post('bulk-quarantine')
async bulkQuarantine(@Body() body: { lot_ids: string[] }) {
  return this.service.bulkQuarantine(body.lot_ids);
}
```

### Option B: Update qc-test to use new method names

Change all call sites in `qc-test.service.ts` to match team version's API:

| Old call | New call |
|---------|---------|
| `getLotById(id)` | `findById(id)` |
| `updateLotStatus(id, s)` | `updateStatus(id, s as InventoryLotStatus)` |
| `updateLot(id, data)` | `update(id, data as UpdateInventoryLotDto)` |
| `getLotsByStatus(s)` | `(await findByStatus(s, 1, 9999)).data` |
| `getLotsByIds(ids)` | *(add `findByLotIds` to repo + service first)* |

This option requires changes across both modules; **Option A is cleaner.**

### Priority Order

1. ✅ Add `findByLotIds()` to repository
2. ✅ Add `updateManyStatus()` to repository
3. ✅ Add 6 alias methods to service (`getLotById`, `getLotsByIds`, `updateLotStatus`, `updateLot`, `getLotsByStatus`, `bulkQuarantine`)
4. ✅ Add `POST /bulk-quarantine` to controller
5. ✅ Delete `src/inventory-lot/` and update `app.module.ts` to import from `inventory-lot-2/`
6. ✅ Rename `inventory-lot-2/` → `inventory-lot/`
