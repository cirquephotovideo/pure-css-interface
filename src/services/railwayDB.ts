
import { toast } from "sonner";

// Product interface to match our database schema for products table
export interface Product {
  id: string;
  reference: string;
  barcode: string;
  description: string;
  brand: string;
  location: string;
  imageUrl: string;
  catalog: string;
  prices: {
    type: string;
    value: number;
  }[];
  eco?: {
    [key: string]: number;
  };
  // Additional fields that might be in products
  sku?: string;
  stock?: number;
  category?: string;
  subcategory?: string;
}

interface QueryResult<T> {
  data: T[] | null;
  count: number;
  error: string | null;
}

// Configuration de la connexion Railway DB
const RAILWAY_DB_HOST = import.meta.env.VITE_RAILWAY_DB_HOST;
const RAILWAY_DB_PORT = import.meta.env.VITE_RAILWAY_DB_PORT;
const RAILWAY_DB_NAME = import.meta.env.VITE_RAILWAY_DB_NAME;
const RAILWAY_DB_USER = import.meta.env.VITE_RAILWAY_DB_USER;
const RAILWAY_DB_PASSWORD = import.meta.env.VITE_RAILWAY_DB_PASSWORD;

/**
 * Execute a query on the Railway PostgreSQL database
 * @param query SQL query to execute
 * @param params Parameters for the query (for prepared statements)
 * @returns Query result
 */
export async function executeRailwayQuery<T>(
  query: string, 
  params: any[] = []
): Promise<QueryResult<T>> {
  try {
    console.log("Executing Railway query:", query, "with params:", params);
    
    // Vérifier que les variables d'environnement sont définies
    if (!RAILWAY_DB_HOST || !RAILWAY_DB_PORT || !RAILWAY_DB_NAME || !RAILWAY_DB_USER || !RAILWAY_DB_PASSWORD) {
      const errorMessage = "Configuration Railway DB manquante. Vérifiez les variables d'environnement.";
      console.error(errorMessage);
      toast.error(errorMessage);
      return { data: null, count: 0, error: errorMessage };
    }
    
    // Préparer l'URL de connexion PostgreSQL
    const connectionString = `postgres://${RAILWAY_DB_USER}:${encodeURIComponent(RAILWAY_DB_PASSWORD)}@${RAILWAY_DB_HOST}:${RAILWAY_DB_PORT}/${RAILWAY_DB_NAME}`;
    
    // Préparer le corps de la requête avec la query et les paramètres
    const requestBody = {
      query,
      params,
      connectionString
    };
    
    // Utiliser une API intermédiaire pour exécuter la requête PostgreSQL
    // Cette API doit être configurée séparément (par exemple avec Express.js)
    const response = await fetch("https://votre-api-railway-pg.com/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Railway API error:", response.status, errorText);
      const errorMessage = `Erreur de l'API Railway (${response.status}): ${errorText}`;
      toast.error(errorMessage);
      return { data: null, count: 0, error: errorMessage };
    }
    
    const result = await response.json();
    console.log("Railway query result:", result);
    
    if (result.error) {
      console.error("Database error returned:", result.error);
      toast.error("Erreur de base de données: " + result.error);
      return result;
    }
    
    return {
      data: result.data || [],
      count: result.data?.length || 0,
      error: null
    };
  } catch (error) {
    console.error("Error executing Railway DB query:", error);
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    
    // Afficher un toast d'erreur plus détaillé
    if (errorMessage.includes("NetworkError") || errorMessage.includes("Failed to fetch")) {
      toast.error("Erreur réseau lors de la connexion au service de base de données. Vérifiez votre connexion internet.");
    } else if (errorMessage.includes("timeout")) {
      toast.error("La connexion à la base de données a expiré. Veuillez réessayer plus tard.");
    } else {
      toast.error("Erreur de connexion à la base de données: " + errorMessage);
    }
    
    return { data: null, count: 0, error: errorMessage };
  }
}

/**
 * Fetch products from Railway database (products table)
 * @returns List of products
 */
export async function fetchProducts() {
  const query = `
    SELECT * FROM products 
    ORDER BY reference ASC 
    LIMIT 20
  `;
  
  return executeRailwayQuery<Product>(query);
}

/**
 * Search products in Railway database (products table)
 * @param searchTerm Term to search for
 * @returns List of matching products
 */
export async function searchProducts(searchTerm: string) {
  const searchPattern = `%${searchTerm}%`;
  const query = `
    SELECT * FROM products 
    WHERE 
      reference ILIKE $1 OR 
      barcode ILIKE $1 OR 
      description ILIKE $1 OR
      brand ILIKE $1
    ORDER BY reference ASC 
    LIMIT 20
  `;
  
  return executeRailwayQuery<Product>(query, [searchPattern]);
}
