
/**
 * Product service for Railway DB access
 */
import { executeRailwayQuery } from "./queryService";
import { Product, ProductQueryResult } from "./types";
import { LogLevel, addToLogBuffer } from "./logger";

/**
 * Fetch all products from the database
 * @returns Promise with product data
 */
export async function fetchProducts(): Promise<ProductQueryResult> {
  try {
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
    return result;
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      data: null,
      count: 0,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Enhances a product with information from settings
 */
function enhanceProductsWithSettings(products: Product[]): Product[] {
  // Get table search configurations from localStorage if available
  let tableConfigs: any[] = [];
  
  try {
    const configsStr = localStorage.getItem('table_search_configs');
    if (configsStr) {
      tableConfigs = JSON.parse(configsStr);
    }
  } catch (e) {
    console.error("Error parsing table configs:", e);
  }
  
  // If no configs, return original products
  if (!tableConfigs || tableConfigs.length === 0) {
    return products;
  }
  
  // Enhance products with column mappings if available
  return products.map(product => {
    // Find config for this product's source table
    const tableConfig = tableConfigs.find(config => 
      config.name === product.source_table
    );
    
    // If no mapping for this table, return product as is
    if (!tableConfig || !tableConfig.columnMapping) {
      return product;
    }
    
    // Clone product to avoid mutating the original
    const enhancedProduct = { ...product };
    
    // Initialize prices array if it doesn't exist
    if (!enhancedProduct.prices) {
      enhancedProduct.prices = [];
    }
    
    // Apply column mappings based on standardized fields
    if (product.price && tableConfig.columnMapping.price) {
      // Add price information to the prices array
      enhancedProduct.prices.push({
        value: product.price,
        type: 'default',
        currency: '€',
        source: product.source_table
      });
    }
    
    return enhancedProduct;
  });
}

/**
 * Search products across multiple tables
 * @param term Search term to look for
 * @returns Promise with product data
 */
export async function searchProducts(term: string): Promise<ProductQueryResult> {
  try {
    // Check if the search term looks like an EAN/barcode (all digits)
    const isEanSearch = /^\d+$/.test(term);
    
    // Get table search configurations from localStorage if available
    let tableConfigs: any[] = [];
    try {
      const configsStr = localStorage.getItem('table_search_configs');
      if (configsStr) {
        tableConfigs = JSON.parse(configsStr);
      }
    } catch (e) {
      console.error("Error parsing table configs:", e);
    }
    
    // Filter to only use enabled tables
    const enabledTables = tableConfigs.filter(config => config.enabled);
    
    // If no tables are enabled, use a default query for products
    if (enabledTables.length === 0) {
      addToLogBuffer(LogLevel.INFO, `Aucune table configurée pour la recherche. Utilisation de la table products par défaut.`);
      
      // Build query params for LIKE search
      const params = isEanSearch 
        ? [term] // Exact match for EAN codes
        : [`%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`, term]; // LIKE for text search
      
      const query = `
        SELECT 
          NULL AS id, 
          "ART NUMBER" AS reference, 
          NULL AS barcode, 
          "DESIGNATION 1" AS description, 
          "BRAND" AS brand, 
          NULL AS supplier_code, 
          "DESIGNATION 2" AS name, 
          "PRICE" AS price, 
          "STOCKCAP" AS stock, 
          NULL AS location, 
          "EAN CODE" AS ean, 
          'products' AS source_table 
        FROM "products" 
        WHERE 
          ${isEanSearch 
            ? '"EAN CODE"::text = $1' 
            : '"BRAND"::text ILIKE $1 OR "DESIGNATION 1"::text ILIKE $2 OR "DESIGNATION 2"::text ILIKE $3 OR "ART NUMBER"::text ILIKE $4 OR "EAN CODE"::text = $5'
          }
        LIMIT 20
      `;
      
      const result = await executeRailwayQuery<Product>(query, params);
      
      if (result.data && !result.error) {
        // Enhance products with column mappings
        result.data = enhanceProductsWithSettings(result.data);
      }
      
      return result;
    }
    
    // We need to build queries for each enabled table
    let results: Product[] = [];
    
    addToLogBuffer(LogLevel.INFO, `Recherche dans ${enabledTables.length} tables configurées`);
    
    // Process each enabled table one by one to avoid complex UNION queries
    for (const tableConfig of enabledTables) {
      const { name: tableName, searchFields, columnMapping } = tableConfig;
      
      if (!searchFields || searchFields.length === 0) {
        addToLogBuffer(LogLevel.WARN, `Table ${tableName} n'a pas de champs de recherche configurés`);
        continue;
      }
      
      addToLogBuffer(LogLevel.INFO, `Recherche dans la table ${tableName} sur ${searchFields.length} champs`);
      
      // Build the WHERE clause for this table
      let whereConditions = [];
      let queryParams = [];
      let paramIndex = 1;
      
      // For EAN/barcode search, try to find relevant fields
      if (isEanSearch) {
        // Look for barcode/ean related fields in the mapping or column names
        const barcodeFields = searchFields.filter(field => 
          field.toLowerCase().includes('ean') || 
          field.toLowerCase().includes('barcode') || 
          field.toLowerCase().includes('code_barre') ||
          field.toLowerCase().includes('upc') ||
          field.toLowerCase().includes('gtin')
        );
        
        if (barcodeFields.length > 0) {
          barcodeFields.forEach(field => {
            whereConditions.push(`"${field}"::text = $${paramIndex}`);
            queryParams.push(term);
            paramIndex++;
          });
        } else {
          // If no specific barcode fields, search in all fields for exact match
          searchFields.forEach(field => {
            whereConditions.push(`"${field}"::text = $${paramIndex}`);
            queryParams.push(term);
            paramIndex++;
          });
        }
      } else {
        // Regular text search
        searchFields.forEach(field => {
          whereConditions.push(`"${field}"::text ILIKE $${paramIndex}`);
          queryParams.push(`%${term}%`);
          paramIndex++;
        });
      }
      
      // Skip if no conditions built
      if (whereConditions.length === 0) continue;
      
      // Figure out mappings for standard fields
      const idField = columnMapping?.id || 'id';
      const referenceField = columnMapping?.reference || null;
      const barcodeField = columnMapping?.barcode || null;
      const descriptionField = columnMapping?.description || null;
      const brandField = columnMapping?.brand || null;
      const supplierCodeField = columnMapping?.supplier_code || null;
      const nameField = columnMapping?.name || null;
      const priceField = columnMapping?.price || null;
      const stockField = columnMapping?.stock || null;
      const locationField = columnMapping?.location || null;
      const eanField = columnMapping?.ean || null;
      
      // Build the SELECT clause with NULL for unmapped fields
      const selectFields = `
        ${idField ? `"${idField}"` : 'NULL'} AS id,
        ${referenceField ? `"${referenceField}"` : 'NULL'} AS reference,
        ${barcodeField ? `"${barcodeField}"` : 'NULL'} AS barcode,
        ${descriptionField ? `"${descriptionField}"` : 'NULL'} AS description,
        ${brandField ? `"${brandField}"` : 'NULL'} AS brand,
        ${supplierCodeField ? `"${supplierCodeField}"` : 'NULL'} AS supplier_code,
        ${nameField ? `"${nameField}"` : 'NULL'} AS name,
        ${priceField ? `"${priceField}"` : 'NULL'} AS price,
        ${stockField ? `"${stockField}"` : 'NULL'} AS stock,
        ${locationField ? `"${locationField}"` : 'NULL'} AS location,
        ${eanField ? `"${eanField}"` : 'NULL'} AS ean,
        '${tableName}' AS source_table
      `;
      
      // Build the final query
      const query = `
        SELECT ${selectFields}
        FROM "${tableName}"
        WHERE ${whereConditions.join(' OR ')}
        LIMIT 20
      `;
      
      try {
        addToLogBuffer(LogLevel.INFO, `Exécution de la requête pour ${tableName}`);
        
        const result = await executeRailwayQuery<Product>(query, queryParams);
        
        if (result.error) {
          addToLogBuffer(LogLevel.ERROR, `Erreur lors de la recherche dans ${tableName}: ${result.error}`);
        } else if (result.data) {
          addToLogBuffer(LogLevel.INFO, `${result.data.length} résultats trouvés dans ${tableName}`);
          
          // Add results to our array
          results = [...results, ...result.data];
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        addToLogBuffer(LogLevel.ERROR, `Exception lors de la recherche dans ${tableName}: ${errorMsg}`);
      }
    }
    
    // If we have results, return them
    if (results.length > 0) {
      const enhancedResults = enhanceProductsWithSettings(results);
      return {
        data: enhancedResults,
        count: enhancedResults.length,
        error: null
      };
    }
    
    // No results found
    addToLogBuffer(LogLevel.INFO, `Aucun résultat trouvé pour "${term}"`);
    return {
      data: [],
      count: 0,
      error: null
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Error searching products:", error);
    addToLogBuffer(LogLevel.ERROR, `Erreur de recherche: ${errorMsg}`);
    return {
      data: null,
      count: 0,
      error: errorMsg
    };
  }
}
