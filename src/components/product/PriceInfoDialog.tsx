
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Product } from '@/services/railway';
import { InfoSection } from './dialog/InfoSection';
import { PriceSection } from './dialog/PriceSection';
import { InfoItem } from './dialog/InfoItem';

interface PriceInfoDialogProps {
  product: Product;
  price: { type: string; value: number };
  isOpen: boolean;
  onClose: () => void;
}

const PriceInfoDialog: React.FC<PriceInfoDialogProps> = ({ 
  product, 
  price, 
  isOpen, 
  onClose 
}) => {
  // Handle eco tax for this specific price type
  const ecoTax = product.eco && product.eco[price.type];
  
  // Format price with eco tax
  const totalPrice = ecoTax ? (price.value + ecoTax) : price.value;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-blue-700">
              {product.reference || product.id || 'Produit'}
            </span>
            <span className="text-xs bg-blue-100 text-blue-800 py-0.5 px-2 rounded-full">
              {price.type}
            </span>
          </DialogTitle>
          <DialogDescription>
            {product.name || product.description || 'Détails du produit'}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            {/* Pricing section */}
            <PriceSection price={price.value} ecoTax={ecoTax} totalPrice={totalPrice} />
            
            {/* Product details */}
            <InfoSection 
              title="Identifiants produit" 
              items={[
                { label: "Référence", value: product.reference, icon: "box", highlight: true },
                { label: "Code-barres", value: product.barcode, icon: "barcode" },
                { label: "EAN", value: product.ean && product.ean !== product.barcode ? product.ean : null, icon: "barcode" },
                { label: "SKU", value: product.sku, icon: "box" },
                { label: "Fournisseur", value: product.supplier_code, icon: "user" }
              ]}
            />
            
            <Separator />
            
            {/* Product information */}
            <InfoSection 
              title="Informations produit" 
              items={[
                { label: "Nom", value: product.name, icon: "shopping-basket", highlight: true },
                { label: "Description", value: product.description && product.description !== product.name ? product.description : null, icon: "shopping-basket" },
                { label: "Marque", value: product.brand, icon: "building" },
                { label: "Catégorie", value: product.category, icon: "shopping-basket" },
                { label: "Sous-catégorie", value: product.subcategory, icon: "shopping-basket" }
              ]}
            />
            
            <Separator />
            
            {/* Stock information */}
            <InfoSection 
              title="Stock et localisation" 
              items={[
                { label: "Quantité en stock", value: product.stock !== undefined ? product.stock : "N/D", icon: "package", highlight: product.stock !== undefined },
                { label: "Emplacement", value: product.location, icon: "truck" }
              ]}
            />
            
            <Separator />
            
            {/* Source information */}
            <InfoSection 
              title="Source de données" 
              items={[
                { label: "Table source", value: product.source_table || "products", icon: "database" },
                { label: "Identifiant en base", value: product.id, icon: "database" }
              ]}
            />
            
            <Separator />
            
            {/* Add any additional fields that might be present */}
            <div className="text-xs text-gray-500 mt-2 italic">
              Les données affichées dépendent des informations disponibles dans la base de données.
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PriceInfoDialog;
