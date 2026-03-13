# Plan: Update InboundControl — Search + Dropdown Filter

## Mục tiêu
1. Thêm ô tìm kiếm theo tên sản phẩm (`material_name`) vào khu vực header.
2. Chuyển filter bar (các pill buttons) thành một `<select>` dropdown.

---

## Step 1 — Thêm state `searchQuery`

**File:** `InboundControl.tsx`

Thêm state mới ngay cạnh `filterStatus`:

```tsx
const [searchQuery, setSearchQuery] = useState('');
```

---

## Step 2 — Thêm logic lọc phía client theo `searchQuery`

Hiện tại `lots` là mảng trả về từ API (đã lọc theo status).  
Thêm một biến `displayedLots` được tính từ `lots` + `searchQuery`:

```tsx
const displayedLots = searchQuery.trim()
  ? lots.filter((lot) =>
      lot.material_name.toLowerCase().includes(searchQuery.trim().toLowerCase())
    )
  : lots;
```

Thay thế mọi nơi dùng `lots.map(...)` / `lots.length === 0` trong JSX bằng `displayedLots`.

---

## Step 3 — Chuyển filter bar thành dropdown

Thay khối `<div className="flex gap-3 flex-wrap">...</div>` bằng một `<select>`:

```tsx
<select
  value={filterStatus}
  onChange={(e) => setFilterStatus(e.target.value as StatusFilter)}
  className="border border-gray-300 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
>
  <option value="all">Tất cả</option>
  <option value="Quarantine">Chờ kiểm định</option>
  <option value="Accepted">Chấp nhận</option>
  <option value="Rejected">Từ chối</option>
  <option value="Hold">Tạm giữ</option>
</select>
```

---

## Step 4 — Thêm ô search vào header

Đặt ô search và dropdown trên cùng một hàng (flex row), ngay sau phần title/subtitle hiện tại:

```tsx
{/* Toolbar: Search + Filter */}
<div className="flex flex-wrap items-center gap-3">
  {/* Search */}
  <div className="relative flex-1 min-w-[200px] max-w-sm">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
    <input
      type="text"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Tìm theo tên sản phẩm..."
      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>

  {/* Status filter dropdown */}
  <select ... />  {/* từ Step 3 */}
</div>
```

Import thêm icon `Search` từ `lucide-react`.

---

## Step 5 — Reset `searchQuery` khi đổi filter

Khi người dùng đổi status filter, reset search để tránh hiển thị kết quả rỗng gây nhầm lẫn:

```tsx
onChange={(e) => {
  setFilterStatus(e.target.value as StatusFilter);
  setSearchQuery('');
}}
```

---

## Step 6 — Cập nhật empty state

Phân biệt thông báo "không có kết quả" theo ngữ cảnh:

```tsx
{displayedLots.length === 0 && (
  <p className="p-10 text-center text-gray-400">
    {searchQuery ? `Không tìm thấy sản phẩm "${searchQuery}"` : 'Không có lô hàng nào'}
  </p>
)}
```

---

## Thứ tự thực hiện (dependencies)

```
Step 1 → Step 2 → Step 6   (search logic, độc lập với UI filter)
Step 3 → Step 4 → Step 5   (dropdown UI)
```

Có thể làm song song hai nhánh, merge cuối cùng.

---

## Checklist

- [ ] Step 1: Thêm state `searchQuery`
- [ ] Step 2: Tính `displayedLots`, thay trong JSX
- [ ] Step 3: Thay filter bar thành `<select>`
- [ ] Step 4: Thêm ô search input vào toolbar
- [ ] Step 5: Reset `searchQuery` khi đổi filter
- [ ] Step 6: Cập nhật empty state message
