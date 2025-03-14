
import React from 'react';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ConfigSaveFooterProps {
  selectedTable: string;
  onSave: () => void;
}

const ConfigSaveFooter: React.FC<ConfigSaveFooterProps> = ({
  selectedTable,
  onSave
}) => {
  const handleSave = () => {
    onSave();
    toast.success(`Configuration enregistrée pour ${selectedTable}`, {
      description: "Les changements seront appliqués à la prochaine recherche."
    });
  };

  return (
    <Button onClick={handleSave}>
      Enregistrer la configuration
    </Button>
  );
};

export default ConfigSaveFooter;
