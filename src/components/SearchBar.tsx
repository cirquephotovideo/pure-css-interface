
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  className?: string;
  onSearch: (query: string) => void;
  isLoading?: boolean;
  hasError?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  className, 
  onSearch, 
  isLoading = false,
  hasError = false 
}) => {
  const [query, setQuery] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
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
        <div className={cn(
          "ios-surface flex items-center px-3 py-2 relative",
          hasError && "border border-red-300 bg-red-50/50"
        )}>
          <Search className="text-gray-500 h-4 w-4 mr-2" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Saisir un terme de recherche..."
            className="flex-1 px-2 py-1 text-base border-none bg-transparent focus:outline-none shadow-none"
            disabled={isLoading}
          />
          {query && (
            <button 
              type="button" 
              onClick={() => setQuery('')}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {isLoading && (
          <div className="py-2">
            <Progress value={75} className="h-1" />
            <p className="text-xs text-muted-foreground mt-1 animate-pulse">Recherche en cours...</p>
          </div>
        )}
        
        {hasError && (
          <p className="text-xs text-red-500">
            Problème de connexion à la base de données. Veuillez réessayer.
          </p>
        )}
        
        <div className="flex justify-between">
          <button
            type="button"
            className="ios-button text-sm"
            onClick={() => {
              setQuery('');
              onSearch('');
            }}
            disabled={isLoading}
          >
            Effacer
          </button>
          
          <button
            type="submit"
            className={cn(
              "ios-button text-sm",
              isLoading && "opacity-50 cursor-not-allowed"
            )}
            disabled={query.trim() === '' || isLoading}
          >
            Rechercher
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
