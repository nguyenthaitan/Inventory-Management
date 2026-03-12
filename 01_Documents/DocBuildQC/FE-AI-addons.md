# FE AI Addons — Triển khai Tab "Phân tích từ AI" (ReportTraceability)

## 1. Tổng quan

Thay thế placeholder trong tab `AI-analysis` của `ReportTraceability.tsx` bằng UI hoàn chỉnh:
- **Chế độ 1:** Phân tích tất cả nhà cung cấp (gọi `GET /ai/supplier-analysis`)
- **Chế độ 2:** Nhập tên nhà cung cấp để phân tích chi tiết (gọi `GET /ai/supplier-analysis/:name`)
- Filter theo ngày từ/đến (tái sử dụng state `dateFrom`/`dateTo` đã có)
- Hiển thị kết quả AI dưới dạng card có thông tin model, timestamp, số nhà cung cấp đã phân tích

---

## 2. UI/UX Layout

```
┌──────────────────────────────────────────────────────┐
│  🤖 Phân tích AI                                      │
│  Chọn chế độ phân tích nhà cung cấp                  │
│                                                      │
│  ┌──────────────────┐  ┌──────────────────────────┐  │
│  │ ● Tất cả NCC     │  │ ○ Theo tên NCC           │  │
│  └──────────────────┘  └──────────────────────────┘  │
│                                                      │
│  [Từ ngày ______]  [Đến ngày ______]                │
│  [Input: Tên nhà cung cấp]   ← chỉ hiện nếu chế độ 2│
│                                                      │
│  [  🤖 Phân tích với AI  ]  ← loading spinner khi gọi│
│                                                      │
│  ┌──── Kết quả phân tích ─────────────────────────┐  │
│  │ Model: Qwen/Qwen2.5-72B │ Thời gian: 10:25 AM │  │
│  │ Đã phân tích: N nhà cung cấp                   │  │
│  │ ─────────────────────────────────────────────  │  │
│  │ [Nội dung phân tích AI hiển thị dạng prose]    │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

---

## 3. Các thay đổi cần thực hiện

### 3.1. Thêm type vào `src/types/qc.ts`

```typescript
// Thêm cuối file:

export interface SupplierAnalysisResponse {
  success: boolean;
  analysis: string;
  suppliers_analyzed: number;
  timestamp: string;
  model_used: string;
}
```

### 3.2. Thêm service functions vào `src/services/qcServices.ts`

Thêm 2 hàm mới vào cuối file, tuân theo pattern `fetch + handleApiError` đã có:

```typescript
export async function analyzeAllSuppliers(
  from?: string,
  to?: string,
): Promise<SupplierAnalysisResponse> {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${BASE_URL}/ai/supplier-analysis${query}`);
  await handleApiError(res);
  return res.json() as Promise<SupplierAnalysisResponse>;
}

export async function analyzeOneSupplier(
  supplierName: string,
  from?: string,
  to?: string,
): Promise<SupplierAnalysisResponse> {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(
    `${BASE_URL}/ai/supplier-analysis/${encodeURIComponent(supplierName)}${query}`,
  );
  await handleApiError(res);
  return res.json() as Promise<SupplierAnalysisResponse>;
}
```

### 3.3. Cập nhật `src/pages/qc/ReportTraceability.tsx`

**3.3.a — Thêm import:**
```typescript
import type { SupplierAnalysisResponse } from '../../types/qc';
import { analyzeAllSuppliers, analyzeOneSupplier } from '../../services/qcServices';
```

**3.3.b — Thêm state vào phần khai báo state của component:**
```typescript
// AI Analysis tab state
type AiMode = 'all' | 'single';
const [aiMode, setAiMode] = useState<AiMode>('all');
const [aiSupplierInput, setAiSupplierInput] = useState('');
const [aiLoading, setAiLoading] = useState(false);
const [aiResult, setAiResult] = useState<SupplierAnalysisResponse | null>(null);
```

**3.3.c — Thêm handler:**
```typescript
async function handleAiAnalyze() {
  if (aiMode === 'single' && !aiSupplierInput.trim()) {
    setToast({ message: 'Vui lòng nhập tên nhà cung cấp', type: 'error' });
    return;
  }
  setAiLoading(true);
  setAiResult(null);
  try {
    const result =
      aiMode === 'all'
        ? await analyzeAllSuppliers(dateFrom || undefined, dateTo || undefined)
        : await analyzeOneSupplier(aiSupplierInput.trim(), dateFrom || undefined, dateTo || undefined);
    setAiResult(result);
    if (!result.success) {
      setToast({ message: 'AI phân tích không thành công. Xem chi tiết trong kết quả.', type: 'error' });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Lỗi không xác định';
    setToast({ message, type: 'error' });
  } finally {
    setAiLoading(false);
  }
}
```

**3.3.d — Thay toàn bộ placeholder trong `{activeTab === 'AI-analysis' && (...)}`:**

```tsx
{activeTab === 'AI-analysis' && (
  <div className="space-y-5">
    {/* Mode card */}
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-lg">🤖</span>
        <div>
          <h3 className="font-bold text-gray-900">Phân tích nhà cung cấp bằng AI</h3>
          <p className="text-xs text-gray-400">Sử dụng dữ liệu QC test thực tế để đánh giá rủi ro</p>
        </div>
      </div>

      {/* Mode selector */}
      <div className="flex gap-3">
        <button
          onClick={() => setAiMode('all')}
          className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-semibold transition ${
            aiMode === 'all'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 text-gray-500 hover:border-gray-300'
          }`}
        >
          📊 Tất cả nhà cung cấp
        </button>
        <button
          onClick={() => setAiMode('single')}
          className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-semibold transition ${
            aiMode === 'single'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 text-gray-500 hover:border-gray-300'
          }`}
        >
          🔍 Theo tên nhà cung cấp
        </button>
      </div>

      {/* Single supplier input */}
      {aiMode === 'single' && (
        <input
          type="text"
          value={aiSupplierInput}
          onChange={(e) => setAiSupplierInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') void handleAiAnalyze(); }}
          placeholder="Nhập tên nhà cung cấp (VD: Công ty ABC)..."
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400"
        />
      )}

      {/* Date range filter */}
      <div className="flex gap-3 items-end flex-wrap">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Từ ngày</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Đến ngày</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <p className="text-xs text-gray-400 pb-2">Bỏ trống để phân tích toàn bộ dữ liệu</p>
      </div>

      {/* Analyze button */}
      <button
        onClick={() => void handleAiAnalyze()}
        disabled={aiLoading}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition"
      >
        {aiLoading ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Đang phân tích...
          </>
        ) : (
          <>🤖 Phân tích với AI</>
        )}
      </button>
    </div>

    {/* Result card */}
    {aiResult && (
      <div className={`bg-white border rounded-xl shadow-sm overflow-hidden ${
        aiResult.success ? 'border-gray-100' : 'border-red-200'
      }`}>
        {/* Result header */}
        <div className={`px-5 py-3 border-b flex items-center justify-between flex-wrap gap-2 ${
          aiResult.success ? 'border-gray-100 bg-gray-50' : 'border-red-100 bg-red-50'
        }`}>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              aiResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {aiResult.success ? '✓ Thành công' : '✕ Lỗi'}
            </span>
            <span className="text-xs text-gray-500">
              Đã phân tích: <strong>{aiResult.suppliers_analyzed}</strong> nhà cung cấp
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>Model: <span className="font-mono">{aiResult.model_used.split('/').pop()}</span></span>
            <span>{new Date(aiResult.timestamp).toLocaleString('vi-VN')}</span>
          </div>
        </div>

        {/* Analysis content */}
        <div className="px-5 py-4">
          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
            {aiResult.analysis}
          </pre>
        </div>
      </div>
    )}

    {/* Empty state */}
    {!aiResult && !aiLoading && (
      <div className="p-12 bg-white border border-dashed border-gray-200 rounded-xl text-center text-gray-400">
        <div className="text-4xl mb-3">🤖</div>
        <p className="text-sm font-medium">Chưa có kết quả phân tích</p>
        <p className="text-xs mt-1">Chọn chế độ và nhấn "Phân tích với AI" để bắt đầu</p>
      </div>
    )}
  </div>
)}
```

---

## 4. Thứ tự implement

```
Step 1 │ Thêm SupplierAnalysisResponse vào src/types/qc.ts
       │   - Import đơn giản, không ảnh hưởng code hiện tại
       │
Step 2 │ Thêm analyzeAllSuppliers() và analyzeOneSupplier() vào src/services/qcServices.ts
       │   - Thêm import SupplierAnalysisResponse vào đầu file
       │   - Append 2 hàm vào cuối file
       │
Step 3 │ Cập nhật ReportTraceability.tsx
       │   3a. Thêm import 2 hàm mới và type SupplierAnalysisResponse
       │   3b. Thêm 4 state: aiMode, aiSupplierInput, aiLoading, aiResult
       │   3c. Thêm handler handleAiAnalyze()
       │   3d. Thay placeholder AI-analysis tab bằng UI hoàn chỉnh
       │
Step 4 │ Kiểm tra lỗi TypeScript
       │   - Chạy kiểm tra lỗi trên 3 file đã sửa
```

---

## 5. Tham chiếu pattern đã có

| Pattern hiện tại | Áp dụng cho AI tab |
|---|---|
| `useState<SupplierPerformance[]>` + `loadingSuppliers` | `useState<SupplierAnalysisResponse \| null>` + `aiLoading` |
| `handleApiError(res)` trong qcServices | Dùng lại — `analyzeAllSuppliers` cũng throw `Error` nếu API lỗi |
| `setToast({ message, type: 'error' })` | Dùng lại toast đã có trong component |
| `dateFrom` / `dateTo` state | **Tái sử dụng** — AI tab dùng chung state filter ngày với Supplier tab |
| `void handleSearch()` trong onClick | `void handleAiAnalyze()` — cùng pattern async void |
| Tailwind spinner `animate-spin` | Copy y hệt từ nút "Áp dụng" trong Supplier tab |

---

## 6. Lưu ý

- **Tái sử dụng `dateFrom`/`dateTo`:** State này đã có sẵn trong component, AI tab dùng chung không cần khai báo thêm.
- **`pre` tag cho kết quả AI:** Dùng `<pre className="whitespace-pre-wrap font-sans">` để giữ nguyên line break trong văn bản AI trả về mà không mất định dạng.
- **Không cần tạo component mới:** Toàn bộ UI nằm trong `ReportTraceability.tsx`, không đủ phức tạp để tách component riêng.
- **Encode tên NCC:** `encodeURIComponent(supplierName)` đã được xử lý trong service function — component không cần lo.
