
import { supabase } from "@/integrations/supabase/client";
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
    
    const response = await supabase.functions.invoke("railway-db", {
      body: { query, params },
    });

    // Handle edge function specific errors
    if (response.error) {
      console.error("Error from edge function:", response.error);
      const errorMessage = response.error.message || "Unknown edge function error";
      toast.error("Railway connection error: " + errorMessage);
      return { data: null, count: 0, error: errorMessage };
    }

    const data = response.data as QueryResult<T>;
    
    // Handle database errors that were returned with a 200 status
    if (data.error) {
      console.error("Database error returned:", data.error);
      toast.error("Database error: " + data.error);
      return data;
    }

    console.log("Railway query result:", data);
    return data;
  } catch (error) {
    console.error("Error calling Railway DB function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    // Show more detailed error toast
    if (errorMessage.includes("NetworkError") || errorMessage.includes("Failed to fetch")) {
      toast.error("Network error connecting to database service. Please check your internet connection.");
    } else if (errorMessage.includes("timeout")) {
      toast.error("Database connection timed out. Please try again later.");
    } else {
      toast.error("Database connection error: " + errorMessage);
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
