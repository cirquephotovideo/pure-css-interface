
import React, { useState } from 'react';
import { 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { Product } from '@/services/railway/types';
import { Button } from '@/components/ui/button';
import { Eye, ShoppingCart, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import ProductDetailDialog from './dialog/ProductDetailDialog';
import { Badge } from '@/components/ui/badge';

interface ProductRowProps {
  product: Product;
  index: number;
  showSimpleView?: boolean;
}

const ProductRow: React.FC<ProductRowProps> = ({ 
  product, 
  index,
  showSimpleView = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Handle dialog open
  const handleOpenDialog = () => {
    setIsOpen(true);
  };

  // Extract price from product
  const price = product.prices && product.prices.length > 0 
    ? product.prices[0].value 
    : product.price;

  // Determine row background based on index
  const getRowClass = () => {
    if (index % 2 === 0) {
      return "bg-white dark:bg-gray-800";
    }
    return "bg-gray-50 dark:bg-gray-850";
  };
  
  // Handle rendering different data formats
  const formatData = (value: any) => {
    if (value === undefined || value === null) return "—";
    return String(value);
  };

  // Determine if this product has detailed information
  const hasDetailedInfo = Boolean(
    product.description || 
    product.prices?.length > 0 || 
    product.supplier_code ||
    product.ean
  );

  return (
    <>
      <TableRow className={cn(
        getRowClass(), 
        "transition-colors hover:bg-gray-100 dark:hover:bg-gray-700",
        isOpen && "bg-blue-50 dark:bg-blue-900/20"
      )}>
        {!showSimpleView && (
          <TableCell className="font-medium">
            {product.source_table && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                {product.source_table.replace('raw_', '')}
              </Badge>
            )}
          </TableCell>
        )}
        <TableCell className="font-medium">
          {formatData(product.reference || product.id)}
        </TableCell>
        <TableCell>{formatData(product.name || product.description)}</TableCell>
        <TableCell>{formatData(product.brand)}</TableCell>
        <TableCell>
          {price ? `${price} €` : "—"}
        </TableCell>
        {!showSimpleView && (
          <TableCell>
            <div className="flex items-center gap-1">
              {formatData(product.stock)}
              {product.stock && (
                Number(product.stock) <= 0 ? (
                  <Badge variant="destructive" className="text-xs">Rupture</Badge>
                ) : Number(product.stock) < 5 ? (
                  <Badge variant="yellow" className="text-xs">Faible</Badge>
                ) : null
              )}
            </div>
          </TableCell>
        )}
        {!showSimpleView && (
          <TableCell>
            {product.barcode || product.ean || "—"}
          </TableCell>
        )}
        <TableCell className="text-right flex justify-end">
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 ml-2"
            onClick={handleOpenDialog}
            title="Voir détails"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </TableCell>
      </TableRow>
      
      {/* Product Detail Dialog */}
      {isOpen && (
        <ProductDetailDialog
          product={product}
          isOpen={isOpen}
          onOpenChange={setIsOpen}
        />
      )}
    </>
  );
};

export default ProductRow;
