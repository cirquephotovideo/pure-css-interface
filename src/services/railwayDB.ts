
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Product interface to match our database schema for main_product table
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
  // Additional fields that might be in main_product
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
    
    const { data, error } = await supabase.functions.invoke("railway-db", {
      body: { query, params },
    });

    if (error) {
      console.error("Error executing Railway DB query:", error);
      toast.error("Database error: " + error.message);
      return { data: null, count: 0, error: error.message };
    }

    console.log("Railway query result:", data);
    return data as QueryResult<T>;
  } catch (error) {
    console.error("Error calling Railway DB function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    toast.error("Database connection error");
    return { data: null, count: 0, error: errorMessage };
  }
}

/**
 * Fetch products from Railway database (main_product table)
 * @returns List of products
 */
export async function fetchProducts() {
  const query = `
    SELECT * FROM main_product 
    ORDER BY reference ASC 
    LIMIT 20
  `;
  
  return executeRailwayQuery<Product>(query);
}

/**
 * Search products in Railway database (main_product table)
 * @param searchTerm Term to search for
 * @returns List of matching products
 */
export async function searchProducts(searchTerm: string) {
  const searchPattern = `%${searchTerm}%`;
  const query = `
    SELECT * FROM main_product 
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
