
/**
 * Main entry point for Railway DB services
 * Re-exports all the necessary functions and types
 */

// Re-export types
export type { Product, QueryResult } from './types';

// Re-export core query service
export { executeRailwayQuery } from './queryService';

// Re-export product service functions
export { fetchProducts, searchProducts } from './productService';
