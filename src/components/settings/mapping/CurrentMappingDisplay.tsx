
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { standardColumns } from '../utils/standardColumns';

interface CurrentMappingDisplayProps {
  columnMapping: Record<string, string>;
}

const CurrentMappingDisplay: React.FC<CurrentMappingDisplayProps> = ({
  columnMapping
}) => {
  if (!columnMapping || Object.keys(columnMapping).length === 0) {
    return <p className="text-sm text-muted-foreground">Aucun mapping défini</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(columnMapping).map(([standardField, tableField]) => {
        const standardLabel = standardColumns.find(col => col.id === standardField)?.label || standardField;
        return (
          <Badge key={standardField} variant="outline" className="flex items-center gap-1">
            <span className="font-semibold">{standardLabel}</span>
            <span className="text-muted-foreground">→</span>
            <span className="font-mono text-xs">{tableField}</span>
          </Badge>
        );
      })}
    </div>
  );
};

export default CurrentMappingDisplay;
