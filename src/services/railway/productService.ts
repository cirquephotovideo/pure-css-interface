
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
 * Search products in Railway database across all raw_* tables and products table
 * @param searchTerm Term to search for
 * @returns List of matching products
 */
export async function searchProducts(searchTerm: string): Promise<QueryResult<Product>> {
  const searchPattern = `%${searchTerm}%`;
  
  // First, get a list of all tables starting with 'raw_'
  const getTablesQuery = `
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name LIKE 'raw_%'
  `;
  
  try {
    // Get all raw_ tables
    const tablesResult = await executeRailwayQuery<{table_name: string}>(getTablesQuery);
    const rawTables = tablesResult.data || [];
    
    if (rawTables.length === 0) {
      console.log("No raw_ tables found, searching only in products table");
      // If no raw_ tables found, just search in products
      const productsQuery = `
        SELECT * FROM products 
        WHERE 
          reference ILIKE $1 OR 
          barcode ILIKE $1 OR 
          description ILIKE $1 OR
          brand ILIKE $1
        ORDER BY reference ASC 
        LIMIT 20
      `;
      
      return executeRailwayQuery<Product>(productsQuery, [searchPattern]);
    }
    
    // Build UNION query to search across all relevant tables
    let unionQuery = '';
    const tableQueries = [];
    
    // Add products table query
    tableQueries.push(`
      SELECT 
        id,
        reference,
        barcode,
        description,
        brand,
        location,
        imageUrl,
        catalog,
        prices,
        eco,
        'products' as source_table
      FROM products 
      WHERE 
        reference ILIKE $1 OR 
        barcode ILIKE $1 OR 
        description ILIKE $1 OR
        brand ILIKE $1
    `);
    
    // Add queries for each raw_ table
    rawTables.forEach(table => {
      tableQueries.push(`
        SELECT 
          id::text as id,
          reference::text as reference,
          barcode::text as barcode,
          description::text as description,
          brand::text as brand,
          location::text as location,
          image_url::text as imageUrl,
          catalog::text as catalog,
          COALESCE(prices, '[]'::jsonb) as prices,
          COALESCE(eco, '{}'::jsonb) as eco,
          '${table.table_name}' as source_table
        FROM ${table.table_name}
        WHERE 
          reference::text ILIKE $1 OR 
          barcode::text ILIKE $1 OR 
          description::text ILIKE $1 OR
          brand::text ILIKE $1
      `);
    });
    
    // Combine all queries with UNION
    unionQuery = tableQueries.join(' UNION ALL ');
    
    // Add ordering and limit
    unionQuery += ` ORDER BY reference ASC LIMIT 20`;
    
    console.log("Executing multi-table search with query:", unionQuery);
    return executeRailwayQuery<Product>(unionQuery, [searchPattern]);
    
  } catch (error) {
    console.error("Error searching across tables:", error);
    
    // Fallback to just products table if there's an error
    const fallbackQuery = `
      SELECT * FROM products 
      WHERE 
        reference ILIKE $1 OR 
        barcode ILIKE $1 OR 
        description ILIKE $1 OR
        brand ILIKE $1
      ORDER BY reference ASC 
      LIMIT 20
    `;
    
    return executeRailwayQuery<Product>(fallbackQuery, [searchPattern]);
  }
}
