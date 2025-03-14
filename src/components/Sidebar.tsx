
import React from 'react';
import { cn } from '@/lib/utils';

interface SidebarItemProps {
  icon: string;
  label: string;
  active?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active }) => {
  return (
    <div 
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-full transition-all cursor-pointer",
        active ? "bg-white/30 backdrop-blur-md font-medium" : "text-foreground/70 hover:bg-white/20"
      )}
    >
      <div className="text-[20px]">{icon}</div>
      <span>{label}</span>
    </div>
  );
};

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  return (
    <aside className={cn("w-64 border-r border-white/20 h-screen flex flex-col ios-glass", className)}>
      <div className="p-6">
        <h1 className="text-xl font-medium">Colbee Hive</h1>
      </div>
      
      <div className="mt-3 px-4 text-sm font-medium opacity-70">
        MENU
      </div>
      
      <nav className="mt-2 flex flex-col gap-2 px-4">
        <SidebarItem icon="📦" label="Produits" active />
        <SidebarItem icon="📑" label="Catalogues" />
        <SidebarItem icon="🏷️" label="Marques" />
        <SidebarItem icon="📊" label="Activités" />
      </nav>
      
      <div className="px-4 py-3 mt-auto">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span>Mode sombre</span>
            <label className="ios-switch">
              <input type="checkbox" />
              <span className="ios-slider"></span>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Notifications</span>
            <label className="ios-switch">
              <input type="checkbox" checked />
              <span className="ios-slider"></span>
            </label>
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-4 text-xs opacity-70 border-t border-white/20">
        Version 1.0.0
      </div>
    </aside>
  );
};

export default Sidebar;
