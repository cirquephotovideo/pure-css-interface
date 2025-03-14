
import React from 'react';
import { toast } from "sonner";
import { Loader2, Database, Search, Eye, Layers } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { executeRailwayQuery } from "@/services/railway/queryService";
import { TableConfig } from "@/types/tableConfig";

interface TableSelectionListProps {
  tableConfigs: TableConfig[];
  onSelectTable: (tableName: string) => void;
  onConfigChange: (configs: TableConfig[]) => void;
  selectedTable: string | null;
  loading: boolean;
  refreshing: boolean;
}

const TableSelectionList: React.FC<TableSelectionListProps> = ({
  tableConfigs,
  onSelectTable,
  onConfigChange,
  selectedTable,
  loading,
  refreshing
}) => {
  const toggleTableEnabled = (tableName: string) => {
    const updatedConfigs = tableConfigs.map(config => 
      config.name === tableName 
        ? { ...config, enabled: !config.enabled } 
        : config
    );
    onConfigChange(updatedConfigs);
  };
  
  const fetchTables = async () => {
    try {
      const query = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND (table_name LIKE 'raw_%' OR table_name = 'products')
        ORDER BY table_name
      `;
      
      const result = await executeRailwayQuery<{table_name: string}>(query);
      
      if (result.data) {
        const tables = result.data.map(row => row.table_name);
        
        const existingTableNames = tableConfigs.map(config => config.name);
        const newTables = tables.filter(table => !existingTableNames.includes(table));
        
        if (newTables.length > 0) {
          const newConfigs = [
            ...tableConfigs,
            ...newTables.map(table => ({
              name: table,
              enabled: false,
              searchFields: [],
              displayFields: [],
              columnMapping: {}
            }))
          ];
          onConfigChange(newConfigs);
        }
        
        toast.success(`${tables.length} tables trouvées`, {
          description: "Cliquez sur une table pour configurer les champs de recherche."
        });
        
        return tables;
      } else if (result.error) {
        toast.error("Impossible de récupérer la liste des tables", {
          description: result.error
        });
      }
      return [];
    } catch (error) {
      console.error("Error fetching tables:", error);
      toast.error("Impossible de récupérer la liste des tables", {
        description: "Vérifiez vos paramètres de connexion à la base de données."
      });
      return [];
    }
  };

  return (
    <>
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ) : tableConfigs.length === 0 ? (
        <div className="text-center py-8">
          <Database className="h-12 w-12 mx-auto text-gray-500 mb-4" />
          <h3 className="text-lg font-medium">Aucune table trouvée</h3>
          <p className="text-sm text-gray-500 mt-2">
            Vérifiez votre connexion à la base de données ou cliquez sur "Actualiser les tables"
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[400px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-1">
            {tableConfigs.map((config) => (
              <TooltipProvider key={config.name}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className={`flex items-center justify-between p-3 border rounded-md hover:bg-gray-900 cursor-pointer transition-colors ${selectedTable === config.name ? 'border-blue-500 bg-blue-950/20' : ''}`}
                      onClick={() => onSelectTable(config.name)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Switch
                          checked={config.enabled}
                          onCheckedChange={() => toggleTableEnabled(config.name)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className={`${config.enabled ? "font-medium" : "opacity-70"} break-words w-full`}>
                          {config.name}
                        </span>
                      </div>
                      <div className="flex gap-2 text-xs opacity-70 flex-shrink-0">
                        <span className="flex items-center">
                          <Search className="h-3 w-3 mr-1" />
                          {config.searchFields.length}
                        </span>
                        <span className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {config.displayFields.length}
                        </span>
                        <span className="flex items-center">
                          <Layers className="h-3 w-3 mr-1" />
                          {config.columnMapping ? Object.keys(config.columnMapping || {}).length : 0}
                        </span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{config.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </ScrollArea>
      )}
    </>
  );
};

export default TableSelectionList;
