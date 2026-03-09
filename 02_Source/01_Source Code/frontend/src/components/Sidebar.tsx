import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, BarChart3, ClipboardCheck, ShieldCheck, FileText, FileSearch, User, LogOut } from 'lucide-react';

const navItems = [
  { to: '/qc/dashboard', label: 'Tổng quan chất lượng', icon: BarChart3 },
  { to: '/qc/inbound', label: 'Kiểm soát đầu vào', icon: ClipboardCheck },
  { to: '/qc/inspection', label: 'Kiểm định sản phẩm', icon: ShieldCheck },
  { to: '/qc/traceability', label: 'Truy vết & Báo cáo', icon: FileText },
  { to: '/qc/inventory', label: 'Kiểm soát kho', icon: FileSearch },
];

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="fixed top-0 left-0 z-40 w-64 h-screen -translate-x-full md:translate-x-0 bg-white border-r border-gray-100 shadow-xl shadow-blue-900/5 flex flex-col transition-transform duration-300">
      {/* Logo */}
      <div className="px-6 py-7 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-normal text-gray-400 tracking-tight">PHARMA</span>
            <span className="text-lg font-black text-gray-900 tracking-tight">WMS</span>
          </div>
        </div>
        <p className="text-[9px] font-bold text-gray-300 uppercase tracking-[3px] mt-1.5 ml-0.5">Warehouse Management System</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-blue-100 shadow-lg text-white shadow-blue-200 translate-x-1'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:translate-x-1'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="px-4 py-4 border-t border-gray-50">
        <div className="flex items-center gap-3 px-3 py-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">QC Technician</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">qc_user</p>
          </div>
          <button className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
