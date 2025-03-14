
/**
 * Product-specific service functions for Railway DB
 */
import { Product, QueryResult } from "./types";
import { executeRailwayQuery } from "./queryService";

/**
 * Fetch products from Railway database (products table)
 * @returns List of products
 */
export async function fetchProducts(): Promise<QueryResult<Product>> {
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
export async function searchProducts(searchTerm: string): Promise<QueryResult<Product>> {
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
