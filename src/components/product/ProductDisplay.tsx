
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Database, Loader2, ArrowDown, ArrowUp, Filter } from 'lucide-react';
import { Product } from '@/services/railway';
import ProductRow from './ProductRow';
import SearchBar from '@/components/SearchBar';
import { searchProducts, fetchProducts } from '@/services/railway/productService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableOrder, setTableOrder] = useState<string[]>([]);
  
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
    setSelectedTable(null);
    
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
        
        // Extract tables in the order they appear
        const tables = result.data
          .map(p => p.source_table || 'products')
          .filter((v, i, a) => a.indexOf(v) === i);
          
        setTableOrder(tables);
      }
    } catch (e) {
      console.error('Error searching products:', e);
      setError('Erreur lors de la recherche de produits.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Group products by barcode or supplier_code within each table
  const groupProductsByTable = (products: Product[]) => {
    // First group by table
    const tableGroups: Record<string, Product[]> = {};
    
    products.forEach(product => {
      const table = product.source_table || 'products';
      if (!tableGroups[table]) {
        tableGroups[table] = [];
      }
      tableGroups[table].push(product);
    });
    
    // Sort the tables based on tableOrder
    const orderedTables = Object.keys(tableGroups).sort((a, b) => {
      const indexA = tableOrder.indexOf(a);
      const indexB = tableOrder.indexOf(b);
      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });
    
    // For each table, group products by barcode/ean/supplier_code
    const result: { table: string, groups: Product[][] }[] = [];
    
    orderedTables.forEach(table => {
      const tableProducts = tableGroups[table];
      const groups = groupProducts(tableProducts);
      result.push({ table, groups });
    });
    
    return result;
  };
  
  // Group products by barcode or supplier_code
  const groupProducts = (products: Product[]) => {
    const groupedMap = new Map<string, Product[]>();
    
    products.forEach(product => {
      // Use barcode, ean, or supplier_code as grouping key
      const groupKey = product.barcode || product.ean || product.supplier_code || product.id + (product.source_table || '');
      
      if (groupKey) {
        if (!groupedMap.has(groupKey)) {
          groupedMap.set(groupKey, []);
        }
        groupedMap.get(groupKey)?.push(product);
      }
    });
    
    // Convert map to array, sorted by group size (largest first)
    return Array.from(groupedMap.values())
      .sort((a, b) => b.length - a.length);
  };

  // Filter products by selected table if needed
  const filteredProducts = selectedTable 
    ? products.filter(p => (p.source_table || 'products') === selectedTable)
    : products;
  
  // Group products with same barcode/supplier code within tables
  const groupedByTable = groupProductsByTable(filteredProducts);
  
  // Count unique source tables
  const sourceTables = new Set(products.map(product => product.source_table || 'products'));
  
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
              <div className="flex gap-4 text-sm">
                <div className="ios-surface px-3 py-1 text-sm font-medium">Catalogue</div>
                <div className="opacity-70 px-3 py-1 text-sm">Stock</div>
                <div className="opacity-70 px-3 py-1 text-sm"></div>
                <div className="opacity-70 px-3 py-1 text-sm"></div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="ios-button text-sm flex items-center gap-1">
                  <Filter className="h-4 w-4" />
                  Filtres
                </Button>
                <Button className="ios-button text-sm">
                  Voir stock et prix ({products.length})
                </Button>
              </div>
            </div>
            
            {sourceTables.size > 1 && !selectedTable && (
              <div className="flex gap-2 items-center bg-blue-950/30 p-2 rounded-lg text-sm">
                <Database className="h-4 w-4 text-blue-500" />
                <span>
                  Résultats de {sourceTables.size} tables: {Array.from(sourceTables).join(', ')}
                </span>
              </div>
            )}
            
            {selectedTable && (
              <div className="flex gap-2 items-center bg-blue-500/20 p-2 rounded-lg text-sm">
                <Database className="h-4 w-4 text-blue-500" />
                <span>
                  Filtre actif: {selectedTable}
                </span>
                <button 
                  className="ml-auto bg-blue-500/30 hover:bg-blue-500/50 px-2 py-0.5 rounded text-xs"
                  onClick={() => setSelectedTable(null)}
                >
                  Voir tous
                </button>
              </div>
            )}
            
            {error && (
              <div className="flex gap-2 items-center bg-red-950/30 p-2 rounded-lg text-sm text-red-400">
                <span>Erreur: {error}</span>
              </div>
            )}
            
            <div className="space-y-6">
              {groupedByTable.length === 0 && !loading && (
                <div className="text-center py-12 opacity-70">
                  {searchTerm ? 'Aucun résultat pour cette recherche' : 'Aucun produit disponible'}
                </div>
              )}
              
              {groupedByTable.map(({ table, groups }, tableIndex) => (
                <div key={`table-${table}-${tableIndex}`} className="space-y-4">
                  <div className="flex items-center gap-2 bg-gray-100/50 dark:bg-gray-800/50 p-2 rounded-lg">
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 flex items-center gap-1">
                      <Database className="h-3 w-3" />
                      <span>{table}</span>
                    </Badge>
                    <span className="text-sm">{groups.length} résultats</span>
                    
                    <div className="ml-auto flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 px-2 text-xs" 
                        onClick={() => setSelectedTable(table)}
                      >
                        <Filter className="h-3 w-3 mr-1" />
                        Filtrer
                      </Button>
                    </div>
                  </div>
                  
                  {groups.map((group, groupIndex) => (
                    <ProductRow 
                      key={`group-${tableIndex}-${groupIndex}`} 
                      productGroup={group} 
                      onSelectTable={setSelectedTable} 
                    />
                  ))}
                </div>
              ))}
            </div>
            
            {groupedByTable.length > 0 && (
              <div className="text-sm opacity-70 py-4 text-center">
                1 sur {Math.ceil(groupedByTable.reduce((acc, { groups }) => acc + groups.length, 0) / 10)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductDisplay;
