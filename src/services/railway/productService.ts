
import { executeRailwayQuery } from './queryService';
import { Product } from './types';
import { toast } from "sonner";

// Interface for search results
export interface SearchResult {
  data: Product[] | null;
  error: string | null;
}

// Fetch all products from the database
export const fetchProducts = async (): Promise<SearchResult> => {
  try {
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
        ARRAY(
          SELECT json_build_object('type', 'default', 'value', price) 
          FROM (SELECT price) p 
          WHERE price IS NOT NULL
        ) as prices,
        'products' as source_table
      FROM products
      LIMIT 100
    `;
    
    const result = await executeRailwayQuery<Product>(query);
    
    if (result.error) {
      return { data: null, error: result.error };
    }
    
    return { data: result.data || [], error: null };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

// Search for products in the database
export const searchProducts = async (searchTerm: string): Promise<SearchResult> => {
  try {
    // Get table configurations from localStorage
    const savedTableConfigs = localStorage.getItem('railway_search_tables');
    let tableConfigs: any[] = [];
    
    if (savedTableConfigs) {
      try {
        tableConfigs = JSON.parse(savedTableConfigs);
      } catch (e) {
        console.error('Error parsing saved table configurations:', e);
      }
    }
    
    // Filter enabled tables
    const enabledTables = tableConfigs.filter(config => config.enabled);
    
    if (enabledTables.length === 0) {
      // If no tables are enabled, search only in the products table
      return fetchProducts();
    }
    
    // Initialize empty results array
    let allResults: Product[] = [];
    
    // Execute a query for each enabled table
    for (const tableConfig of enabledTables) {
      const tableName = tableConfig.name;
      const searchFields = tableConfig.searchFields.length > 0 
        ? tableConfig.searchFields 
        : ['id', 'reference', 'name', 'description', 'brand', 'barcode', 'ean', 'supplier_code'];
      
      const columnMapping = tableConfig.columnMapping || {};
      
      // Build the WHERE clause for searching in the specified fields
      const searchConditions = searchFields.map(field => 
        `CAST(${field} AS TEXT) ILIKE $1`
      ).join(' OR ');
      
      let query = `
        SELECT 
          id,
          ${columnMapping.reference ? columnMapping.reference : 'reference'} as reference,
          ${columnMapping.name ? columnMapping.name : 'name'} as name,
          ${columnMapping.description ? columnMapping.description : 'description'} as description,
          ${columnMapping.brand ? columnMapping.brand : 'brand'} as brand,
          ${columnMapping.barcode ? columnMapping.barcode : 'barcode'} as barcode,
          ${columnMapping.ean ? columnMapping.ean : 'ean'} as ean,
          ${columnMapping.supplier_code ? columnMapping.supplier_code : 'supplier_code'} as supplier_code,
          ${columnMapping.stock ? columnMapping.stock : 'stock'} as stock,
          '${tableName}' as source_table
      `;
      
      // Add price mapping and conversion to prices array
      if (columnMapping.price) {
        query += `
          ,ARRAY(
            SELECT json_build_object('type', 'default', 'value', ${columnMapping.price}) 
            FROM (SELECT ${columnMapping.price}) p 
            WHERE ${columnMapping.price} IS NOT NULL
          ) as prices
        `;
      } else {
        query += `
          ,ARRAY(
            SELECT json_build_object('type', 'default', 'value', price) 
            FROM (SELECT price) p 
            WHERE price IS NOT NULL
          ) as prices
        `;
      }
      
      query += `
        FROM ${tableName}
        WHERE ${searchConditions}
        LIMIT 100
      `;
      
      const result = await executeRailwayQuery<Product>(query, [`%${searchTerm}%`]);
      
      if (result.data && result.data.length > 0) {
        allResults = [...allResults, ...result.data];
      }
    }
    
    if (allResults.length === 0) {
      return { data: [], error: null };
    }
    
    return { data: allResults, error: null };
  } catch (error) {
    console.error('Error searching products:', error);
    toast.error("Erreur de recherche", { 
      description: error instanceof Error ? error.message : 'Erreur inconnue' 
    });
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};
