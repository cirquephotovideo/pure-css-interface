
/**
 * Product-specific service functions for Railway DB
 */
import { Product, QueryResult } from "./types";
import { executeRailwayQuery } from "./queryService";
import { LogLevel, addToLogBuffer, clearLogBuffer } from "./logger";

// Interface for table configuration
interface TableConfig {
  name: string;
  enabled: boolean;
  searchFields: string[];
  displayFields: string[];
}

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
 * Search products in Railway database based on user configuration
 * @param searchTerm Term to search for
 * @returns List of matching products
 */
export async function searchProducts(searchTerm: string): Promise<QueryResult<Product>> {
  // Clear previous log buffer when starting a new search
  clearLogBuffer();
  addToLogBuffer(LogLevel.INFO, `Début de recherche pour: "${searchTerm}"`);
  
  const searchPattern = `%${searchTerm}%`;
  
  // Get the saved table configurations
  let tableConfigs: TableConfig[] = [];
  try {
    const savedConfig = localStorage.getItem('railway_search_tables');
    if (savedConfig) {
      tableConfigs = JSON.parse(savedConfig);
    }
  } catch (error) {
    addToLogBuffer(LogLevel.ERROR, `Erreur lors de la lecture de la configuration des tables: ${error}`);
  }
  
  // Filter to only enabled tables
  const enabledTables = tableConfigs.filter(config => config.enabled);
  
  if (enabledTables.length === 0) {
    // If no tables are configured or enabled, fallback to the default behavior
    addToLogBuffer(LogLevel.WARN, "Aucune table configurée pour la recherche, utilisation du comportement par défaut");
    return searchProductsDefault(searchTerm);
  }
  
  // Get list of raw_ tables if configuration is present but no enabled tables yet
  try {
    const tableQueries: string[] = [];
    
    // Add query for each enabled table
    for (const tableConfig of enabledTables) {
      addToLogBuffer(LogLevel.INFO, `Préparation de la recherche dans la table ${tableConfig.name}`);
      
      // If no search fields configured, skip this table
      if (!tableConfig.searchFields || tableConfig.searchFields.length === 0) {
        addToLogBuffer(LogLevel.WARN, `Aucun champ de recherche configuré pour la table ${tableConfig.name}, table ignorée`);
        continue;
      }
      
      // Build the search conditions based on configured search fields
      const searchConditions = tableConfig.searchFields
        .map(field => `${field}::text ILIKE $1`)
        .join(' OR ');
      
      // Determine fields to select
      let selectFields = '*';
      if (tableConfig.displayFields && tableConfig.displayFields.length > 0) {
        // Use specific display fields if configured
        const displayFields = tableConfig.displayFields.join(', ');
        selectFields = `${displayFields}`;
      }
      
      // Add the query for this table
      tableQueries.push(`
        SELECT 
          ${selectFields},
          '${tableConfig.name}' as source_table
        FROM ${tableConfig.name}
        WHERE ${searchConditions}
      `);
    }
    
    if (tableQueries.length === 0) {
      // If no valid queries generated, fallback to default
      addToLogBuffer(LogLevel.WARN, "Aucune requête valide générée, utilisation du comportement par défaut");
      return searchProductsDefault(searchTerm);
    }
    
    // Combine all queries with UNION
    const unionQuery = tableQueries.join(' UNION ALL ');
    
    // Add ordering and limit
    const finalQuery = `${unionQuery} ORDER BY reference ASC LIMIT 30`;
    
    addToLogBuffer(LogLevel.INFO, `Exécution de la recherche dans ${tableQueries.length} tables`);
    const result = await executeRailwayQuery<Product>(finalQuery, [searchPattern]);
    
    if (result.data && result.data.length > 0) {
      // Count results by source table
      const resultsByTable = result.data.reduce((acc, product) => {
        const source = product.source_table || 'unknown';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Log results breakdown
      Object.entries(resultsByTable).forEach(([table, count]) => {
        addToLogBuffer(LogLevel.INFO, `${count} produit(s) trouvé(s) dans la table ${table}`);
      });
    } else {
      addToLogBuffer(LogLevel.WARN, "Aucun produit trouvé dans toutes les tables");
    }
    
    return result;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    addToLogBuffer(LogLevel.ERROR, `Erreur lors de la recherche avec configuration: ${errorMessage}`);
    
    // Fallback to default search on error
    addToLogBuffer(LogLevel.WARN, "Tentative de repli sur la recherche par défaut");
    return searchProductsDefault(searchTerm);
  }
}

/**
 * Default search function that searches across raw_* tables and products
 * Used as fallback when no configuration is available
 * @param searchTerm Term to search for
 * @returns List of matching products
 */
async function searchProductsDefault(searchTerm: string): Promise<QueryResult<Product>> {
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
    addToLogBuffer(LogLevel.DEBUG, "Recherche des tables raw_* disponibles");
    const tablesResult = await executeRailwayQuery<{table_name: string}>(getTablesQuery);
    const rawTables = tablesResult.data || [];
    
    if (rawTables.length === 0) {
      addToLogBuffer(LogLevel.WARN, "Aucune table raw_* trouvée, recherche uniquement dans la table products");
      // If no raw_ tables found, just search in products
      const productsQuery = `
        SELECT * FROM products 
        WHERE 
          reference ILIKE $1 OR 
          barcode ILIKE $1 OR 
          name ILIKE $1 OR
          supplier_code ILIKE $1 OR
          ean ILIKE $1 OR
          description ILIKE $1 OR
          brand ILIKE $1
        ORDER BY reference ASC 
        LIMIT 20
      `;
      
      addToLogBuffer(LogLevel.DEBUG, "Exécution de la recherche dans products");
      const result = await executeRailwayQuery<Product>(productsQuery, [searchPattern]);
      
      if (result.data && result.data.length > 0) {
        addToLogBuffer(LogLevel.INFO, `${result.data.length} produit(s) trouvé(s) dans products`);
      } else {
        addToLogBuffer(LogLevel.INFO, "Aucun produit trouvé dans products");
      }
      
      return result;
    }
    
    // Build UNION query to search across all relevant tables
    let unionQuery = '';
    const tableQueries = [];
    
    // Add products table query
    addToLogBuffer(LogLevel.DEBUG, "Création de la requête pour la table products");
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
        name,
        supplier_code,
        ean,
        'products' as source_table
      FROM products 
      WHERE 
        reference ILIKE $1 OR 
        barcode ILIKE $1 OR 
        name ILIKE $1 OR
        supplier_code ILIKE $1 OR
        ean ILIKE $1 OR
        description ILIKE $1 OR
        brand ILIKE $1
    `);
    
    // Add queries for each raw_ table
    addToLogBuffer(LogLevel.DEBUG, `Création de requêtes pour ${rawTables.length} tables raw_*`);
    rawTables.forEach(table => {
      addToLogBuffer(LogLevel.DEBUG, `Ajout de la table ${table.table_name} à la recherche`);
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
          name::text as name,
          supplier_code::text as supplier_code,
          ean::text as ean,
          '${table.table_name}' as source_table
        FROM ${table.table_name}
        WHERE 
          reference::text ILIKE $1 OR 
          barcode::text ILIKE $1 OR 
          name::text ILIKE $1 OR
          supplier_code::text ILIKE $1 OR
          ean::text ILIKE $1 OR
          description::text ILIKE $1 OR
          brand::text ILIKE $1
      `);
    });
    
    // Combine all queries with UNION
    unionQuery = tableQueries.join(' UNION ALL ');
    
    // Add ordering and limit
    unionQuery += ` ORDER BY reference ASC LIMIT 20`;
    
    addToLogBuffer(LogLevel.INFO, `Exécution de la recherche dans ${rawTables.length + 1} tables`);
    const result = await executeRailwayQuery<Product>(unionQuery, [searchPattern]);
    
    if (result.data && result.data.length > 0) {
      // Count results by source table
      const resultsByTable = result.data.reduce((acc, product) => {
        const source = product.source_table || 'unknown';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Log results breakdown
      Object.entries(resultsByTable).forEach(([table, count]) => {
        addToLogBuffer(LogLevel.INFO, `${count} produit(s) trouvé(s) dans la table ${table}`);
      });
    } else {
      addToLogBuffer(LogLevel.WARN, "Aucun produit trouvé dans toutes les tables");
    }
    
    return result;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    addToLogBuffer(LogLevel.ERROR, `Erreur lors de la recherche: ${errorMessage}`);
    
    // Fallback to just products table if there's an error
    addToLogBuffer(LogLevel.WARN, "Tentative de repli sur la table products uniquement");
    const fallbackQuery = `
      SELECT * FROM products 
      WHERE 
        reference ILIKE $1 OR 
        barcode ILIKE $1 OR 
        name ILIKE $1 OR
        supplier_code ILIKE $1 OR
        ean ILIKE $1 OR
        description ILIKE $1 OR
        brand ILIKE $1
      ORDER BY reference ASC 
      LIMIT 20
    `;
    
    return executeRailwayQuery<Product>(fallbackQuery, [searchPattern]);
  }
}
