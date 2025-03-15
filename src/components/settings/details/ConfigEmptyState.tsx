
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfigEmptyStateProps {
  message?: string;
  submessage?: string;
  icon?: React.ReactNode;
}

const ConfigEmptyState: React.FC<ConfigEmptyStateProps> = ({ 
  message = "Impossible de charger les colonnes pour cette table.",
  submessage = "Vérifiez que la table existe et que vous avez les permissions nécessaires.",
  icon = <AlertTriangle className="h-8 w-8 text-amber-500" />
}) => {
  return (
    <div className="text-center py-6 space-y-2">
      <div className="flex justify-center">
        {icon}
      </div>
      <div className="opacity-70">
        {message}
      </div>
      <div className="text-sm text-muted-foreground">
        {submessage}
      </div>
    </div>
  );
};

export default ConfigEmptyState;
