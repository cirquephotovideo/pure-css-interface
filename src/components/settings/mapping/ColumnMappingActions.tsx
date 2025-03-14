
import React from 'react';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { autoMapColumns } from '../utils/standardColumns';
import { TableConfig } from "@/types/tableConfig";

interface ColumnMappingActionsProps {
  selectedTable: string;
  tableColumns: string[];
  tableConfigs: TableConfig[];
  onConfigChange: (configs: TableConfig[]) => void;
}

const ColumnMappingActions: React.FC<ColumnMappingActionsProps> = ({
  selectedTable,
  tableColumns,
  tableConfigs,
  onConfigChange
}) => {
  const autoMapColumnsHandler = () => {
    if (!tableColumns || tableColumns.length === 0) return;
    
    const mapping = autoMapColumns(tableColumns);
    
    const updatedConfigs = tableConfigs.map(config => {
      if (config.name === selectedTable) {
        return { 
          ...config, 
          columnMapping: { ...config.columnMapping, ...mapping } 
        };
      }
      return config;
    });
    
    onConfigChange(updatedConfigs);
    
    toast.success(`Auto-mapping terminé pour ${selectedTable}`, {
      description: `${Object.keys(mapping).length} champs ont été mappés automatiquement.`
    });
  };
  
  const clearColumnMappings = () => {
    const updatedConfigs = tableConfigs.map(config => {
      if (config.name === selectedTable) {
        return { ...config, columnMapping: {} };
      }
      return config;
    });
    
    onConfigChange(updatedConfigs);
    
    toast.success(`Mappings effacés pour ${selectedTable}`);
  };

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={autoMapColumnsHandler}
      >
        Auto-mapping
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={clearColumnMappings}
      >
        Effacer tout
      </Button>
    </div>
  );
};

export default ColumnMappingActions;
