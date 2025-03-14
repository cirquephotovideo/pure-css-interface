
import React from 'react';
import { Product } from '@/services/railway';
import { Badge } from '@/components/ui/badge';
import { Database, Filter } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BrandDisplayProps {
  product: Product;
  onClick?: () => void;
}

const BrandDisplay: React.FC<BrandDisplayProps> = ({ product, onClick }) => {
  const hasBrand = !!product.brand && product.brand !== 'NULL';
  const hasSourceTable = !!product.source_table && product.source_table !== 'products';
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={`flex flex-col items-center justify-center w-36 h-24 rounded-xl ${hasBrand ? 'bg-white/80' : 'bg-white/30'} flex-shrink-0 p-2 ${onClick ? 'cursor-pointer hover:bg-white/100 hover:shadow-md transition-all border-2 border-blue-100' : ''}`}
            onClick={onClick}
          >
            {hasSourceTable && (
              <Badge variant="outline" className="bg-blue-100 text-blue-800 text-xs mb-1 flex items-center gap-1">
                <Database className="h-3 w-3" />
                <span className="truncate max-w-[80px]">{product.source_table}</span>
              </Badge>
            )}
            
            {hasBrand ? (
              <div className="text-center w-full font-medium">
                {product.brand}
              </div>
            ) : (
              <div className="text-center text-sm opacity-70">
                Sans marque
              </div>
            )}
            
            {onClick && (
              <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
                <Filter className="h-3 w-3" />
                <span>Filtrer par table</span>
              </div>
            )}
          </div>
        </TooltipTrigger>
        {onClick && (
          <TooltipContent>
            <p>Cliquer pour voir tous les produits de {product.source_table}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default BrandDisplay;
