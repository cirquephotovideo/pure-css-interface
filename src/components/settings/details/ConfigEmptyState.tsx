
import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfigEmptyState: React.FC = () => {
  return (
    <div className="text-center py-6 space-y-2">
      <div className="flex justify-center">
        <AlertTriangle className="h-8 w-8 text-amber-500" />
      </div>
      <div className="opacity-70">
        Impossible de charger les colonnes pour cette table.
      </div>
      <div className="text-sm text-muted-foreground">
        Vérifiez que la table existe et que vous avez les permissions nécessaires.
      </div>
    </div>
  );
};

export default ConfigEmptyState;
