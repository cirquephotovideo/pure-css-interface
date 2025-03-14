
import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { TableConfig } from "@/types/tableConfig";
import ConfigDetailsHeader from './details/ConfigDetailsHeader';
import ConfigContentSection from './details/ConfigContentSection';
import ConfigSaveFooter from './details/ConfigSaveFooter';

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
  if (!selectedTable) return null;
  
  const getSelectedTableConfig = (): TableConfig => {
    return tableConfigs.find(config => config.name === selectedTable) || {
      name: selectedTable,
      enabled: false,
      searchFields: [],
      displayFields: [],
      columnMapping: {}
    };
  };
  
  const tableConfig = getSelectedTableConfig();
  const columns = tableColumns[selectedTable] || [];
  
  const handleSaveConfig = () => {
    if (onConfigChange) onConfigChange(tableConfigs);
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
          tableConfig={tableConfig}
          onConfigChange={onConfigChange}
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
