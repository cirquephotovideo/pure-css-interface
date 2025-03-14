
import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { executeRailwayQuery } from "@/services/railway/queryService";
import { TableConfig } from "@/types/tableConfig";

interface UseTableFetchingResult {
  loading: boolean;
  refreshing: boolean;
  tableConfigs: TableConfig[];
  tableColumns: Record<string, string[]>;
  fetchingColumns: boolean;
  fetchTables: () => Promise<void>;
  handleRefresh: () => Promise<void>;
  fetchColumnsForTable: (tableName: string) => Promise<void>;
}

export function useTableFetching(
  initialConfigs: TableConfig[] = [],
  onChange?: (configs: TableConfig[]) => void
): UseTableFetchingResult {
  const [loading, setLoading] = useState(true);
  const [tableConfigs, setTableConfigs] = useState<TableConfig[]>(initialConfigs);
  const [tableColumns, setTableColumns] = useState<Record<string, string[]>>({});
  const [fetchingColumns, setFetchingColumns] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  useEffect(() => {
    fetchTables();
  }, []);

  return {
    loading,
    refreshing,
    tableConfigs,
    tableColumns,
    fetchingColumns,
    fetchTables,
    handleRefresh,
    fetchColumnsForTable
  };
}
