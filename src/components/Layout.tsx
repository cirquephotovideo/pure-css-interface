
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState<string>('products');

  // Update active page based on current route
  useEffect(() => {
    const pathname = location.pathname;
    
    if (pathname === '/') {
      setActivePage('products');
    } else if (pathname === '/catalogs') {
      setActivePage('catalogs');
    } else if (pathname === '/settings') {
      setActivePage('settings');
    }
  }, [location.pathname]);

  // Handle navigation from sidebar
  const handleNavigate = (page: string) => {
    switch (page) {
      case 'products':
        navigate('/');
        break;
      case 'catalogs':
        navigate('/catalogs');
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'brands':
        // Not implemented yet
        break;
      case 'activities':
        // Not implemented yet
        break;
      default:
        navigate('/');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        activePage={activePage} 
        onNavigate={handleNavigate} 
      />
      <main className="flex-1 overflow-auto p-6 bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
