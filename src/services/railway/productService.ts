
/**
 * Services for retrieving and managing products from Railway DB
 */
import { Product, QueryResult } from "./types";
import { executeRailwayQuery } from "./queryService";
import { LogLevel, logMessage, addToLogBuffer } from "./logger";

/**
 * Fetch all products from Railway DB with optional limit
 */
export async function fetchProducts(limit: number = 50): Promise<QueryResult<Product>> {
  logMessage(LogLevel.INFO, "Fetching all products");
  addToLogBuffer(LogLevel.INFO, "Récupération de tous les produits");
  
  // Build a select query that gets all available products
  const query = `
      SELECT 
        NULL AS id, 
        NULL AS reference, 
        NULL AS barcode, 
        NULL AS description, 
        "BRAND" AS brand, 
        NULL AS supplier_code, 
        NULL AS name, 
        "PRICE" AS price, 
        "STOCKCAP" AS stock, 
        NULL AS location, 
        NULL AS ean, 
        'products' AS source_table 
      FROM "products" 
      LIMIT ${limit}
    `;
  
  try {
    const result = await executeRailwayQuery<Product>(query);
    
    if (result.error) {
      logMessage(LogLevel.ERROR, "Error fetching products", { error: result.error });
      addToLogBuffer(LogLevel.ERROR, `Erreur de requête: ${result.error}`);
    }
    
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logMessage(LogLevel.ERROR, "Error in fetchProducts", { error: errorMessage });
    addToLogBuffer(LogLevel.ERROR, `Erreur de requête: ${errorMessage}`);
    return {
      data: null,
      count: 0,
      error: errorMessage
    };
  }
}

/**
 * Search for products across multiple tables in Railway DB
 */
export async function searchProducts(searchTerm: string): Promise<QueryResult<Product>> {
  logMessage(LogLevel.INFO, "Searching for products", { searchTerm });
  addToLogBuffer(LogLevel.INFO, `Recherche de produits: ${searchTerm}`);
  
  // First, try to get the configured tables for search from localStorage
  let searchTables: Array<{name: string, enabled: boolean, searchFields: string[]}> = [];
  try {
    const savedConfig = localStorage.getItem('railway_search_tables');
    if (savedConfig) {
      searchTables = JSON.parse(savedConfig);
      searchTables = searchTables.filter(table => table.enabled);
    }
  } catch (e) {
    console.error("Error parsing saved table configurations:", e);
  }
  
  // If no configured tables, use default (products table)
  if (!searchTables || searchTables.length === 0) {
    searchTables = [
      {
        name: 'products',
        enabled: true,
        searchFields: ['BRAND']
      }
    ];
  }
  
  // Build query for each search table
  const tableQueries = searchTables.map(table => {
    const fields = table.searchFields.join(', ');
    return `
      SELECT 
        NULL AS id, 
        NULL AS reference, 
        NULL AS barcode, 
        NULL AS description, 
        "${fields}" AS brand, 
        NULL AS supplier_code, 
        NULL AS name, 
        "PRICE" AS price, 
        "STOCKCAP" AS stock, 
        NULL AS location, 
        NULL AS ean, 
        '${table.name}' AS source_table 
      FROM "${table.name}" 
      WHERE "${fields}" ILIKE '%${searchTerm}%'
      LIMIT 100
    `;
  });
  
  // Combine all queries with UNION
  const combinedQuery = tableQueries.join(" UNION ALL ");
  
  try {
    // Execute without parameters to avoid the binding issue
    const result = await executeRailwayQuery<Product>(combinedQuery);
    
    if (result.error) {
      logMessage(LogLevel.ERROR, "Error searching products", { error: result.error });
      addToLogBuffer(LogLevel.ERROR, `Erreur de recherche: ${result.error}`);
    }
    
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logMessage(LogLevel.ERROR, "Error in searchProducts", { error: errorMessage });
    addToLogBuffer(LogLevel.ERROR, `Erreur de recherche: ${errorMessage}`);
    return {
      data: null,
      count: 0,
      error: errorMessage
    };
  }
}
