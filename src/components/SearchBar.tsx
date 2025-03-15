import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Search, X, Terminal, BarcodeIcon, FileText } from 'lucide-react';
import { getLogBuffer, LogLevel } from '@/services/railway/logger';

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
  const [logs, setLogs] = useState<Array<{level: LogLevel, message: string, timestamp: string}>>([]);
  
  const isEanSearch = /^\d+$/.test(query);
  
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLogs(getLogBuffer());
      }, 1000);
      
      return () => clearInterval(interval);
    } else {
      setLogs(getLogBuffer());
    }
  }, [isLoading]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };
  
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString();
    } catch (e) {
      return timestamp;
    }
  };
  
  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="space-y-2">
        <h2 className="text-lg font-medium">Recherche parmi les produits</h2>
        <p className="text-sm text-muted-foreground">
          Recherchez par référence, code-barres, EAN, nom, fournisseur ou description
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className={cn(
          "ios-surface flex items-center px-3 py-2 relative",
          hasError && "border border-red-300 bg-red-50/50"
        )}>
          {isEanSearch ? (
            <BarcodeIcon className="text-blue-500 h-4 w-4 mr-2" />
          ) : (
            <FileText className="text-gray-500 h-4 w-4 mr-2" />
          )}
          
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isEanSearch ? "Recherche exacte par code EAN/barcode..." : "Recherche par nom, référence, description..."}
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
        
        {isEanSearch && query.length > 0 && (
          <div className="text-xs text-blue-600 flex items-center gap-1">
            <BarcodeIcon className="h-3 w-3" />
            Recherche exacte par code EAN/barcode
          </div>
        )}
        
        {isLoading && (
          <div className="py-2">
            <Progress value={75} className="h-1" />
            <p className="text-xs text-muted-foreground mt-1 animate-pulse">Recherche en cours...</p>
            
            <div className="mt-2 bg-black/80 text-green-400 p-2 rounded font-mono text-xs h-24 overflow-y-auto">
              <div className="flex items-center mb-1 opacity-70">
                <Terminal className="h-3 w-3 mr-1" />
                <span>Logs en direct</span>
              </div>
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <div key={index} className={cn(
                    "text-xs font-mono",
                    log.level === LogLevel.ERROR && "text-red-400",
                    log.level === LogLevel.WARN && "text-yellow-400",
                    log.level === LogLevel.INFO && "text-blue-400",
                    log.level === LogLevel.DEBUG && "text-green-400"
                  )}>
                    <span className="opacity-70">[{formatTimestamp(log.timestamp)}]</span> {log.message}
                  </div>
                ))
              ) : (
                <div className="opacity-50">En attente de logs...</div>
              )}
            </div>
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
