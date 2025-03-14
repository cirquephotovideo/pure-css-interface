
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TableConfig } from "@/types/tableConfig";

interface SettingsTabsProps {
  children: React.ReactNode;
  defaultTab?: string;
}

const SettingsTabs: React.FC<SettingsTabsProps> = ({ 
  children, 
  defaultTab = "connection"
}) => {
  return (
    <Tabs defaultValue={defaultTab}>
      <TabsList className="mb-6">
        <TabsTrigger value="connection">Connexion Base de Données</TabsTrigger>
        <TabsTrigger value="search">Configuration Recherche</TabsTrigger>
        <TabsTrigger value="mapping">Mapping des Champs</TabsTrigger>
      </TabsList>
      
      {children}
    </Tabs>
  );
};

export default SettingsTabs;
