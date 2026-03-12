# FE Technical Specification — `QCInventoryQA` Page

> **Mục đích:** Bản đặc tả kỹ thuật đầy đủ để tái tạo lại toàn bộ trang `QualityControl/InventoryQA.tsx` cùng với Layout shell bao ngoài chính xác 100%. Ưu tiên trình bày dưới dạng class Tailwind CSS.

---

## 1. Hệ màu (Color Palette)

| Token              | Light mode (CSS Var / Tailwind)    | Hex / RGBA           |
| ------------------ | ---------------------------------- | -------------------- |
| **Background**     | `bg-[#F8FAFC]`                     | `#F8FAFC`            |
| **Surface/Card**   | `bg-white`                         | `#FFFFFF`            |
| **Surface Muted**  | `bg-gray-50` / `bg-gray-50/50`     | ~`#F9FAFB`           |
| **Primary**        | `bg-blue-600`                      | `#2563EB`            |
| **Primary Hover**  | `hover:bg-blue-700`                | `#1D4ED8`            |
| **Primary Light**  | `bg-blue-50`                       | `#EFF6FF`            |
| **Danger**         | `bg-red-600`                       | `#DC2626`            |
| **Danger Light**   | `bg-red-50`                        | `#FEF2F2`            |
| **Warning Badge**  | `bg-amber-100 text-amber-700`      | `#FEF3C7` / `#B45309`|
| **Purple Badge**   | `bg-purple-100 text-purple-700`    | `#F3E8FF` / `#7E22CE`|
| **Success Badge**  | `bg-green-100 text-green-700`      | `#DCFCE7` / `#15803D`|
| **Quarantine Badge**| `bg-red-100 text-red-700`         | `#FEE2E2` / `#B91C1C`|
| **Border**         | `border-gray-100` / `border-gray-200` | `#F3F4F6` / `#E5E7EB` |
| **Text Heading**   | `text-gray-900`                    | `#111827`            |
| **Text Body**      | `text-gray-500`                    | `#6B7280`            |
| **Text Muted**     | `text-gray-400`                    | `#9CA3AF`            |
| **Sidebar Active** | `bg-blue-600 text-white`           | `#2563EB` / `#FFFFFF`|
| **Overlay**        | `bg-black/40 backdrop-blur-sm`     | `rgba(0,0,0,0.4)`    |
| **Primary CSS Var**| `--primary: #030213`               | `#030213`            |
| **Muted CSS Var**  | `--muted: #ececf0`                 | `#ECECF0`            |
| **Muted FG**       | `--muted-foreground: #717182`      | `#717182`            |
| **Destructive**    | `--destructive: #d4183d`           | `#D4183D`            |
| **Border CSS Var** | `--border: rgba(0,0,0,0.1)`        | `rgba(0,0,0,0.10)`   |

---

## 2. Hệ thống Typography

| Element                    | Tailwind Classes                                                 | Ghi chú              |
| -------------------------- | ---------------------------------------------------------------- | -------------------- |
| **Page Title (H1)**        | `text-2xl font-black text-gray-900 tracking-tight leading-none uppercase` | Topbar header  |
| **Page Subtitle**          | `text-[11px] text-gray-400 font-bold uppercase tracking-widest` | Breadcrumb dưới H1  |
| **Section Heading (H2)**   | `text-lg font-bold text-gray-900 flex items-center gap-2`       | Card header         |
| **Table Header (TH)**      | `text-xs font-bold text-gray-500 uppercase tracking-wider`      | `<thead>` row       |
| **Item Name / Bold Body**  | `font-bold text-gray-900`                                       | Product name        |
| **Meta Info / Body**       | `text-sm text-gray-500 font-medium`                             | Location, date      |
| **Table Cell**             | `text-sm font-medium text-gray-700`                             | TD general          |
| **Batch No (Sub-label)**   | `text-[10px] text-gray-400 font-normal`                         | Under product name  |
| **Badge / Pill Label**     | `text-[10px] font-bold uppercase`                               | Status badges       |
| **Button Label**           | `text-sm font-bold`                                             | Action buttons      |
| **Modal Info Label**       | `text-xs text-blue-500 font-bold uppercase mb-1`                | Field prefix        |
| **Modal Body Title**       | `text-lg font-bold text-gray-900`                               | Item name in modal  |
| **Decision Button Label**  | `font-bold text-green-700` / `font-bold text-red-700`           | Extend / Discard    |
| **Sub-description**        | `text-[10px] text-gray-500 mt-1`                                | Below decision btn  |
| **Footer**                 | `text-[10px] text-gray-400 font-bold uppercase tracking-[2px]`  |                     |
| **Brand Name**             | `font-black text-gray-900 text-lg tracking-tighter`             | "PHARMA" in sidebar |
| **Brand Accent**           | `text-blue-600`                                                 | "WMS" span          |
| **Nav Item**               | `font-bold text-sm tracking-tight`                              |                     |
| **Font family**            | `font-sans` (system default)                                    | Applied on root div |
| **--font-size**            | `16px` (root)                                                   | CSS variable        |

---

## 3. Bố cục & Khoảng cách (Layout & Spacing)

### 3.1 Shell Layout (Component `Layout`)

```
min-h-screen bg-[#F8FAFC] text-gray-900 font-sans
├── <aside> Sidebar (Desktop)
│     fixed top-0 left-0 z-40
│     w-64 h-screen
│     -translate-x-full md:translate-x-0   ← hidden mobile, visible ≥md
│     bg-white border-r border-gray-100
│     shadow-xl shadow-blue-900/5
│   ├── Logo section: p-8
│   ├── <nav>: flex-1 px-4 py-4 space-y-1 overflow-y-auto
│   └── UserProfileSection: p-4 border-t border-gray-100
│
├── Mobile Menu Button
│     fixed top-4 right-4 z-50 md:hidden
│     p-3 bg-white rounded-2xl shadow-xl border border-gray-100
│
└── Main Content Area
      md:ml-64 min-h-screen flex flex-col relative transition-all duration-300
    ├── <header> Topbar
    │     bg-white/70 backdrop-blur-xl sticky top-0 z-30
    │     border-b border-gray-100
    │     Inner: px-8 py-6 flex justify-between items-center
    │
    ├── <main>: p-8 flex-1
    │     animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out
    │
    └── <footer>: px-8 py-6 border-t border-gray-50
```

### 3.2 Page Content (`InventoryQA`)

```
<div class="space-y-6">        ← gap 24px between sections
  ├── Tabs Navigation
  ├── [Tab: alert]   Quality Alert Section
  └── [Tab: quarantine] Quarantine Section
```

### 3.3 Tabs Navigation

| Property     | Value                                    |
| ------------ | ---------------------------------------- |
| Container    | `flex border-b border-gray-200`          |
| Each Tab     | `px-6 py-3 font-bold text-sm transition-all` → px: 24px, py: 12px |
| Active (alert)      | `+ border-b-2 border-blue-600 text-blue-600` |
| Active (quarantine) | `+ border-b-2 border-red-600 text-red-600`   |
| Inactive     | `text-gray-500 hover:text-gray-700`      |

### 3.4 Quality Alert Card

| Zone            | Tailwind Classes                                                     |
| --------------- | -------------------------------------------------------------------- |
| Card wrapper    | `bg-white rounded-xl shadow-sm border border-gray-100 animate-in fade-in duration-300` |
| Card header     | `p-6 border-b border-gray-100 bg-gray-50/50`                         |
| Item list       | `divide-y divide-gray-200`                                            |
| Each item row   | `p-6 hover:bg-gray-50/50 transition`                                  |
| Row inner flex  | `flex items-center justify-between`                                   |
| Left section    | `space-y-2`                                                           |
| Name + badge row| `flex items-center gap-3`                                             |
| Meta info grid  | `grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500 font-medium` |
| Meta item       | `flex items-center gap-1`                                             |

### 3.5 Quarantine Section

| Zone              | Tailwind Classes                                                              |
| ----------------- | ----------------------------------------------------------------------------- |
| Outer wrapper     | `space-y-4 animate-in fade-in duration-300`                                   |
| Toolbar card      | `bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between` |
| Left toolbar group| `flex items-center gap-4 w-full md:w-auto`                                    |
| Search wrapper    | `relative flex-1 md:w-80`                                                     |
| Search input      | `w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-red-500` |
| Filter button     | `p-2 border rounded-lg text-gray-400 hover:bg-gray-50`                        |
| Table card        | `bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden`        |
| `<table>`         | `w-full text-left`                                                            |
| `<thead>`         | `bg-gray-50 border-b`                                                         |
| TH cell           | `px-6 py-4`                                                                   |
| `<tbody>`         | `divide-y divide-gray-100`                                                    |
| TR normal         | `hover:bg-gray-50 transition`                                                 |
| TR selected       | `+ bg-red-50/30`                                                              |
| TD cell           | `px-6 py-4`                                                                   |

---

## 4. Visual Styles (Border, Shadow, Radius, Hover)

### 4.1 Border Radius

| Component                   | Tailwind          | Value (from `--radius: 0.625rem`) |
| --------------------------- | ----------------- | --------------------------------- |
| Section cards               | `rounded-xl`      | 12px                              |
| Modal card                  | `rounded-2xl`     | 16px                              |
| Nav items, buttons          | `rounded-2xl`     | 16px                              |
| Action buttons (inline)     | `rounded-lg`      | 8px                               |
| Status badges (pill)        | `rounded-full`    | 9999px                            |
| Status badges (flat)        | `rounded`         | 4px                               |
| Re-test decision buttons    | `rounded-xl`      | 12px                              |
| Logo icon box               | `rounded-xl`      | 12px                              |
| Avatar circle               | `rounded-full`    | 9999px                            |
| Input fields                | `rounded-lg`      | 8px                               |

### 4.2 Box Shadows

| Target                  | Tailwind                                   |
| ----------------------- | ------------------------------------------ |
| Sidebar                 | `shadow-xl shadow-blue-900/5`              |
| Active sidebar nav item | `shadow-lg shadow-blue-200`               |
| Retest button           | `shadow-md shadow-blue-100`               |
| Topbar                  | (border-b only, no explicit shadow)        |
| Section cards           | `shadow-sm`                               |
| Quarantine bulk button  | `shadow-lg shadow-red-100`                |
| Modal card              | `shadow-2xl`                              |
| Logo icon               | `shadow-lg shadow-blue-200`               |
| Mobile menu button      | `shadow-xl`                               |

### 4.3 Hover / Active / Transition Effects

| Element                    | State Class                                              |
| -------------------------- | -------------------------------------------------------- |
| Alert item row             | `hover:bg-gray-50/50 transition`                         |
| Retest button              | `hover:bg-blue-700 transition`                           |
| Filter button              | `hover:bg-gray-50`                                       |
| Table row                  | `hover:bg-gray-50 transition`                            |
| Nav item                   | `hover:bg-blue-50 hover:text-blue-600 transition-all duration-300` |
| Active nav item            | `translate-x-1` (subtle slide right)                    |
| Logout button              | `hover:bg-red-600 hover:text-white transition-all duration-200 active:scale-95` |
| Re-test decision btn       | `hover:bg-green-50` / `hover:bg-red-50 transition`       |
| Mobile menu button         | `active:scale-90 transition-all`                         |
| Quarantine bulk (active)   | `bg-red-600 text-white`                                  |
| Quarantine bulk (disabled) | `bg-gray-100 text-gray-400 cursor-not-allowed`           |

### 4.4 Animation (tw-animate-css)

| Target                | Class                                                    |
| --------------------- | -------------------------------------------------------- |
| Section switch        | `animate-in fade-in duration-300`                        |
| Modal appear          | `animate-in zoom-in-95`                                  |
| Mobile sidebar        | `animate-in slide-in-from-left duration-300`             |
| Page content load     | `animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out` |
| Status dot            | `animate-pulse`                                          |

### 4.5 Opacity / Backdrop

| Element             | Class                        |
| ------------------- | ---------------------------- |
| Modal overlay       | `bg-black/40 backdrop-blur-sm` |
| Topbar              | `bg-white/70 backdrop-blur-xl` |
| Mobile overlay      | `bg-gray-900/20 backdrop-blur-md` |
| Sidebar active nav  | Chevron: `text-white/50`     |
| Surface muted       | `bg-gray-50/50`              |

---

## 5. Icons (Lucide React)

### Dùng trong `InventoryQA.tsx`

| Icon            | Kích thước | Màu / Class                | Ngữ cảnh                        |
| --------------- | ---------- | -------------------------- | ------------------------------- |
| `AlertCircle`   | default    | `text-amber-500`           | Section heading (Quality Alert) |
| `RefreshCw`     | 20px       | `text-white`               | Modal header + Retest button    |
| `RefreshCw`     | 16px       | —                          | Trong Retest button             |
| `ShieldAlert`   | 18px       | —                          | Quarantine bulk action button   |
| `MapPin`        | 14px       | —                          | Location meta                   |
| `Calendar`      | 14px       | —                          | Expiry date meta                |
| `CheckCircle`   | 24px       | `text-green-500 mx-auto mb-2` | Modal "Extend" decision      |
| `Trash2`        | 24px       | `text-red-500 mx-auto mb-2`   | Modal "Discard" decision     |
| `Search`        | 18px       | `text-gray-400`            | Search input prefix             |
| `Filter`        | 20px       | —                          | Filter button                   |
| `Lock`          | 14px       | —                          | Item ID meta                    |
| `ChevronRight`  | —          | —                          | (imported, available)           |
| `X`             | —          | —                          | Modal close button              |

### Dùng trong `Layout.tsx`

| Icon               | Size  | Ngữ cảnh                     |
| ------------------ | ----- | ----------------------------- |
| `LayoutDashboard`  | 20px  | Nav: Dashboard                |
| `Package`          | 20px  | Nav: Inventory / Logo icon    |
| `BarChart3`        | 20px  | Nav: Stock                    |
| `ClipboardCheck`   | 20px  | Nav: QC Pending               |
| `FileText`         | 20px  | Nav: Reports / InOut / Users  |
| `LogOut`           | 18px  | Logout button                 |
| `Menu`             | 24px  | Mobile hamburger              |
| `X`                | 24px  | Mobile close                  |
| `ArrowUpCircle`    | 20px  | Nav: Outbound                 |
| `ArrowDownCircle`  | 20px  | Nav: Inbound / Material       |
| `ListChecks`       | 20px  | Nav: Audit                    |
| `History`          | 20px  | Nav: History                  |
| `Activity`         | 20px  | Nav: Monitoring               |
| `Terminal`         | 20px  | Nav: Logs                     |
| `Database`         | 20px  | Nav: Backup                   |
| `ShieldCheck`      | 20px  | Nav: QC Products / Inventory  |
| `FileBarChart`     | 20px  | Nav: IT Reports               |
| `User`             | 20px  | User avatar in profile        |
| `FileSearch`       | 20px  | Nav: Traceability             |
| `ChevronRight`     | 14px  | Active nav arrow / breadcrumb |

> **Thư viện:** `lucide-react` — import theo tên, không dùng sprite.

---

## 6. Component Specifications (Copy-paste Ready)

### 6.1 Layout Shell

```tsx
// Root shell
<div className="min-h-screen bg-[#F8FAFC] text-gray-900 font-sans">

  {/* Sidebar */}
  <aside className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full md:translate-x-0 bg-white border-r border-gray-100 shadow-xl shadow-blue-900/5">
    <div className="h-full flex flex-col">

      {/* Logo */}
      <div className="p-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Package className="text-white" size={24} />
          </div>
          <div>
            <div className="font-black text-gray-900 leading-none text-lg tracking-tighter">
              PHARMA<span className="text-blue-600">WMS</span>
            </div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[2px] mt-1">
              {roleLabel}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {/* Nav item inactive */}
        <a className="flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group text-gray-500 hover:bg-blue-50 hover:text-blue-600">
          <div className="flex items-center space-x-3">
            <span className="group-hover:text-blue-600 transition-colors">{icon}</span>
            <span className="font-bold text-sm tracking-tight">{label}</span>
          </div>
        </a>
        {/* Nav item active */}
        <a className="flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group bg-blue-600 text-white shadow-lg shadow-blue-200 translate-x-1">
          <div className="flex items-center space-x-3">
            <span className="text-white">{icon}</span>
            <span className="font-bold text-sm tracking-tight">{label}</span>
          </div>
          <ChevronRight size={14} className="text-white/50" />
        </a>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-100">
        <div className="bg-blue-50/50 rounded-2xl p-4 mb-3 border border-blue-100/50 flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
            <User size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-black text-gray-900 truncate tracking-tight">John123</div>
            <div className="text-[10px] font-black text-blue-600 bg-blue-100 px-2 py-0.5 rounded uppercase tracking-widest mt-1">
              {roleName}
            </div>
          </div>
        </div>
        <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-white border border-red-100 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-200 shadow-sm active:scale-95 font-bold text-sm">
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </button>
      </div>

    </div>
  </aside>

  {/* Main content */}
  <div className="md:ml-64 min-h-screen flex flex-col relative transition-all duration-300">
    
    {/* Topbar */}
    <header className="bg-white/70 backdrop-blur-xl sticky top-0 z-30 border-b border-gray-100">
      <div className="px-8 py-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none uppercase">{title}</h1>
          <p className="text-[11px] text-gray-400 font-bold mt-2 flex items-center gap-1 uppercase tracking-widest">
            Hệ thống Quản lý Dược phẩm <ChevronRight size={10} /> {roleLabel}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter italic">Server Status: Online</span>
        </div>
      </div>
    </header>

    {/* Page content */}
    <main className="p-8 flex-1 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      {children}
    </main>

    {/* Footer */}
    <footer className="px-8 py-6 border-t border-gray-50 text-[10px] text-gray-400 font-bold uppercase tracking-[2px] flex justify-between">
      <span>PharmaWMS v2.0.1</span>
      <span className="hidden sm:inline">© 2026 Toàn quyền bởi IT Department</span>
    </footer>
  </div>
</div>
```

---

### 6.2 Tab Navigation Bar

```tsx
<div className="flex border-b border-gray-200">
  {/* Tab active — blue variant */}
  <button className="px-6 py-3 font-bold text-sm transition-all border-b-2 border-blue-600 text-blue-600">
    Cảnh báo chất lượng (Quality Alert)
  </button>
  {/* Tab active — red variant */}
  <button className="px-6 py-3 font-bold text-sm transition-all border-b-2 border-red-600 text-red-600">
    Cách ly hàng hóa (Quarantine)
  </button>
  {/* Tab inactive */}
  <button className="px-6 py-3 font-bold text-sm transition-all text-gray-500 hover:text-gray-700">
    Tab Name
  </button>
</div>
```

---

### 6.3 Quality Alert Card (Section 1)

```tsx
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
    {/* Each Row */}
    <div className="p-6 hover:bg-gray-50/50 transition">
      <div className="flex items-center justify-between">
        
        {/* Left: Info */}
        <div className="space-y-2">
          {/* Name + Badge */}
          <div className="flex items-center gap-3">
            <span className="font-bold text-gray-900">Paracetamol 500mg</span>
            {/* Near-expiry badge */}
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-700">
              Near Expiry
            </span>
            {/* Retest badge */}
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-100 text-purple-700">
              Retest Due
            </span>
          </div>
          {/* Meta */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500 font-medium">
            <div className="flex items-center gap-1"><Lock size={14} /> P001</div>
            <div className="flex items-center gap-1"><MapPin size={14} /> Kho A-1</div>
            <div className="flex items-center gap-1"><Calendar size={14} /> 2026-03-01</div>
          </div>
        </div>

        {/* Right: Action Button */}
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm font-bold transition shadow-md shadow-blue-100">
          <RefreshCw size={16} /> Thực hiện Re-test
        </button>

      </div>
    </div>
  </div>
</div>
```

---

### 6.4 Quarantine Section (Section 2)

```tsx
<div className="space-y-4 animate-in fade-in duration-300">

  {/* Toolbar */}
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
    <div className="flex items-center gap-4 w-full md:w-auto">
      {/* Search */}
      <div className="relative flex-1 md:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Tìm theo khu vực (Ví dụ: Kho A-1)..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>
      {/* Filter */}
      <button className="p-2 border rounded-lg text-gray-400 hover:bg-gray-50">
        <Filter size={20} />
      </button>
    </div>

    {/* Bulk Quarantine — Active */}
    <button className="flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition bg-red-600 text-white shadow-lg shadow-red-100">
      <ShieldAlert size={18} /> Cách ly hàng loạt (2)
    </button>
    {/* Bulk Quarantine — Disabled */}
    <button disabled className="flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition bg-gray-100 text-gray-400 cursor-not-allowed">
      <ShieldAlert size={18} /> Cách ly hàng loạt (0)
    </button>
  </div>

  {/* Table */}
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
    <table className="w-full text-left">
      <thead className="bg-gray-50 border-b">
        <tr className="text-gray-500 text-xs font-bold uppercase tracking-wider">
          <th className="px-6 py-4"><input type="checkbox" className="rounded border-gray-300" /></th>
          <th className="px-6 py-4">Lô hàng / Tên hàng</th>
          <th className="px-6 py-4">Vị trí Bin</th>
          <th className="px-6 py-4">Trạng thái</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {/* Row — Normal */}
        <tr className="hover:bg-gray-50 transition">
          <td className="px-6 py-4">
            <input type="checkbox" className="rounded border-gray-300 text-red-600 focus:ring-red-500" />
          </td>
          <td className="px-6 py-4 font-bold text-gray-900">
            Paracetamol 500mg
            <p className="text-[10px] text-gray-400 font-normal">LOT-001</p>
          </td>
          <td className="px-6 py-4 text-sm font-medium">Kho A-1</td>
          <td className="px-6 py-4">
            {/* Normal badge */}
            <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700">NORMAL</span>
          </td>
        </tr>
        {/* Row — Selected */}
        <tr className="hover:bg-gray-50 transition bg-red-50/30">
          <td className="px-6 py-4">
            <input type="checkbox" checked className="rounded border-gray-300 text-red-600 focus:ring-red-500" />
          </td>
          <td className="px-6 py-4 font-bold text-gray-900">
            Vitamin C 1000mg
            <p className="text-[10px] text-gray-400 font-normal">LOT-005</p>
          </td>
          <td className="px-6 py-4 text-sm font-medium">Kho B-3</td>
          <td className="px-6 py-4">
            {/* Quarantine badge */}
            <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700">QUARANTINE</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

---

### 6.5 Re-test Decision Modal

```tsx
{/* Overlay */}
<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
  
  {/* Modal Card */}
  <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200 animate-in zoom-in-95">
    
    {/* Header */}
    <div className="p-6 border-b flex justify-between items-center bg-blue-600 text-white">
      <h3 className="font-bold flex items-center gap-2">
        <RefreshCw size={20} /> Kết quả tái kiểm định
      </h3>
      <button onClick={onClose}><X /></button>
    </div>

    {/* Body */}
    <div className="p-6 space-y-6">
      
      {/* Info card */}
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
        <p className="text-xs text-blue-500 font-bold uppercase mb-1">Đang kiểm tra: P001</p>
        <p className="text-lg font-bold text-gray-900">Paracetamol 500mg</p>
        <p className="text-sm text-gray-600">Vị trí hiện tại: <span className="font-bold">Kho A-1</span></p>
      </div>

      {/* Decision */}
      <div className="space-y-3 text-sm">
        <p className="font-bold text-gray-700">Quyết định trạng thái mới:</p>
        <div className="grid grid-cols-2 gap-4">
          
          {/* Extend */}
          <button className="p-4 border-2 border-green-100 rounded-xl hover:bg-green-50 transition text-center group">
            <CheckCircle className="mx-auto mb-2 text-green-500" size={24} />
            <span className="font-bold text-green-700">GIA HẠN (Extend)</span>
            <p className="text-[10px] text-gray-500 mt-1">Cập nhật HSD mới</p>
          </button>

          {/* Discard */}
          <button className="p-4 border-2 border-red-100 rounded-xl hover:bg-red-50 transition text-center group">
            <Trash2 className="mx-auto mb-2 text-red-500" size={24} />
            <span className="font-bold text-red-700">HỦY BỎ (Discard)</span>
            <p className="text-[10px] text-gray-500 mt-1">Hàng đã hỏng/hết hạn</p>
          </button>

        </div>
      </div>
    </div>

    {/* Footer */}
    <div className="p-4 bg-gray-50 border-t flex justify-end">
      <button onClick={onClose} className="px-6 py-2 text-gray-500 font-bold">Đóng</button>
    </div>

  </div>
</div>
```

---

## 7. Kích thước cố định (Fixed Dimensions)

| Element                    | Width / Height           | Tailwind         |
| -------------------------- | ------------------------ | ---------------- |
| Sidebar width              | 256px (w-64)             | `w-64`           |
| Main content offset        | margin-left 256px        | `md:ml-64`       |
| Logo icon box              | 40×40px                  | `w-10 h-10`      |
| User avatar                | 40×40px                  | `w-10 h-10`      |
| Status dot                 | 8×8px                    | `w-2 h-2`        |
| Nav item height            | ~44px (py-3.5 + text)    | `py-3.5`         |
| Search input width (md+)   | 320px                    | `md:w-80`        |
| Mobile sidebar width       | 288px                    | `w-72`           |
| Modal max-width            | 512px                    | `max-w-lg`       |
| Mobile menu button padding | 12px                     | `p-3`            |

---

## 8. Dependencies & Packages

```json
{
  "lucide-react": "^latest",
  "tailwindcss": "^4.x",
  "tw-animate-css": "^latest",
  "react-router": "^7.x"
}
```

```ts
// tailwind.css (entry)
@import 'tailwindcss' source(none);
@source '../**/*.{js,ts,jsx,tsx}';
@import 'tw-animate-css';
```

---

## 9. Responsive Breakpoints

| Breakpoint | Behavior                                              |
| ---------- | ----------------------------------------------------- |
| `< md`     | Sidebar ẩn (`-translate-x-full`), hiện mobile button  |
| `≥ md`     | Sidebar visible (`translate-x-0`), main `ml-64`       |
| `< md`     | Toolbar stacks vertically (`flex-col`)                |
| `≥ md`     | Toolbar nằm ngang (`flex-row`)                        |
| `< md`     | Meta grid: `grid-cols-2`                              |
| `≥ md`     | Meta grid: `grid-cols-4`                              |
| `< sm`     | Status dot + footer right hidden (`hidden sm:*`)      |

---

> *Tài liệu được tạo tự động từ phân tích mã nguồn. Cập nhật lần cuối: 09/03/2026.*
