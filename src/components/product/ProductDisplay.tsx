
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Database, Loader2 } from 'lucide-react';
import { Product } from '@/services/railway';
import ProductRow from './ProductRow';
import ConsolidatedProductRow from './ConsolidatedProductRow';
import SearchBar from '@/components/SearchBar';
import { searchProducts, fetchProducts } from '@/services/railway/productService';

interface ProductDisplayProps {
  products?: Product[];
  className?: string;
}

const ProductDisplay: React.FC<ProductDisplayProps> = ({
  products: initialProducts,
  className
}) => {
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupBy, setGroupBy] = useState<'none' | 'barcode' | 'supplier_code'>('none');
  
  // Load initial products if none are provided
  useEffect(() => {
    if (!initialProducts && !loading && !searchTerm) {
      loadInitialProducts();
    }
  }, [initialProducts]);
  
  // Load initial products from the database
  const loadInitialProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchProducts();
      if (result.error) {
        setError(result.error);
        setProducts([]);
      } else {
        setProducts(result.data || []);
      }
    } catch (e) {
      console.error('Error fetching products:', e);
      setError('Erreur lors de la récupération des produits.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle search
  const handleSearch = async (query: string) => {
    setSearchTerm(query);
    
    if (!query.trim()) {
      // If search is cleared, load initial products
      loadInitialProducts();
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await searchProducts(query);
      if (result.error) {
        setError(result.error);
        setProducts([]);
      } else {
        setProducts(result.data || []);
      }
    } catch (e) {
      console.error('Error searching products:', e);
      setError('Erreur lors de la recherche de produits.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Group products by specified key
  const groupProducts = () => {
    if (groupBy === 'none') {
      return products.map(product => ({
        key: `${product.source_table}-${product.id}`,
        items: [product],
        groupKey: null,
        groupType: null
      }));
    }

    const groups: Record<string, Product[]> = {};
    
    products.forEach(product => {
      const groupValue = product[groupBy as keyof Product];
      if (groupValue && typeof groupValue === 'string') {
        if (!groups[groupValue]) {
          groups[groupValue] = [];
        }
        groups[groupValue].push(product);
      } else {
        // If no group value, add as individual item
        const key = `${product.source_table}-${product.id}`;
        groups[key] = [product];
      }
    });
    
    return Object.entries(groups).map(([key, items]) => ({
      key,
      items,
      groupKey: key,
      groupType: items.length > 1 ? groupBy : null
    }));
  };

  // Count unique source tables
  const sourceTables = new Set(products.map(product => product.source_table || 'products'));
  const groupedProducts = groupProducts();
  
  return (
    <div className="container py-8">
      <SearchBar
        onSearch={handleSearch}
        isLoading={loading}
        hasError={!!error}
      />
      
      <div className={cn("w-full space-y-4 mt-6", className)}>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <div className="flex gap-4 items-center">
                <div className="ios-surface px-3 py-1 text-sm font-medium">Catalogue</div>
                <div className="flex gap-2 items-center">
                  <span className="text-sm">Grouper par:</span>
                  <select 
                    className="ios-surface px-2 py-1 text-sm rounded-md" 
                    value={groupBy}
                    onChange={(e) => setGroupBy(e.target.value as any)}
                  >
                    <option value="none">Aucun</option>
                    <option value="barcode">Code-barres</option>
                    <option value="supplier_code">Code fournisseur</option>
                  </select>
                </div>
              </div>
              
              <button className="ios-button text-sm">
                Voir stock et prix ({products.length})
              </button>
            </div>
            
            {sourceTables.size > 1 && (
              <div className="flex gap-2 items-center bg-blue-950/30 p-2 rounded-lg text-sm">
                <Database className="h-4 w-4 text-blue-500" />
                <span>
                  Résultats de {sourceTables.size} tables: {Array.from(sourceTables).join(', ')}
                </span>
              </div>
            )}
            
            {error && (
              <div className="flex gap-2 items-center bg-red-950/30 p-2 rounded-lg text-sm text-red-400">
                <span>Erreur: {error}</span>
              </div>
            )}
            
            <div className="space-y-4">
              {groupedProducts.map(group => 
                group.groupType ? (
                  <ConsolidatedProductRow 
                    key={group.key}
                    products={group.items}
                    groupKey={group.groupKey || ""}
                    groupType={group.groupType as 'barcode' | 'supplier_code'}
                  />
                ) : (
                  <ProductRow key={group.key} product={group.items[0]} />
                )
              )}
              
              {products.length === 0 && !loading && (
                <div className="text-center py-12 opacity-70">
                  {searchTerm ? 'Aucun résultat pour cette recherche' : 'Aucun produit disponible'}
                </div>
              )}
            </div>
            
            {products.length > 0 && (
              <div className="text-sm opacity-70 py-4 text-center">
                1 sur {Math.ceil(products.length / 10)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductDisplay;
