
import React, { useEffect, useState } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Database } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { executeRailwayQuery } from '@/services/railway/queryService';

interface TableInfoPopoverProps {
  tableName: string;
}

interface ColumnInfo {
  column_name: string;
}

const TableInfoPopover: React.FC<TableInfoPopoverProps> = ({ tableName }) => {
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTableColumns = async () => {
      if (!tableName) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const columnsQuery = `
          SELECT column_name
          FROM information_schema.columns
          WHERE table_schema = 'public'
          AND table_name = $1
          ORDER BY ordinal_position
        `;
        
        const result = await executeRailwayQuery<ColumnInfo>(columnsQuery, [tableName]);
        
        if (result.error) {
          console.error("Error fetching columns:", result.error);
          setError("Impossible de récupérer les colonnes");
        } else if (result.data) {
          setColumns(result.data.map(col => col.column_name));
        }
      } catch (err) {
        console.error("Exception fetching columns:", err);
        setError("Erreur lors de la récupération des colonnes");
      } finally {
        setLoading(false);
      }
    };
    
    fetchTableColumns();
  }, [tableName]);

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
          
          {loading ? (
            <div className="flex justify-center p-3">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-3 rounded text-xs text-red-500">{error}</div>
          ) : (
            <div className="bg-gray-50 p-3 rounded mt-2">
              <h4 className="text-xs font-medium mb-1">Champs de la table</h4>
              <div className="grid grid-cols-2 gap-1 text-xs">
                {columns.length > 0 ? (
                  columns.map((field) => (
                    <div key={field} className="bg-white p-1.5 rounded border border-gray-100">
                      {field}
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-gray-500 text-center p-1">
                    Aucun champ trouvé
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TableInfoPopover;
