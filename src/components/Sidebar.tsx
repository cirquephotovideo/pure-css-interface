
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
        "flex items-center gap-3 px-4 py-3 rounded-md transition-all cursor-pointer",
        active ? "bg-accent text-primary font-medium" : "text-muted-foreground hover:bg-accent/50 hover:text-primary"
      )}
    >
      <div className="text-[18px] opacity-80">{icon}</div>
      <span>{label}</span>
    </div>
  );
};

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  return (
    <aside className={cn("w-64 border-r border-border/60 h-screen flex flex-col", className)}>
      <div className="p-6">
        <h1 className="text-xl font-medium">Colbee Hive</h1>
      </div>
      
      <div className="mt-3 px-4 text-sm font-medium text-muted-foreground">
        MENU
      </div>
      
      <nav className="mt-2 flex flex-col gap-1 px-2">
        <SidebarItem icon="📦" label="Produits" active />
        <SidebarItem icon="📑" label="Catalogues" />
        <SidebarItem icon="🏷️" label="Marques" />
        <SidebarItem icon="📊" label="Activités" />
      </nav>
      
      <div className="mt-auto p-4 text-xs text-muted-foreground border-t border-border/60">
        Version 1.0.0
      </div>
    </aside>
  );
};

export default Sidebar;
