
import React from 'react';

interface PriceSectionProps {
  price: number;
  ecoTax: number | undefined;
  totalPrice: number;
}

export const PriceSection: React.FC<PriceSectionProps> = ({ price, ecoTax, totalPrice }) => {
  return (
    <div className="bg-blue-50 p-3 rounded-lg">
      <h3 className="text-sm font-medium mb-2">Prix et tarification</h3>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white p-2 rounded">
          <div className="text-xs text-gray-500">Prix HT</div>
          <div className="text-lg font-semibold text-blue-700">{price.toFixed(2)} €</div>
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
  );
};
