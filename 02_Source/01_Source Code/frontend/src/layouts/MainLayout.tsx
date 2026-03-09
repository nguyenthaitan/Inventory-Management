import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 font-sans">
      <Sidebar />
      <div className="md:ml-64 min-h-screen flex flex-col relative transition-all duration-300">
        <header className="bg-white/70 backdrop-blur-xl sticky top-0 z-30 border-b border-gray-100">
          <div className="px-8 py-5 flex justify-between items-center">
            <div />
          </div>
        </header>
        <main className="p-8 flex-1 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
          <Outlet />
        </main>
        <footer className="px-8 py-5 border-t border-gray-50 text-[10px] text-gray-400 font-bold uppercase tracking-[2px] flex justify-between">
          <span>PharmaWMS v2.0.1</span>
          <span className="hidden sm:inline">© 2026 Toàn quyền bởi IT Department</span>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;