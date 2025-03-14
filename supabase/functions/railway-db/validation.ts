
/**
 * Validation functions for the Railway DB edge function
 */

/**
 * Validates the required database configuration
 */
export function validateDbConfig(dbConfig) {
  const { host, port, database, user, password } = dbConfig || {};
  
  // Log the received config for debugging (without the actual password)
  console.log("Received DB Config:", {
    host,
    port,
    database,
    user,
    passwordProvided: password ? "Yes" : "No"
  });
  
  if (!host || !port || !database || !user || !password) {
    const missingFields = [];
    if (!host) missingFields.push("host");
    if (!port) missingFields.push("port");
    if (!database) missingFields.push("database");
    if (!user) missingFields.push("user");
    if (!password) missingFields.push("password");
    
    console.error(`Missing Railway database configuration fields: ${missingFields.join(', ')}`);
    return {
      valid: false,
      error: `Missing Railway database configuration fields: ${missingFields.join(', ')}. Please check environment variables.`
    };
  }
  
  return { valid: true };
}

/**
 * Validates the Railway token in the request headers
 */
export function validateRailwayToken(headers) {
  const railwayToken = headers.get('x-railway-token');
  if (!railwayToken) {
    console.error("No Railway token provided");
    return {
      valid: false,
      error: "No Railway token provided. Please provide a valid token."
    };
  }
  
  return { valid: true };
}

/**
 * Validates the SQL query from the request
 */
export function validateQuery(query, readOnly) {
  if (!query) {
    console.error("No SQL query provided in request");
    return {
      valid: false,
      error: "No SQL query provided"
    };
  }
  
  // Check if the query is read-only when required
  if (readOnly) {
    const upperQuery = query.trim().toUpperCase();
    if (!upperQuery.startsWith('SELECT')) {
      console.error("Write operation detected with read-only token");
      return {
        valid: false,
        error: "The token provided is read-only, but a write operation was detected."
      };
    }
  }
  
  return { valid: true };
}
