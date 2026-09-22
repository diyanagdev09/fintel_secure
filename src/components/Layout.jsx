import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import Sidebar from './Sidebar.jsx';
import Navbar from './Navbar.jsx';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />

      <div className={`main ${collapsed ? 'collapsed' : ''}`}>
        <Navbar />

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
