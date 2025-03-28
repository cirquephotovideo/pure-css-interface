
import React from 'react';
import { cn } from '@/lib/utils';

interface SidebarItemProps {
  icon: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick }) => {
  return (
    <div 
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-full transition-all cursor-pointer",
        active 
          ? "bg-white/30 backdrop-blur-md font-medium text-white shadow-md border border-white/20" 
          : "text-white/80 hover:bg-white/20"
      )}
      onClick={onClick}
    >
      <div className="text-[20px]">{icon}</div>
      <span>{label}</span>
    </div>
  );
};

interface SidebarProps {
  className?: string;
  onNavigate?: (page: string) => void;
  activePage?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className, onNavigate, activePage = 'products' }) => {
  const handleNavigation = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <aside className={cn(
      "w-64 bg-sidebar h-screen flex flex-col bg-gradient-to-b from-[#9b87f5] to-[#7E69AB]", 
      "border-r border-white/20",
      className
    )}>
      <div className="p-6">
        <h1 className="text-xl font-medium text-white">Colbee Hive</h1>
      </div>
      
      <div className="mt-3 px-4 text-sm font-medium text-white/70">
        MENU
      </div>
      
      <nav className="mt-2 flex flex-col gap-2 px-4">
        <SidebarItem 
          icon="📦" 
          label="Produits" 
          active={activePage === 'products'} 
          onClick={() => handleNavigation('products')}
        />
        <SidebarItem 
          icon="📑" 
          label="Catalogues" 
          active={activePage === 'catalogs'}
          onClick={() => handleNavigation('catalogs')}
        />
        <SidebarItem 
          icon="🏷️" 
          label="Marques" 
          active={activePage === 'brands'}
          onClick={() => handleNavigation('brands')}
        />
        <SidebarItem 
          icon="📊" 
          label="Activités" 
          active={activePage === 'activities'}
          onClick={() => handleNavigation('activities')}
        />
        <SidebarItem 
          icon="⚙️" 
          label="Paramètres" 
          active={activePage === 'settings'}
          onClick={() => handleNavigation('settings')}
        />
      </nav>
      
      <div className="px-4 py-3 mt-auto bg-white/10 backdrop-blur-md m-3 rounded-xl border border-white/20">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white">Mode sombre</span>
            <label className="ios-switch">
              <input type="checkbox" />
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
      
      <div className="mt-2 p-4 text-xs text-white/60 border-t border-white/20">
        Version 1.0.0
      </div>
    </aside>
  );
};

export default Sidebar;
