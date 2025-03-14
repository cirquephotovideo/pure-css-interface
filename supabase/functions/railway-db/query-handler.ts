
/**
 * Query handler for the Railway DB edge function
 */
import { validateDbConfig, validateRailwayToken, validateQuery } from "./validation.ts";
import { createPostgresClient, executeQuery } from "./db-client.ts";
import { createErrorResponse, createSuccessResponse } from "./response-utils.ts";

/**
 * Main request handler for the Railway DB edge function
 */
export async function handleRequest(req) {
  try {
    // Parse the request body for the query and configuration
    const requestData = await req.json();
    const { query, params, readOnly, dbConfig } = requestData;

    console.log("Request received with data:", {
      queryProvided: !!query,
      paramsProvided: !!params,
      readOnly,
      dbConfigProvided: !!dbConfig,
      queryPreview: query ? query.substring(0, 100) + (query.length > 100 ? '...' : '') : null,
      paramsPreview: params ? JSON.stringify(params).substring(0, 100) : null
    });

    // Validate database configuration
    const configValidation = validateDbConfig(dbConfig);
    if (!configValidation.valid) {
      console.error("DB config validation failed:", configValidation.error);
      return createErrorResponse(configValidation.error, 500);
    }

    // Validate Railway token
    const tokenValidation = validateRailwayToken(req.headers);
    if (!tokenValidation.valid) {
      console.error("Railway token validation failed:", tokenValidation.error);
      return createErrorResponse(tokenValidation.error, 401);
    }

    // Validate the SQL query
    const queryValidation = validateQuery(query, readOnly);
    if (!queryValidation.valid) {
      console.error("Query validation failed:", queryValidation.error);
      return createErrorResponse(queryValidation.error, 400);
    }

    console.log(`Connecting to Railway DB at ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);

    // Create a Postgres client connected to Railway
    const client = createPostgresClient(dbConfig);

    console.log("Connecting to Railway DB...");
    
    // Execute the query with the client handling the connection
    const result = await executeQuery(client, query, params);
    
    if (!result.success) {
      console.error("Query execution failed:", result.error);
      return createErrorResponse(result.error, 500);
    }
    
    console.log(`Query successful. Returned ${result.count} rows.`);
    // Log a sample of the result for debugging if available
    if (result.data && result.data.length > 0) {
      console.log("Sample result row:", JSON.stringify(result.data[0]).substring(0, 200));
    }
    
    return createSuccessResponse(result.data, result.count);
  } catch (error) {
    console.error("Error in Railway DB function:", error.message, error.stack);
    return createErrorResponse(`Server error: ${error.message}`, 500);
  }
}
