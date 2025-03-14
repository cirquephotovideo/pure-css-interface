
import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';
import ProductDisplay from '@/components/ProductDisplay';

// Mock data for our products
const mockProducts = [
  {
    id: '1',
    reference: 'TQ77S95DATXXC',
    barcode: '8806095486086',
    description: 'TV 77 OLED TV OLED, 3840x2160, 120Hz, HDR10+, Boîtier déporté One Connect, Surface mate Anti-reflet, Tizen 8.0, NQ4 AI Gen2 Processor, Pied central Vesa 400x400, 4xHDMI, 3xUSB, Smart TV, Airplay 2, Dolby Atmos, Audio 70W',
    brand: 'SAMSUNG',
    location: '52GJ',
    imageUrl: '',
    catalog: 'digitalpro',
    prices: [
      { type: 'digitalpro', value: 2043.36 },
      { type: 'pacenet/pro', value: 2157.46 },
      { type: 'fvs/pro', value: 2416.00 }
    ]
  },
  {
    id: '2',
    reference: 'TQ77S90DAEXXC',
    barcode: '8806095568898',
    description: 'TV 77 OLED TV OLED, 3840x2160, 120Hz, HDR10+, Tizen 8.0, NQ4 AI Gen2 Processor, Pied central Vesa 400x300, 4xHDMI, 2xUSB, Airplay 2, Dolby Atmos, Audio 40W',
    brand: 'SAMSUNG',
    location: '42J4',
    imageUrl: '',
    catalog: 'digitalpro',
    prices: [
      { type: 'digitalpro', value: 1843.36 },
      { type: 'pacenet/pro', value: 1957.46 }
    ]
  }
];

const Index = () => {
  const [products, setProducts] = useState(mockProducts);
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // In a real application, this would filter products or make an API call
    console.log('Searching for:', query);
  };
  
  return (
    <div className="flex w-full h-screen overflow-hidden bg-background animate-fade-in">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="border-b border-border/60 py-4 px-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
              ≡
            </button>
            <h2 className="font-medium">Planète Technologie</h2>
          </div>
          
          <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
            ⚙
          </button>
        </header>
        
        <div className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <nav className="flex gap-6 border-b border-border/60 text-sm">
              <div className="px-2 py-3 text-primary font-medium border-b-2 border-primary">
                Recherche
              </div>
              <div className="px-2 py-3 text-muted-foreground hover:text-primary transition-colors">
                Tableau de bord
              </div>
            </nav>
            
            <div className="py-6 animate-slide-in">
              <SearchBar onSearch={handleSearch} />
            </div>
            
            <div className="mt-6 animate-scale-in">
              <ProductDisplay products={products} />
            </div>
          </div>
        </div>
        
        <footer className="px-6 py-2 border-t border-border/60 text-xs text-muted-foreground flex justify-between items-center">
          <div>12/03/2023, 16:16</div>
          <div>http://hive-ui.pl01.colbee.club:8080/</div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
