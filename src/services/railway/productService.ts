
/**
 * Railway DB Product Service
 * Handles product-related database operations
 */
import { toast } from "sonner";
import { Product, QueryResult } from "./types";
import { executeRailwayQuery } from "./queryService";
import { LogLevel, logMessage, addToLogBuffer } from "./logger";

/**
 * Fetch all products from the database
 */
export async function fetchProducts(): Promise<QueryResult<Product>> {
  try {
    logMessage(LogLevel.INFO, "Fetching all products");
    addToLogBuffer(LogLevel.INFO, "Récupération de tous les produits");
    
    // Construct a query to fetch products from multiple tables
    // with a unified schema for each result
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
      LIMIT 50
    `;
    
    const result = await executeRailwayQuery<Product>(query);
    
    if (result.error) {
      logMessage(LogLevel.ERROR, "Error fetching products", { error: result.error });
      addToLogBuffer(LogLevel.ERROR, `Erreur de requête: ${result.error}`);
      return result;
    }
    
    logMessage(LogLevel.INFO, `Fetched ${result.data?.length || 0} products`);
    addToLogBuffer(LogLevel.INFO, `${result.data?.length || 0} produits récupérés`);
    
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logMessage(LogLevel.ERROR, "Exception fetching products", { error: errorMessage });
    addToLogBuffer(LogLevel.ERROR, `Exception: ${errorMessage}`);
    toast.error("Erreur lors de la récupération des produits");
    
    return {
      data: [],
      count: 0,
      error: errorMessage
    };
  }
}

/**
 * Search for products by term
 */
export async function searchProducts(term: string): Promise<QueryResult<Product>> {
  try {
    // Log the search operation
    logMessage(LogLevel.INFO, `Recherche par terme (approximative): ${term}`);
    
    // First, get all available tables for searching
    const tablesQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND (table_name LIKE 'raw_%' OR table_name = 'products')
        ORDER BY table_name
      `;
    
    const tablesResult = await executeRailwayQuery<{table_name: string}>(tablesQuery);
    
    if (tablesResult.error) {
      logMessage(LogLevel.ERROR, "Error fetching tables", { error: tablesResult.error });
      addToLogBuffer(LogLevel.ERROR, `Erreur de requête des tables: ${tablesResult.error}`);
      return {
        data: [],
        count: 0,
        error: tablesResult.error
      };
    }
    
    // Get a list of raw tables to search
    const tables = tablesResult.data || [];
    
    // Limit to the first 5 tables for performance
    const selectedTables = tables.slice(0, 5);
    
    // Now for each table, get its columns to build a dynamic search query
    const tableQueries = [];
    
    for (const table of selectedTables) {
      const columnsQuery = `
          SELECT column_name
          FROM information_schema.columns
          WHERE table_schema = 'public'
          AND table_name = $1
          ORDER BY ordinal_position
        `;
      
      const columnsResult = await executeRailwayQuery<{column_name: string}>(
        columnsQuery, 
        [table.table_name]
      );
      
      if (columnsResult.error) {
        logMessage(LogLevel.ERROR, `Error fetching columns for ${table.table_name}`, 
                   { error: columnsResult.error });
        continue;
      }
      
      const columns = columnsResult.data || [];
      
      // Build a query part for this table
      if (table.table_name === 'products') {
        tableQueries.push(`
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
          WHERE "BRAND"::text ILIKE $1
        `);
      } else {
        // For raw tables, try to build a meaningful mapping
        const hasId = columns.some(c => c.column_name.toLowerCase() === 'id');
        const hasDescription = columns.some(c => c.column_name.toLowerCase() === 'description');
        const hasBrand = columns.some(c => c.column_name.toLowerCase() === 'brand');
        const hasArticleNr = columns.some(c => c.column_name.toLowerCase() === 'articlenr');
        const hasEan = columns.some(c => c.column_name.toLowerCase() === 'eannr');
        const hasPrice = columns.some(c => c.column_name.toLowerCase() === 'price');
        const hasStock = columns.some(c => c.column_name.toLowerCase() === 'stock');
        const hasLocation = columns.some(c => c.column_name.toLowerCase() === 'stock_location');
        const hasOem = columns.some(c => c.column_name.toLowerCase() === 'oemnr');
        const hasCodeArticle = columns.some(c => c.column_name.toLowerCase() === 'code_article');
        const hasDescriptionOdr = columns.some(c => c.column_name.toLowerCase() === 'description_odr1');
        
        // Build a query for this raw table
        // Convert column names to lowercase for case-insensitive comparison
        const searchableColumns = columns
          .filter(c => ['id', 'brand', 'code_article', 'oemnr', 'articlenr', 
                        'description_odr1', 'description'].includes(c.column_name.toLowerCase()))
          .map(c => `${c.column_name}::text ILIKE $1`);
        
        if (searchableColumns.length > 0) {
          tableQueries.push(`
            SELECT 
              ${hasId ? 'id' : 'NULL'} AS id, 
              ${hasArticleNr ? 'articlenr' : 'NULL'} AS reference, 
              ${hasEan ? 'eannr' : 'NULL'} AS barcode, 
              ${hasDescription ? 'description' : 'NULL'} AS description, 
              ${hasBrand ? 'brand' : 'NULL'} AS brand, 
              ${hasOem ? 'oemnr' : 'NULL'} AS supplier_code, 
              ${hasDescription ? 'description' : 'NULL'} AS name, 
              ${hasPrice ? 'price' : 'NULL'} AS price, 
              ${hasStock ? 'stock' : 'NULL'} AS stock, 
              ${hasLocation ? 'stock_location' : 'NULL'} AS location, 
              ${hasEan ? 'eannr' : 'NULL'} AS ean, 
              '${table.table_name}' AS source_table 
            FROM "${table.table_name}" 
            WHERE ${searchableColumns.join(' OR ')}
          `);
        }
      }
    }
    
    if (tableQueries.length === 0) {
      const errorMessage = "Aucune table valide pour la recherche n'a été trouvée";
      logMessage(LogLevel.ERROR, errorMessage);
      addToLogBuffer(LogLevel.ERROR, errorMessage);
      toast.error(errorMessage);
      
      return {
        data: [],
        count: 0,
        error: errorMessage
      };
    }
    
    // Join all table queries with UNION ALL
    const fullQuery = tableQueries.join(' UNION ALL ') + ' LIMIT 100';
    
    logMessage(LogLevel.INFO, `Recherche de produits avec "${term}" dans ${tableQueries.length} tables`);
    
    // Execute the combined search query
    const searchResult = await executeRailwayQuery<Product>(
      fullQuery, 
      [`%${term}%`]
    );
    
    if (searchResult.error) {
      logMessage(LogLevel.ERROR, "Error searching products", { error: searchResult.error });
      addToLogBuffer(LogLevel.ERROR, `Erreur de recherche: ${searchResult.error}`);
      toast.error("Erreur lors de la recherche de produits");
      
      return searchResult;
    }
    
    logMessage(LogLevel.INFO, `Found ${searchResult.data?.length || 0} products matching "${term}"`);
    addToLogBuffer(LogLevel.INFO, `${searchResult.data?.length || 0} produits trouvés pour "${term}"`);
    
    return searchResult;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logMessage(LogLevel.ERROR, "Exception searching products", { error: errorMessage });
    addToLogBuffer(LogLevel.ERROR, `Exception lors de la recherche: ${errorMessage}`);
    toast.error("Erreur lors de la recherche de produits");
    
    return {
      data: [],
      count: 0,
      error: errorMessage
    };
  }
}
