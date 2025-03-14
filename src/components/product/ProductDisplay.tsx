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
        const tables = result.data.map(p => p.source_table || 'products').filter((v, i, a) => a.indexOf(v) === i);
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
    const result: {
      table: string;
      groups: Product[][];
    }[] = [];
    orderedTables.forEach(table => {
      const tableProducts = tableGroups[table];
      const groups = groupProducts(tableProducts);
      result.push({
        table,
        groups
      });
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
    return Array.from(groupedMap.values()).sort((a, b) => b.length - a.length);
  };

  // Filter products by selected table if needed
  const filteredProducts = selectedTable ? products.filter(p => (p.source_table || 'products') === selectedTable) : products;

  // Group products with same barcode/supplier code within tables
  const groupedByTable = groupProductsByTable(filteredProducts);

  // Count unique source tables
  const sourceTables = new Set(products.map(product => product.source_table || 'products'));
  return <div className="container py-8">
      <SearchBar onSearch={handleSearch} isLoading={loading} hasError={!!error} />
      
      
    </div>;
};
export default ProductDisplay;