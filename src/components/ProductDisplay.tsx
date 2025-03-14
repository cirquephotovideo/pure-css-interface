import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Info } from 'lucide-react';
interface Product {
  id: string;
  reference: string;
  barcode: string;
  description: string;
  brand: string;
  location: string;
  imageUrl: string;
  catalog: string;
  prices: {
    type: string;
    value: number;
  }[];
  eco?: {
    [key: string]: number;
  };
}
interface ProductDisplayProps {
  products: Product[];
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
  return <div className="ios-glass flex items-center gap-4 p-4 mb-4 animate-fade-in">
      <div className="w-[340px] flex-shrink-0 mr-3">
        <Table className="w-full bg-white/20 rounded-xl overflow-hidden text-xs">
          <TableHeader className="bg-white/30">
            <TableRow>
              <TableHead className="h-8 px-2 text-xs font-medium">Catalogue</TableHead>
              <TableHead className="h-8 px-2 text-xs font-medium">Stock</TableHead>
              <TableHead className="h-8 px-2 text-xs font-medium">PA HT</TableHead>
              <TableHead className="h-8 px-2 text-xs font-medium">Eco</TableHead>
              <TableHead className="h-8 w-8 px-2 text-xs font-medium">...</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {product.prices.map((price, index) => <TableRow key={index} className="border-b border-white/10">
                <TableCell className="py-1 px-2">{price.type}</TableCell>
                <TableCell className="py-1 px-2"></TableCell>
                <TableCell className="py-1 px-2">{price.value.toFixed(2)}</TableCell>
                <TableCell className="py-1 px-2">
                  {product.eco && product.eco[price.type] ? product.eco[price.type].toFixed(2) : ''}
                </TableCell>
                <TableCell className="py-1 px-2 text-center">
                  <button onClick={() => handleOpenDialog(price.type)} className="cursor-pointer hover:bg-white/20 rounded-full p-1 transition-colors">
                    <Info className="h-3 w-3" />
                  </button>
                </TableCell>
              </TableRow>)}
          </TableBody>
        </Table>
      </div>
      
      {/* Price Info Dialog */}
      {product.prices.map((price, index) => <Dialog key={index} open={openInfoDialog === price.type} onOpenChange={() => setOpenInfoDialog(null)}>
          <DialogContent className="ios-glass max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center">Détails du Prix - {price.type}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <p className="text-xs opacity-70">Référence</p>
                  <p className="font-medium">{product.reference}</p>
                </div>
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <p className="text-xs opacity-70">Catalogue</p>
                  <p className="font-medium">{price.type}</p>
                </div>
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <p className="text-xs opacity-70">Prix d'achat HT</p>
                  <p className="font-medium">{price.value.toFixed(2)} €</p>
                </div>
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <p className="text-xs opacity-70">Eco-participation</p>
                  <p className="font-medium">{product.eco && product.eco[price.type] ? product.eco[price.type].toFixed(2) : '0.00'} €</p>
                </div>
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <p className="text-xs opacity-70">Marque</p>
                  <p className="font-medium">{product.brand}</p>
                </div>
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <p className="text-xs opacity-70">Emplacement</p>
                  <p className="font-medium">{product.location}</p>
                </div>
              </div>
              <div className="bg-white p-3 rounded-md shadow-sm">
                <p className="text-xs opacity-70">Description</p>
                <p className="text-sm">{product.description}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>)}
      
      <div className="w-10 flex-shrink-0">
        <div className="flex items-center justify-center w-6 h-6 text-xs opacity-70">
          ❤
        </div>
      </div>
      
      <div className="flex gap-4 items-center flex-1">
        <div className="w-20 h-16 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <img src={product.imageUrl || "public/placeholder.svg"} alt={product.reference} className="max-w-full max-h-full object-contain" />
        </div>
        
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium">{product.reference}</span>
          </div>
          <div className="text-xs opacity-70 mb-1">◼ {product.barcode}</div>
          <div className="text-sm leading-tight">{product.description}</div>
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
    </div>;
};
const ProductDisplay: React.FC<ProductDisplayProps> = ({
  products,
  className
}) => {
  return <div className={cn("w-full space-y-4", className)}>
      <div className="flex justify-between items-center">
        <div className="flex gap-4 text-sm">
          <div className="ios-surface px-3 py-1 text-sm font-medium">Catalogue</div>
          <div className="opacity-70 px-3 py-1 text-sm">Stock</div>
          <div className="opacity-70 px-3 py-1 text-sm">
        </div>
          <div className="opacity-70 px-3 py-1 text-sm">
        </div>
        </div>
        
        <button className="ios-button text-sm">
          Voir stock et prix (3)
        </button>
      </div>
      
      <div className="space-y-4">
        {products.map(product => <ProductRow key={product.id} product={product} />)}
      </div>
      
      <div className="text-sm opacity-70 py-4 text-center">
        1 sur 2
      </div>
    </div>;
};
export default ProductDisplay;