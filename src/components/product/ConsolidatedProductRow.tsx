
import React, { useState } from 'react';
import { Product } from '@/services/railway';
import { ChevronDown, ChevronUp, Table, Info } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import ProductInfo from './info/ProductInfo';
import BrandDisplay from './info/BrandDisplay';
import PriceInfoDialog from './PriceInfoDialog';
import { cn } from '@/lib/utils';

interface ConsolidatedProductRowProps {
  products: Product[];
  groupKey: string;
  groupType: 'barcode' | 'supplier_code' | 'reference';
}

const ConsolidatedProductRow: React.FC<ConsolidatedProductRowProps> = ({ 
  products, 
  groupKey, 
  groupType 
}) => {
  const [openInfoDialog, setOpenInfoDialog] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  
  // Get a representative product for the main display
  // Choose the one with the most complete information
  const getPrimaryProduct = (): Product => {
    if (products.length === 0) return {} as Product;
    
    // Sort by completeness and pick the most complete one
    return [...products].sort((a, b) => {
      const aFields = Object.values(a).filter(Boolean).length;
      const bFields = Object.values(b).filter(Boolean).length;
      return bFields - aFields;
    })[0];
  };
  
  const primaryProduct = getPrimaryProduct();
  const sourceTables = [...new Set(products.map(p => p.source_table || 'unknown'))];
  
  const handleOpenDialog = (priceType: string) => {
    setOpenInfoDialog(priceType);
  };

  const handleSelectSource = (source: string) => {
    setSelectedSource(selectedSource === source ? null : source);
  };
  
  const getUniqueValues = (fieldName: keyof Product): string[] => {
    const values = new Set<string>();
    products.forEach(product => {
      if (product[fieldName]) {
        values.add(String(product[fieldName]));
      }
    });
    return Array.from(values);
  };
  
  // Get products for the selected source or all if none selected
  const getDisplayProducts = (): Product[] => {
    if (!selectedSource) return products;
    return products.filter(p => p.source_table === selectedSource);
  };

  return (
    <div className="ios-glass p-4 mb-4 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="w-10 flex-shrink-0">
          <div className="flex items-center justify-center w-6 h-6 text-xs opacity-70">
            ❤
          </div>
        </div>
        
        <ProductInfo product={primaryProduct} />
        <BrandDisplay product={primaryProduct} />
        
        <div className="flex items-center gap-2 ml-auto">
          <div className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
            {groupType === 'barcode' ? 'EAN' : groupType === 'supplier_code' ? 'Code' : 'Ref'}: {groupKey}
          </div>
          <div className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
            {products.length} source{products.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>
      
      <Collapsible className="w-full mt-4">
        <CollapsibleTrigger className="flex items-center justify-center w-full py-1 text-sm text-blue-600 hover:text-blue-800 transition-colors">
          <div className="flex items-center gap-1">
            <span>Voir les détails</span>
            <ChevronDown className="h-4 w-4 ui-open:rotate-180 ui-open:transform transition-transform" />
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-4">
          <div className="flex items-center gap-2 mb-4 overflow-x-auto py-1">
            <span className="text-sm font-medium">Sources:</span>
            {sourceTables.map(source => (
              <button
                key={source}
                onClick={() => handleSelectSource(source)}
                className={cn(
                  "text-xs px-3 py-1 rounded-full transition-colors whitespace-nowrap",
                  selectedSource === source 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-100 hover:bg-gray-200"
                )}
              >
                {source}
              </button>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="ios-glass p-4 rounded-xl overflow-hidden">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Table className="h-4 w-4" />
                Comparaison des champs
              </h3>
              
              <div className="rounded-xl overflow-hidden border border-gray-100">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="p-2 text-left font-medium text-blue-800 border-b border-white/30">Champ standard</th>
                      <th className="p-2 text-left font-medium text-blue-800 border-b border-white/30">Valeur</th>
                      <th className="p-2 text-left font-medium text-blue-800 border-b border-white/30">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { key: 'reference', label: 'Référence' },
                      { key: 'barcode', label: 'Code-barres' },
                      { key: 'description', label: 'Description' },
                      { key: 'brand', label: 'Marque' },
                      { key: 'supplier_code', label: 'Code fournisseur' },
                      { key: 'name', label: 'Nom' },
                      { key: 'location', label: 'Emplacement' },
                      { key: 'category', label: 'Catégorie' }
                    ].map((field, index) => {
                      const uniqueValues = getUniqueValues(field.key as keyof Product);
                      const hasDifferences = uniqueValues.length > 1;
                      
                      return (
                        <tr key={field.key} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="p-2 border-b border-gray-100">{field.label}</td>
                          <td className={cn(
                            "p-2 border-b border-gray-100",
                            hasDifferences && "text-orange-600 font-medium"
                          )}>
                            {hasDifferences ? (
                              <span>{uniqueValues.length} valeurs différentes</span>
                            ) : uniqueValues.length === 1 ? (
                              uniqueValues[0]
                            ) : (
                              <span className="text-gray-400">Non défini</span>
                            )}
                          </td>
                          <td className="p-2 border-b border-gray-100">
                            {hasDifferences ? (
                              <span className="text-xs bg-orange-100 text-orange-800 px-1 py-0.5 rounded">
                                Plusieurs sources
                              </span>
                            ) : uniqueValues.length === 1 ? (
                              <span className="text-xs bg-blue-50 text-blue-800 px-1 py-0.5 rounded-md">
                                {products.find(p => String(p[field.key as keyof Product]) === uniqueValues[0])?.source_table}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="ios-glass p-4 rounded-xl overflow-hidden">
              <h3 className="text-sm font-medium mb-3">Détails par source</h3>
              
              <Accordion type="single" collapsible className="w-full">
                {getDisplayProducts().map((product, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-xs py-2">
                      {product.source_table} {product.reference ? `- ${product.reference}` : ''}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                        {Object.entries(product)
                          .filter(([key]) => !['source_table', 'prices', 'eco'].includes(key))
                          .map(([key, value]) => value && (
                            <div key={key} className="flex flex-col">
                              <span className="text-gray-500">{key}</span>
                              <span className="font-medium">{String(value)}</span>
                            </div>
                          ))}
                      </div>
                      
                      {product.prices && product.prices.length > 0 && (
                        <div className="mt-3">
                          <h4 className="font-medium mb-1">Prix:</h4>
                          <div className="flex gap-2 flex-wrap">
                            {product.prices.map((price, idx) => (
                              <div key={idx} className="text-xs bg-blue-50 px-2 py-1 rounded flex items-center gap-1">
                                <span>{price.type}:</span>
                                <span className="font-medium">{price.value.toFixed(2)} €</span>
                                <button 
                                  onClick={() => handleOpenDialog(price.type)}
                                  className="ml-1 text-blue-600"
                                >
                                  <Info className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
      
      {primaryProduct.prices && primaryProduct.prices.map((price, index) => (
        <PriceInfoDialog 
          key={index}
          product={primaryProduct}
          price={price}
          isOpen={openInfoDialog === price.type}
          onClose={() => setOpenInfoDialog(null)}
        />
      ))}
    </div>
  );
};

export default ConsolidatedProductRow;
