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
import { 
  BarcodeIcon, 
  Box, 
  Building, 
  Calendar, 
  CircleDollarSign, 
  Leaf, 
  Package, 
  ShoppingBasket, 
  Truck, 
  User, 
  Database
} from 'lucide-react';
import { Product } from '@/services/railway';

interface PriceInfoDialogProps {
  product: Product;
  price: { type: string; value: number };
  isOpen: boolean;
  onClose: () => void;
}

interface InfoItemProps {
  label: string;
  value: string | number | null | undefined;
  icon?: React.ReactNode;
  highlight?: boolean;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value, icon, highlight = false }) => {
  if (value === null || value === undefined || value === '') return null;
  
  return (
    <div className="flex items-start gap-2 py-2">
      <div className="mt-0.5 text-gray-400">
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-xs text-gray-500">{label}</div>
        <div className={`text-sm ${highlight ? "font-medium text-blue-700" : ""}`}>
          {value}
        </div>
      </div>
    </div>
  );
};

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
            <div className="bg-blue-50 p-3 rounded-lg">
              <h3 className="text-sm font-medium mb-2">Prix et tarification</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white p-2 rounded">
                  <div className="text-xs text-gray-500">Prix HT</div>
                  <div className="text-lg font-semibold text-blue-700">{price.value.toFixed(2)} €</div>
                </div>
                
                <div className="bg-white p-2 rounded">
                  <div className="text-xs text-gray-500">Eco-taxe</div>
                  <div className="text-lg font-medium text-green-600">{ecoTax ? `${ecoTax.toFixed(2)} €` : "N/A"}</div>
                </div>
                
                <div className="bg-white p-2 rounded col-span-2">
                  <div className="text-xs text-gray-500">Prix total (HT + Eco)</div>
                  <div className="text-xl font-bold text-blue-800">{totalPrice.toFixed(2)} €</div>
                </div>
              </div>
            </div>
            
            {/* Product details */}
            <div>
              <h3 className="text-sm font-medium mb-2">Identifiants produit</h3>
              <div className="space-y-1 bg-gray-50 p-3 rounded-lg">
                <InfoItem 
                  label="Référence" 
                  value={product.reference} 
                  icon={<Box className="h-4 w-4" />} 
                  highlight 
                />
                <InfoItem 
                  label="Code-barres" 
                  value={product.barcode} 
                  icon={<BarcodeIcon className="h-4 w-4" />} 
                />
                <InfoItem 
                  label="EAN" 
                  value={product.ean && product.ean !== product.barcode ? product.ean : null} 
                  icon={<BarcodeIcon className="h-4 w-4" />} 
                />
                <InfoItem 
                  label="SKU" 
                  value={product.sku} 
                  icon={<Box className="h-4 w-4" />} 
                />
                <InfoItem 
                  label="Fournisseur" 
                  value={product.supplier_code} 
                  icon={<User className="h-4 w-4" />} 
                />
              </div>
            </div>
            
            <Separator />
            
            {/* Product information */}
            <div>
              <h3 className="text-sm font-medium mb-2">Informations produit</h3>
              <div className="space-y-1 bg-gray-50 p-3 rounded-lg">
                <InfoItem 
                  label="Nom" 
                  value={product.name} 
                  icon={<ShoppingBasket className="h-4 w-4" />} 
                  highlight 
                />
                <InfoItem 
                  label="Description" 
                  value={product.description && product.description !== product.name ? product.description : null} 
                  icon={<ShoppingBasket className="h-4 w-4" />} 
                />
                <InfoItem 
                  label="Marque" 
                  value={product.brand} 
                  icon={<Building className="h-4 w-4" />} 
                />
                <InfoItem 
                  label="Catégorie" 
                  value={product.category} 
                  icon={<ShoppingBasket className="h-4 w-4" />} 
                />
                <InfoItem 
                  label="Sous-catégorie" 
                  value={product.subcategory} 
                  icon={<ShoppingBasket className="h-4 w-4" />} 
                />
              </div>
            </div>
            
            <Separator />
            
            {/* Stock information */}
            <div>
              <h3 className="text-sm font-medium mb-2">Stock et localisation</h3>
              <div className="space-y-1 bg-gray-50 p-3 rounded-lg">
                <InfoItem 
                  label="Quantité en stock" 
                  value={product.stock !== undefined ? product.stock : "N/D"} 
                  icon={<Package className="h-4 w-4" />} 
                  highlight={product.stock !== undefined}
                />
                <InfoItem 
                  label="Emplacement" 
                  value={product.location} 
                  icon={<Truck className="h-4 w-4" />} 
                />
              </div>
            </div>
            
            <Separator />
            
            {/* Source information */}
            <div>
              <h3 className="text-sm font-medium mb-2">Source de données</h3>
              <div className="space-y-1 bg-gray-50 p-3 rounded-lg">
                <InfoItem 
                  label="Table source" 
                  value={product.source_table || "products"} 
                  icon={<Database className="h-4 w-4" />} 
                />
                <InfoItem 
                  label="Identifiant en base" 
                  value={product.id} 
                  icon={<Database className="h-4 w-4" />} 
                />
              </div>
            </div>
            
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
