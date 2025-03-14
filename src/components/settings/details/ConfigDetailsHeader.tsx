
import React from 'react';
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ConfigDetailsHeaderProps {
  selectedTable: string;
  configTab: 'fields' | 'mapping';
  setConfigTab: (tab: 'fields' | 'mapping') => void;
}

const ConfigDetailsHeader: React.FC<ConfigDetailsHeaderProps> = ({
  selectedTable,
  configTab,
  setConfigTab
}) => {
  return (
    <>
      <CardTitle>Configuration de <span className="font-mono text-sm bg-muted p-1 rounded break-all">{selectedTable}</span></CardTitle>
      <CardDescription>
        Configurez cette table pour améliorer la recherche et l'affichage.
      </CardDescription>
      <Tabs 
        value={configTab} 
        onValueChange={(value: string) => setConfigTab(value as 'fields' | 'mapping')} 
        className="w-full mt-4"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="fields">Champs</TabsTrigger>
          <TabsTrigger value="mapping">Correspondance des colonnes</TabsTrigger>
        </TabsList>
      </Tabs>
    </>
  );
};

export default ConfigDetailsHeader;
