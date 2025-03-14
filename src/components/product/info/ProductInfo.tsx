
import React from 'react';
import { Product } from '@/services/railway';
import { Badge } from '@/components/ui/badge';
import { Database, BarcodeIcon, User } from 'lucide-react';

interface ProductInfoProps {
  product: Product;
}

const ProductInfo: React.FC<ProductInfoProps> = ({ product }) => {
  return (
    <div className="flex gap-4 items-center flex-1">
      <div className="w-20 h-16 bg-white/50 rounded-xl flex items-center justify-center flex-shrink-0">
        <img 
          src={product.imageUrl || "/placeholder.svg"} 
          alt={product.reference} 
          className="max-w-full max-h-full object-contain" 
        />
      </div>
      
      <div className="flex flex-col gap-1 flex-1">
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium">{product.reference}</span>
          {product.source_table && product.source_table !== 'products' && (
            <Badge variant="outline" className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full flex items-center">
              <Database className="h-3 w-3 mr-1" />
              {product.source_table}
            </Badge>
          )}
        </div>
        
        <div className="flex gap-2 flex-wrap text-xs opacity-70 mb-1">
          {product.barcode && (
            <span className="flex items-center gap-1">
              <BarcodeIcon className="h-3 w-3" />
              {product.barcode}
            </span>
          )}
          
          {product.ean && product.ean !== product.barcode && (
            <span className="flex items-center gap-1">
              <BarcodeIcon className="h-3 w-3" />
              EAN: {product.ean}
            </span>
          )}
          
          {product.supplier_code && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {product.supplier_code}
            </span>
          )}
        </div>
        
        <div className="text-sm leading-tight font-medium">
          {product.name || product.description || "Sans description"}
        </div>
        
        {product.description && product.name && product.description !== product.name && (
          <div className="text-xs opacity-70 mt-1">
            {product.description}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductInfo;
