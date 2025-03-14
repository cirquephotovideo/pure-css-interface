import React, { useState, useEffect } from 'react';
import { 
  RAILWAY_DB_HOST, 
  RAILWAY_DB_PORT, 
  RAILWAY_DB_NAME, 
  RAILWAY_DB_USER, 
  RAILWAY_DB_PASSWORD 
} from '@/services/railway/config';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2 } from 'lucide-react';
import TableSearchConfig from '@/components/settings/TableSearchConfig';
import { executeRailwayQuery } from "@/services/railway/queryService";

// Interface for table configuration
interface TableConfig {
  name: string;
  enabled: boolean;
  searchFields: string[];
  displayFields: string[];
}

const Settings = () => {
  const [dbSettings, setDbSettings] = useState({
    host: RAILWAY_DB_HOST || '',
    port: RAILWAY_DB_PORT || '',
    database: RAILWAY_DB_NAME || '',
    user: RAILWAY_DB_USER || '',
    password: RAILWAY_DB_PASSWORD || '',
  });
  
  const [tableConfigs, setTableConfigs] = useState<TableConfig[]>([]);
  const [testingConnection, setTestingConnection] = useState(false);
  const [currentSettings, setCurrentSettings] = useState({
    host: RAILWAY_DB_HOST || '',
    port: RAILWAY_DB_PORT || '',
    database: RAILWAY_DB_NAME || '',
    user: RAILWAY_DB_USER || '',
    password: RAILWAY_DB_PASSWORD ? '••••••••' : 'Non défini',
  });
  
  // Load saved table configurations on component mount
  useEffect(() => {
    // Log current configuration at component mount
    console.log("Settings component mounted with DB config:", {
      host: RAILWAY_DB_HOST,
      port: RAILWAY_DB_PORT,
      database: RAILWAY_DB_NAME,
      user: RAILWAY_DB_USER,
      passwordProvided: RAILWAY_DB_PASSWORD ? "Yes" : "No"
    });
    
    const savedTableConfigs = localStorage.getItem('railway_search_tables');
    if (savedTableConfigs) {
      try {
        setTableConfigs(JSON.parse(savedTableConfigs));
      } catch (e) {
        console.error('Error parsing saved table configurations:', e);
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDbSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveSettings = () => {
    // Validate settings first
    if (!dbSettings.host || !dbSettings.port || !dbSettings.database || !dbSettings.user) {
      toast.error("Paramètres incomplets", { 
        description: "Tous les champs sauf le mot de passe sont obligatoires."
      });
      return;
    }
    
    // Save settings to localStorage with correct format
    localStorage.setItem('railway_db_settings', JSON.stringify({
      host: dbSettings.host,
      port: dbSettings.port,
      database: dbSettings.database,
      user: dbSettings.user,
      password: dbSettings.password,
    }));
    
    // Update current settings for display
    setCurrentSettings({
      ...dbSettings,
      password: dbSettings.password ? '••••••••' : 'Non défini',
    });
    
    // Apply settings immediately by updating window object
    if (window) {
      // @ts-ignore - Directly setting environment variables on window for immediate use
      window.RAILWAY_DB_HOST = dbSettings.host;
      // @ts-ignore
      window.RAILWAY_DB_PORT = dbSettings.port;
      // @ts-ignore
      window.RAILWAY_DB_NAME = dbSettings.database;
      // @ts-ignore
      window.RAILWAY_DB_USER = dbSettings.user;
      // @ts-ignore
      window.RAILWAY_DB_PASSWORD = dbSettings.password;
      
      // Force reload to ensure all components use the new settings
      window.location.reload();
    }
    
    toast.success("Paramètres de connexion enregistrés", {
      description: "Les paramètres ont été appliqués et la page va se recharger."
    });
  };

  const testConnection = async () => {
    setTestingConnection(true);
    try {
      // Use a simple query to test the connection
      // Use the current form values for testing, not the stored ones
      const testSettings = {
        host: dbSettings.host,
        port: dbSettings.port,
        database: dbSettings.database,
        user: dbSettings.user,
        password: dbSettings.password,
      };
      
      console.log("Testing connection with settings:", {
        host: testSettings.host,
        port: testSettings.port,
        database: testSettings.database,
        user: testSettings.user,
        passwordProvided: testSettings.password ? "Yes" : "No"
      });
      
      // Temporarily set the connection parameters on window for the test
      if (window) {
        // @ts-ignore
        const originalHost = window.RAILWAY_DB_HOST;
        // @ts-ignore
        const originalPort = window.RAILWAY_DB_PORT;
        // @ts-ignore
        const originalName = window.RAILWAY_DB_NAME;
        // @ts-ignore
        const originalUser = window.RAILWAY_DB_USER;
        // @ts-ignore
        const originalPassword = window.RAILWAY_DB_PASSWORD;
        
        try {
          // @ts-ignore - Set temporary test values
          window.RAILWAY_DB_HOST = testSettings.host;
          // @ts-ignore
          window.RAILWAY_DB_PORT = testSettings.port;
          // @ts-ignore
          window.RAILWAY_DB_NAME = testSettings.database;
          // @ts-ignore
          window.RAILWAY_DB_USER = testSettings.user;
          // @ts-ignore
          window.RAILWAY_DB_PASSWORD = testSettings.password;
          
          // Use a simple query to test the connection
          const query = "SELECT 1 as connection_test";
          const result = await executeRailwayQuery(query);
          
          if (result.error) {
            console.error("Connection test failed:", result.error);
            toast.error("Échec de la connexion", {
              description: `Erreur: ${result.error}`
            });
          } else {
            console.log("Connection test successful:", result);
            toast.success("Connexion réussie!", {
              description: "La connexion à la base de données Railway a été établie avec succès."
            });
            
            // If the test was successful, save the settings automatically
            localStorage.setItem('railway_db_settings', JSON.stringify(testSettings));
            setCurrentSettings({
              ...testSettings,
              password: testSettings.password ? '••••••••' : 'Non défini',
            });
          }
        } finally {
          // Restore original values
          // @ts-ignore
          window.RAILWAY_DB_HOST = originalHost;
          // @ts-ignore
          window.RAILWAY_DB_PORT = originalPort;
          // @ts-ignore
          window.RAILWAY_DB_NAME = originalName;
          // @ts-ignore
          window.RAILWAY_DB_USER = originalUser;
          // @ts-ignore
          window.RAILWAY_DB_PASSWORD = originalPassword;
        }
      } else {
        // Direct test without window object (should not happen in browser)
        const query = "SELECT 1 as connection_test";
        const result = await executeRailwayQuery(query);
        
        if (result.error) {
          toast.error("Échec de la connexion", {
            description: `Erreur: ${result.error}`
          });
        } else {
          toast.success("Connexion réussie!", {
            description: "La connexion à la base de données Railway a été établie avec succès."
          });
        }
      }
    } catch (error) {
      console.error("Test connection error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error("Échec de la connexion", {
        description: `Erreur: ${errorMessage}`
      });
    } finally {
      setTestingConnection(false);
    }
  };
  
  const handleTableConfigChange = (configs: TableConfig[]) => {
    setTableConfigs(configs);
    localStorage.setItem('railway_search_tables', JSON.stringify(configs));
    toast.success("Configuration des tables enregistrée", {
      description: "Les changements seront appliqués à la prochaine recherche."
    });
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Paramètres</h1>
      
      <Tabs defaultValue="connection">
        <TabsList className="mb-6">
          <TabsTrigger value="connection">Connexion Base de Données</TabsTrigger>
          <TabsTrigger value="search">Configuration Recherche</TabsTrigger>
        </TabsList>
        
        <TabsContent value="connection">
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle>Connexion Railway DB</CardTitle>
              <CardDescription>
                Configurez les paramètres de connexion à votre base de données Railway.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="host">Host</Label>
                <Input 
                  id="host" 
                  name="host" 
                  value={dbSettings.host} 
                  onChange={handleInputChange}
                  placeholder="ex: autorack.proxy.rlwy.net"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="port">Port</Label>
                <Input 
                  id="port" 
                  name="port" 
                  value={dbSettings.port} 
                  onChange={handleInputChange}
                  placeholder="ex: 32112"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="database">Nom de la base de données</Label>
                <Input 
                  id="database" 
                  name="database" 
                  value={dbSettings.database} 
                  onChange={handleInputChange}
                  placeholder="ex: railway"
                />
              </div>
              
              <Separator className="my-2" />
              
              <div className="space-y-2">
                <Label htmlFor="user">Utilisateur</Label>
                <Input 
                  id="user" 
                  name="user" 
                  value={dbSettings.user} 
                  onChange={handleInputChange}
                  placeholder="ex: postgres"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  value={dbSettings.password} 
                  onChange={handleInputChange}
                  placeholder="••••••••••••"
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={testConnection} disabled={testingConnection}>
                {testingConnection ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Test en cours...
                  </>
                ) : (
                  "Tester la connexion"
                )}
              </Button>
              <Button onClick={saveSettings}>
                Enregistrer les paramètres
              </Button>
            </CardFooter>
          </Card>
          
          <div className="mt-8">
            <h2 className="text-xl font-medium mb-4">Informations actuelles</h2>
            <pre className="bg-muted p-4 rounded-md overflow-auto">
{`Railway DB Host: ${currentSettings.host}
Railway DB Port: ${currentSettings.port}
Railway DB Name: ${currentSettings.database}
Railway DB User: ${currentSettings.user}
Railway DB Password: ${currentSettings.password}`}
            </pre>
          </div>
        </TabsContent>
        
        <TabsContent value="search">
          <TableSearchConfig 
            initialConfigs={tableConfigs}
            onChange={handleTableConfigChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
