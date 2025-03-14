
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Info, Database } from 'lucide-react';
import { Product } from '@/services/railway';

interface ProductDisplayProps {
  products?: Product[];
  className?: string;
}

const ProductRow: React.FC<{
  product: Product;
}> = ({
  product
}) => {
  const [openInfoDialog, setOpenInfoDialog] = useState<string | null>(null);
  const handleOpenDialog = (priceType: string) => {
    setOpenInfoDialog(priceType);
  };

  // Handle potentially missing data in the product object
  const prices = product.prices || [];
  const eco = product.eco || {};
  
  return (
    <div className="ios-glass flex items-center gap-4 p-4 mb-4 animate-fade-in">
      <div className="w-[340px] flex-shrink-0 mr-3">
        <Table className="w-full bg-white/60 rounded-xl overflow-hidden text-xs shadow-sm">
          <TableHeader className="bg-white/80">
            <TableRow>
              <TableHead className="h-8 px-2 text-xs font-semibold text-black">Catalogue</TableHead>
              <TableHead className="h-8 px-2 text-xs font-semibold text-black">Stock</TableHead>
              <TableHead className="h-8 px-2 text-xs font-semibold text-black">PA HT</TableHead>
              <TableHead className="h-8 px-2 text-xs font-semibold text-black">Eco</TableHead>
              <TableHead className="h-8 w-8 px-2 text-xs font-semibold text-black">...</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prices.length > 0 ? (
              prices.map((price, index) => (
                <TableRow key={index} className="border-b border-white/30 hover:bg-white/70">
                  <TableCell className="py-2 px-2 font-medium">{price.type}</TableCell>
                  <TableCell className="py-2 px-2">{product.stock || ''}</TableCell>
                  <TableCell className="py-2 px-2 font-medium">{price.value.toFixed(2)}</TableCell>
                  <TableCell className="py-2 px-2">
                    {eco && eco[price.type] ? eco[price.type].toFixed(2) : ''}
                  </TableCell>
                  <TableCell className="py-2 px-2 text-center">
                    <button onClick={() => handleOpenDialog(price.type)} className="cursor-pointer hover:bg-white/90 rounded-full p-1 transition-colors">
                      <Info className="h-4 w-4 text-black/70" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="border-b border-white/30">
                <TableCell colSpan={5} className="py-2 px-2 text-center text-gray-500">
                  Aucun prix disponible
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Price Info Dialog */}
      {prices.map((price, index) => (
        <Dialog key={index} open={openInfoDialog === price.type} onOpenChange={() => setOpenInfoDialog(null)}>
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
      ))}
      
      <div className="w-10 flex-shrink-0">
        <div className="flex items-center justify-center w-6 h-6 text-xs opacity-70">
          ❤
        </div>
      </div>
      
      <div className="flex gap-4 items-center flex-1">
        <div className="w-20 h-16 bg-white/50 rounded-xl flex items-center justify-center flex-shrink-0">
          <img src={product.imageUrl || "/placeholder.svg"} alt={product.reference} className="max-w-full max-h-full object-contain" />
        </div>
        
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium">{product.reference}</span>
            {product.source_table && product.source_table !== 'products' && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full flex items-center">
                <Database className="h-3 w-3 mr-1" />
                {product.source_table}
              </span>
            )}
          </div>
          <div className="text-xs opacity-70 mb-1">
            <span className="mr-2">◼ {product.barcode}</span>
            {product.ean && <span className="mr-2">EAN: {product.ean}</span>}
            {product.supplier_code && <span>Fournisseur: {product.supplier_code}</span>}
          </div>
          <div className="text-sm leading-tight">{product.name || product.description}</div>
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
    </div>
  );
};

const ProductDisplay: React.FC<ProductDisplayProps> = ({
  products = [], // Default to empty array if products is not provided
  className
}) => {
  // Count unique source tables
  const sourceTables = new Set(products.map(product => product.source_table || 'products'));
  
  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="flex justify-between items-center">
        <div className="flex gap-4 text-sm">
          <div className="ios-surface px-3 py-1 text-sm font-medium">Catalogue</div>
          <div className="opacity-70 px-3 py-1 text-sm">Stock</div>
          <div className="opacity-70 px-3 py-1 text-sm"></div>
          <div className="opacity-70 px-3 py-1 text-sm"></div>
        </div>
        
        <button className="ios-button text-sm">
          Voir stock et prix ({products.length})
        </button>
      </div>
      
      {sourceTables.size > 1 && (
        <div className="flex gap-2 items-center bg-blue-50 p-2 rounded-lg text-sm">
          <Database className="h-4 w-4 text-blue-500" />
          <span>Résultats de {sourceTables.size} tables: {Array.from(sourceTables).join(', ')}</span>
        </div>
      )}
      
      <div className="space-y-4">
        {products.map(product => <ProductRow key={product.id} product={product} />)}
      </div>
      
      <div className="text-sm opacity-70 py-4 text-center">
        {products.length > 0 ? `1 sur ${Math.ceil(products.length / 10)}` : 'Aucun résultat'}
      </div>
    </div>
  );
};

export default ProductDisplay;
