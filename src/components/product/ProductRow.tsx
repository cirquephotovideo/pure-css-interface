
import React, { useState } from 'react';
import { Product } from '@/services/railway';
import PricingTable from './pricing/PricingTable';
import ProductInfo from './info/ProductInfo';
import BrandDisplay from './info/BrandDisplay';
import PriceInfoDialog from './PriceInfoDialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database } from 'lucide-react';

interface ProductRowProps {
  productGroup: Product[];
  onSelectTable?: (table: string) => void;
}

const ProductRow: React.FC<ProductRowProps> = ({ productGroup, onSelectTable }) => {
  const [openInfoDialog, setOpenInfoDialog] = useState<string | null>(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  
  // If there's only one product in the group, show it directly
  if (productGroup.length === 1) {
    const product = productGroup[0];
    const prices = product.prices || [];
    
    return (
      <div className="ios-glass flex items-center gap-4 p-4 mb-4 animate-fade-in">
        <PricingTable product={product} onOpenDialog={(priceType) => setOpenInfoDialog(priceType)} />
        
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
        <BrandDisplay 
          product={product} 
          onClick={() => product.source_table && onSelectTable?.(product.source_table)}
        />
      </div>
    );
  }
  
  // For multiple products in a group, show a tabbed interface
  const activeProduct = productGroup[activeTabIndex];
  const prices = activeProduct.prices || [];
  
  return (
    <div className="ios-glass p-4 mb-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="outline" className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5">
          {productGroup.length} fiches produit
        </Badge>
        <Badge variant="outline" className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5">
          Même code: {activeProduct.barcode || activeProduct.ean || activeProduct.supplier_code}
        </Badge>
      </div>
      
      <Tabs defaultValue="0" onValueChange={(value) => setActiveTabIndex(parseInt(value))}>
        <TabsList className="mb-4">
          {productGroup.map((product, index) => (
            <TabsTrigger key={index} value={index.toString()} className="flex items-center gap-1">
              <Database className="h-3 w-3" />
              <span className="truncate max-w-[100px]">{product.source_table}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value={activeTabIndex.toString()} className="flex items-center gap-4">
          <PricingTable product={activeProduct} onOpenDialog={(priceType) => setOpenInfoDialog(priceType)} />
          
          {prices.map((price, index) => (
            <PriceInfoDialog 
              key={index}
              product={activeProduct}
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
          
          <ProductInfo product={activeProduct} />
          <BrandDisplay 
            product={activeProduct} 
            onClick={() => activeProduct.source_table && onSelectTable?.(activeProduct.source_table)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductRow;
