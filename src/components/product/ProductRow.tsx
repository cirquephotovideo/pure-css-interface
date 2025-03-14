
import React, { useState } from 'react';
import { Product } from '@/services/railway';
import PricingTable from './pricing/PricingTable';
import ProductInfo from './info/ProductInfo';
import BrandDisplay from './info/BrandDisplay';
import PriceInfoDialog from './PriceInfoDialog';
import ProductDetailDialog from './dialog/ProductDetailDialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Layers, FileText, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductRowProps {
  productGroup: Product[];
  onSelectTable?: (table: string) => void;
}

const ProductRow: React.FC<ProductRowProps> = ({ productGroup, onSelectTable }) => {
  const [openInfoDialog, setOpenInfoDialog] = useState<string | null>(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  
  // If there's only one product in the group, show it directly
  if (productGroup.length === 1) {
    const product = productGroup[0];
    const prices = product.prices || [];
    
    return (
      <div className="ios-glass flex items-center gap-4 p-4 mb-4 animate-fade-in dark:bg-gray-800/70">
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
        
        <div className="w-10 flex-shrink-0 flex flex-col items-center gap-2">
          <button 
            onClick={() => setShowDetailDialog(true)} 
            className="flex items-center justify-center w-7 h-7 text-blue-600 dark:text-blue-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Voir détails complets"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
        
        <ProductInfo product={product} />
        <BrandDisplay 
          product={product} 
          onClick={() => product.source_table && onSelectTable?.(product.source_table)}
        />
        
        <ProductDetailDialog 
          product={product}
          isOpen={showDetailDialog}
          onClose={() => setShowDetailDialog(false)}
        />
      </div>
    );
  }
  
  // For multiple products in a group, show a tabbed interface
  const activeProduct = productGroup[activeTabIndex];
  const prices = activeProduct.prices || [];
  
  return (
    <div className="ios-glass p-4 mb-4 animate-fade-in dark:bg-gray-800/70">
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs px-2 py-0.5 flex items-center gap-1">
          <Layers className="h-3 w-3" />
          <span>{productGroup.length} fiches produit</span>
        </Badge>
        <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 text-xs px-2 py-0.5 flex items-center gap-1">
          <FileText className="h-3 w-3 mr-1" />
          <span>Même code: {activeProduct.barcode || activeProduct.ean || activeProduct.supplier_code}</span>
        </Badge>
      </div>
      
      <Tabs defaultValue="0" onValueChange={(value) => setActiveTabIndex(parseInt(value))}>
        <TabsList className="mb-4 bg-gray-100 dark:bg-gray-700 p-1">
          {productGroup.map((product, index) => (
            <TabsTrigger 
              key={index} 
              value={index.toString()} 
              className="flex items-center gap-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
            >
              <Database className="h-3 w-3" />
              <span className="truncate max-w-[100px]">{product.source_table || 'products'}</span>
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
          
          <div className="w-10 flex-shrink-0 flex flex-col items-center gap-2">
            <button 
              onClick={() => setShowDetailDialog(true)} 
              className="flex items-center justify-center w-7 h-7 text-blue-600 dark:text-blue-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Voir détails complets"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
          
          <ProductInfo product={activeProduct} />
          <BrandDisplay 
            product={activeProduct} 
            onClick={() => activeProduct.source_table && onSelectTable?.(activeProduct.source_table)}
          />
        </TabsContent>
      </Tabs>
      
      <ProductDetailDialog 
        product={activeProduct}
        isOpen={showDetailDialog}
        onClose={() => setShowDetailDialog(false)}
      />
    </div>
  );
};

export default ProductRow;
