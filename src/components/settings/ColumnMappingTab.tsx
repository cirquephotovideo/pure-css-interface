
import React from 'react';
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tag, Store, ShoppingCart, CreditCard } from 'lucide-react';
import { TableConfig } from "@/types/tableConfig";

interface ColumnMappingTabProps {
  selectedTable: string;
  tableColumns: string[];
  tableConfig: TableConfig;
  onConfigChange: (configs: TableConfig[]) => void;
  tableConfigs: TableConfig[];
}

// Standard columns definition
const standardColumns = [
  { id: 'id', label: 'ID', icon: <Tag className="h-4 w-4 mr-2" /> },
  { id: 'reference', label: 'Référence', icon: <Tag className="h-4 w-4 mr-2" /> },
  { id: 'barcode', label: 'Code-barres', icon: <Tag className="h-4 w-4 mr-2" /> },
  { id: 'description', label: 'Description', icon: <Tag className="h-4 w-4 mr-2" /> },
  { id: 'brand', label: 'Marque', icon: <Store className="h-4 w-4 mr-2" /> },
  { id: 'supplier_code', label: 'Code fournisseur', icon: <ShoppingCart className="h-4 w-4 mr-2" /> },
  { id: 'name', label: 'Nom', icon: <Tag className="h-4 w-4 mr-2" /> },
  { id: 'price', label: 'Prix', icon: <CreditCard className="h-4 w-4 mr-2" /> },
  { id: 'stock', label: 'Stock', icon: <Tag className="h-4 w-4 mr-2" /> },
  { id: 'location', label: 'Emplacement', icon: <Tag className="h-4 w-4 mr-2" /> },
  { id: 'ean', label: 'EAN', icon: <Tag className="h-4 w-4 mr-2" /> }
];

const ColumnMappingTab: React.FC<ColumnMappingTabProps> = ({
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
  
  const autoMapColumns = () => {
    if (!tableColumns || tableColumns.length === 0) return;
    
    const columns = tableColumns;
    const mapping: Record<string, string> = {};
    
    standardColumns.forEach(({ id }) => {
      const match = columns.find(col => {
        const colLower = col.toLowerCase();
        
        if (id === 'id' && (colLower === 'id' || colLower.endsWith('_id') || colLower === 'uid')) {
          return true;
        }
        
        if (id === 'reference' && (
          colLower === 'reference' || 
          colLower.includes('ref') || 
          colLower.includes('articlenr') || 
          colLower.includes('code_article') ||
          colLower.includes('product_code') ||
          colLower.includes('sku')
        )) {
          return true;
        }
        
        if (id === 'barcode' && (
          colLower === 'barcode' || 
          colLower.includes('code_barre') || 
          colLower.includes('upc') ||
          colLower.includes('gtin')
        )) {
          return true;
        }
        
        if (id === 'description' && (
          colLower === 'description' || 
          colLower.includes('desc') || 
          colLower.includes('description_odr') ||
          colLower.includes('product_desc')
        )) {
          return true;
        }
        
        if (id === 'brand' && (
          colLower === 'brand' || 
          colLower.includes('marque') || 
          colLower.includes('manufacturer') ||
          colLower.includes('maker')
        )) {
          return true;
        }
        
        if (id === 'supplier_code' && (
          colLower.includes('supplier') || 
          colLower.includes('oemnr') || 
          colLower.includes('vendor') ||
          colLower.includes('fournisseur')
        )) {
          return true;
        }
        
        if (id === 'name' && (
          colLower === 'name' || 
          colLower.includes('nom') || 
          colLower.includes('designation') ||
          colLower.includes('title') ||
          colLower.includes('product_name')
        )) {
          return true;
        }
        
        if (id === 'price' && (
          colLower === 'price' || 
          colLower.includes('prix') || 
          colLower.includes('cost') ||
          colLower.includes('tarif') ||
          colLower.includes('montant')
        )) {
          return true;
        }
        
        if (id === 'stock' && (
          colLower === 'stock' || 
          colLower.includes('qty') || 
          colLower.includes('quantity') ||
          colLower.includes('inventory') ||
          colLower.includes('disponible')
        )) {
          return true;
        }
        
        if (id === 'location' && (
          colLower.includes('location') || 
          colLower.includes('emplacement') || 
          colLower.includes('storage') ||
          colLower.includes('position') ||
          colLower.includes('warehouse')
        )) {
          return true;
        }
        
        if (id === 'ean' && (
          colLower === 'ean' || 
          colLower.includes('eannr') || 
          colLower.includes('ean13') ||
          colLower.includes('ean8') ||
          colLower.includes('european_article_number')
        )) {
          return true;
        }
        
        return colLower === id.toLowerCase();
      });
      
      if (match) {
        mapping[id] = match;
      }
    });
    
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
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">Correspondance des colonnes</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={autoMapColumns}
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
      </div>
      
      <div className="text-sm text-muted-foreground mb-4">
        <p>Spécifiez comment les champs de cette table correspondent aux champs standards.</p>
        <p className="mt-1">Exemple: si la colonne pour la marque s'appelle "brand_name", associez-la à "brand".</p>
      </div>
      
      <div className="bg-muted/30 p-4 rounded-md mb-4">
        <h4 className="text-sm font-medium mb-2">Mappings actuels:</h4>
        {Object.keys(columnMapping).length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {Object.entries(columnMapping).map(([standardField, tableField]) => (
              <Badge key={standardField} variant="outline" className="flex items-center gap-1">
                <span className="font-semibold">{
                  standardColumns.find(col => col.id === standardField)?.label || standardField
                }</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-mono text-xs">{tableField}</span>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Aucun mapping défini</p>
        )}
      </div>
      
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
    </div>
  );
};

export default ColumnMappingTab;
