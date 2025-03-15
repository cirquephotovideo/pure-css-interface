
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { TableConfig } from "@/types/tableConfig";
import ConfigDetailsHeader from './details/ConfigDetailsHeader';
import ConfigContentSection from './details/ConfigContentSection';
import ConfigSaveFooter from './details/ConfigSaveFooter';
import { toast } from "sonner";

interface TableConfigDetailsProps {
  selectedTable: string | null;
  tableColumns: Record<string, string[]>;
  tableConfigs: TableConfig[];
  onConfigChange: (configs: TableConfig[]) => void;
  fetchingColumns: boolean;
  configTab: 'fields' | 'mapping';
  setConfigTab: (tab: 'fields' | 'mapping') => void;
}

const TableConfigDetails: React.FC<TableConfigDetailsProps> = ({
  selectedTable,
  tableColumns,
  tableConfigs,
  onConfigChange,
  fetchingColumns,
  configTab,
  setConfigTab
}) => {
  // Track local state of the current table config
  const [localTableConfig, setLocalTableConfig] = useState<TableConfig | null>(null);
  
  // Update local state when the selected table or tableConfigs change
  useEffect(() => {
    if (selectedTable) {
      const config = tableConfigs.find(config => config.name === selectedTable) || {
        name: selectedTable,
        enabled: false,
        searchFields: [],
        displayFields: [],
        columnMapping: {}
      };
      setLocalTableConfig(config);
    } else {
      setLocalTableConfig(null);
    }
  }, [selectedTable, tableConfigs]);

  if (!selectedTable || !localTableConfig) return null;
  
  const columns = tableColumns[selectedTable] || [];
  
  // Handler for local config changes, this will be passed to child components
  const handleLocalConfigChange = (updatedConfigs: TableConfig[]) => {
    const updatedConfig = updatedConfigs.find(config => config.name === selectedTable);
    if (updatedConfig) {
      setLocalTableConfig(updatedConfig);
    }
    onConfigChange(updatedConfigs);
  };
  
  const handleSaveConfig = () => {
    if (onConfigChange) {
      onConfigChange(tableConfigs);
      toast.success(`Configuration de ${selectedTable} enregistrée`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <ConfigDetailsHeader 
          selectedTable={selectedTable}
          configTab={configTab}
          setConfigTab={setConfigTab}
        />
      </CardHeader>
      
      <CardContent>
        <ConfigContentSection
          fetchingColumns={fetchingColumns}
          columns={columns}
          selectedTable={selectedTable}
          tableConfig={localTableConfig}
          onConfigChange={handleLocalConfigChange}
          tableConfigs={tableConfigs}
          configTab={configTab}
        />
      </CardContent>
      
      <CardFooter>
        <ConfigSaveFooter
          selectedTable={selectedTable}
          onSave={handleSaveConfig}
        />
      </CardFooter>
    </Card>
  );
};

export default TableConfigDetails;
