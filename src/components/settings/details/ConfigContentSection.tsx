
import React from 'react';
import { TableConfig } from "@/types/tableConfig";
import FieldsConfigTab from '../FieldsConfigTab';
import ColumnMappingTab from '../ColumnMappingTab';
import ConfigLoadingState from './ConfigLoadingState';
import ConfigEmptyState from './ConfigEmptyState';
import { AlertCircle } from 'lucide-react';

interface ConfigContentSectionProps {
  fetchingColumns: boolean;
  columns: string[];
  selectedTable: string;
  tableConfig: TableConfig;
  onConfigChange: (configs: TableConfig[]) => void;
  tableConfigs: TableConfig[];
  configTab: 'fields' | 'mapping';
}

const ConfigContentSection: React.FC<ConfigContentSectionProps> = ({
  fetchingColumns,
  columns,
  selectedTable,
  tableConfig,
  onConfigChange,
  tableConfigs,
  configTab
}) => {
  if (fetchingColumns) {
    return <ConfigLoadingState />;
  }
  
  // Vérification des erreurs ou des colonnes vides
  if (!columns || columns.length === 0) {
    return (
      <ConfigEmptyState 
        message={`Impossible de charger les colonnes pour la table "${selectedTable}"`}
        submessage="Vérifiez que la table existe et que vous avez les permissions nécessaires."
        icon={<AlertCircle className="h-8 w-8 text-amber-500" />}
        error={`Table sélectionnée: ${selectedTable}\nColonnes trouvées: ${columns ? columns.length : 0}`}
      />
    );
  }
  
  return (
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
  );
};

export default ConfigContentSection;
