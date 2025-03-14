
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Moon, Sun } from 'lucide-react';

interface SidebarItemProps {
  icon: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
  collapsed?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  active,
  onClick,
  collapsed
}) => {
  return (
    <div 
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-full transition-all cursor-pointer", 
        active ? "bg-white/30 backdrop-blur-md font-medium text-white shadow-md border border-white/20" : "text-white/80 hover:bg-white/20",
        collapsed && "justify-center px-3"
      )} 
      onClick={onClick}
    >
      <div className="text-[20px]">{icon}</div>
      {!collapsed && <span>{label}</span>}
    </div>
  );
};

interface SidebarProps {
  className?: string;
  onNavigate?: (page: string) => void;
  activePage?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  className,
  onNavigate,
  activePage = 'products'
}) => {
  const [darkMode, setDarkMode] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Initialize dark mode based on localStorage or system preference
  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true' || window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDarkMode);
    
    // Check if sidebar state is stored
    const sidebarState = localStorage.getItem('sidebarCollapsed');
    if (sidebarState) {
      setCollapsed(sidebarState === 'true');
    }
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);
  
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', newDarkMode.toString());
  };
  
  const toggleCollapsed = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    localStorage.setItem('sidebarCollapsed', newCollapsed.toString());
  };
  
  const handleNavigation = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };
  
  return (
    <aside 
      className={cn(
        "bg-sidebar h-screen flex flex-col relative transition-all duration-300", 
        "dark:from-[#322F3D] dark:to-[#221F26]", 
        "bg-gradient-to-b from-[#9b87f5] to-[#7E69AB]", 
        "border-r border-white/20 dark:border-white/5", 
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className={cn("p-6 flex items-center", collapsed && "justify-center p-4")}>
        {!collapsed && <h1 className="text-xl font-medium text-white">TARIFIQUE</h1>}
        {collapsed && <h1 className="text-xl font-medium text-white">T</h1>}
      </div>
      
      <div className={cn("mt-3 px-4 text-sm font-medium text-white/70", collapsed && "text-center px-2")}>
        {!collapsed && "MENU"}
      </div>
      
      <nav className="mt-2 flex flex-col gap-2 px-4">
        <SidebarItem 
          icon="📦" 
          label="Produits" 
          active={activePage === 'products'} 
          onClick={() => handleNavigation('products')} 
          collapsed={collapsed}
        />
        <SidebarItem 
          icon="📑" 
          label="Catalogues" 
          active={activePage === 'catalogs'} 
          onClick={() => handleNavigation('catalogs')} 
          collapsed={collapsed}
        />
        <SidebarItem 
          icon="🏷️" 
          label="Marques" 
          active={activePage === 'brands'} 
          onClick={() => handleNavigation('brands')} 
          collapsed={collapsed}
        />
        <SidebarItem 
          icon="📊" 
          label="Activités" 
          active={activePage === 'activities'} 
          onClick={() => handleNavigation('activities')} 
          collapsed={collapsed}
        />
        <SidebarItem 
          icon="⚙️" 
          label="Paramètres" 
          active={activePage === 'settings'} 
          onClick={() => handleNavigation('settings')} 
          collapsed={collapsed}
        />
      </nav>
      
      {!collapsed && (
        <div className="px-4 py-3 mt-auto bg-white/10 dark:bg-black/20 backdrop-blur-md m-3 rounded-xl border border-white/20 dark:border-white/5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                {darkMode ? <Moon size={16} /> : <Sun size={16} />}
                <span>Mode sombre</span>
              </div>
              <label className="ios-switch">
                <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
                <span className="ios-slider"></span>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-white">Notifications</span>
              <label className="ios-switch">
                <input type="checkbox" defaultChecked />
                <span className="ios-slider"></span>
              </label>
            </div>
          </div>
        </div>
      )}
      
      {collapsed && (
        <div className="px-2 py-3 mt-auto bg-white/10 dark:bg-black/20 backdrop-blur-md m-3 rounded-xl border border-white/20 dark:border-white/5 flex flex-col items-center gap-3">
          <button onClick={toggleDarkMode} className="text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20">
            {darkMode ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      )}
      
      <div className={cn(
        "mt-2 p-4 text-xs text-white/60 border-t border-white/20 dark:border-white/5",
        collapsed && "text-center p-2"
      )}>
        {!collapsed ? "Version 1.0.0" : "v1.0.0"}
      </div>
      
      {/* Toggle button */}
      <button 
        onClick={toggleCollapsed} 
        className="absolute -right-3 top-16 bg-white/30 dark:bg-black/30 backdrop-blur-md border border-white/20 dark:border-white/5 rounded-full p-1 shadow-md text-white"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
};

export default Sidebar;
