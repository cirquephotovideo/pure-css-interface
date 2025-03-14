
import React from 'react';
import { cn } from '@/lib/utils';
import { Database } from 'lucide-react';
import { Product } from '@/services/railway';
import ProductRow from './ProductRow';

interface ProductDisplayProps {
  products?: Product[];
  className?: string;
}

const ProductDisplay: React.FC<ProductDisplayProps> = ({
  products = [], // Default to empty array if products is not provided
  className
}) => {
  // Count unique source tables
  const sourceTables = new Set(products.map(product => product.source_table || 'products'));
  
  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="flex justify-between items-center">
        <div className="flex gap-4 text-sm">
          <div className="ios-surface px-3 py-1 text-sm font-medium">Catalogue</div>
          <div className="opacity-70 px-3 py-1 text-sm">Stock</div>
          <div className="opacity-70 px-3 py-1 text-sm"></div>
          <div className="opacity-70 px-3 py-1 text-sm"></div>
        </div>
        
        <button className="ios-button text-sm">
          Voir stock et prix ({products.length})
        </button>
      </div>
      
      {sourceTables.size > 1 && (
        <div className="flex gap-2 items-center bg-blue-50 p-2 rounded-lg text-sm">
          <Database className="h-4 w-4 text-blue-500" />
          <span>Résultats de {sourceTables.size} tables: {Array.from(sourceTables).join(', ')}</span>
        </div>
      )}
      
      <div className="space-y-4">
        {products.map(product => <ProductRow key={product.id} product={product} />)}
      </div>
      
      <div className="text-sm opacity-70 py-4 text-center">
        {products.length > 0 ? `1 sur ${Math.ceil(products.length / 10)}` : 'Aucun résultat'}
      </div>
    </div>
  );
};

export default ProductDisplay;
