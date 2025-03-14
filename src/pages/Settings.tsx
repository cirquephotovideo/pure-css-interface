
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
import { toast } from "sonner";

const Settings = () => {
  const [dbSettings, setDbSettings] = useState({
    host: RAILWAY_DB_HOST || '',
    port: RAILWAY_DB_PORT || '',
    database: RAILWAY_DB_NAME || '',
    user: RAILWAY_DB_USER || '',
    password: RAILWAY_DB_PASSWORD || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDbSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveSettings = () => {
    // In a production app, you would save these values to localStorage or a backend
    // For now, we'll just show a toast notification
    localStorage.setItem('railway_db_settings', JSON.stringify(dbSettings));
    toast.success("Paramètres de connexion enregistrés", {
      description: "Veuillez redémarrer l'application pour appliquer les changements."
    });
  };

  const testConnection = () => {
    // This would ideally call an API endpoint to test the connection
    toast.info("Test de connexion", {
      description: "Cette fonctionnalité sera disponible prochainement."
    });
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Paramètres</h1>
      
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
          <Button variant="outline" onClick={testConnection}>
            Tester la connexion
          </Button>
          <Button onClick={saveSettings}>
            Enregistrer les paramètres
          </Button>
        </CardFooter>
      </Card>
      
      <div className="mt-8">
        <h2 className="text-xl font-medium mb-4">Informations actuelles</h2>
        <pre className="bg-muted p-4 rounded-md overflow-auto">
{`Railway DB Host: ${RAILWAY_DB_HOST}
Railway DB Port: ${RAILWAY_DB_PORT}
Railway DB Name: ${RAILWAY_DB_NAME}
Railway DB User: ${RAILWAY_DB_USER}
Railway DB Password: ${RAILWAY_DB_PASSWORD ? '••••••••' : 'Non défini'}`}
        </pre>
      </div>
    </div>
  );
};

export default Settings;
