
import React, { useState, useEffect } from "react";
import { executeRailwayQuery } from "@/services/railway/queryService";
import TableDisplay from "@/components/database/TableDisplay";
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Database, Plus, X } from "lucide-react";

const Catalogs = () => {
  const [loading, setLoading] = useState(true);
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [displayedTables, setDisplayedTables] = useState<string[]>([]);

  // Fetch available tables
  useEffect(() => {
    const fetchTables = async () => {
      try {
        setLoading(true);
        const query = `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
          ORDER BY table_name
        `;
        
        const result = await executeRailwayQuery<{table_name: string}>(query);
        
        if (result.data) {
          const tableNames = result.data.map(row => row.table_name);
          setTables(tableNames);
          
          if (tableNames.length > 0) {
            setSelectedTable(tableNames[0]);
          }
        } else if (result.error) {
          toast.error("Erreur lors de la récupération des tables", {
            description: result.error
          });
        }
      } catch (error) {
        toast.error("Impossible de récupérer la liste des tables", {
          description: "Vérifiez votre connexion à la base de données."
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchTables();
  }, []);
  
  // Add a table to the display list
  const addTableToDisplay = () => {
    if (selectedTable && !displayedTables.includes(selectedTable)) {
      setDisplayedTables([...displayedTables, selectedTable]);
      toast.success(`Table ${selectedTable} ajoutée`);
    } else if (displayedTables.includes(selectedTable)) {
      toast.info(`La table ${selectedTable} est déjà affichée`);
    }
  };
  
  // Remove a table from the display list
  const removeTable = (tableName: string) => {
    setDisplayedTables(displayedTables.filter(t => t !== tableName));
    toast.info(`Table ${tableName} retirée`);
  };

  return (
    <div className="container p-4 mx-auto">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Catalogues de données</CardTitle>
          <CardDescription>
            Explorez les données de vos tables PostgreSQL
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <Select
                value={selectedTable}
                onValueChange={setSelectedTable}
                disabled={loading || tables.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une table" />
                </SelectTrigger>
                <SelectContent>
                  {tables.map((table) => (
                    <SelectItem key={table} value={table}>
                      {table}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={addTableToDisplay}
              disabled={loading || !selectedTable}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              Ajouter cette table
            </Button>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Chargement des tables...
            </div>
          ) : tables.length === 0 ? (
            <div className="text-center py-8">
              <Database className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium">Aucune table trouvée</h3>
              <p className="text-sm text-gray-500 mt-2">
                Vérifiez votre connexion à la base de données
              </p>
            </div>
          ) : displayedTables.length === 0 ? (
            <div className="text-center py-8 border rounded-md">
              <Database className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium">Aucune table sélectionnée</h3>
              <p className="text-sm text-gray-500 mt-2">
                Sélectionnez une table et cliquez sur "Ajouter cette table"
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 my-4">
              {displayedTables.map(table => (
                <div key={table} className="flex items-center bg-muted/30 p-2 rounded-md">
                  <span className="flex-1">{table}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeTable(table)}
                    className="h-8 w-8 p-0"
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {displayedTables.map(table => (
        <TableDisplay key={table} tableName={table} />
      ))}
    </div>
  );
};

export default Catalogs;
