
import React, { useState, useEffect } from 'react';
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';
import { executeRailwayQuery } from "@/services/railway/queryService";
import { TableConfig } from "@/types/tableConfig";
import TableSelectionList from './TableSelectionList';
import TableConfigDetails from './TableConfigDetails';

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
  const [loading, setLoading] = useState(true);
  const [tableConfigs, setTableConfigs] = useState<TableConfig[]>(initialConfigs);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableColumns, setTableColumns] = useState<Record<string, string[]>>({});
  const [fetchingColumns, setFetchingColumns] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [configTab, setConfigTab] = useState<'fields' | 'mapping'>(activeTab);
  
  useEffect(() => {
    setConfigTab(activeTab);
  }, [activeTab]);
  
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
  
  const handleSelectTable = (tableName: string) => {
    setSelectedTable(tableName);
    fetchColumnsForTable(tableName);
    setConfigTab(activeTab);
  };
  
  const handleConfigChange = (configs: TableConfig[]) => {
    setTableConfigs(configs);
    if (onChange) onChange(configs);
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
