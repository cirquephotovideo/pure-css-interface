
import React, { useState, useEffect } from 'react';
import { executeRailwayQuery } from "@/services/railway/queryService";
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Database } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface TableDisplayProps {
  tableName: string;
}

const TableDisplay = ({ tableName }: TableDisplayProps) => {
  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState<string[]>([]);
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  // Fetch columns and data for the table
  useEffect(() => {
    const fetchTableData = async () => {
      try {
        setLoading(true);
        
        // 1. First fetch the columns
        const columnsQuery = `
          SELECT column_name
          FROM information_schema.columns
          WHERE table_schema = 'public'
          AND table_name = $1
          ORDER BY ordinal_position
        `;
        
        const columnsResult = await executeRailwayQuery<{column_name: string}>(columnsQuery, [tableName]);
        
        if (!columnsResult.data || columnsResult.error) {
          toast.error(`Erreur lors de la récupération des colonnes pour ${tableName}`, {
            description: columnsResult.error
          });
          setLoading(false);
          return;
        }
        
        const columnNames = columnsResult.data.map(col => col.column_name);
        setColumns(columnNames);
        
        // 2. Then fetch the data with pagination
        const offset = (page - 1) * pageSize;
        const dataQuery = `
          SELECT *
          FROM ${tableName}
          LIMIT ${pageSize}
          OFFSET ${offset}
        `;
        
        const dataResult = await executeRailwayQuery(dataQuery);
        
        if (!dataResult.data || dataResult.error) {
          toast.error(`Erreur lors de la récupération des données pour ${tableName}`, {
            description: dataResult.error
          });
          setLoading(false);
          return;
        }
        
        setData(dataResult.data);
        
        // 3. Get the total count for pagination
        const countQuery = `
          SELECT COUNT(*) as total
          FROM ${tableName}
        `;
        
        const countResult = await executeRailwayQuery<{total: number}>(countQuery);
        
        if (countResult.data && countResult.data.length > 0) {
          setTotalCount(countResult.data[0].total);
        }
        
      } catch (error) {
        toast.error(`Erreur lors de l'affichage de la table ${tableName}`);
        console.error(`Error fetching table data for ${tableName}:`, error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTableData();
  }, [tableName, page]);
  
  // Handle pagination
  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };
  
  const handleNextPage = () => {
    if (page * pageSize < totalCount) {
      setPage(page + 1);
    }
  };
  
  // Format cell value for display
  const formatCellValue = (value: any): string => {
    if (value === null || value === undefined) {
      return '-';
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    return String(value);
  };
  
  // Truncate long values
  const truncateValue = (value: string, maxLength: number = 50): string => {
    if (value.length <= maxLength) {
      return value;
    }
    return value.substring(0, maxLength) + '...';
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database size={18} />
          Table: {tableName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : columns.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            Aucune colonne trouvée pour cette table
          </div>
        ) : (
          <>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.slice(0, 8).map((column) => (
                      <TableHead key={column} className="font-medium">
                        {column}
                      </TableHead>
                    ))}
                    {columns.length > 8 && (
                      <TableHead>
                        +{columns.length - 8} colonnes
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columns.length > 8 ? 9 : columns.length} className="text-center py-6 text-muted-foreground">
                        Aucune donnée disponible
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((row, index) => (
                      <TableRow key={index}>
                        {columns.slice(0, 8).map((column) => (
                          <TableCell key={column} className="max-w-xs truncate">
                            {truncateValue(formatCellValue(row[column]))}
                          </TableCell>
                        ))}
                        {columns.length > 8 && (
                          <TableCell>...</TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
                <TableCaption>
                  <div className="flex justify-between items-center">
                    <span>Affichage de {data.length} sur {totalCount} lignes</span>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handlePreviousPage}
                        disabled={page === 1}
                      >
                        <ChevronLeft size={16} />
                      </Button>
                      <span className="px-2 flex items-center">
                        Page {page}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleNextPage}
                        disabled={page * pageSize >= totalCount}
                      >
                        <ChevronRight size={16} />
                      </Button>
                    </div>
                  </div>
                </TableCaption>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TableDisplay;
