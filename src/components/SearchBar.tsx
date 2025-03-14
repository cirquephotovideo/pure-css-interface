
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  className?: string;
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ className, onSearch }) => {
  const [query, setQuery] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };
  
  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="space-y-2">
        <h2 className="text-lg font-medium">Recherche parmi les produits</h2>
        <p className="text-sm text-muted-foreground">
          Recherchez par référence, code-barres, description ou marque
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="ios-surface flex items-center px-3 py-2">
          <span className="text-gray-500 mr-2">🔍</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Saisir un terme de recherche..."
            className="flex-1 px-2 py-1 text-base border-none bg-transparent focus:outline-none"
          />
        </div>
        
        <div className="flex justify-between">
          <button
            type="button"
            className="ios-button text-sm"
            onClick={() => setQuery('')}
          >
            Effacer
          </button>
          
          <button
            type="submit"
            className="ios-button text-sm"
          >
            Rechercher
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
