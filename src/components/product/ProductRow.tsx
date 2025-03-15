
import React, { useState } from 'react';
import { Product } from '@/services/railway';
import PricingTable from './pricing/PricingTable';
import ProductInfo from './info/ProductInfo';
import BrandDisplay from './info/BrandDisplay';
import PriceInfoDialog from './PriceInfoDialog';

interface ProductRowProps {
  product: Product;
}

const ProductRow: React.FC<ProductRowProps> = ({ product }) => {
  const [openInfoDialog, setOpenInfoDialog] = useState<string | null>(null);
  
  const handleOpenDialog = (priceType: string) => {
    setOpenInfoDialog(priceType);
  };

  const prices = product.prices || [];
  
  return (
    <div className="ios-glass flex items-center gap-4 p-4 mb-4 animate-fade-in">
      <PricingTable product={product} onOpenDialog={handleOpenDialog} />
      
      {prices.map((price, index) => (
        <PriceInfoDialog 
          key={index}
          product={product}
          price={price}
          isOpen={openInfoDialog === price.type}
          onClose={() => setOpenInfoDialog(null)}
        />
      ))}
      
      <div className="w-10 flex-shrink-0">
        <div className="flex items-center justify-center w-6 h-6 text-xs opacity-70">
          ❤
        </div>
      </div>
      
      <ProductInfo product={product} />
      <BrandDisplay product={product} />
    </div>
  );
};

export default ProductRow;
