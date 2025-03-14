
import React from 'react';
import { TableConfig } from "@/types/tableConfig";
import FieldsConfigTab from '../FieldsConfigTab';
import ColumnMappingTab from '../ColumnMappingTab';
import ConfigLoadingState from './ConfigLoadingState';
import ConfigEmptyState from './ConfigEmptyState';

interface ConfigContentSectionProps {
  fetchingColumns: boolean;
  columns: string[];
  selectedTable: string;
  tableConfig: TableConfig;
  onConfigChange: (configs: TableConfig[]) => void;
  tableConfigs: TableConfig[];
  configTab: 'fields' | 'mapping';
}

const ConfigContentSection: React.FC<ConfigContentSectionProps> = ({
  fetchingColumns,
  columns,
  selectedTable,
  tableConfig,
  onConfigChange,
  tableConfigs,
  configTab
}) => {
  if (fetchingColumns) {
    return <ConfigLoadingState />;
  }
  
  if (!columns.length) {
    return <ConfigEmptyState />;
  }
  
  return (
    <>
      {configTab === 'fields' && (
        <FieldsConfigTab
          selectedTable={selectedTable}
          tableColumns={columns}
          tableConfig={tableConfig}
          onConfigChange={onConfigChange}
          tableConfigs={tableConfigs}
        />
      )}
      {configTab === 'mapping' && (
        <ColumnMappingTab
          selectedTable={selectedTable}
          tableColumns={columns}
          tableConfig={tableConfig}
          onConfigChange={onConfigChange}
          tableConfigs={tableConfigs}
        />
      )}
    </>
  );
};

export default ConfigContentSection;
