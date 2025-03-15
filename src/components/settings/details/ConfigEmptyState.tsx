
import React from 'react';
import { AlertTriangle, Database, Info } from 'lucide-react';

interface ConfigEmptyStateProps {
  message?: string;
  submessage?: string;
  icon?: React.ReactNode;
  error?: string;
}

const ConfigEmptyState: React.FC<ConfigEmptyStateProps> = ({ 
  message = "Impossible de charger les colonnes pour cette table.",
  submessage = "Vérifiez que la table existe et que vous avez les permissions nécessaires.",
  icon = <AlertTriangle className="h-8 w-8 text-amber-500" />,
  error
}) => {
  return (
    <div className="text-center py-6 space-y-4">
      <div className="flex justify-center">
        {icon}
      </div>
      <div className="opacity-70 font-medium">
        {message}
      </div>
      <div className="text-sm text-muted-foreground">
        {submessage}
      </div>
      
      {error && (
        <div className="mt-4 text-sm bg-destructive/10 text-destructive p-3 rounded-md mx-auto max-w-2xl overflow-auto">
          <div className="font-medium mb-1 flex items-center gap-1">
            <Info className="h-4 w-4" /> Détails de l'erreur:
          </div>
          <code className="whitespace-pre-wrap text-xs break-all">
            {error}
          </code>
        </div>
      )}
      
      <div className="flex justify-center mt-4">
        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md max-w-md">
          <p className="mb-2 flex items-center gap-1">
            <Database className="h-4 w-4" /> 
            <span className="font-medium">Astuce de dépannage:</span>
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Vérifiez que la table contient effectivement des données</li>
            <li>Assurez-vous que les noms des colonnes correspondent exactement</li>
            <li>Vérifiez les permissions d'accès à cette table</li>
            <li>Essayez de rafraîchir la liste des tables</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ConfigEmptyState;
