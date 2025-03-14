
import React from 'react';
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { standardColumns } from '../utils/standardColumns';
import { TableConfig } from "@/types/tableConfig";

interface MappingFieldSelectorProps {
  selectedTable: string;
  tableColumns: string[];
  tableConfig: TableConfig;
  onConfigChange: (configs: TableConfig[]) => void;
  tableConfigs: TableConfig[];
}

const MappingFieldSelector: React.FC<MappingFieldSelectorProps> = ({
  selectedTable,
  tableColumns,
  tableConfig,
  onConfigChange,
  tableConfigs
}) => {
  const columnMapping = tableConfig.columnMapping || {};
  
  const updateColumnMapping = (standardField: string, tableField: string) => {
    const updatedConfigs = tableConfigs.map(config => {
      if (config.name === selectedTable) {
        const columnMapping = config.columnMapping || {};
        
        const newMapping = tableField 
          ? { ...columnMapping, [standardField]: tableField }
          : { ...columnMapping };
          
        if (!tableField && standardField in newMapping) {
          delete newMapping[standardField];
        }
        
        return { ...config, columnMapping: newMapping };
      }
      return config;
    });
    
    onConfigChange(updatedConfigs);
  };

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4 p-1">
        {standardColumns.map(({ id, label, icon }) => {
          const currentMapping = columnMapping[id] || '';
          
          return (
            <div key={id} className="grid grid-cols-12 gap-4 items-center">
              <Label htmlFor={`map-${id}`} className="col-span-3 flex items-center">
                {icon}
                <span>{label}</span>
              </Label>
              <div className="col-span-9">
                <select
                  id={`map-${id}`}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={currentMapping}
                  onChange={(e) => updateColumnMapping(id, e.target.value)}
                >
                  <option value="">-- Sélectionner une colonne --</option>
                  {tableColumns.map(column => (
                    <option key={column} value={column}>
                      {column}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default MappingFieldSelector;
