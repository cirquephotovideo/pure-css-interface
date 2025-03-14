
import React from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Database } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TableInfoPopoverProps {
  tableName: string;
}

const TableInfoPopover: React.FC<TableInfoPopoverProps> = ({ tableName }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Badge 
          variant="outline" 
          className="bg-blue-100 text-blue-800 text-xs flex items-center gap-1 cursor-pointer hover:bg-blue-200"
        >
          <Database className="h-3 w-3" />
          <span className="truncate max-w-[150px]">{tableName}</span>
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-white rounded-lg shadow-lg border-none">
        <div className="p-4">
          <h3 className="text-sm font-medium mb-2">Informations de la table</h3>
          <div className="text-xs text-gray-700 mb-1">Nom: <span className="font-medium text-blue-600">{tableName}</span></div>
          
          {/* This would be populated with actual fields from the table */}
          <div className="bg-gray-50 p-3 rounded mt-2">
            <h4 className="text-xs font-medium mb-1">Champs de la table</h4>
            <div className="grid grid-cols-2 gap-1 text-xs">
              {['id', 'reference', 'brand', 'price', 'stock', 'description'].map((field) => (
                <div key={field} className="bg-white p-1.5 rounded border border-gray-100">
                  {field}
                </div>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TableInfoPopover;
