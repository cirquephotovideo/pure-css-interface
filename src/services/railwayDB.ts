
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
    const { data, error } = await supabase.functions.invoke("railway-db", {
      body: { query, params },
    });

    if (error) {
      console.error("Error executing Railway DB query:", error);
      toast.error("Database error: " + error.message);
      return { data: null, count: 0, error: error.message };
    }

    return data as QueryResult<T>;
  } catch (error) {
    console.error("Error calling Railway DB function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    toast.error("Database connection error");
    return { data: null, count: 0, error: errorMessage };
  }
}

/**
 * Example function to fetch products from Railway database
 * @returns List of products
 */
export async function fetchProducts() {
  const query = `
    SELECT * FROM products 
    ORDER BY reference ASC 
    LIMIT 20
  `;
  
  return executeRailwayQuery(query);
}

/**
 * Search products in Railway database
 * @param searchTerm Term to search for
 * @returns List of matching products
 */
export async function searchProducts(searchTerm: string) {
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
  
  return executeRailwayQuery(query, [`%${searchTerm}%`]);
}
