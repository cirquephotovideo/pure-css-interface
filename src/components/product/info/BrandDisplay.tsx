
import React from 'react';
import { Product } from '@/services/railway';
import { Package } from 'lucide-react';

interface BrandDisplayProps {
  product: Product;
}

const BrandDisplay: React.FC<BrandDisplayProps> = ({ product }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col items-end">
        <div className="flex items-center gap-1">
          <span className="text-sm font-semibold">{product.brand || "Sans marque"}</span>
        </div>
        {product.location && (
          <div className="text-xs flex items-center gap-1 opacity-70">
            <Package className="h-3 w-3" />
            {product.location}
          </div>
        )}
        {product.category && (
          <div className="text-xs opacity-70">
            {product.category}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandDisplay;
