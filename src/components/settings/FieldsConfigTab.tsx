
import React from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TableConfig } from "@/types/tableConfig";
import { toast } from "sonner";

interface FieldsConfigTabProps {
  selectedTable: string;
  tableColumns: string[];
  tableConfig: TableConfig;
  onConfigChange: (configs: TableConfig[]) => void;
  tableConfigs: TableConfig[];
}

const FieldsConfigTab: React.FC<FieldsConfigTabProps> = ({
  selectedTable,
  tableColumns,
  tableConfig,
  onConfigChange,
  tableConfigs
}) => {
  const toggleField = (fieldName: string, type: 'searchFields' | 'displayFields') => {
    const updatedConfigs = tableConfigs.map(config => {
      if (config.name === selectedTable) {
        const fields = config[type];
        const newFields = fields.includes(fieldName)
          ? fields.filter(f => f !== fieldName)
          : [...fields, fieldName];
        
        return { ...config, [type]: newFields };
      }
      return config;
    });
    
    onConfigChange(updatedConfigs);
    toast.success(`Champ ${fieldName} ${type === 'searchFields' ? 'de recherche' : 'd\'affichage'} mis à jour`);
  };
  
  const selectAllFields = (type: 'searchFields' | 'displayFields') => {
    const updatedConfigs = tableConfigs.map(config => {
      if (config.name === selectedTable) {
        return { ...config, [type]: [...tableColumns] };
      }
      return config;
    });
    
    onConfigChange(updatedConfigs);
    toast.success(`Tous les champs ${type === 'searchFields' ? 'de recherche' : 'd\'affichage'} sélectionnés`);
  };
  
  const clearAllFields = (type: 'searchFields' | 'displayFields') => {
    const updatedConfigs = tableConfigs.map(config => {
      if (config.name === selectedTable) {
        return { ...config, [type]: [] };
      }
      return config;
    });
    
    onConfigChange(updatedConfigs);
    toast.success(`Tous les champs ${type === 'searchFields' ? 'de recherche' : 'd\'affichage'} désélectionnés`);
  };

  // Ensure tableConfig has the correct structure
  const currentSearchFields = tableConfig?.searchFields || [];
  const currentDisplayFields = tableConfig?.displayFields || [];

  // Debug logging to track state
  console.log("Current table config:", tableConfig);
  console.log("Display fields:", currentDisplayFields);

  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium">Champs de recherche</h3>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => selectAllFields('searchFields')}
            >
              Tout sélectionner
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => clearAllFields('searchFields')}
            >
              Tout désélectionner
            </Button>
          </div>
        </div>
        <ScrollArea className="h-[200px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 p-1">
            {tableColumns.map(column => (
              <div key={`search-${column}`} className="flex items-center space-x-2">
                <Checkbox 
                  id={`search-${column}`} 
                  checked={currentSearchFields.includes(column)}
                  onCheckedChange={() => toggleField(column, 'searchFields')}
                />
                <label
                  htmlFor={`search-${column}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {column}
                </label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      
      <Separator />
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium">Champs d'affichage</h3>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => selectAllFields('displayFields')}
            >
              Tout sélectionner
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => clearAllFields('displayFields')}
            >
              Tout désélectionner
            </Button>
          </div>
        </div>
        <ScrollArea className="h-[200px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 p-1">
            {tableColumns.map(column => (
              <div key={`display-${column}`} className="flex items-center space-x-2">
                <Checkbox 
                  id={`display-${column}`} 
                  checked={currentDisplayFields.includes(column)}
                  onCheckedChange={() => toggleField(column, 'displayFields')}
                />
                <label
                  htmlFor={`display-${column}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {column}
                </label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default FieldsConfigTab;
