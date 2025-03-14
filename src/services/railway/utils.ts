
/**
 * Utility functions for Railway DB queries
 */

/**
 * Checks if a SQL query is read-only (SELECT only)
 * @param query SQL query to validate
 * @returns true if the query is read-only, false otherwise
 */
export function isReadOnlyQuery(query: string): boolean {
  const upperQuery = query.trim().toUpperCase();
  // Only allow SELECT operations
  return upperQuery.startsWith('SELECT');
}
