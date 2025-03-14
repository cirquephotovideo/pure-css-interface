
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';
import ProductDisplay from '@/components/ProductDisplay';
import { fetchProducts, searchProducts } from '@/services/railwayDB';
import { toast } from 'sonner';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch products based on search query or get all products
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['products', searchQuery],
    queryFn: () => searchQuery 
      ? searchProducts(searchQuery) 
      : fetchProducts(),
    staleTime: 60 * 1000, // 1 minute
  });

  // Get products from the query result or use empty array
  const products = productsData?.data || [];

  useEffect(() => {
    if (error) {
      console.error('Error fetching products:', error);
      toast.error("Erreur lors de la récupération des produits");
    }
  }, [error]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log('Searching for:', query);
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
              <SearchBar onSearch={handleSearch} />
            </div>
            
            <div className="ios-glass p-6 rounded-[20px] mb-6 animate-scale-in">
              {isLoading ? (
                <div className="flex justify-center p-12">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                </div>
              ) : (
                <ProductDisplay products={products} />
              )}
            </div>
          </div>
        </div>
        
        <footer className="ios-glass p-4 mb-2 mx-2 rounded-xl text-xs opacity-70 flex justify-between items-center">
          <div>
            {new Date().toLocaleDateString('fr-FR')}, {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div>
            {products.length} produit(s)
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
