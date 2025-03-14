
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
  Database,
  Tag,
  Warehouse,
  BarChart,
  CreditCard,
  Map,
  Info
} from 'lucide-react';

export interface InfoItemProps {
  label: string;
  value: string | number | null | undefined;
  icon?: string;
  highlight?: boolean;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value, icon, highlight = false }) => {
  if (value === null || value === undefined || value === '') return null;
  
  // Render the appropriate icon based on the string prop
  const renderIcon = () => {
    if (!icon) return null;
    
    switch (icon) {
      case 'box':
        return <Box className="h-4 w-4" />;
      case 'barcode':
        return <BarcodeIcon className="h-4 w-4" />;
      case 'building':
        return <Building className="h-4 w-4" />;
      case 'calendar':
        return <Calendar className="h-4 w-4" />;
      case 'dollar':
        return <CircleDollarSign className="h-4 w-4" />;
      case 'leaf':
        return <Leaf className="h-4 w-4" />;
      case 'package':
        return <Package className="h-4 w-4" />;
      case 'shopping-basket':
        return <ShoppingBasket className="h-4 w-4" />;
      case 'truck':
        return <Truck className="h-4 w-4" />;
      case 'user':
        return <User className="h-4 w-4" />;
      case 'database':
        return <Database className="h-4 w-4" />;
      case 'tag':
        return <Tag className="h-4 w-4" />;
      case 'warehouse':
        return <Warehouse className="h-4 w-4" />;
      case 'bar-chart':
        return <BarChart className="h-4 w-4" />;
      case 'credit-card':
        return <CreditCard className="h-4 w-4" />;
      case 'map':
        return <Map className="h-4 w-4" />;
      case 'info':
        return <Info className="h-4 w-4" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="flex items-start gap-2 py-2">
      <div className="mt-0.5 text-gray-400">
        {renderIcon()}
      </div>
      <div className="flex-1">
        <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
        <div className={`text-sm ${highlight ? "font-medium text-blue-700 dark:text-blue-400" : ""}`}>
          {value}
        </div>
      </div>
    </div>
  );
};

export { InfoItem };
