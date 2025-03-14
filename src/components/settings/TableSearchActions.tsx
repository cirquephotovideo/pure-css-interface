
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';

interface TableSearchActionsProps {
  onRefresh: () => Promise<void>;
  refreshing: boolean;
  loading: boolean;
}

const TableSearchActions: React.FC<TableSearchActionsProps> = ({
  onRefresh,
  refreshing,
  loading
}) => {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={onRefresh}
      disabled={refreshing || loading}
    >
      {refreshing || loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        "Actualiser les tables"
      )}
    </Button>
  );
};

export default TableSearchActions;
