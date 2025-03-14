
import React from 'react';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  reference: string;
  barcode: string;
  description: string;
  brand: string;
  location: string;
  imageUrl: string;
  catalog: string;
  prices: {
    type: string;
    value: number;
  }[];
}

interface ProductDisplayProps {
  products: Product[];
  className?: string;
}

const ProductRow: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <div className="ios-glass flex items-center gap-4 p-4 mb-4 animate-fade-in">
      <div className="w-10 flex-shrink-0">
        <div className="flex items-center justify-center w-6 h-6 text-xs opacity-70">
          ❤
        </div>
      </div>
      
      <div className="flex gap-4 items-center flex-1">
        <div className="w-20 h-16 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <img 
            src={product.imageUrl || "public/placeholder.svg"} 
            alt={product.reference}
            className="max-w-full max-h-full object-contain" 
          />
        </div>
        
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium">{product.reference}</span>
          </div>
          <div className="text-xs opacity-70 mb-1">◼ {product.barcode}</div>
          <div className="text-sm leading-tight">{product.description}</div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold">{product.brand}</span>
            </div>
            <div className="text-xs opacity-70">{product.location}</div>
          </div>
        </div>
      </div>
      
      <div className="flex gap-3 ml-2">
        {product.prices.map((price, index) => (
          <div 
            key={index} 
            className="flex flex-col text-center w-24 bg-white/20 rounded-xl py-1 px-2"
          >
            <span className="text-xs opacity-70">{price.type}</span>
            <span className="font-medium">{price.value.toFixed(2)}</span>
          </div>
        ))}
        
        <div className="flex items-center justify-center w-10 h-10 opacity-70">
          ⊙
        </div>
      </div>
    </div>
  );
};

const ProductDisplay: React.FC<ProductDisplayProps> = ({ products, className }) => {
  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="flex justify-between items-center">
        <div className="flex gap-4 text-sm">
          <div className="ios-surface px-3 py-1 text-sm font-medium">Catalogue</div>
          <div className="opacity-70 px-3 py-1 text-sm">Stock</div>
          <div className="opacity-70 px-3 py-1 text-sm">PA HT</div>
          <div className="opacity-70 px-3 py-1 text-sm">Eco ...</div>
        </div>
        
        <button className="ios-button text-sm">
          Voir stock et prix (3)
        </button>
      </div>
      
      <div className="space-y-4">
        {products.map((product) => (
          <ProductRow key={product.id} product={product} />
        ))}
      </div>
      
      <div className="text-sm opacity-70 py-4 text-center">
        1 sur 2
      </div>
    </div>
  );
};

export default ProductDisplay;
