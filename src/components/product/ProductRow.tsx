
import React, { useState } from 'react';
import { Product } from '@/services/railway';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Info, Database, Package, BarcodeScan, TrendingUp, User } from 'lucide-react';
import PriceInfoDialog from './PriceInfoDialog';

interface ProductRowProps {
  product: Product;
}

const ProductRow: React.FC<ProductRowProps> = ({ product }) => {
  const [openInfoDialog, setOpenInfoDialog] = useState<string | null>(null);
  const handleOpenDialog = (priceType: string) => {
    setOpenInfoDialog(priceType);
  };

  // Handle potentially missing data in the product object
  const prices = product.prices || [];
  const eco = product.eco || {};
  
  return (
    <div className="ios-glass flex items-center gap-4 p-4 mb-4 animate-fade-in">
      <div className="w-[380px] flex-shrink-0 mr-3">
        <Table className="w-full bg-white/60 rounded-xl overflow-hidden text-xs shadow-sm">
          <TableHeader className="bg-white/80">
            <TableRow>
              <TableHead className="h-8 px-2 text-xs font-semibold text-black">Catalogue</TableHead>
              <TableHead className="h-8 px-2 text-xs font-semibold text-black">Stock</TableHead>
              <TableHead className="h-8 px-2 text-xs font-semibold text-black">PA HT</TableHead>
              <TableHead className="h-8 px-2 text-xs font-semibold text-black">Eco</TableHead>
              <TableHead className="h-8 w-8 px-2 text-xs font-semibold text-black">Détails</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prices.length > 0 ? (
              prices.map((price, index) => (
                <TableRow key={index} className="border-b border-white/30 hover:bg-white/70">
                  <TableCell className="py-2 px-2 font-medium">{price.type}</TableCell>
                  <TableCell className="py-2 px-2">
                    {product.stock ? (
                      <span className={product.stock > 0 ? "text-green-700 font-medium" : "text-red-600"}>
                        {product.stock}
                      </span>
                    ) : "N/D"}
                  </TableCell>
                  <TableCell className="py-2 px-2 font-medium">{price.value.toFixed(2)} €</TableCell>
                  <TableCell className="py-2 px-2">
                    {eco && eco[price.type] ? (
                      <span className="text-blue-600">{eco[price.type].toFixed(2)} €</span>
                    ) : "N/D"}
                  </TableCell>
                  <TableCell className="py-2 px-2 text-center">
                    <button 
                      onClick={() => handleOpenDialog(price.type)} 
                      className="cursor-pointer hover:bg-white/90 rounded-full p-1 transition-colors flex items-center justify-center"
                      title="Voir détails"
                    >
                      <Info className="h-4 w-4 text-blue-600" />
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
      
      <div className="flex gap-4 items-center flex-1">
        <div className="w-20 h-16 bg-white/50 rounded-xl flex items-center justify-center flex-shrink-0">
          <img src={product.imageUrl || "/placeholder.svg"} alt={product.reference} className="max-w-full max-h-full object-contain" />
        </div>
        
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium">{product.reference}</span>
            {product.source_table && product.source_table !== 'products' && (
              <Badge variant="outline" className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full flex items-center">
                <Database className="h-3 w-3 mr-1" />
                {product.source_table}
              </Badge>
            )}
          </div>
          
          <div className="flex gap-2 flex-wrap text-xs opacity-70 mb-1">
            {product.barcode && (
              <span className="flex items-center gap-1">
                <BarcodeScan className="h-3 w-3" />
                {product.barcode}
              </span>
            )}
            
            {product.ean && product.ean !== product.barcode && (
              <span className="flex items-center gap-1">
                <BarcodeScan className="h-3 w-3" />
                EAN: {product.ean}
              </span>
            )}
            
            {product.supplier_code && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {product.supplier_code}
              </span>
            )}
          </div>
          
          <div className="text-sm leading-tight font-medium">
            {product.name || product.description || "Sans description"}
          </div>
          
          {product.description && product.name && product.description !== product.name && (
            <div className="text-xs opacity-70 mt-1">
              {product.description}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold">{product.brand || "Sans marque"}</span>
            </div>
            {product.location && (
              <div className="text-xs flex items-center gap-1 opacity-70">
                <Package className="h-3 w-3" />
                {product.location}
              </div>
            )}
            {product.category && (
              <div className="text-xs opacity-70">
                {product.category}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductRow;
