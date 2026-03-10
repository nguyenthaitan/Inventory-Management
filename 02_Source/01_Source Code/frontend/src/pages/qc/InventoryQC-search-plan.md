# Plan: Thêm tìm kiếm theo vị trí — InventoryQC

## Mục tiêu
Thêm ô tìm kiếm theo trường `location` cho **cả hai tab** (Alert & Quarantine) trong `InventoryQC.tsx`.  
Ô search được đặt ở **toolbar chung** ngay trên khu vực tab, áp dụng đồng thời cho tab đang active.

---

## Step 1 — Thêm state `searchLocation`

**File:** `InventoryQC.tsx`

Thêm sau các state hiện có:

```tsx
const [searchLocation, setSearchLocation] = useState('');
```

---

## Step 2 — Tính `filteredAlertLots` và `filteredQuarantinableLots`

Thay vì dùng trực tiếp `alertLots` / `quarantinableLots` trong JSX, tính thêm hai biến filtered:

```tsx
const filteredAlertLots = searchLocation.trim()
  ? alertLots.filter((lot) =>
      lot.location?.toLowerCase().includes(searchLocation.trim().toLowerCase())
    )
  : alertLots;

const filteredQuarantinableLots = searchLocation.trim()
  ? quarantinableLots.filter((lot) =>
      lot.location?.toLowerCase().includes(searchLocation.trim().toLowerCase())
    )
  : quarantinableLots;
```

> Dùng `?.` để tránh crash khi `location` là `null`/`undefined`.

---

## Step 3 — Thêm ô search vào toolbar chung (trên tabs)

Đặt input search vào khu vực giữa header và tab bar — dùng chung cho cả hai tab:

```tsx
{/* Toolbar */}
<div className="flex items-center gap-3">
  <div className="relative w-64">
    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    <input
      type="text"
      value={searchLocation}
      onChange={(e) => setSearchLocation(e.target.value)}
      placeholder="Tìm theo vị trí kho..."
      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
</div>
```

Import thêm icon `MapPin` từ `lucide-react`.

---

## Step 4 — Thay thế trong JSX

| Chỗ dùng hiện tại | Thay bằng |
|---|---|
| `alertLots.length === 0` | `filteredAlertLots.length === 0` |
| `alertLots.map(...)` | `filteredAlertLots.map(...)` |
| `quarantinableLots.length === 0` | `filteredQuarantinableLots.length === 0` |
| `quarantinableLots.map(...)` | `filteredQuarantinableLots.map(...)` |
| Select-all checkbox: `quarantinableLots.length` & `.map(l => l.lot_id)` | `filteredQuarantinableLots.length` & `.map(l => l.lot_id)` |

---

## Step 5 — Cập nhật empty state message

Phân biệt thông báo theo ngữ cảnh search:

**Alert tab:**
```tsx
{searchLocation
  ? `Không có lô nào tại vị trí "${searchLocation}" sắp hết hạn`
  : 'Không có lô hàng nào sắp hết hạn trong 30 ngày tới.'}
```

**Quarantine tab:**
```tsx
{searchLocation
  ? `Không tìm thấy lô nào tại vị trí "${searchLocation}"`
  : 'Không có lô hàng nào có thể cách ly.'}
```

---

## Step 6 — Reset `searchLocation` khi chuyển tab (tuỳ chọn)

Xét reset search khi người dùng chuyển tab để tránh nhầm lẫn kết quả:

```tsx
onClick={() => {
  setActiveTab('alert');
  setSearchLocation('');
}}
// tương tự cho tab quarantine
```

---

## Thứ tự thực hiện

```
Step 1 → Step 2 → Step 4 → Step 5   (logic filtering)
Step 3                                (UI input)
Step 6                                (UX reset, làm sau cùng)
```

---

## Checklist

- [ ] Step 1: Thêm state `searchLocation`
- [ ] Step 2: Tính `filteredAlertLots` và `filteredQuarantinableLots`
- [ ] Step 3: Thêm input search + import `MapPin`
- [ ] Step 4: Thay `alertLots` / `quarantinableLots` trong JSX bằng filtered
- [ ] Step 5: Cập nhật empty state message
- [ ] Step 6: Reset search khi chuyển tab
