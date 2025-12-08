import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Header from './Header';
import Sidebar from './Sidebar';
import { Navigate } from 'react-router-dom';

const Layout = ({ children, requireAuth = false }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      {requireAuth && (
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}
      
      <main className={`${requireAuth ? 'lg:ml-64' : ''} min-h-[calc(100vh-64px)]`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
