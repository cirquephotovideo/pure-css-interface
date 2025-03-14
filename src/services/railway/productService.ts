
/**
 * Product service for Railway DB
 */
import { toast } from "sonner";
import { executeRailwayQuery } from "./queryService";
import { LogLevel, addToLogBuffer } from "./logger";
import type { Product, QueryResult } from "./types";

/**
 * Fetch products from the database 
 * @returns Query result with products
 */
export async function fetchProducts(): Promise<QueryResult<Product>> {
  try {
    // First, get the list of tables to determine what we have available
    const tablesResult = await executeRailwayQuery<{table_name: string}>(
      `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND (table_name LIKE 'raw_%' OR table_name = 'products')
        ORDER BY table_name
      `
    );
    
    if (tablesResult.error) {
      addToLogBuffer(LogLevel.ERROR, `Erreur lors de la récupération des tables: ${tablesResult.error}`);
      return { data: null, count: 0, error: tablesResult.error };
    }
    
    // No tables found
    if (!tablesResult.data || tablesResult.data.length === 0) {
      const msg = "Aucune table trouvée dans la base de données";
      addToLogBuffer(LogLevel.WARN, msg);
      return { data: [], count: 0, error: null };
    }
    
    // Sample a table to get column structure
    const sampleTable = tablesResult.data[0].table_name;
    const columnsResult = await executeRailwayQuery<{column_name: string}>(
      `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = $1
        ORDER BY ordinal_position
      `,
      [sampleTable]
    );
    
    if (columnsResult.error) {
      addToLogBuffer(LogLevel.ERROR, `Erreur lors de la récupération des colonnes: ${columnsResult.error}`);
      return { data: null, count: 0, error: columnsResult.error };
    }
    
    // Build a basic product query based on detected columns
    let query = '';
    const availableColumns = columnsResult.data.map(col => col.column_name);
    
    // Build dynamic query for first table
    query = buildQueryForTable(sampleTable, availableColumns);
    
    // Add a limit to avoid too many results
    query += " LIMIT 50";
    
    addToLogBuffer(LogLevel.INFO, `Exécution de la requête: ${query}`);
    
    const result = await executeRailwayQuery<Product>(query);
    
    if (result.error) {
      addToLogBuffer(LogLevel.ERROR, `Erreur de requête: ${result.error}`);
      return result;
    }
    
    addToLogBuffer(LogLevel.INFO, `${result.data?.length || 0} produits trouvés`);
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    addToLogBuffer(LogLevel.ERROR, `Exception dans fetchProducts: ${errorMessage}`);
    return { data: null, count: 0, error: `Erreur lors de la récupération des produits: ${errorMessage}` };
  }
}

/**
 * Search products based on the provided query
 * @param searchQuery Query string
 * @returns Query result with matching products
 */
export async function searchProducts(searchQuery: string): Promise<QueryResult<Product>> {
  try {
    // First, get the list of tables to determine what we have available
    const tablesResult = await executeRailwayQuery<{table_name: string}>(
      `
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name LIKE 'raw_%'
  `
    );
    
    if (tablesResult.error) {
      addToLogBuffer(LogLevel.ERROR, `Erreur lors de la récupération des tables: ${tablesResult.error}`);
      return { data: null, count: 0, error: tablesResult.error };
    }
    
    // No tables found
    if (!tablesResult.data || tablesResult.data.length === 0) {
      const msg = "Aucune table trouvée dans la base de données";
      addToLogBuffer(LogLevel.WARN, msg);
      return { data: [], count: 0, error: null };
    }
    
    // Sample a table to get column structure
    const sampleTable = tablesResult.data[0].table_name;
    const columnsResult = await executeRailwayQuery<{column_name: string}>(
      `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = $1
        ORDER BY ordinal_position
      `,
      [sampleTable]
    );
    
    if (columnsResult.error) {
      addToLogBuffer(LogLevel.ERROR, `Erreur lors de la récupération des colonnes: ${columnsResult.error}`);
      return { data: null, count: 0, error: columnsResult.error };
    }
    
    // Get columns
    const availableColumns = columnsResult.data.map(col => col.column_name);
    
    // Use first 3 tables max to avoid query getting too big
    const tables = tablesResult.data.slice(0, 3).map(t => t.table_name);
    
    // Build queries for each table
    const queries = tables.map(table => {
      return buildSearchQueryForTable(table, availableColumns, searchQuery);
    });
    
    // Combine with UNION ALL
    const finalQuery = queries.join(" UNION ALL ");
    
    // Add a limit to avoid too many results
    const limitedQuery = `${finalQuery} LIMIT 100`;
    
    addToLogBuffer(LogLevel.INFO, `Recherche de produits avec ${searchQuery} dans ${tables.length} tables`);
    
    const result = await executeRailwayQuery<Product>(limitedQuery, [`%${searchQuery}%`]);
    
    if (result.error) {
      addToLogBuffer(LogLevel.ERROR, `Erreur de recherche: ${result.error}`);
      return result;
    }
    
    if (!result.data || result.data.length === 0) {
      addToLogBuffer(LogLevel.WARN, "Aucun produit trouvé dans toutes les tables");
    } else {
      addToLogBuffer(LogLevel.INFO, `${result.data.length} produits trouvés pour "${searchQuery}"`);
    }
    
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    addToLogBuffer(LogLevel.ERROR, `Exception dans searchProducts: ${errorMessage}`);
    return { 
      data: null, 
      count: 0, 
      error: `Erreur lors de la recherche de produits: ${errorMessage}` 
    };
  }
}

/**
 * Helper function to build a query for a table with available columns
 */
function buildQueryForTable(tableName: string, availableColumns: string[]): string {
  // Map common product fields to available columns
  const columnMappings: Record<string, string[]> = {
    id: ['id', 'articlenr', 'code_article'],
    reference: ['reference', 'articlenr', 'code_article'],
    barcode: ['barcode', 'eannr', 'ean'],
    description: ['description', 'description_odr1', 'unspscdescription'],
    brand: ['brand', 'oemnr'],
    supplier_code: ['supplier_code', 'oemnr', 'articlenr'],
    name: ['name', 'description', 'description_odr1'],
    price: ['price'],
    stock: ['stock'],
    location: ['location', 'stock_location']
  };
  
  // Build SELECT clause
  let selectClause = 'SELECT ';
  const selectParts: string[] = [];
  
  // Dynamically add each field based on available columns
  Object.entries(columnMappings).forEach(([targetField, possibleColumns]) => {
    // Find the first column that exists in the available columns
    const foundColumn = possibleColumns.find(col => availableColumns.includes(col));
    
    if (foundColumn) {
      selectParts.push(`${foundColumn} AS ${targetField}`);
    } else {
      // Use NULL or default value if no matching column exists
      selectParts.push(`NULL AS ${targetField}`);
    }
  });
  
  // Always add source_table for tracking
  selectParts.push(`'${tableName}' AS source_table`);
  
  selectClause += selectParts.join(', ');
  
  // Complete the query
  return `${selectClause} FROM ${tableName}`;
}

/**
 * Helper function to build a search query for a table with available columns
 */
function buildSearchQueryForTable(tableName: string, availableColumns: string[], searchQuery: string): string {
  // Start with the basic selection
  const baseQuery = buildQueryForTable(tableName, availableColumns);
  
  // Define searchable columns
  const searchableColumns = [
    'reference', 'articlenr', 'code_article',
    'barcode', 'eannr', 'ean', 
    'description', 'description_odr1',
    'brand', 'oemnr',
    'name'
  ];
  
  // Filter to columns that actually exist in the table
  const existingSearchColumns = searchableColumns.filter(col => 
    availableColumns.includes(col)
  );
  
  // If no searchable columns exist, return a query that will return no results
  if (existingSearchColumns.length === 0) {
    return `${baseQuery} WHERE 1=0`;
  }
  
  // Build WHERE clause for searching
  const whereConditions = existingSearchColumns.map(col => 
    `${col}::text ILIKE $1`
  );
  
  return `${baseQuery} WHERE ${whereConditions.join(' OR ')}`;
}

/**
 * Update a product in the database
 * @param productId ID of the product to update
 * @param productData Updated product data
 * @returns Query result
 */
export async function updateProduct(
  productId: string, 
  productData: Partial<Product>,
  sourceTable: string
): Promise<QueryResult<void>> {
  try {
    // Future implementation
    toast.error("Modification de produits non prise en charge");
    return { data: null, count: 0, error: "Non implémenté" };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { data: null, count: 0, error: errorMessage };
  }
}
