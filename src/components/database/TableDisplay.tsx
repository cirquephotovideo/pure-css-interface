
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
import { ChevronLeft, ChevronRight, Database, RefreshCw, Download } from "lucide-react";
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
  const [error, setError] = useState<string | null>(null);
  const pageSize = 25; // Increased from 10 to 25 to show more rows

  const fetchTableData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching data for table: ${tableName}, page: ${page}`);
      
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
        const errorMsg = columnsResult.error || "Failed to retrieve columns";
        console.error(`Error fetching columns for ${tableName}:`, errorMsg);
        setError(errorMsg);
        toast.error(`Erreur lors de la récupération des colonnes pour ${tableName}`, {
          description: errorMsg
        });
        setLoading(false);
        return;
      }
      
      const columnNames = columnsResult.data.map(col => col.column_name);
      console.log(`Got ${columnNames.length} columns for table ${tableName}:`, columnNames);
      setColumns(columnNames);
      
      // 2. Then fetch the data with pagination
      const offset = (page - 1) * pageSize;
      const escapedTableName = tableName.replace(/[^\w\d_]/g, ''); // Basic SQL injection prevention
      const dataQuery = `
        SELECT *
        FROM "${escapedTableName}"
        LIMIT ${pageSize}
        OFFSET ${offset}
      `;
      
      console.log(`Executing data query for ${tableName}:`, dataQuery);
      const dataResult = await executeRailwayQuery(dataQuery);
      
      if (!dataResult.data || dataResult.error) {
        const errorMsg = dataResult.error || "Failed to retrieve data";
        console.error(`Error fetching data for ${tableName}:`, errorMsg);
        setError(errorMsg);
        toast.error(`Erreur lors de la récupération des données pour ${tableName}`, {
          description: errorMsg
        });
        setLoading(false);
        return;
      }
      
      console.log(`Got ${dataResult.data.length} rows for table ${tableName}`);
      setData(dataResult.data);
      
      // 3. Get the total count for pagination
      const countQuery = `
        SELECT COUNT(*) as total
        FROM "${escapedTableName}"
      `;
      
      console.log(`Executing count query for ${tableName}:`, countQuery);
      const countResult = await executeRailwayQuery<{total: number}>(countQuery);
      
      if (countResult.data && countResult.data.length > 0) {
        const total = Number(countResult.data[0].total);
        console.log(`Total count for ${tableName}: ${total} rows`);
        setTotalCount(total);
      }
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      console.error(`Error in fetchTableData for ${tableName}:`, error);
      setError(errorMsg);
      toast.error(`Erreur lors de l'affichage de la table ${tableName}`, {
        description: errorMsg
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch table data on component mount and when page or tableName changes
  useEffect(() => {
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

  // Export the data as CSV
  const exportTableAsCSV = () => {
    try {
      if (!data || data.length === 0 || columns.length === 0) {
        toast.error("Pas de données à exporter");
        return;
      }

      // Format data as CSV
      const header = columns.join(',');
      const rows = data.map(row => 
        columns.map(col => {
          const value = formatCellValue(row[col]);
          // Escape commas and quotes in CSV
          return `"${value.replace(/"/g, '""')}"`;
        }).join(',')
      );
      
      const csvContent = [header, ...rows].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${tableName}_export.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Export de ${data.length} lignes réussi`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Erreur lors de l'export");
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2">
          <Database size={18} />
          Table: {tableName}
        </CardTitle>
        <div className="flex gap-2">
          {!loading && !error && data.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={exportTableAsCSV}
              className="flex items-center gap-1"
            >
              <Download size={14} />
              Exporter CSV
            </Button>
          )}
          {error ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchTableData}
              className="flex items-center gap-1"
            >
              <RefreshCw size={14} />
              Réessayer
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : error ? (
          <div className="text-center py-6 text-red-500 border border-red-200 rounded-md">
            <p>Erreur: {error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchTableData}
              className="mt-4 flex items-center gap-1 mx-auto"
            >
              <RefreshCw size={14} />
              Réessayer
            </Button>
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
                    {columns.slice(0, 10).map((column) => (
                      <TableHead key={column} className="font-medium">
                        {column}
                      </TableHead>
                    ))}
                    {columns.length > 10 && (
                      <TableHead>
                        +{columns.length - 10} colonnes
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columns.length > 10 ? 11 : columns.length} className="text-center py-6 text-muted-foreground">
                        Aucune donnée disponible
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((row, index) => (
                      <TableRow key={index}>
                        {columns.slice(0, 10).map((column) => (
                          <TableCell key={column} className="max-w-xs truncate">
                            {truncateValue(formatCellValue(row[column]))}
                          </TableCell>
                        ))}
                        {columns.length > 10 && (
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
                        Page {page} sur {Math.ceil(totalCount / pageSize)}
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
