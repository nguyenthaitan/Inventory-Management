# FE Styling Plan — Apply `fe_pattern` to QC Module

> **Mục tiêu:** Áp dụng toàn bộ design system trong `fe_pattern.md` cho các trang QC và
> các component layout dùng chung. Không thay đổi logic/state/API call, chỉ thay đổi
> phần giao diện (className, JSX structure, icon imports).
>
> **Ngày lập:** 09/03/2026

---

## Tóm tắt vấn đề hiện tại

| File | Vấn đề |
|------|--------|
| `MainLayout.tsx` | Dùng inline `style={{}}` với debug border màu đỏ/xanh, không có Tailwind |
| `Sidebar.tsx` | Dùng inline `style={{}}`, background `#334155`, không có icon, không đúng cấu trúc nav |
| `Header.tsx` | Inline `style={{}}`, sẽ được hợp nhất vào topbar của Layout |
| `DashboardQC.tsx` | Có Tailwind nhưng dùng `indigo-600` thay vì `blue-600`, typography chưa đúng pattern |
| `InboundControl.tsx` | Filter tab dùng `bg-indigo-600 rounded-full` thay vì border-b, không có Lucide icon |
| `InventoryQC.tsx` | Tab dùng pill style `bg-gray-100 p-1 rounded-lg`, dùng emoji ⚠️🔒 thay Lucide icon |
| `ProductInspection.tsx` | Heading/card style chưa khớp pattern |
| `ReportTraceability.tsx` | Tab và table chưa đúng pattern |
| **Toast component** | Bị duplicate trong cả 4 file QC — cần tách ra shared component |

---

## Phase 0 — Chuẩn bị chung

### 0.1 Kiểm tra & cài đặt dependencies

```bash
# Trong thư mục frontend/
npm install lucide-react          # nếu chưa có
npm install tw-animate-css        # nếu chưa có
```

Kiểm tra `index.css` (hoặc `App.css`) có dòng sau chưa:

```css
@import 'tailwindcss' source(none);
@source '../**/*.{js,ts,jsx,tsx}';
@import 'tw-animate-css';
```

### 0.2 Tạo shared Toast component

**File cần tạo mới:** `src/components/Toast.tsx`

Lý do: Component `Toast` đang bị copy-paste y hệt trong 4 file:
`InboundControl.tsx`, `InventoryQC.tsx`, `ProductInspection.tsx`, `ReportTraceability.tsx`.

```tsx
// src/components/Toast.tsx
import { useEffect } from 'react';

interface Props {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm flex items-center gap-3 ${
      type === 'success' ? 'bg-green-600' : 'bg-red-600'
    }`}>
      <span>{type === 'success' ? '✓' : '✕'}</span>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">×</button>
    </div>
  );
}
```

Sau đó xoá inline `Toast` function trong 4 file QC và thay bằng:
```tsx
import Toast from '../../components/Toast';
```

---

## Phase 1 — Layout Shell

### 1.1 `src/layouts/MainLayout.tsx`

**Tình trạng hiện tại:** Dùng `style={{ display: 'flex' }}` với debug border, không responsive.

**Mục tiêu:** Áp dụng đúng Layout Shell từ fe_pattern §6.1.

**Thay đổi JSX structure:**

```tsx
// TRƯỚC
<div style={{ display: 'flex', height: '100vh' }}>
  <aside style={{ width: '250px', border: '2px solid red' }}>
    <Sidebar />
  </aside>
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
    <header style={{ height: '60px', border: '2px solid green' }}>
      <Header />
    </header>
    <main style={{ flex: 1, padding: '20px', border: '2px solid blue', overflowY: 'auto' }}>
      <Outlet />
    </main>
  </div>
</div>
```

```tsx
// SAU — khớp §3.1 Layout Shell
<div className="min-h-screen bg-[#F8FAFC] text-gray-900 font-sans">
  <Sidebar />

  {/* Main content area */}
  <div className="md:ml-64 min-h-screen flex flex-col relative transition-all duration-300">

    {/* Topbar — thay thế Header.tsx, không cần render <Header /> nữa */}
    <header className="bg-white/70 backdrop-blur-xl sticky top-0 z-30 border-b border-gray-100">
      <div className="px-8 py-6 flex justify-between items-center">
        {/* Title vùng này sẽ được inject vào từng page qua context hoặc để trống */}
        <div /> {/* placeholder */}
      </div>
    </header>

    <main className="p-8 flex-1 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <Outlet />
    </main>

    <footer className="px-8 py-6 border-t border-gray-50 text-[10px] text-gray-400 font-bold uppercase tracking-[2px] flex justify-between">
      <span>PharmaWMS v2.0.1</span>
      <span className="hidden sm:inline">© 2026 Toàn quyền bởi IT Department</span>
    </footer>
  </div>
</div>
```

**Lưu ý:** Bỏ import `Header` sau khi topbar đã được baked vào `MainLayout`.

---

### 1.2 `src/components/Sidebar.tsx`

**Tình trạng hiện tại:** Inline style `#334155` background, plain `<Link>` không icon, không có user profile section, không responsive.

**Mục tiêu:** Áp dụng sidebar spec từ fe_pattern §3.1 và §6.1.

**Thay đổi chính:**

1. **Imports Lucide icon** (dùng cho QC nav items):
```tsx
import {
  Package,           // Logo
  ShieldCheck,       // QC Inventory / QC Products
  ClipboardCheck,    // QC Pending / Inbound Control
  BarChart3,         // QC Dashboard
  FileSearch,        // Traceability
  FileText,          // Reports
  ChevronRight,      // Active nav indicator
  User,              // User avatar
  LogOut,            // Logout
  Menu,              // Mobile hamburger
  X,                 // Mobile close
} from 'lucide-react';
```

2. **Cấu trúc sidebar JSX:**
```tsx
<aside className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform
                  -translate-x-full md:translate-x-0
                  bg-white border-r border-gray-100 shadow-xl shadow-blue-900/5">
  <div className="h-full flex flex-col">

    {/* Logo Section */}
    <div className="p-8">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
          <Package size={20} className="text-white" />
        </div>
        <span className="font-black text-gray-900 text-lg tracking-tighter">
          PHARMA<span className="text-blue-600">WMS</span>
        </span>
      </div>
    </div>

    {/* Nav — QC Section */}
    <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">

      {/* Nav item ACTIVE example */}
      <Link to="/qc/dashboard" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl
          bg-blue-600 text-white shadow-lg shadow-blue-200 translate-x-1 font-bold text-sm tracking-tight">
        <BarChart3 size={20} />
        <span>QC Dashboard</span>
        <ChevronRight size={14} className="ml-auto text-white/50" />
      </Link>

      {/* Nav item INACTIVE example */}
      <Link to="/qc/inbound" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl
          text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 font-bold text-sm tracking-tight">
        <ClipboardCheck size={20} />
        <span>Kiểm định đầu vào</span>
      </Link>

      <Link to="/qc/inventory" className="...same inactive classes...">
        <ShieldCheck size={20} />
        <span>Kiểm soát kho QC</span>
      </Link>

      <Link to="/qc/inspection" className="...same inactive classes...">
        <FileText size={20} />
        <span>Kiểm định sản phẩm</span>
      </Link>

      <Link to="/qc/traceability" className="...same inactive classes...">
        <FileSearch size={20} />
        <span>Truy vết & Báo cáo</span>
      </Link>
    </nav>

    {/* User Profile Section */}
    <div className="p-4 border-t border-gray-100">
      <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <User size={20} className="text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm truncate">QC Technician</p>
          <p className="text-xs text-gray-400 truncate">qc@pharma.com</p>
        </div>
        <button className="p-2 rounded-xl text-gray-400
            hover:bg-red-600 hover:text-white transition-all duration-200 active:scale-95">
          <LogOut size={18} />
        </button>
      </div>
    </div>

  </div>
</aside>
```

3. **Active nav detection:** Dùng `useLocation()` từ `react-router-dom` để so sánh `location.pathname` với `to` của mỗi Link để áp class active/inactive động.

---

## Phase 2 — QC Pages

### 2.1 `src/pages/qc/DashboardQC.tsx`

**Tình trạng hiện tại:** Tailwind có sẵn nhưng dùng màu sai, typography chưa đúng standard.

**Các thay đổi cần làm:**

| Vị trí | Hiện tại | Cần đổi thành |
|--------|----------|---------------|
| Page heading H1 | `text-2xl font-bold text-gray-800` | `text-2xl font-black text-gray-900 tracking-tight leading-none uppercase` |
| Page subtitle | `text-sm text-gray-500 mt-1` | `text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1` |
| Nút "Vào màn hình truy vết" | `bg-indigo-600 hover:bg-indigo-700` | `bg-blue-600 hover:bg-blue-700 font-bold` |
| KPI card container | `rounded-xl` (OK) | Giữ nguyên, thêm `shadow-sm border-gray-100` |
| KPI value | `text-3xl font-bold mt-2 ${color}` | Giữ nguyên (đã đúng) |
| Table card wrapper | `bg-white border border-gray-200 rounded-xl` | `bg-white rounded-xl shadow-sm border border-gray-100` |
| Table header | `bg-gray-50 text-xs text-gray-500 uppercase` | Thêm `font-bold tracking-wider` |
| TH cell | `px-5 py-3` | `px-6 py-4` |
| TD cell | `px-5 py-3` | `px-6 py-4` |
| Priority badge `High` | `bg-red-100 text-red-700 text-xs font-medium` | Thêm `font-bold uppercase text-[10px] rounded-full` |
| Priority badge `Normal` | `bg-gray-100 text-gray-600` | Giữ nguyên, thêm `font-bold text-[10px] uppercase` |
| "Lấy mẫu ngay →" button | `text-xs text-indigo-600 hover:underline` | `text-xs font-bold text-blue-600 hover:text-blue-700` |
| Section heading H2 | `font-semibold text-gray-700` | `text-lg font-bold text-gray-900` |

---

### 2.2 `src/pages/qc/InboundControl.tsx`

**Tình trạng hiện tại:** Filter dùng pill tabs màu `indigo`, không có Lucide icon, modal không có header màu.

**Các thay đổi cần làm:**

**1. Page heading:**
```tsx
// TRƯỚC
<h1 className="text-2xl font-bold text-gray-800">Kiểm định lô đầu vào</h1>
<p className="text-sm text-gray-500 mt-1">...</p>

// SAU
<h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none uppercase">
  Kiểm định lô đầu vào
</h1>
<p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1">
  QC / Inbound Control
</p>
```

**2. Filter tabs — đổi từ pill sang border-b style:**
```tsx
// TRƯỚC: pill tabs với bg-indigo-600
<div className="flex gap-2 flex-wrap">
  <button className="px-4 py-1.5 rounded-full ...bg-indigo-600 text-white...">

// SAU: border-b tabs khớp §3.3
<div className="flex border-b border-gray-200">
  <button className={`px-6 py-3 font-bold text-sm transition-all ${
    filterStatus === s
      ? 'border-b-2 border-blue-600 text-blue-600'
      : 'text-gray-500 hover:text-gray-700'
  }`}>
```

**3. Table card:**
```tsx
// TRƯỚC
<div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

// SAU
<div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
```

**4. Status badge — thêm `text-[10px] font-bold uppercase rounded-full`:**
```tsx
// STATUS_BADGE map — cập nhật
const STATUS_BADGE: Record<string, string> = {
  Quarantine: 'bg-amber-100 text-amber-700',   // pattern: Warning Badge
  Accepted:   'bg-green-100 text-green-700',
  Rejected:   'bg-red-100 text-red-700',
  Hold:       'bg-purple-100 text-purple-700',  // pattern: Purple Badge
  Depleted:   'bg-gray-100 text-gray-500',
};
// Khi render badge, dùng thêm: px-2 py-0.5 rounded-full text-[10px] font-bold uppercase
```

**5. Modal header — thêm màu blue:**
```tsx
// Thêm vào header div của modal:
<div className="p-6 border-b flex justify-between items-center bg-blue-600 text-white">
  <h3 className="font-bold flex items-center gap-2">
    <ClipboardCheck size={20} />
    Kết quả kiểm định — {selectedLot?.lot_id}
  </h3>
  <button onClick={closeModal}><X /></button>
</div>
```

**6. Submit button:**
```tsx
// TRƯỚC
<button className="...bg-indigo-600 hover:bg-indigo-700...">

// SAU
<button className="...bg-blue-600 hover:bg-blue-700...">
```

**7. Toast:** Xoá inline Toast function, import từ `../../components/Toast`.

---

### 2.3 `src/pages/qc/InventoryQC.tsx`

**Tình trạng hiện tại:** Tab là pill style, dùng emoji ⚠️ và 🔒, không có cấu trúc card theo pattern, quarantine tab dùng table đơn giản.

**Đây là file thay đổi nhiều nhất — áp dụng trực tiếp từ fe_pattern §6.2, §6.3, §6.4, §6.5.**

**1. Icon imports cần thêm:**
```tsx
import {
  AlertCircle,    // Section heading Quality Alert
  ShieldAlert,    // Bulk quarantine button
  Search,         // Search input
  Filter,         // Filter button
  MapPin,         // Location meta
  Calendar,       // Expiry date meta
  Lock,           // Item ID meta
  RefreshCw,      // Retest button + modal header
  CheckCircle,    // Modal: Extend decision
  Trash2,         // Modal: Discard decision
  X,              // Modal close
} from 'lucide-react';
```

**2. Tabs — đổi từ pill sang border-b:**
```tsx
// TRƯỚC: pill style
<div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
  <button className="px-5 py-2 rounded-md ...bg-white shadow...">⚠️ Cảnh báo...</button>
  <button className="px-5 py-2 rounded-md ...">🔒 Cách ly...</button>
</div>

// SAU: khớp §6.2
<div className="flex border-b border-gray-200">
  <button className={`px-6 py-3 font-bold text-sm transition-all ${
    activeTab === 'alert'
      ? 'border-b-2 border-blue-600 text-blue-600'
      : 'text-gray-500 hover:text-gray-700'
  }`}>
    Cảnh báo chất lượng (Quality Alert)
  </button>
  <button className={`px-6 py-3 font-bold text-sm transition-all ${
    activeTab === 'quarantine'
      ? 'border-b-2 border-red-600 text-red-600'
      : 'text-gray-500 hover:text-gray-700'
  }`}>
    Cách ly hàng hóa (Quarantine)
  </button>
</div>
```

**3. Quality Alert tab — đổi từ table sang card+divide-y style (§6.3):**
```tsx
// SAU: card với divide-y per row thay vì <table>
<div className="bg-white rounded-xl shadow-sm border border-gray-100 animate-in fade-in duration-300">
  {/* Card Header */}
  <div className="p-6 border-b border-gray-100 bg-gray-50/50">
    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
      <AlertCircle className="text-amber-500" />
      Danh sách sắp hết hạn / Tái kiểm tra
    </h2>
  </div>

  {/* Item List */}
  <div className="divide-y divide-gray-200">
    {alertLots.map((lot) => {
      const days = getDaysUntilExpiry(lot.expiration_date);
      return (
        <div key={lot.lot_id} className="p-6 hover:bg-gray-50/50 transition">
          <div className="flex items-center justify-between">
            {/* Left */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-900">{lot.material_name}</span>
                {/* Expiry badge */}
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  days !== null && days <= 7
                    ? 'bg-red-100 text-red-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {days !== null ? `${days} ngày` : 'N/A'}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-normal">{lot.lot_id}</p>
              {/* Meta grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500 font-medium">
                <span className="flex items-center gap-1">
                  <MapPin size={14} />{lot.location ?? '—'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={14} />{lot.expiration_date ?? '—'}
                </span>
                <span className="flex items-center gap-1">
                  <Lock size={14} />{lot.lot_id}
                </span>
              </div>
            </div>

            {/* Right: Retest button */}
            <button
              onClick={() => openRetestModal(lot)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg
                         font-bold text-sm hover:bg-blue-700 transition shadow-md shadow-blue-100"
            >
              <RefreshCw size={16} />
              Re-test
            </button>
          </div>
        </div>
      );
    })}
  </div>
</div>
```

**4. Quarantine tab — áp dụng §6.4 (toolbar + table):**
```tsx
<div className="space-y-4 animate-in fade-in duration-300">
  {/* Toolbar */}
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm
                  flex flex-col md:flex-row gap-4 items-center justify-between">
    <div className="flex items-center gap-4 w-full md:w-auto">
      {/* Search */}
      <div className="relative flex-1 md:w-80">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          placeholder="Tìm mã lô..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none
                     focus:ring-2 focus:ring-red-500 text-sm"
        />
      </div>
      <button className="p-2 border rounded-lg text-gray-400 hover:bg-gray-50">
        <Filter size={20} />
      </button>
    </div>

    {/* Bulk Quarantine button */}
    <button
      onClick={handleBulkQuarantine}
      disabled={selectedItems.length === 0}
      className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition ${
        selectedItems.length > 0
          ? 'bg-red-600 text-white shadow-lg shadow-red-100'
          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
      }`}
    >
      <ShieldAlert size={18} />
      Cách ly hàng loạt ({selectedItems.length})
    </button>
  </div>

  {/* Table */}
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
    <table className="w-full text-left">
      <thead className="bg-gray-50 border-b">
        <tr>
          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <input type="checkbox" />
          </th>
          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Mã lô</th>
          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Sản phẩm</th>
          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nhà CC</th>
          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Số lượng</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {quarantinableLots.map((lot) => (
          <tr key={lot.lot_id}
              onClick={() => toggleSelect(lot.lot_id)}
              className={`hover:bg-gray-50 transition cursor-pointer ${
                selectedItems.includes(lot.lot_id) ? 'bg-red-50/30' : ''
              }`}>
            <td className="px-6 py-4">
              <input type="checkbox" checked={selectedItems.includes(lot.lot_id)} readOnly />
            </td>
            <td className="px-6 py-4 text-sm font-medium text-gray-700">{lot.lot_id}</td>
            <td className="px-6 py-4 font-bold text-gray-900">{lot.material_name}</td>
            <td className="px-6 py-4 text-sm text-gray-500 font-medium">{lot.supplier_name}</td>
            <td className="px-6 py-4">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_BADGE[lot.status]}`}>
                {lot.status}
              </span>
            </td>
            <td className="px-6 py-4 text-sm font-medium text-gray-700">{lot.quantity}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
```

**5. Re-test Decision Modal — áp dụng §6.5:**
```tsx
// Overlay
<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
  {/* Modal Card */}
  <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200 animate-in zoom-in-95">

    {/* Header — blue */}
    <div className="p-6 border-b flex justify-between items-center bg-blue-600 text-white">
      <h3 className="font-bold flex items-center gap-2">
        <RefreshCw size={20} className="text-white" />
        Re-test / Gia hạn lô — {retestLot?.lot_id}
      </h3>
      <button onClick={closeRetestModal}><X /></button>
    </div>

    {/* Body */}
    <div className="p-6 space-y-6">
      {/* Lot info */}
      <div>
        <p className="text-xs text-blue-500 font-bold uppercase mb-1">Sản phẩm</p>
        <p className="text-lg font-bold text-gray-900">{retestLot?.material_name}</p>
      </div>

      {/* Decision buttons */}
      <div className="grid grid-cols-2 gap-4">
        {/* Extend */}
        <button
          onClick={() => setRetestAction('extend')}
          className={`p-4 border-2 rounded-xl text-center transition hover:bg-green-50 ${
            retestAction === 'extend' ? 'border-green-500 bg-green-50' : 'border-gray-200'
          }`}
        >
          <CheckCircle size={24} className="text-green-500 mx-auto mb-2" />
          <p className="font-bold text-green-700">Gia hạn</p>
          <p className="text-[10px] text-gray-500 mt-1">Cập nhật ngày hết hạn mới</p>
        </button>

        {/* Discard */}
        <button
          onClick={() => setRetestAction('discard')}
          className={`p-4 border-2 rounded-xl text-center transition hover:bg-red-50 ${
            retestAction === 'discard' ? 'border-red-500 bg-red-50' : 'border-gray-200'
          }`}
        >
          <Trash2 size={24} className="text-red-500 mx-auto mb-2" />
          <p className="font-bold text-red-700">Hủy lô</p>
          <p className="text-[10px] text-gray-500 mt-1">Đánh dấu lô hàng bị loại</p>
        </button>
      </div>

      {/* New expiry date input (only when extend) */}
      {retestAction === 'extend' && (
        <input
          type="date"
          value={newExpiryDate}
          onChange={(e) => setNewExpiryDate(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}
    </div>

    {/* Footer */}
    <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
      <button onClick={closeRetestModal} className="px-6 py-2 text-gray-500 font-bold">Đóng</button>
      <button
        onClick={handleRetest}
        disabled={!retestAction || submitting}
        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold
                   hover:bg-blue-700 transition disabled:opacity-50"
      >
        <RefreshCw size={16} />
        {submitting ? 'Đang xử lý...' : 'Xác nhận'}
      </button>
    </div>
  </div>
</div>
```

**6. Toast:** Xoá inline Toast function, import từ `../../components/Toast`.

---

### 2.4 `src/pages/qc/ProductInspection.tsx`

**Tình trạng hiện tại:** Có Tailwind nhưng heading/card style chưa khớp pattern.

**Các thay đổi cần làm:**

| Vị trí | Hiện tại | Cần đổi thành |
|--------|----------|---------------|
| Page H1 | `text-2xl font-bold text-gray-800` | `text-2xl font-black text-gray-900 tracking-tight leading-none uppercase` |
| Table card | `bg-white border border-gray-200 rounded-xl` | `bg-white rounded-xl shadow-sm border border-gray-100` |
| TH | `px-5 py-3 text-left` | `px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider` |
| TD | `px-5 py-3` | `px-6 py-4 text-sm font-medium text-gray-700` |
| "Kiểm định ngay" button | `text-xs text-indigo-600 hover:underline` | `px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition` |
| Modal overlay | Thiếu backdrop-blur | `bg-black/40 backdrop-blur-sm` |
| Modal card | `rounded-xl` | `rounded-2xl shadow-2xl border border-gray-200 animate-in zoom-in-95` |
| Modal header | Không có màu background | Thêm `bg-blue-600 text-white` |
| Submit button | `bg-indigo-600` | `bg-blue-600 hover:bg-blue-700` |
| Toast | Inline function | Import từ `../../components/Toast` |

---

### 2.5 `src/pages/qc/ReportTraceability.tsx`

**Tình trạng hiện tại:** Tab dùng button không có border-b, table styling inconsistent.

**Các thay đổi cần làm:**

**1. Tabs — đổi sang border-b style:**
```tsx
// SAU
<div className="flex border-b border-gray-200">
  <button className={`px-6 py-3 font-bold text-sm transition-all ${
    activeTab === 'history'
      ? 'border-b-2 border-blue-600 text-blue-600'
      : 'text-gray-500 hover:text-gray-700'
  }`}>
    Lịch sử kiểm nghiệm
  </button>
  <button className={`px-6 py-3 font-bold text-sm transition-all ${
    activeTab === 'supplier'
      ? 'border-b-2 border-blue-600 text-blue-600'
      : 'text-gray-500 hover:text-gray-700'
  }`}>
    Hiệu suất nhà cung cấp
  </button>
</div>
```

**2. Search bar:**
```tsx
// Thêm icon Search từ lucide-react
<div className="relative flex-1 md:w-80">
  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
  <input className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
</div>
```

**3. Result badge map** — cập nhật sizes:
```tsx
// Khi render: px-2 py-0.5 rounded-full text-[10px] font-bold uppercase
const RESULT_BADGE: Record<string, string> = {
  Pass:    'bg-green-100 text-green-700',
  Fail:    'bg-red-100 text-red-700',
  Pending: 'bg-amber-100 text-amber-700',  // thay yellow → amber cho nhất quán
};
```

**4. Table structure:**
```
- Card: bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden
- thead: bg-gray-50 border-b
- th: px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider
- tbody: divide-y divide-gray-100
- tr: hover:bg-gray-50 transition
- td: px-6 py-4 text-sm font-medium text-gray-700
```

**5. Supplier KPI cards:**
- Card: `p-5 bg-white rounded-xl border border-gray-100 shadow-sm`
- Label: `text-xs font-bold text-gray-500 uppercase tracking-wide`
- Value: `text-3xl font-bold mt-2 text-blue-600`

**6. Toast:** Xoá inline Toast function, import từ `../../components/Toast`.

---

## Thứ tự thực hiện (ưu tiên)

```
Phase 0 (phải làm trước)
  └── 0.1 Kiểm tra dependencies (lucide-react, tw-animate-css, index.css import)
  └── 0.2 Tạo src/components/Toast.tsx

Phase 1 (Layout — ảnh hưởng toàn bộ app)
  └── 1.1 src/layouts/MainLayout.tsx    ← sửa inline styles → Layout Shell
  └── 1.2 src/components/Sidebar.tsx   ← sửa inline styles → Pattern sidebar

Phase 2 (QC Pages — theo thứ tự phức tạp tăng dần)
  └── 2.1 DashboardQC.tsx              ← ít thay đổi nhất, color fixes
  └── 2.2 InboundControl.tsx           ← filter tabs + modal header
  └── 2.4 ProductInspection.tsx        ← table + modal
  └── 2.5 ReportTraceability.tsx       ← tabs + table
  └── 2.3 InventoryQC.tsx              ← nhiều thay đổi nhất, đổi alert tab từ table → card layout
```

---

## Checklist tổng hợp

- [ ] `src/components/Toast.tsx` — tạo mới
- [ ] `src/layouts/MainLayout.tsx` — xoá inline style, áp Layout Shell
- [ ] `src/components/Sidebar.tsx` — xoá inline style, áp sidebar với Lucide icons + `useLocation` active detection
- [ ] `src/pages/qc/DashboardQC.tsx` — màu `indigo→blue`, typography fix
- [ ] `src/pages/qc/InboundControl.tsx` — tabs border-b, modal header blue, badge classes, Toast import
- [ ] `src/pages/qc/ProductInspection.tsx` — table, modal, button, Toast import
- [ ] `src/pages/qc/ReportTraceability.tsx` — tabs, search icon, badge, table, Toast import
- [ ] `src/pages/qc/InventoryQC.tsx` — tabs, alert card → divide-y layout, quarantine toolbar+table, modal §6.5, Lucide icons, Toast import

---

*Kế hoạch này chỉ thay đổi phần giao diện. Không có thay đổi nào đối với API calls, state management, hoặc business logic.*
