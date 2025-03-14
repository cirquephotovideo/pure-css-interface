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
    // Check if the search query looks like an EAN code (numeric only)
    const isEanSearch = /^\d+$/.test(searchQuery);
    
    addToLogBuffer(LogLevel.INFO, `Recherche par ${isEanSearch ? "EAN (exacte)" : "terme (approximative)"}: ${searchQuery}`);
    
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
    
    // Use first 3 tables max to avoid query getting too big
    const tables = tablesResult.data.slice(0, 5).map(t => t.table_name);
    
    // Get columns for each table and build appropriate queries
    const queryParts = [];
    
    for (const table of tables) {
      // Get columns for this specific table
      const columnsResult = await executeRailwayQuery<{column_name: string}>(
        `
          SELECT column_name
          FROM information_schema.columns
          WHERE table_schema = 'public'
          AND table_name = $1
          ORDER BY ordinal_position
        `,
        [table]
      );
      
      if (columnsResult.error) {
        addToLogBuffer(LogLevel.ERROR, `Erreur lors de la récupération des colonnes pour ${table}: ${columnsResult.error}`);
        continue; // Skip this table but continue with others
      }
      
      const availableColumns = columnsResult.data.map(col => col.column_name);
      
      // Find searchable columns based on the type of search
      const searchableColumnsForTable = isEanSearch 
        ? getEanSearchColumns(availableColumns)  // Exact match for EAN/barcode columns
        : getSearchableColumns(availableColumns); // Approximate match for text columns
      
      if (searchableColumnsForTable.length === 0) {
        addToLogBuffer(LogLevel.WARN, `Aucune colonne recherchable trouvée dans ${table}, table ignorée`);
        continue; // Skip this table as it has no searchable columns
      }
      
      // Build a query specific for this table's structure and search type
      const tableQuery = buildSearchQueryForSpecificTable(
        table, 
        availableColumns, 
        searchableColumnsForTable, 
        isEanSearch
      );
      queryParts.push(tableQuery);
    }
    
    if (queryParts.length === 0) {
      addToLogBuffer(LogLevel.WARN, "Aucune table avec des colonnes recherchables n'a été trouvée");
      return { data: [], count: 0, error: null };
    }
    
    // Combine with UNION ALL
    const finalQuery = queryParts.join(" UNION ALL ");
    
    // Add a limit to avoid too many results
    const limitedQuery = `${finalQuery} LIMIT 100`;
    
    addToLogBuffer(LogLevel.INFO, `Recherche de produits avec "${searchQuery}" dans ${queryParts.length} tables`);
    
    // For EAN searches use exact match, for text searches use approximate match
    const params = isEanSearch 
      ? [searchQuery]  // Exact match
      : [`%${searchQuery}%`];  // Approximate match with LIKE
    
    const result = await executeRailwayQuery<Product>(limitedQuery, params);
    
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
 * Get columns that are specifically for EAN/barcode exact searches
 */
function getEanSearchColumns(availableColumns: string[]): string[] {
  // Define potential EAN/barcode column names (in lowercase for case-insensitive comparison)
  const potentialEanColumns = [
    'barcode', 'eannr', 'ean', 'ean_code', 'gtin', 'upc', 'article_code'
  ];
  
  // Filter columns that can be used for EAN searching
  return availableColumns.filter(col => 
    potentialEanColumns.includes(col.toLowerCase())
  );
}

/**
 * Get searchable columns from available columns for approximate text searches
 */
function getSearchableColumns(availableColumns: string[]): string[] {
  // Define potential searchable column names (in lowercase for case-insensitive comparison)
  const potentialSearchColumns = [
    'id', 'reference', 'articlenr', 'code_article', 
    'description', 'description_odr1', 'desc', 'product_name', 'name',
    'brand', 'oemnr', 'manu_name', 'manufacturer', 'marque',
    'supplier_code', 'supplier', 'vendor', 'vendor_code',
    'part_number', 'part_no', 'manu_part_no', 'midw_part_no'
  ];
  
  // Filter columns that can be used for searching
  return availableColumns.filter(col => 
    potentialSearchColumns.includes(col.toLowerCase())
  );
}

/**
 * Helper function to build a query for a table with available columns
 */
function buildQueryForTable(tableName: string, availableColumns: string[]): string {
  // Map common product fields to available columns
  const columnMappings: Record<string, string[]> = {
    id: ['id', 'articlenr', 'code_article', 'manu_part_no', 'midw_part_no'],
    reference: ['reference', 'articlenr', 'code_article', 'manu_part_no', 'midw_part_no'],
    barcode: ['barcode', 'eannr', 'ean', 'ean_code', 'gtin'],
    description: ['description', 'description_odr1', 'desc', 'product_name', 'unspscdescription'],
    brand: ['brand', 'oemnr', 'manu_name', 'manufacturer', 'marque'],
    supplier_code: ['supplier_code', 'oemnr', 'articlenr', 'supplier', 'vendor', 'vendor_code'],
    name: ['name', 'description', 'description_odr1', 'product_name'],
    price: ['price', 'cost', 'list', 'prix', 'price_ht', 'price_ht', 'price_euro'],
    stock: ['stock', 'quantity', 'qty', 'stockcap', 'current_stock', 'available_stock'],
    location: ['location', 'stock_location', 'warehouse', 'depot'],
    ean: ['ean', 'eannr', 'ean_code', 'gtin', 'upc']
  };
  
  // Build SELECT clause
  let selectClause = 'SELECT ';
  const selectParts: string[] = [];
  
  // Dynamically add each field based on available columns
  Object.entries(columnMappings).forEach(([targetField, possibleColumns]) => {
    // Find the first column that exists in the available columns
    const matchingColumns = possibleColumns.filter(col => 
      availableColumns.some(availCol => availCol.toLowerCase() === col.toLowerCase())
    );
    
    const foundColumn = matchingColumns.length > 0 ? 
      availableColumns.find(availCol => 
        availCol.toLowerCase() === matchingColumns[0].toLowerCase()
      ) : null;
    
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
  return `${selectClause} FROM "${tableName}"`;
}

/**
 * Build a search query for a specific table with its known columns
 */
function buildSearchQueryForSpecificTable(
  tableName: string, 
  availableColumns: string[],
  searchableColumns: string[], 
  isExactMatch: boolean = false
): string {
  // Start with the basic selection
  const baseQuery = buildQueryForTable(tableName, availableColumns);
  
  // If no searchable columns exist, return a query that will return no results
  if (searchableColumns.length === 0) {
    return `${baseQuery} WHERE 1=0`;
  }
  
  // Build WHERE clause based on search type
  const whereConditions = searchableColumns.map(col => 
    isExactMatch
      ? `${col}::text = $1`  // Exact match for EAN codes
      : `${col}::text ILIKE $1`  // Approximate match for text searches
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
