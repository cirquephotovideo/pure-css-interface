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
import { Loader2, Database, Search, Eye, Layers } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Interface for table configuration
interface TableConfig {
  name: string;
  enabled: boolean;
  searchFields: string[];
  displayFields: string[];
  columnMapping?: Record<string, string>;
}

// Standard column names for product data
const standardColumns = [
  { id: 'id', label: 'ID' },
  { id: 'reference', label: 'Référence' },
  { id: 'barcode', label: 'Code-barres' },
  { id: 'description', label: 'Description' },
  { id: 'brand', label: 'Marque' },
  { id: 'supplier_code', label: 'Code fournisseur' },
  { id: 'name', label: 'Nom' },
  { id: 'price', label: 'Prix' },
  { id: 'stock', label: 'Stock' },
  { id: 'location', label: 'Emplacement' },
  { id: 'ean', label: 'EAN' }
];

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
  const [configTab, setConfigTab] = useState('fields');
  
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
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTables();
    setRefreshing(false);
  };
  
  useEffect(() => {
    fetchTables();
  }, []);
  
  const fetchColumnsForTable = async (tableName: string) => {
    if (tableColumns[tableName]) {
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
  
  const toggleTableEnabled = (tableName: string) => {
    const updatedConfigs = tableConfigs.map(config => 
      config.name === tableName 
        ? { ...config, enabled: !config.enabled } 
        : config
    );
    setTableConfigs(updatedConfigs);
    if (onChange) onChange(updatedConfigs);
  };
  
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
  
  const updateColumnMapping = (tableName: string, standardField: string, tableField: string) => {
    const updatedConfigs = tableConfigs.map(config => {
      if (config.name === tableName) {
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
    
    setTableConfigs(updatedConfigs);
    if (onChange) onChange(updatedConfigs);
  };
  
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

  const autoMapColumns = (tableName: string) => {
    if (!tableColumns[tableName]) return;
    
    const columns = tableColumns[tableName];
    const mapping: Record<string, string> = {};
    
    standardColumns.forEach(({ id }) => {
      const match = columns.find(col => 
        col.toLowerCase() === id.toLowerCase() ||
        col.toLowerCase().includes(id.toLowerCase()) ||
        (id === 'reference' && (col.toLowerCase().includes('articlenr') || col.toLowerCase().includes('code_article'))) ||
        (id === 'barcode' && (col.toLowerCase().includes('ean') || col.toLowerCase().includes('code_barre'))) ||
        (id === 'brand' && (col.toLowerCase().includes('marque') || col.toLowerCase() === 'brand')) ||
        (id === 'supplier_code' && (col.toLowerCase().includes('oemnr') || col.toLowerCase().includes('supplierid'))) ||
        (id === 'name' && (col.toLowerCase().includes('designation') || col.toLowerCase().includes('nom'))) ||
        (id === 'location' && col.toLowerCase().includes('location'))
      );
      
      if (match) {
        mapping[id] = match;
      }
    });
    
    const updatedConfigs = tableConfigs.map(config => {
      if (config.name === tableName) {
        return { 
          ...config, 
          columnMapping: { ...config.columnMapping, ...mapping } 
        };
      }
      return config;
    });
    
    setTableConfigs(updatedConfigs);
    if (onChange) onChange(updatedConfigs);
    
    toast.success(`Auto-mapping terminé pour ${tableName}`, {
      description: `${Object.keys(mapping).length} champs ont été mappés automatiquement.`
    });
  };
  
  const clearColumnMappings = (tableName: string) => {
    const updatedConfigs = tableConfigs.map(config => {
      if (config.name === tableName) {
        return { ...config, columnMapping: {} };
      }
      return config;
    });
    
    setTableConfigs(updatedConfigs);
    if (onChange) onChange(updatedConfigs);
    
    toast.success(`Mappings effacés pour ${tableName}`);
  };
  
  const handleSelectTable = (tableName: string) => {
    setSelectedTable(tableName);
    fetchColumnsForTable(tableName);
    setConfigTab('fields');
  };
  
  const getSelectedTableConfig = () => {
    return tableConfigs.find(config => config.name === selectedTable) || {
      name: selectedTable || '',
      enabled: false,
      searchFields: [],
      displayFields: [],
      columnMapping: {}
    };
  };
  
  const renderFieldsTab = () => {
    if (!selectedTable || !tableColumns[selectedTable]) return null;
    
    return (
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
          <ScrollArea className="h-[200px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 p-1">
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
          <ScrollArea className="h-[200px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 p-1">
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
          </ScrollArea>
        </div>
      </div>
    );
  };
  
  const renderMappingTab = () => {
    if (!selectedTable || !tableColumns[selectedTable]) return null;
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium">Correspondance des colonnes</h3>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => autoMapColumns(selectedTable)}
            >
              Auto-mapping
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => clearColumnMappings(selectedTable)}
            >
              Effacer tout
            </Button>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground mb-4">
          Spécifiez comment les champs de cette table correspondent aux champs standards. 
          Exemple: si la colonne pour la marque s'appelle "brand_name", associez-la à "brand".
        </div>
        
        <ScrollArea className="h-[400px]">
          <div className="space-y-4 p-1">
            {standardColumns.map(({ id, label }) => {
              const tableConfig = getSelectedTableConfig();
              const currentMapping = tableConfig.columnMapping?.[id] || '';
              
              return (
                <div key={id} className="grid grid-cols-12 gap-4 items-center">
                  <Label htmlFor={`map-${id}`} className="col-span-3">
                    {label} ({id})
                  </Label>
                  <div className="col-span-9">
                    <select
                      id={`map-${id}`}
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      value={currentMapping}
                      onChange={(e) => updateColumnMapping(selectedTable, id, e.target.value)}
                    >
                      <option value="">-- Sélectionner une colonne --</option>
                      {tableColumns[selectedTable].map(column => (
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
      </div>
    );
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
            <ScrollArea className="h-[400px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-1">
                {tableConfigs.map((config) => (
                  <TooltipProvider key={config.name}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div 
                          className={`flex items-center justify-between p-3 border rounded-md hover:bg-gray-900 cursor-pointer transition-colors ${selectedTable === config.name ? 'border-blue-500 bg-blue-950/20' : ''}`}
                          onClick={() => handleSelectTable(config.name)}
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
        </CardContent>
      </Card>
      
      {selectedTable && (
        <Card>
          <CardHeader>
            <CardTitle>Configuration de <span className="font-mono text-sm bg-muted p-1 rounded break-all">{selectedTable}</span></CardTitle>
            <CardDescription>
              Configurez cette table pour améliorer la recherche et l'affichage.
            </CardDescription>
            <Tabs value={configTab} onValueChange={setConfigTab} className="w-full mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="fields">Champs</TabsTrigger>
                <TabsTrigger value="mapping">Correspondance des colonnes</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          
          <CardContent>
            {fetchingColumns ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : !tableColumns[selectedTable] ? (
              <div className="text-center py-4 opacity-70">
                Impossible de charger les colonnes pour cette table.
              </div>
            ) : (
              <>
                {configTab === 'fields' && renderFieldsTab()}
                {configTab === 'mapping' && renderMappingTab()}
              </>
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
