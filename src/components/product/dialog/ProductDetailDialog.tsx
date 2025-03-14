
import React from 'react';
import { Product } from '@/services/railway';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { InfoSection } from './InfoSection';
import { PriceSection } from './PriceSection';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarcodeIcon, Database, Tag, Package, Warehouse, CircleDollarSign, ShoppingCart } from 'lucide-react';

interface ProductDetailDialogProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const ProductDetailDialog: React.FC<ProductDetailDialogProps> = ({
  product,
  isOpen,
  onClose
}) => {
  // Calculate price information if available
  const price = product.prices && product.prices.length > 0 
    ? (typeof product.prices[0].value === 'number' ? product.prices[0].value : 0) 
    : 0;
  
  const ecoTax = product.eco && product.prices && product.prices.length > 0
    ? product.eco[product.prices[0].type]
    : undefined;
    
  const totalPrice = price + (typeof ecoTax === 'number' ? ecoTax : 0);
  
  // Extract all product fields
  const allFields = Object.entries(product)
    .filter(([key]) => !['prices', 'eco', 'source_table', 'name', 'description', 'id'].includes(key))
    .map(([key, value]) => ({
      label: key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' '),
      value: value !== null && value !== undefined ? String(value) : 'N/D',
      key
    }));
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden dark:bg-gray-800 dark:text-white">
        <DialogHeader>
          <Badge variant="outline" className="w-fit mb-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 flex items-center gap-1">
            <Database className="h-3 w-3" />
            <span>{product.source_table || 'products'}</span>
          </Badge>
          <DialogTitle className="text-xl">{product.reference || product.id}</DialogTitle>
          <DialogDescription>
            {product.name || product.description || "Sans description"}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="mt-4 h-[50vh]">
          <div className="space-y-6 pr-4">
            {/* Main information */}
            <InfoSection 
              title="Informations principales" 
              items={[
                { 
                  label: "Référence", 
                  value: product.reference || "N/D", 
                  icon: <Tag className="h-4 w-4" /> 
                },
                { 
                  label: "Marque", 
                  value: product.brand || "Sans marque", 
                  highlight: !!product.brand && product.brand !== "NULL"
                },
                { 
                  label: "Description", 
                  value: product.description || "Sans description" 
                }
              ]}
            />
            
            {/* Codes */}
            <InfoSection 
              title="Codes et identifiants" 
              items={[
                { 
                  label: "Code EAN/Barcode", 
                  value: product.barcode || product.ean || "N/D",
                  icon: <BarcodeIcon className="h-4 w-4" /> 
                },
                { 
                  label: "Code fournisseur", 
                  value: product.supplier_code || "N/D" 
                },
                { 
                  label: "ID interne", 
                  value: product.id || "N/D" 
                }
              ]}
            />
            
            {/* Stock information */}
            <InfoSection 
              title="Informations de stock" 
              items={[
                { 
                  label: "Stock disponible", 
                  value: product.stock !== undefined ? String(product.stock) : "N/D",
                  highlight: product.stock !== undefined && product.stock > 0,
                  icon: <Package className="h-4 w-4" /> 
                },
                { 
                  label: "Emplacement", 
                  value: product.location || "N/D",
                  icon: <Warehouse className="h-4 w-4" /> 
                }
              ]}
            />
            
            {/* Price information */}
            {price > 0 && (
              <PriceSection 
                price={price}
                ecoTax={ecoTax as number | undefined}
                totalPrice={totalPrice}
              />
            )}
            
            {/* All other fields */}
            <div>
              <h3 className="text-sm font-medium mb-2">Toutes les informations</h3>
              <div className="space-y-1 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-2">
                {allFields.map((field) => (
                  <div key={field.key} className="flex justify-between p-1 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{field.label}:</span>
                    <span className="text-xs font-medium ml-2">{field.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter className="flex justify-between items-center pt-4">
          <Button variant="outline" onClick={onClose} className="dark:bg-gray-700 dark:hover:bg-gray-600">
            Fermer
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-1 dark:bg-blue-900/50 dark:hover:bg-blue-800/50">
              <CircleDollarSign className="h-4 w-4" />
              Voir prix
            </Button>
            <Button className="flex items-center gap-1 dark:bg-green-900/80 dark:hover:bg-green-800/80">
              <ShoppingCart className="h-4 w-4" />
              Ajouter au panier
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailDialog;
