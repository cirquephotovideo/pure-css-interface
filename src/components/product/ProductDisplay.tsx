
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Database, Loader2, ArrowDown, ArrowUp, Filter, Eye } from 'lucide-react';
import { Product } from '@/services/railway';
import ProductRow from './ProductRow';
import SearchBar from '@/components/SearchBar';
import { searchProducts, fetchProducts } from '@/services/railway/productService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductDetailDialog from './dialog/ProductDetailDialog';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

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
  
  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
  };
  
  return (
    <div className="container py-8">
      <SearchBar onSearch={handleSearch} isLoading={loading} hasError={!!error} />
      
      {products.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              Résultats de recherche {searchTerm && <span className="font-normal text-muted-foreground ml-2">pour "{searchTerm}"</span>}
            </h2>
            
            {sourceTables.size > 1 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Filtrer par table:</span>
                <div className="flex flex-wrap gap-2">
                  {selectedTable && (
                    <Badge 
                      variant="outline" 
                      className="cursor-pointer flex items-center gap-1"
                      onClick={() => setSelectedTable(null)}
                    >
                      Tous <ArrowDown className="h-3 w-3" />
                    </Badge>
                  )}
                  
                  {!selectedTable && Array.from(sourceTables).map(table => (
                    <Badge 
                      key={table} 
                      variant="outline" 
                      className="cursor-pointer flex items-center gap-1"
                      onClick={() => setSelectedTable(table)}
                    >
                      {table} <Filter className="h-3 w-3" />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-8">
            {groupedByTable.map(({ table, groups }) => (
              <div key={table} className="border rounded-lg overflow-hidden">
                <div className="bg-muted/50 px-4 py-2 flex justify-between items-center">
                  <h3 className="font-medium text-sm">
                    Table: <span className="font-mono">{table}</span>
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {groups.reduce((acc, group) => acc + group.length, 0)} résultats
                  </span>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30%]">Référence</TableHead>
                      <TableHead className="w-[30%]">Description</TableHead>
                      <TableHead className="w-[15%]">Marque</TableHead>
                      <TableHead className="w-[15%]">Prix</TableHead>
                      <TableHead className="w-[10%]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groups.map((group, groupIndex) => (
                      group.map((product, productIndex) => (
                        <TableRow key={`${product.id}-${product.source_table}-${productIndex}`}>
                          <TableCell className="font-medium">
                            {product.reference || product.barcode || product.ean || "—"}
                          </TableCell>
                          <TableCell>
                            {product.description || product.name || "—"}
                          </TableCell>
                          <TableCell>{product.brand || "—"}</TableCell>
                          <TableCell>
                            {product.prices && product.prices.length > 0 ? 
                              `${product.prices[0].value} €` : "—"}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleViewDetails(product)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {products.length === 0 && !loading && (
        <div className="mt-8 text-center py-12">
          <Database className="mx-auto h-12 w-12 text-muted-foreground/70" />
          <h3 className="mt-4 text-lg font-medium">Aucun résultat trouvé</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {searchTerm ? 
              `Aucun produit ne correspond à "${searchTerm}"` : 
              "Commencez par effectuer une recherche pour voir des produits"
            }
          </p>
        </div>
      )}
      
      {/* Product Detail Dialog */}
      {selectedProduct && (
        <ProductDetailDialog
          product={selectedProduct}
          isOpen={isDetailOpen}
          onOpenChange={setIsDetailOpen}
        />
      )}
    </div>
  );
};

export default ProductDisplay;
