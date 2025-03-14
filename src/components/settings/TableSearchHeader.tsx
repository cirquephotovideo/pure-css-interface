
import React from 'react';
import { CardTitle, CardDescription } from "@/components/ui/card";
import TableSearchActions from './TableSearchActions';

interface TableSearchHeaderProps {
  onRefresh: () => Promise<void>;
  refreshing: boolean;
  loading: boolean;
}

const TableSearchHeader: React.FC<TableSearchHeaderProps> = ({
  onRefresh,
  refreshing,
  loading
}) => {
  return (
    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div>
        <CardTitle>Configuration des tables de recherche</CardTitle>
        <CardDescription>
          Sélectionnez les tables à inclure dans la recherche et configurez les champs.
        </CardDescription>
      </div>
      <TableSearchActions 
        onRefresh={onRefresh}
        refreshing={refreshing}
        loading={loading}
      />
    </div>
  );
};

export default TableSearchHeader;
