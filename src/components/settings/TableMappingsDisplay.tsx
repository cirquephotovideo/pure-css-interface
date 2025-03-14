
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TableConfig } from "@/types/tableConfig";

interface ColumnMapping {
  standardField: string;
  tableField: string;
  standardLabel: string;
}

interface TableMappingsDisplayProps {
  className?: string;
}

const standardFields = [
  { id: 'name', label: 'Nom' },
  { id: 'price', label: 'Prix' },
  { id: 'barcode', label: 'Code-barres' },
  { id: 'reference', label: 'Référence' },
  { id: 'description', label: 'Description' },
  { id: 'brand', label: 'Marque' },
  { id: 'supplier_code', label: 'Code fournisseur' },
  { id: 'stock', label: 'Stock' },
  { id: 'location', label: 'Emplacement' },
  { id: 'ean', label: 'EAN' },
  { id: 'id', label: 'ID' },
];

const TableMappingsDisplay: React.FC<TableMappingsDisplayProps> = ({ className }) => {
  // Load table configurations from localStorage
  const [tableConfigs, setTableConfigs] = React.useState<TableConfig[]>([]);
  
  React.useEffect(() => {
    const savedTableConfigs = localStorage.getItem('railway_search_tables');
    if (savedTableConfigs) {
      try {
        const parsedConfigs = JSON.parse(savedTableConfigs);
        setTableConfigs(parsedConfigs);
      } catch (e) {
        console.error('Error parsing saved table configurations:', e);
      }
    }
  }, []);
  
  // Filter enabled tables with mappings
  const enabledTablesWithMappings = tableConfigs
    .filter(config => config.enabled && config.columnMapping && Object.keys(config.columnMapping).length > 0);
  
  if (enabledTablesWithMappings.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Mappings des colonnes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-4 text-muted-foreground">
            Aucune table active n'a de mappings définis.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Mappings des colonnes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {enabledTablesWithMappings.map(table => {
            const mappings: ColumnMapping[] = Object.entries(table.columnMapping || {}).map(([standardField, tableField]) => ({
              standardField,
              tableField,
              standardLabel: standardFields.find(field => field.id === standardField)?.label || standardField
            }));
            
            return (
              <div key={table.name} className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center">
                  <Badge variant="outline" className="mr-2">{table.name}</Badge>
                  Table active
                </h3>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/3">Champ standard</TableHead>
                      <TableHead className="w-1/3">Colonne mappée</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mappings.map(mapping => (
                      <TableRow key={`${table.name}-${mapping.standardField}`}>
                        <TableCell className="font-medium">{mapping.standardLabel}</TableCell>
                        <TableCell className="font-mono text-sm">{mapping.tableField}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default TableMappingsDisplay;
