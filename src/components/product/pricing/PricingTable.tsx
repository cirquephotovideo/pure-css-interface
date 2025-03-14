
import React from 'react';
import { Product } from '@/services/railway';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { Info, Database } from 'lucide-react';
import TableInfoPopover from '../dialog/TableInfoPopover';
import { Badge } from '@/components/ui/badge';

interface PricingTableProps {
  product: Product;
  onOpenDialog: (priceType: string) => void;
}

const PricingTable: React.FC<PricingTableProps> = ({
  product,
  onOpenDialog
}) => {
  const prices = product.prices || [];
  const eco = product.eco || {};
  const sourceTable = product.source_table || 'products';
  
  return (
    <div className="w-[380px] flex-shrink-0 mr-3">
      <div className="mb-2 flex items-center gap-2">
        <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 flex items-center gap-1">
          <Database className="h-3 w-3" />
          <span>{sourceTable}</span>
        </Badge>
        <TableInfoPopover tableName={sourceTable} />
      </div>
      
      <Table className="w-full bg-white/60 dark:bg-gray-800/60 rounded-xl overflow-hidden text-xs shadow-sm">
        <TableHeader className="bg-white/80 dark:bg-gray-800/80">
          <TableRow>
            <TableHead className="h-8 px-2 text-xs font-semibold text-black dark:text-white">Catalogue</TableHead>
            <TableHead className="h-8 px-2 text-xs font-semibold text-black dark:text-white bg-[#8294ce] dark:bg-[#3a4876]">Stock</TableHead>
            <TableHead className="h-8 px-2 text-xs font-semibold text-black dark:text-white bg-[#8294cf] dark:bg-[#3c4a7d]">PA HT</TableHead>
            <TableHead className="h-8 px-2 text-xs font-semibold text-black dark:text-white bg-[#a0abce] dark:bg-[#465381]">Eco</TableHead>
            <TableHead className="h-8 w-8 px-2 text-xs font-semibold text-black dark:text-white bg-[#a3afd4] dark:bg-[#4a5789]">Détails</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prices.length > 0 ? (
            prices.map((price, index) => (
              <TableRow key={index} className="border-b border-white/30 dark:border-gray-700/30 hover:bg-white/70 dark:hover:bg-gray-700/70">
                <TableCell className="py-2 px-2 font-medium">{sourceTable}</TableCell>
                <TableCell className="py-2 px-2">
                  {product.stock !== undefined ? (
                    <span className={product.stock > 0 ? "text-green-700 dark:text-green-500 font-medium" : "text-red-600 dark:text-red-400"}>
                      {product.stock}
                    </span>
                  ) : "N/D"}
                </TableCell>
                <TableCell className="py-2 px-2 font-medium">
                  {typeof price.value === 'number' ? price.value.toFixed(2) : price.value} €
                </TableCell>
                <TableCell className="py-2 px-2">
                  {eco && eco[price.type] ? (
                    <span className="text-blue-600 dark:text-blue-400">
                      {typeof eco[price.type] === 'number' ? eco[price.type].toFixed(2) : eco[price.type]} €
                    </span>
                  ) : "N/D"}
                </TableCell>
                <TableCell className="py-2 px-2 text-center">
                  <button 
                    onClick={() => onOpenDialog(price.type)} 
                    className="cursor-pointer hover:bg-white/90 dark:hover:bg-gray-700/90 rounded-full p-1 transition-colors flex items-center justify-center" 
                    title="Voir détails"
                  >
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow className="border-b border-white/30 dark:border-gray-700/30">
              <TableCell colSpan={5} className="py-2 px-2 text-center text-gray-500 bg-red-300 dark:bg-red-900/30">
                Aucun prix disponible
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PricingTable;
