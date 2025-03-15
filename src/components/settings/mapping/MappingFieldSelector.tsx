
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { standardColumns } from '../utils/standardColumns';

interface MappingFieldSelectorProps {
  standardField: string;
  tableColumns: string[];
  selectedColumn: string | undefined;
  onColumnSelect: (standardField: string, tableColumn: string) => void;
}

const MappingFieldSelector: React.FC<MappingFieldSelectorProps> = ({
  standardField,
  tableColumns,
  selectedColumn,
  onColumnSelect
}) => {
  const standardFieldLabel = 
    standardColumns.find(col => col.id === standardField)?.label || standardField;
  
  return (
    <div className="space-y-2">
      <Label htmlFor={`field-${standardField}`}>{standardFieldLabel}</Label>
      <Select 
        value={selectedColumn || ''} 
        onValueChange={(value) => onColumnSelect(standardField, value)}
      >
        <SelectTrigger id={`field-${standardField}`} className="w-full">
          <SelectValue placeholder="Sélectionner une colonne" />
        </SelectTrigger>
        <SelectContent>
          {/* Add empty option to allow clearing the selection */}
          <SelectItem value="">-- Aucun --</SelectItem>
          {tableColumns.map((column) => (
            <SelectItem key={column} value={column}>
              {column}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default MappingFieldSelector;
