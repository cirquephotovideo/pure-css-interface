
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TableConfig } from "@/types/tableConfig";
import TableSelectionList from './TableSelectionList';
import TableConfigDetails from './TableConfigDetails';
import TableSearchHeader from './TableSearchHeader';
import { useTableFetching } from '@/hooks/useTableFetching';

interface TableSearchConfigProps {
  onChange?: (configs: TableConfig[]) => void;
  initialConfigs?: TableConfig[];
  activeTab?: 'fields' | 'mapping';
}

const TableSearchConfig: React.FC<TableSearchConfigProps> = ({ 
  onChange, 
  initialConfigs = [],
  activeTab = 'fields'
}) => {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [configTab, setConfigTab] = useState<'fields' | 'mapping'>(activeTab);
  
  const {
    loading,
    refreshing,
    tableConfigs,
    tableColumns,
    fetchingColumns,
    handleRefresh,
    fetchColumnsForTable
  } = useTableFetching(initialConfigs, onChange);
  
  useEffect(() => {
    setConfigTab(activeTab);
  }, [activeTab]);
  
  const handleSelectTable = (tableName: string) => {
    setSelectedTable(tableName);
    fetchColumnsForTable(tableName);
    setConfigTab(activeTab);
  };
  
  const handleConfigChange = (configs: TableConfig[]) => {
    if (onChange) onChange(configs);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <TableSearchHeader 
            onRefresh={handleRefresh}
            refreshing={refreshing}
            loading={loading}
          />
        </CardHeader>
        
        <CardContent>
          <TableSelectionList 
            tableConfigs={tableConfigs}
            onSelectTable={handleSelectTable}
            onConfigChange={handleConfigChange}
            selectedTable={selectedTable}
            loading={loading}
            refreshing={refreshing}
          />
        </CardContent>
      </Card>
      
      {selectedTable && (
        <TableConfigDetails
          selectedTable={selectedTable}
          tableColumns={tableColumns}
          tableConfigs={tableConfigs}
          onConfigChange={handleConfigChange}
          fetchingColumns={fetchingColumns}
          configTab={configTab}
          setConfigTab={setConfigTab}
        />
      )}
    </div>
  );
};

export default TableSearchConfig;
