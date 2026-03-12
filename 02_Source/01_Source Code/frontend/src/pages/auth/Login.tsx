import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Package, Eye, EyeOff, LogIn } from "lucide-react";
import type { UserRole } from "../../types/auth";

const ROLE_ROUTES: Record<UserRole, string> = {
  manager: "/manager/dashboard",
  operator: "/operator/dashboard",
  qc: "/qc/dashboard",
  it_admin: "/admin/dashboard",
};

const ROLE_LABELS: Record<UserRole, string> = {
  manager: "Quản lý",
  operator: "Nhân viên kho",
  qc: "Kiểm soát chất lượng",
  it_admin: "Quản trị viên IT",
};

// Demo accounts — replace with real auth API
const DEMO_ACCOUNTS: Record<string, { password: string; role: UserRole }> = {
  manager01:  { password: "Manager@123",  role: "manager"  },
  operator01: { password: "Operator@123", role: "operator" },
  qc01:       { password: "QC@123456",    role: "qc"       },
  itadmin01:  { password: "ITAdmin@123",  role: "it_admin" },
};

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Vui lòng nhập tên đăng nhập và mật khẩu.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const account = DEMO_ACCOUNTS[username.trim()];
      if (!account || account.password !== password) {
        setError("Tên đăng nhập hoặc mật khẩu không đúng.");
        return;
      }
      navigate(ROLE_ROUTES[account.role]);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 mb-4">
            <Package className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Inventory Management</h1>
          <p className="text-sm text-gray-500 mt-1">Hệ thống quản lý kho dược phẩm</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/8 border border-gray-100 p-8">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Đăng nhập</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Tên đăng nhập
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                autoComplete="username"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-blue-200"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn size={18} />
              )}
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Chưa có tài khoản?{" "}
            <Link to="/register" className="text-blue-600 font-semibold hover:underline">
              Đăng ký
            </Link>
          </p>
        </div>

        {/* Demo accounts */}
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-xs font-black text-amber-700 uppercase tracking-widest mb-3">Tài khoản thử nghiệm</p>
          <div className="space-y-2">
            {[
              { user: "manager01",  pass: "Manager@123",  role: "Quản lý" },
              { user: "operator01", pass: "Operator@123", role: "Nhân viên kho" },
              { user: "qc01",       pass: "QC@123456",    role: "Kiểm soát chất lượng" },
              { user: "itadmin01",  pass: "ITAdmin@123",  role: "Quản trị viên IT" },
            ].map(({ user, pass, role }) => (
              <button
                key={user}
                type="button"
                onClick={() => { setUsername(user); setPassword(pass); setError(""); }}
                className="w-full flex items-center justify-between px-3 py-2 bg-white border border-amber-100 hover:border-amber-300 rounded-xl transition-all text-left group"
              >
                <span className="text-xs font-bold text-gray-800 group-hover:text-blue-600">{user}</span>
                <span className="text-[10px] font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">{role}</span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-amber-600 mt-2 text-center">Nhấn để điền nhanh thông tin đăng nhập</p>
        </div>
      </div>
    </div>
  );
}
