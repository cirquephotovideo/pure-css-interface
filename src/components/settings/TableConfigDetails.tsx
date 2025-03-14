
import React, { useState } from 'react';
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import FieldsConfigTab from './FieldsConfigTab';
import ColumnMappingTab from './ColumnMappingTab';
import { TableConfig } from "@/types/tableConfig";

interface TableConfigDetailsProps {
  selectedTable: string | null;
  tableColumns: Record<string, string[]>;
  tableConfigs: TableConfig[];
  onConfigChange: (configs: TableConfig[]) => void;
  fetchingColumns: boolean;
  configTab: 'fields' | 'mapping';
  setConfigTab: (tab: 'fields' | 'mapping') => void;
}

const TableConfigDetails: React.FC<TableConfigDetailsProps> = ({
  selectedTable,
  tableColumns,
  tableConfigs,
  onConfigChange,
  fetchingColumns,
  configTab,
  setConfigTab
}) => {
  if (!selectedTable) return null;
  
  const getSelectedTableConfig = (): TableConfig => {
    return tableConfigs.find(config => config.name === selectedTable) || {
      name: selectedTable,
      enabled: false,
      searchFields: [],
      displayFields: [],
      columnMapping: {}
    };
  };
  
  const tableConfig = getSelectedTableConfig();
  const columns = tableColumns[selectedTable] || [];
  
  const handleSaveConfig = () => {
    if (onConfigChange) onConfigChange(tableConfigs);
    toast.success(`Configuration enregistrée pour ${selectedTable}`, {
      description: "Les changements seront appliqués à la prochaine recherche."
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration de <span className="font-mono text-sm bg-muted p-1 rounded break-all">{selectedTable}</span></CardTitle>
        <CardDescription>
          Configurez cette table pour améliorer la recherche et l'affichage.
        </CardDescription>
        <Tabs 
          value={configTab} 
          onValueChange={(value: string) => setConfigTab(value as 'fields' | 'mapping')} 
          className="w-full mt-4"
        >
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
        ) : !columns.length ? (
          <div className="text-center py-4 opacity-70">
            Impossible de charger les colonnes pour cette table.
          </div>
        ) : (
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
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveConfig}>
          Enregistrer la configuration
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TableConfigDetails;
