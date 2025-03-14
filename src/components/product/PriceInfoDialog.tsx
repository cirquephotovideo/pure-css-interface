
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Database } from 'lucide-react';
import { Product } from '@/services/railway';

interface PriceInfoDialogProps {
  product: Product;
  price: {
    type: string;
    value: number;
  };
  isOpen: boolean;
  onClose: () => void;
}

const PriceInfoDialog: React.FC<PriceInfoDialogProps> = ({
  product,
  price,
  isOpen,
  onClose
}) => {
  const eco = product.eco || {};
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Détails du Prix - {price.type}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 p-3 rounded-md shadow-sm">
              <p className="text-xs opacity-70">Référence</p>
              <p className="font-medium">{product.reference}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md shadow-sm">
              <p className="text-xs opacity-70">Catalogue</p>
              <p className="font-medium">{price.type}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md shadow-sm">
              <p className="text-xs opacity-70">Prix d'achat HT</p>
              <p className="font-medium">{price.value.toFixed(2)} €</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md shadow-sm">
              <p className="text-xs opacity-70">Eco-participation</p>
              <p className="font-medium">{eco && eco[price.type] ? eco[price.type].toFixed(2) : '0.00'} €</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md shadow-sm">
              <p className="text-xs opacity-70">Marque</p>
              <p className="font-medium">{product.brand}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md shadow-sm">
              <p className="text-xs opacity-70">Emplacement</p>
              <p className="font-medium">{product.location}</p>
            </div>
            {product.supplier_code && (
              <div className="bg-gray-50 p-3 rounded-md shadow-sm">
                <p className="text-xs opacity-70">Code fournisseur</p>
                <p className="font-medium">{product.supplier_code}</p>
              </div>
            )}
            {product.ean && (
              <div className="bg-gray-50 p-3 rounded-md shadow-sm">
                <p className="text-xs opacity-70">EAN</p>
                <p className="font-medium">{product.ean}</p>
              </div>
            )}
            {product.source_table && (
              <div className="bg-gray-50 p-3 rounded-md shadow-sm col-span-2">
                <p className="text-xs opacity-70">Source</p>
                <p className="font-medium flex items-center">
                  <Database className="h-3 w-3 mr-1" />
                  {product.source_table}
                </p>
              </div>
            )}
          </div>
          <div className="bg-gray-50 p-3 rounded-md shadow-sm">
            <p className="text-xs opacity-70">Description</p>
            <p className="text-sm">{product.description}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PriceInfoDialog;
