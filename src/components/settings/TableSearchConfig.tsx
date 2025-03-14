
import React, { useState, useEffect } from 'react';
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { executeRailwayQuery } from "@/services/railway/queryService";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Database, Search, Eye } from 'lucide-react';

// Interface for table configuration
interface TableConfig {
  name: string;
  enabled: boolean;
  searchFields: string[];
  displayFields: string[];
}

interface TableSearchConfigProps {
  onChange?: (configs: TableConfig[]) => void;
  initialConfigs?: TableConfig[];
}

const TableSearchConfig: React.FC<TableSearchConfigProps> = ({ 
  onChange, 
  initialConfigs = []
}) => {
  const [loading, setLoading] = useState(true);
  const [rawTables, setRawTables] = useState<string[]>([]);
  const [tableConfigs, setTableConfigs] = useState<TableConfig[]>(initialConfigs);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableColumns, setTableColumns] = useState<Record<string, string[]>>({});
  const [fetchingColumns, setFetchingColumns] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Fetch all raw_ tables from the database
  const fetchTables = async () => {
    try {
      setLoading(true);
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
        setRawTables(tables);
        
        // Initialize configs for tables that don't have one yet
        const existingTableNames = tableConfigs.map(config => config.name);
        const newTables = tables.filter(table => !existingTableNames.includes(table));
        
        if (newTables.length > 0) {
          const newConfigs = [
            ...tableConfigs,
            ...newTables.map(table => ({
              name: table,
              enabled: false,
              searchFields: [],
              displayFields: []
            }))
          ];
          setTableConfigs(newConfigs);
          if (onChange) onChange(newConfigs);
        }
        
        toast.success(`${tables.length} tables trouvées`, {
          description: "Cliquez sur une table pour configurer les champs de recherche."
        });
      } else if (result.error) {
        toast.error("Impossible de récupérer la liste des tables", {
          description: result.error
        });
      }
    } catch (error) {
      console.error("Error fetching tables:", error);
      toast.error("Impossible de récupérer la liste des tables", {
        description: "Vérifiez vos paramètres de connexion à la base de données."
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Refresh the table list
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTables();
    setRefreshing(false);
  };
  
  useEffect(() => {
    fetchTables();
  }, []);
  
  // Fetch columns for a specific table
  const fetchColumnsForTable = async (tableName: string) => {
    if (tableColumns[tableName]) {
      // We already have the columns for this table
      return;
    }
    
    try {
      setFetchingColumns(true);
      const query = `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = $1
        ORDER BY ordinal_position
      `;
      
      const result = await executeRailwayQuery<{column_name: string}>(query, [tableName]);
      
      if (result.data) {
        const columns = result.data.map(row => row.column_name);
        setTableColumns(prev => ({
          ...prev,
          [tableName]: columns
        }));
      }
    } catch (error) {
      console.error(`Error fetching columns for table ${tableName}:`, error);
      toast.error(`Impossible de récupérer les colonnes pour la table ${tableName}`);
    } finally {
      setFetchingColumns(false);
    }
  };
  
  // Handle toggling a table's enabled state
  const toggleTableEnabled = (tableName: string) => {
    const updatedConfigs = tableConfigs.map(config => 
      config.name === tableName 
        ? { ...config, enabled: !config.enabled } 
        : config
    );
    setTableConfigs(updatedConfigs);
    if (onChange) onChange(updatedConfigs);
  };
  
  // Handle toggling a field for search or display
  const toggleField = (tableName: string, fieldName: string, type: 'searchFields' | 'displayFields') => {
    const updatedConfigs = tableConfigs.map(config => {
      if (config.name === tableName) {
        const fields = config[type];
        const newFields = fields.includes(fieldName)
          ? fields.filter(f => f !== fieldName)
          : [...fields, fieldName];
        
        return { ...config, [type]: newFields };
      }
      return config;
    });
    
    setTableConfigs(updatedConfigs);
    if (onChange) onChange(updatedConfigs);
  };
  
  // Select all fields for a table
  const selectAllFields = (tableName: string, type: 'searchFields' | 'displayFields') => {
    const columns = tableColumns[tableName] || [];
    const updatedConfigs = tableConfigs.map(config => {
      if (config.name === tableName) {
        return { ...config, [type]: [...columns] };
      }
      return config;
    });
    
    setTableConfigs(updatedConfigs);
    if (onChange) onChange(updatedConfigs);
  };
  
  // Clear all selected fields for a table
  const clearAllFields = (tableName: string, type: 'searchFields' | 'displayFields') => {
    const updatedConfigs = tableConfigs.map(config => {
      if (config.name === tableName) {
        return { ...config, [type]: [] };
      }
      return config;
    });
    
    setTableConfigs(updatedConfigs);
    if (onChange) onChange(updatedConfigs);
  };
  
  // Select a table to configure
  const handleSelectTable = (tableName: string) => {
    setSelectedTable(tableName);
    fetchColumnsForTable(tableName);
  };
  
  // Get the current configuration for the selected table
  const getSelectedTableConfig = () => {
    return tableConfigs.find(config => config.name === selectedTable) || {
      name: selectedTable || '',
      enabled: false,
      searchFields: [],
      displayFields: []
    };
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Configuration des tables de recherche</CardTitle>
            <CardDescription>
              Sélectionnez les tables à inclure dans la recherche et configurez les champs.
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing || loading}
          >
            {refreshing || loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Actualiser les tables"
            )}
          </Button>
        </CardHeader>
        
        <CardContent>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tableConfigs.map((config) => (
                <div 
                  key={config.name}
                  className={`flex items-center justify-between p-3 border rounded-md hover:bg-gray-900 cursor-pointer transition-colors ${selectedTable === config.name ? 'border-blue-500 bg-blue-950/20' : ''}`}
                  onClick={() => handleSelectTable(config.name)}
                >
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={config.enabled}
                      onCheckedChange={() => toggleTableEnabled(config.name)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className={config.enabled ? "font-medium" : "opacity-70"}>
                      {config.name}
                    </span>
                  </div>
                  <div className="flex gap-2 text-xs opacity-70">
                    <span className="flex items-center">
                      <Search className="h-3 w-3 mr-1" />
                      {config.searchFields.length}
                    </span>
                    <span className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      {config.displayFields.length}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {selectedTable && (
        <Card>
          <CardHeader>
            <CardTitle>Configuration de {selectedTable}</CardTitle>
            <CardDescription>
              Sélectionnez les champs à utiliser pour la recherche et l'affichage.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {fetchingColumns ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : tableColumns[selectedTable] ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium">Champs de recherche</h3>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => selectAllFields(selectedTable, 'searchFields')}
                      >
                        Tout sélectionner
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => clearAllFields(selectedTable, 'searchFields')}
                      >
                        Tout désélectionner
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {tableColumns[selectedTable].map(column => (
                      <div key={`search-${column}`} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`search-${column}`} 
                          checked={getSelectedTableConfig().searchFields.includes(column)}
                          onCheckedChange={() => toggleField(selectedTable, column, 'searchFields')}
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
                </div>
                
                <Separator />
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium">Champs d'affichage</h3>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => selectAllFields(selectedTable, 'displayFields')}
                      >
                        Tout sélectionner
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => clearAllFields(selectedTable, 'displayFields')}
                      >
                        Tout désélectionner
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {tableColumns[selectedTable].map(column => (
                      <div key={`display-${column}`} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`display-${column}`} 
                          checked={getSelectedTableConfig().displayFields.includes(column)}
                          onCheckedChange={() => toggleField(selectedTable, column, 'displayFields')}
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
                </div>
              </div>
            ) : (
              <div className="text-center py-4 opacity-70">
                Impossible de charger les colonnes pour cette table.
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => {
                if (onChange) onChange(tableConfigs);
                toast.success(`Configuration enregistrée pour ${selectedTable}`, {
                  description: "Les changements seront appliqués à la prochaine recherche."
                });
              }}
            >
              Enregistrer la configuration
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default TableSearchConfig;
