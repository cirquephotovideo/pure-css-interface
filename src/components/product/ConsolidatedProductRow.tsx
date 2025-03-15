import React, { useState } from 'react';
import { Product } from '@/services/railway';
import { ChevronDown, ChevronUp, Table, Info, Database, ExternalLink } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import ProductInfo from './info/ProductInfo';
import BrandDisplay from './info/BrandDisplay';
import PriceInfoDialog from './PriceInfoDialog';
import { cn } from '@/lib/utils';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  const [selectedProductForDialog, setSelectedProductForDialog] = useState<Product | null>(null);
  
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

  const handleOpenProductDetails = (product: Product) => {
    setSelectedProductForDialog(product);
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

  // Helper function to get unique prices with their sources
  const getUniquePrices = (): { value: number; source: string }[] => {
    const priceMap = new Map<string, { value: number; source: string }>();
    
    products.forEach(product => {
      if (product.prices && product.prices.length > 0) {
        // Use the first price for simplicity
        const price = product.prices[0];
        const key = `${price.value}-${product.source_table}`;
        
        if (!priceMap.has(key)) {
          priceMap.set(key, {
            value: price.value,
            source: product.source_table || 'unknown'
          });
        }
      }
    });
    
    return Array.from(priceMap.values());
  };

  // Helper function to get unique stocks with their sources
  const getUniqueStocks = (): { value: number; source: string }[] => {
    const stockMap = new Map<string, { value: number; source: string }>();
    
    products.forEach(product => {
      if (product.stock !== undefined) {
        const key = `${product.stock}-${product.source_table}`;
        
        if (!stockMap.has(key)) {
          stockMap.set(key, {
            value: product.stock,
            source: product.source_table || 'unknown'
          });
        }
      }
    });
    
    return Array.from(stockMap.values());
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
          
          {/* Expanded Field Comparison Section */}
          <div className="mb-6 bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            <div className="bg-blue-50 p-3 border-b border-blue-100">
              <h3 className="text-sm font-medium flex items-center gap-2 text-blue-800">
                <Table className="h-4 w-4" />
                Comparaison des champs
              </h3>
            </div>
            
            <UITable>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-1/4 font-medium text-blue-800">Champ standard</TableHead>
                  <TableHead className="w-2/4 font-medium text-blue-800">Valeur</TableHead>
                  <TableHead className="w-1/4 font-medium text-blue-800">Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Price field */}
                <TableRow>
                  <TableCell className="font-medium">Prix</TableCell>
                  <TableCell>
                    {getUniquePrices().length > 0 ? (
                      getUniquePrices().length > 1 ? (
                        <span className="text-orange-600 font-medium">
                          {getUniquePrices().length} valeurs différentes
                        </span>
                      ) : (
                        <span>{getUniquePrices()[0].value.toFixed(2)} €</span>
                      )
                    ) : (
                      <span className="text-gray-400">Non défini</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {getUniquePrices().length > 0 ? (
                      getUniquePrices().length > 1 ? (
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                          Plusieurs sources
                        </span>
                      ) : (
                        <span className="text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded-full">
                          {getUniquePrices()[0].source}
                        </span>
                      )
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                </TableRow>
                
                {/* Stock field */}
                <TableRow>
                  <TableCell className="font-medium">Stock</TableCell>
                  <TableCell>
                    {getUniqueStocks().length > 0 ? (
                      getUniqueStocks().length > 1 ? (
                        <span className="text-orange-600 font-medium">
                          {getUniqueStocks().length} valeurs différentes
                        </span>
                      ) : (
                        <span>{getUniqueStocks()[0].value}</span>
                      )
                    ) : (
                      <span className="text-gray-400">Non défini</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {getUniqueStocks().length > 0 ? (
                      getUniqueStocks().length > 1 ? (
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                          Plusieurs sources
                        </span>
                      ) : (
                        <span className="text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded-full">
                          {getUniqueStocks()[0].source}
                        </span>
                      )
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                </TableRow>
                
                {/* Other standard fields */}
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
                    <TableRow key={field.key}>
                      <TableCell className="font-medium">{field.label}</TableCell>
                      <TableCell className={cn(
                        hasDifferences && "text-orange-600 font-medium"
                      )}>
                        {hasDifferences ? (
                          <span>{uniqueValues.length} valeurs différentes</span>
                        ) : uniqueValues.length === 1 ? (
                          uniqueValues[0]
                        ) : (
                          <span className="text-gray-400">Non défini</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {hasDifferences ? (
                          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                            Plusieurs sources
                          </span>
                        ) : uniqueValues.length === 1 ? (
                          <span className="text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded-full">
                            {products.find(p => String(p[field.key as keyof Product]) === uniqueValues[0])?.source_table}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </UITable>
          </div>
          
          {/* Source Details Section */}
          <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            <div className="bg-purple-50 p-3 border-b border-purple-100">
              <h3 className="text-sm font-medium flex items-center gap-2 text-purple-800">
                <Database className="h-4 w-4" />
                Détails par source
              </h3>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              {getDisplayProducts().map((product, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="px-4 py-3 text-sm hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{product.source_table}</span>
                      {product.reference && 
                        <span className="text-gray-500">- {product.reference}</span>
                      }
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      {/* Price Information Card */}
                      {product.prices && product.prices.length > 0 && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <h4 className="text-xs font-medium mb-2 text-blue-800">Prix:</h4>
                          <div className="space-y-2">
                            {product.prices.map((price, idx) => (
                              <div key={idx} className="bg-white p-2 rounded flex items-center justify-between">
                                <span className="text-xs text-gray-600">{price.type}:</span>
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">{price.value.toFixed(2)} €</span>
                                  <button 
                                    onClick={() => handleOpenDialog(price.type)}
                                    className="text-blue-600"
                                  >
                                    <Info className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Stock Information Card */}
                      <div className="bg-green-50 p-3 rounded-lg">
                        <h4 className="text-xs font-medium mb-2 text-green-800">Stock:</h4>
                        <div className="bg-white p-2 rounded flex items-center justify-between">
                          <span className="text-xs text-gray-600">Quantité:</span>
                          <span className="font-medium">
                            {product.stock !== undefined 
                              ? product.stock 
                              : <span className="text-gray-400">Non défini</span>
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleOpenProductDetails(product)}
                      className="w-full mt-2 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 py-2 px-3 rounded flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>Voir tous les détails</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </CollapsibleContent>
      </Collapsible>
      
      {/* Price Info Dialog */}
      {primaryProduct.prices && primaryProduct.prices.map((price, index) => (
        <PriceInfoDialog 
          key={index}
          product={primaryProduct}
          price={price}
          isOpen={openInfoDialog === price.type}
          onClose={() => setOpenInfoDialog(null)}
        />
      ))}
      
      {/* Product Details Dialog */}
      {selectedProductForDialog && (
        <Dialog open={!!selectedProductForDialog} onOpenChange={(open) => !open && setSelectedProductForDialog(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span>Détails de la table {selectedProductForDialog.source_table}</span>
                <span className="text-xs bg-blue-100 text-blue-800 py-0.5 px-2 rounded-full">
                  {selectedProductForDialog.reference || selectedProductForDialog.id || 'Produit'}
                </span>
              </DialogTitle>
              <DialogDescription>
                {selectedProductForDialog.name || selectedProductForDialog.description || 'Informations complètes du produit'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="overflow-y-auto max-h-[60vh] pr-2">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                {/* Prices Section */}
                {selectedProductForDialog.prices && selectedProductForDialog.prices.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-3">Prix et tarification</h3>
                    <div className="space-y-2">
                      {selectedProductForDialog.prices.map((price, idx) => (
                        <div key={idx} className="bg-white p-3 rounded flex items-center justify-between">
                          <span className="text-sm text-gray-700">{price.type}:</span>
                          <span className="text-lg font-semibold text-blue-700">{price.value.toFixed(2)} €</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Stock Section */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-3">Stock et localisation</h3>
                  <div className="space-y-2">
                    <div className="bg-white p-3 rounded flex items-center justify-between">
                      <span className="text-sm text-gray-700">Quantité:</span>
                      <span className="text-lg font-semibold text-green-700">
                        {selectedProductForDialog.stock !== undefined 
                          ? selectedProductForDialog.stock 
                          : 'Non défini'
                        }
                      </span>
                    </div>
                    {selectedProductForDialog.location && (
                      <div className="bg-white p-3 rounded flex items-center justify-between">
                        <span className="text-sm text-gray-700">Emplacement:</span>
                        <span className="text-lg font-semibold text-green-700">
                          {selectedProductForDialog.location}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* All Product Details Table */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium mb-3">Toutes les informations</h3>
                <UITable>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/3">Champ</TableHead>
                      <TableHead className="w-2/3">Valeur</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(selectedProductForDialog)
                      .filter(([key]) => !['prices', 'eco', 'source_table'].includes(key))
                      .map(([key, value]) => value && (
                        <TableRow key={key}>
                          <TableCell className="font-medium">{key}</TableCell>
                          <TableCell>{String(value)}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </UITable>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ConsolidatedProductRow;
