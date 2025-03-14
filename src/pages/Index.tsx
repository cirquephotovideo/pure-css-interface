
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';
import ProductDisplay from '@/components/ProductDisplay';
import { fetchProducts, searchProducts, Product } from '@/services/railway';
import { toast } from 'sonner';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch products based on search query or get all products
  const { data: productsData, isLoading, error, isError, refetch } = useQuery({
    queryKey: ['products', searchQuery],
    queryFn: () => {
      console.log("Fetching products with search query:", searchQuery);
      return searchQuery 
        ? searchProducts(searchQuery) 
        : fetchProducts();
    },
    staleTime: 60 * 1000, // 1 minute
    retry: 1, // Reduce retries to avoid flooding with errors
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000), // Exponential backoff
  });

  // Get products from the query result or use empty array
  const products: Product[] = productsData?.data || [];
  const errorMessage = productsData?.error || (error instanceof Error ? error.message : 'Unknown error');

  useEffect(() => {
    if (isError || productsData?.error) {
      console.error('Error fetching products:', errorMessage);
      toast.error("Erreur lors de la récupération des produits");
    }
  }, [isError, productsData?.error, errorMessage]);

  // Add debug logging
  useEffect(() => {
    console.log("Products loaded:", products.length);
    if (products.length > 0) {
      console.log("Sample product:", products[0]);
    }
  }, [products]);

  const handleSearch = (query: string) => {
    console.log("Search query:", query);
    setSearchQuery(query);
  };

  const handleRetry = () => {
    toast.info("Tentative de reconnexion à la base de données...");
    refetch();
  };

  return (
    <div className="flex w-full h-screen overflow-hidden animate-fade-in">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="ios-glass py-4 px-6 flex justify-between items-center mb-4 m-2 rounded-xl">
          <div className="flex items-center gap-4">
            <button className="p-2 opacity-70 hover:opacity-100 transition-opacity">
              ≡
            </button>
            <h2 className="font-medium">Planète Technologie</h2>
          </div>
          
          <button className="p-2 opacity-70 hover:opacity-100 transition-opacity">
            ⚙
          </button>
        </header>
        
        <div className="flex-1 overflow-auto px-2">
          <div className="max-w-6xl mx-auto">
            <nav className="flex ios-glass p-1 rounded-full mb-6">
              <div className="px-5 py-2 text-sm font-medium rounded-full bg-white/30">
                Recherche
              </div>
              <div className="px-5 py-2 text-sm opacity-70 hover:opacity-100 transition-opacity">
                Tableau de bord
              </div>
            </nav>
            
            <div className="ios-glass p-6 rounded-[20px] mb-6 animate-slide-in">
              <SearchBar 
                onSearch={handleSearch}
                isLoading={isLoading}
                hasError={isError || !!productsData?.error}
              />
            </div>
            
            <div className="ios-glass p-6 rounded-[20px] mb-6 animate-scale-in">
              {isLoading ? (
                <div className="flex justify-center p-12">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                </div>
              ) : isError || productsData?.error ? (
                <div className="text-center p-8 bg-red-50 rounded-lg">
                  <p className="text-red-500 font-medium">Erreur de connexion à la base de données</p>
                  <p className="text-sm text-red-400 mt-2">
                    {errorMessage.includes("Connection failed") || errorMessage.includes("DNS") ? 
                      "Problème de connexion avec la base de données Railway." : 
                      "Veuillez réessayer plus tard ou contacter le support technique."}
                  </p>
                  <button 
                    onClick={handleRetry}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Réessayer
                  </button>
                  <details className="mt-4 text-left">
                    <summary className="cursor-pointer text-xs text-red-400">Détails techniques</summary>
                    <p className="mt-2 text-xs font-mono bg-red-100/50 p-2 rounded">{errorMessage}</p>
                  </details>
                </div>
              ) : products.length > 0 ? (
                <ProductDisplay products={products} />
              ) : (
                <div className="text-center p-8 opacity-70">
                  {searchQuery ? 
                    `Aucun produit trouvé pour "${searchQuery}". Essayez une autre recherche.` : 
                    "Aucun produit disponible. Vérifiez la connexion à la base de données."}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <footer className="ios-glass p-4 mb-2 mx-2 rounded-xl text-xs opacity-70 flex justify-between items-center">
          <div>
            {new Date().toLocaleDateString('fr-FR')}, {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div>
            {products.length} produit(s) {searchQuery ? `pour "${searchQuery}"` : ""}
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
