
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
// Use hardcoded values for now to avoid URL encoding issues
const RAILWAY_DB_HOST = "containers-us-west-146.railway.app"; // Hardcoded valid host
const RAILWAY_DB_PORT = "7739"; // Example port, update with your actual port
const RAILWAY_DB_NAME = "railway";
const RAILWAY_DB_USER = "postgres";
// For development and testing, use a fallback password if env variable is not set
const RAILWAY_DB_PASSWORD = import.meta.env.VITE_RAILWAY_DB_PASSWORD || "PLEASE_SET_RAILWAY_DB_PASSWORD";
const RAILWAY_READ_ONLY_TOKEN = "dbe21f72-1f35-489b-8500-8823ebf152d5";

// Debug log to check if password is defined
console.log("Railway DB Password:", RAILWAY_DB_PASSWORD === "PLEASE_SET_RAILWAY_DB_PASSWORD" ? "Not set, using fallback" : "Defined");

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
    if (!RAILWAY_DB_HOST || !RAILWAY_DB_PORT || !RAILWAY_DB_NAME || !RAILWAY_DB_USER) {
      const missingVars = [];
      if (!RAILWAY_DB_HOST) missingVars.push("RAILWAY_DB_HOST");
      if (!RAILWAY_DB_PORT) missingVars.push("RAILWAY_DB_PORT");
      if (!RAILWAY_DB_NAME) missingVars.push("RAILWAY_DB_NAME");
      if (!RAILWAY_DB_USER) missingVars.push("RAILWAY_DB_USER");
      
      const errorMessage = `Configuration Railway DB incomplète: ${missingVars.join(', ')}. Vérifiez les variables d'environnement.`;
      console.error(errorMessage);
      toast.error(errorMessage);
      return { data: null, count: 0, error: errorMessage };
    }
    
    // Check if the password is the fallback value, warn but continue
    if (RAILWAY_DB_PASSWORD === "PLEASE_SET_RAILWAY_DB_PASSWORD") {
      console.warn("Using fallback Railway DB password. For production, please set VITE_RAILWAY_DB_PASSWORD environment variable.");
      toast.warning("Connexion DB avec mot de passe par défaut", {
        description: "Pour une utilisation en production, configurez la variable d'environnement VITE_RAILWAY_DB_PASSWORD."
      });
    }
    
    // Vérifier si la requête est une opération de lecture seule
    const isReadOperation = isReadOnlyQuery(query);
    if (!isReadOperation) {
      const errorMessage = "Opération d'écriture détectée. Le token Railway fourni est en lecture seule.";
      console.error(errorMessage);
      toast.error(errorMessage);
      return {
        data: null,
        count: 0,
        error: errorMessage
      };
    }
    
    // Log the DB configuration being sent (without the actual password)
    console.log("Railway DB Config:", {
      host: RAILWAY_DB_HOST,
      port: RAILWAY_DB_PORT,
      database: RAILWAY_DB_NAME,
      user: RAILWAY_DB_USER,
      passwordProvided: RAILWAY_DB_PASSWORD ? "Yes" : "No"
    });
    
    // Utiliser l'edge function Supabase pour exécuter la requête PostgreSQL
    const response = await fetch("https://hspgrehyavlqiilrajor.supabase.co/functions/v1/railway-db", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzcGdyZWh5YXZscWlpbHJham9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5NTEwNzAsImV4cCI6MjA1NzUyNzA3MH0.wGPKekL1VBzO3WpqsnyahS7ncSBXrFMJA5ZjTwljDEE",
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzcGdyZWh5YXZscWlpbHJham9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5NTEwNzAsImV4cCI6MjA1NzUyNzA3MH0.wGPKekL1VBzO3WpqsnyahS7ncSBXrFMJA5ZjTwljDEE",
        "X-Railway-Token": RAILWAY_READ_ONLY_TOKEN
      },
      body: JSON.stringify({
        query,
        params,
        readOnly: true,
        dbConfig: {
          host: RAILWAY_DB_HOST,
          port: RAILWAY_DB_PORT,
          database: RAILWAY_DB_NAME,
          user: RAILWAY_DB_USER,
          password: RAILWAY_DB_PASSWORD
        }
      }),
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
    
    toast.error("Erreur de connexion à la base de données: " + errorMessage);
    
    return { data: null, count: 0, error: errorMessage };
  }
}

/**
 * Vérifie si une requête SQL est en lecture seule
 */
function isReadOnlyQuery(query: string): boolean {
  const upperQuery = query.trim().toUpperCase();
  // Ne permet que les opérations SELECT
  return upperQuery.startsWith('SELECT');
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
