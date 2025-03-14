
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
      dbConfigProvided: !!dbConfig
    });

    // Validate database configuration
    const configValidation = validateDbConfig(dbConfig);
    if (!configValidation.valid) {
      return createErrorResponse(configValidation.error, 500);
    }

    // Validate Railway token
    const tokenValidation = validateRailwayToken(req.headers);
    if (!tokenValidation.valid) {
      return createErrorResponse(tokenValidation.error, 401);
    }

    // Validate the SQL query
    const queryValidation = validateQuery(query, readOnly);
    if (!queryValidation.valid) {
      return createErrorResponse(queryValidation.error, 400);
    }

    console.log(`Connecting to Railway DB at ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);

    // Create a Postgres client connected to Railway
    const client = createPostgresClient(dbConfig);

    console.log("Connecting to Railway DB...");
    
    // Connect to Railway DB
    try {
      await client.connect();
      console.log("Successfully connected to Railway DB");
    } catch (connectError) {
      console.error("Error connecting to Railway DB:", connectError.message);
      return createErrorResponse(`Connection failed: ${connectError.message}. Please check Railway database configuration.`, 500);
    }

    try {
      // Execute the query
      const result = await executeQuery(client, query, params);
      
      if (!result.success) {
        return createErrorResponse(result.error, 500);
      }
      
      return createSuccessResponse(result.data, result.count);
    } finally {
      // Always close the connection
      console.log("Closing Railway DB connection...");
      await client.end();
      console.log("Railway DB connection closed");
    }
  } catch (error) {
    console.error("Error in Railway DB function:", error.message, error.stack);
    return createErrorResponse(`Server error: ${error.message}`, 500);
  }
}
