
import React from 'react';
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

export interface InfoItemProps {
  label: string;
  value: string | number | null | undefined;
  icon?: string;
  highlight?: boolean;
}

const iconComponents: Record<string, React.ReactNode> = {
  'box': <Box className="h-4 w-4" />,
  'barcode': <BarcodeIcon className="h-4 w-4" />,
  'building': <Building className="h-4 w-4" />,
  'calendar': <Calendar className="h-4 w-4" />,
  'dollar': <CircleDollarSign className="h-4 w-4" />,
  'leaf': <Leaf className="h-4 w-4" />,
  'package': <Package className="h-4 w-4" />,
  'shopping-basket': <ShoppingBasket className="h-4 w-4" />,
  'truck': <Truck className="h-4 w-4" />,
  'user': <User className="h-4 w-4" />,
  'database': <Database className="h-4 w-4" />
};

export const InfoItem: React.FC<InfoItemProps> = ({ label, value, icon, highlight = false }) => {
  if (value === null || value === undefined || value === '') return null;
  
  return (
    <div className="flex items-start gap-2 py-2">
      <div className="mt-0.5 text-gray-400">
        {icon && iconComponents[icon]}
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
