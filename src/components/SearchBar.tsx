
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

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
          Pour faire une recherche exacte, placer des guillemets autour du terme à rechercher.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="tq77s95d"
          className="flex-1 px-4 py-2 text-base border border-border rounded-md focus:outline-none focus-ring transition-all bg-background"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-background border border-border rounded-md hover:bg-accent transition-all text-primary font-medium"
        >
          Rechercher
        </button>
      </form>
      
      <div className="flex">
        <button className="text-sm text-muted-foreground hover:text-primary transition-colors">
          Options ...
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
