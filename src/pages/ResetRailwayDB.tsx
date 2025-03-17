
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resetRailwayDBSettings } from '@/services/railway/config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const ResetRailwayDB = () => {
  const [resetComplete, setResetComplete] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const navigate = useNavigate();
  
  const handleReset = () => {
    setIsResetting(true);
    try {
      // Clear localStorage and reset to default
      const newSettings = resetRailwayDBSettings();
      
      if (newSettings) {
        console.log("Reset Railway DB settings to:", {
          host: newSettings.host,
          port: newSettings.port,
          database: newSettings.database,
          user: newSettings.user,
          passwordProvided: newSettings.password ? "Yes" : "No"
        });
        
        toast.success("Paramètres Railway DB réinitialisés");
        setResetComplete(true);
      } else {
        toast.error("Échec de la réinitialisation des paramètres");
      }
    } catch (error) {
      console.error("Error resetting Railway DB settings:", error);
      toast.error("Erreur lors de la réinitialisation");
    } finally {
      setIsResetting(false);
    }
  };
  
  const handleGoToSettings = () => {
    navigate('/settings');
  };
  
  return (
    <div className="container py-8">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Réinitialiser les paramètres Railway DB</CardTitle>
          <CardDescription>
            Cette page vous permet de réinitialiser tous les paramètres de connexion à Railway DB en cas de problème.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800">
            <div className="flex gap-2 items-start">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h3 className="font-medium">Attention</h3>
                <p className="text-sm">
                  La réinitialisation effacera tous vos paramètres personnalisés et rétablira les valeurs par défaut. 
                  Utilisez cette option uniquement en cas de problème de connexion.
                </p>
              </div>
            </div>
          </div>
          
          {resetComplete ? (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 text-green-800">
              <div className="flex gap-2 items-start">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-medium">Réinitialisation réussie</h3>
                  <p className="text-sm">
                    Les paramètres ont été réinitialisés avec succès aux valeurs par défaut.
                    Vous pouvez maintenant retourner aux paramètres pour vérifier ou personnaliser la connexion.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p>
              Les paramètres seront réinitialisés aux valeurs suivantes:
              <pre className="bg-muted p-3 rounded-md mt-2 text-sm overflow-auto">
{`Host: autorack.proxy.rlwy.net
Port: 32112
Database: railway
User: postgres
Password: (valeur par défaut sécurisée)`}
              </pre>
            </p>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate('/')}>
            Retour
          </Button>
          
          {resetComplete ? (
            <Button onClick={handleGoToSettings}>
              Aller aux paramètres
            </Button>
          ) : (
            <Button 
              onClick={handleReset} 
              disabled={isResetting}
              className="flex items-center gap-2"
            >
              {isResetting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Réinitialisation...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Réinitialiser les paramètres
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetRailwayDB;
