
import React, { useState, useEffect } from 'react';
import { 
  RAILWAY_DB_HOST, 
  RAILWAY_DB_PORT, 
  RAILWAY_DB_NAME, 
  RAILWAY_DB_USER, 
  RAILWAY_DB_PASSWORD 
} from '@/services/railway/config';
import { TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import TableSearchConfig from '@/components/settings/TableSearchConfig';
import SettingsTabs from '@/components/settings/SettingsTabs';
import DatabaseConnectionSettings from '@/components/settings/DatabaseConnectionSettings';
import { TableConfig } from "@/types/tableConfig";

const Settings = () => {
  const [tableConfigs, setTableConfigs] = useState<TableConfig[]>([]);
  const [currentSettings, setCurrentSettings] = useState({
    host: RAILWAY_DB_HOST || '',
    port: RAILWAY_DB_PORT || '',
    database: RAILWAY_DB_NAME || '',
    user: RAILWAY_DB_USER || '',
    password: RAILWAY_DB_PASSWORD ? '••••••••' : 'Non défini',
  });
  
  // Load saved table configurations on component mount
  useEffect(() => {
    // Log current configuration at component mount
    console.log("Settings component mounted with DB config:", {
      host: RAILWAY_DB_HOST,
      port: RAILWAY_DB_PORT,
      database: RAILWAY_DB_NAME,
      user: RAILWAY_DB_USER,
      passwordProvided: RAILWAY_DB_PASSWORD ? "Yes" : "No"
    });
    
    const savedTableConfigs = localStorage.getItem('railway_search_tables');
    if (savedTableConfigs) {
      try {
        setTableConfigs(JSON.parse(savedTableConfigs));
      } catch (e) {
        console.error('Error parsing saved table configurations:', e);
      }
    }
  }, []);

  const handleTableConfigChange = (configs: TableConfig[]) => {
    setTableConfigs(configs);
    localStorage.setItem('railway_search_tables', JSON.stringify(configs));
    toast.success("Configuration des tables enregistrée", {
      description: "Les changements seront appliqués à la prochaine recherche."
    });
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Paramètres</h1>
      
      <SettingsTabs>
        <TabsContent value="connection">
          <DatabaseConnectionSettings 
            currentSettings={currentSettings}
            onSettingsUpdate={setCurrentSettings}
          />
        </TabsContent>
        
        <TabsContent value="search">
          <TableSearchConfig 
            initialConfigs={tableConfigs}
            onChange={handleTableConfigChange}
            activeTab="fields"
          />
        </TabsContent>
        
        <TabsContent value="mapping">
          <TableSearchConfig 
            initialConfigs={tableConfigs}
            onChange={handleTableConfigChange}
            activeTab="mapping"
          />
        </TabsContent>
      </SettingsTabs>
    </div>
  );
};

export default Settings;
