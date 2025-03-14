
import { Tag, Store, ShoppingCart, CreditCard } from 'lucide-react';
import React from 'react';

// Standard columns definition with icons and labels
export const standardColumns = [
  { id: 'id', label: 'ID', icon: <Tag className="h-4 w-4 mr-2" /> },
  { id: 'reference', label: 'Référence', icon: <Tag className="h-4 w-4 mr-2" /> },
  { id: 'barcode', label: 'Code-barres', icon: <Tag className="h-4 w-4 mr-2" /> },
  { id: 'description', label: 'Description', icon: <Tag className="h-4 w-4 mr-2" /> },
  { id: 'brand', label: 'Marque', icon: <Store className="h-4 w-4 mr-2" /> },
  { id: 'supplier_code', label: 'Code fournisseur', icon: <ShoppingCart className="h-4 w-4 mr-2" /> },
  { id: 'name', label: 'Nom', icon: <Tag className="h-4 w-4 mr-2" /> },
  { id: 'price', label: 'Prix', icon: <CreditCard className="h-4 w-4 mr-2" /> },
  { id: 'stock', label: 'Stock', icon: <Tag className="h-4 w-4 mr-2" /> },
  { id: 'location', label: 'Emplacement', icon: <Tag className="h-4 w-4 mr-2" /> },
  { id: 'ean', label: 'EAN', icon: <Tag className="h-4 w-4 mr-2" /> }
];

// Helper function to find a matching column
export const findMatchingColumn = (id: string, columns: string[]): string | undefined => {
  const colLowerMap = columns.map(col => ({ original: col, lower: col.toLowerCase() }));
  
  for (const { original, lower } of colLowerMap) {
    if (id === 'id' && (lower === 'id' || lower.endsWith('_id') || lower === 'uid')) {
      return original;
    }
    
    if (id === 'reference' && (
      lower === 'reference' || 
      lower.includes('ref') || 
      lower.includes('articlenr') || 
      lower.includes('code_article') ||
      lower.includes('product_code') ||
      lower.includes('sku')
    )) {
      return original;
    }
    
    if (id === 'barcode' && (
      lower === 'barcode' || 
      lower.includes('code_barre') || 
      lower.includes('upc') ||
      lower.includes('gtin')
    )) {
      return original;
    }
    
    if (id === 'description' && (
      lower === 'description' || 
      lower.includes('desc') || 
      lower.includes('description_odr') ||
      lower.includes('product_desc')
    )) {
      return original;
    }
    
    if (id === 'brand' && (
      lower === 'brand' || 
      lower.includes('marque') || 
      lower.includes('manufacturer') ||
      lower.includes('maker')
    )) {
      return original;
    }
    
    if (id === 'supplier_code' && (
      lower.includes('supplier') || 
      lower.includes('oemnr') || 
      lower.includes('vendor') ||
      lower.includes('fournisseur')
    )) {
      return original;
    }
    
    if (id === 'name' && (
      lower === 'name' || 
      lower.includes('nom') || 
      lower.includes('designation') ||
      lower.includes('title') ||
      lower.includes('product_name')
    )) {
      return original;
    }
    
    if (id === 'price' && (
      lower === 'price' || 
      lower.includes('prix') || 
      lower.includes('cost') ||
      lower.includes('tarif') ||
      lower.includes('montant')
    )) {
      return original;
    }
    
    if (id === 'stock' && (
      lower === 'stock' || 
      lower.includes('qty') || 
      lower.includes('quantity') ||
      lower.includes('inventory') ||
      lower.includes('disponible')
    )) {
      return original;
    }
    
    if (id === 'location' && (
      lower.includes('location') || 
      lower.includes('emplacement') || 
      lower.includes('storage') ||
      lower.includes('position') ||
      lower.includes('warehouse')
    )) {
      return original;
    }
    
    if (id === 'ean' && (
      lower === 'ean' || 
      lower.includes('eannr') || 
      lower.includes('ean13') ||
      lower.includes('ean8') ||
      lower.includes('european_article_number')
    )) {
      return original;
    }
    
    if (lower === id.toLowerCase()) {
      return original;
    }
  }
  
  return undefined;
};

// Auto-map columns by checking various patterns
export const autoMapColumns = (tableColumns: string[]): Record<string, string> => {
  const mapping: Record<string, string> = {};
  
  standardColumns.forEach(({ id }) => {
    const match = findMatchingColumn(id, tableColumns);
    if (match) {
      mapping[id] = match;
    }
  });
  
  return mapping;
};
