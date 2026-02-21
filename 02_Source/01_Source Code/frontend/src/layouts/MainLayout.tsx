import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const MainLayout = () => {
  return (
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
  );
};

export default MainLayout;