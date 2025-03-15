
import { executeRailwayQuery } from "./queryService";
import { Product, QueryResult } from "./types";

/**
 * Fetch all products from the database
 */
export async function fetchProducts(): Promise<QueryResult<Product>> {
  try {
    // Modified query to select columns with their original names and aliases
    const query = `
      SELECT 
        id, 
        reference, 
        name, 
        description, 
        brand, 
        barcode, 
        ean,
        supplier_code,
        stock,
        price,
        'products' as source_table
      FROM products
      LIMIT 100
    `;
    
    return await executeRailwayQuery<Product>(query);
  } catch (error) {
    console.error("Error fetching products:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      data: null,
      count: 0,
      error: `Error fetching products: ${errorMessage}`
    };
  }
}

/**
 * Search for products by term
 */
export async function searchProducts(searchTerm: string): Promise<QueryResult<Product>> {
  try {
    let query = '';
    let params = [];
    
    // Determine if the search is for a numeric identifier (EAN, barcode)
    if (/^\d+$/.test(searchTerm)) {
      // Search by EAN or barcode (exact match)
      query = `
        SELECT 
          id, 
          reference, 
          name, 
          description, 
          brand, 
          barcode, 
          ean,
          supplier_code,
          stock,
          price,
          'products' as source_table
        FROM products
        WHERE ean = $1 OR barcode = $1
        LIMIT 100
      `;
      params = [searchTerm];
    } else {
      // Full text search on multiple fields
      query = `
        SELECT 
          id, 
          reference, 
          name, 
          description, 
          brand, 
          barcode, 
          ean,
          supplier_code,
          stock,
          price,
          'products' as source_table
        FROM products
        WHERE 
          name ILIKE $1 OR 
          reference ILIKE $1 OR 
          description ILIKE $1 OR
          brand ILIKE $1 OR
          supplier_code ILIKE $1
        LIMIT 100
      `;
      params = [`%${searchTerm}%`];
    }
    
    return await executeRailwayQuery<Product>(query, params);
  } catch (error) {
    console.error("Error searching products:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      data: null,
      count: 0,
      error: `Error searching products: ${errorMessage}`
    };
  }
}
