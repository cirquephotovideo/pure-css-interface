
/**
 * Types and interfaces for Railway DB services
 */

// Product interface to match our database schema for products table
export interface Product {
  id: string;
  reference: string;
  barcode: string;
  description: string;
  brand: string;
  location: string;
  imageUrl: string;
  catalog: string;
  prices: {
    type: string;
    value: number;
  }[];
  eco?: {
    [key: string]: number;
  };
  // Additional fields for extended search
  name?: string;
  supplier_code?: string;
  ean?: string;
  // Additional fields that might be in products
  sku?: string;
  stock?: number;
  category?: string;
  subcategory?: string;
  // Source table field to know where the product came from
  source_table?: string;
}

// Standard query result interface
export interface QueryResult<T> {
  data: T[] | null;
  count: number;
  error: string | null;
}
