
import React from 'react';
import { TableConfig } from "@/types/tableConfig";
import ColumnMappingActions from './mapping/ColumnMappingActions';
import CurrentMappingDisplay from './mapping/CurrentMappingDisplay';
import MappingFieldSelector from './mapping/MappingFieldSelector';

interface ColumnMappingTabProps {
  selectedTable: string;
  tableColumns: string[];
  tableConfig: TableConfig;
  onConfigChange: (configs: TableConfig[]) => void;
  tableConfigs: TableConfig[];
}

const ColumnMappingTab: React.FC<ColumnMappingTabProps> = ({
  selectedTable,
  tableColumns,
  tableConfig,
  onConfigChange,
  tableConfigs
}) => {
  const columnMapping = tableConfig.columnMapping || {};
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">Correspondance des colonnes</h3>
        <ColumnMappingActions
          selectedTable={selectedTable}
          tableColumns={tableColumns}
          tableConfigs={tableConfigs}
          onConfigChange={onConfigChange}
        />
      </div>
      
      <div className="text-sm text-muted-foreground mb-4">
        <p>Spécifiez comment les champs de cette table correspondent aux champs standards.</p>
        <p className="mt-1">Exemple: si la colonne pour la marque s'appelle "brand_name", associez-la à "brand".</p>
      </div>
      
      <div className="bg-muted/30 p-4 rounded-md mb-4">
        <h4 className="text-sm font-medium mb-2">Mappings actuels:</h4>
        <CurrentMappingDisplay columnMapping={columnMapping} />
      </div>
      
      <MappingFieldSelector
        selectedTable={selectedTable}
        tableColumns={tableColumns}
        tableConfig={tableConfig}
        onConfigChange={onConfigChange}
        tableConfigs={tableConfigs}
      />
    </div>
  );
};

export default ColumnMappingTab;
