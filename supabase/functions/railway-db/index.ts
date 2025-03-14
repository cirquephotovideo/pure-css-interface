
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-railway-token',
};

/**
 * Handles CORS preflight requests
 */
function handleCorsRequest() {
  return new Response(null, { headers: corsHeaders });
}

/**
 * Validates the required database configuration
 */
function validateDbConfig(dbConfig) {
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
function validateRailwayToken(headers) {
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
function validateQuery(query, readOnly) {
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

/**
 * Creates a PostgreSQL client with the given configuration
 */
function createPostgresClient(dbConfig) {
  const { host, port, database, user, password } = dbConfig;
  
  return new Client({
    hostname: host,
    port: Number(port),
    database,
    user,
    password,
    tls: {
      enabled: true,
    },
    connection: {
      attempts: 3,
      delay: 1000
    }
  });
}

/**
 * Executes the SQL query and returns the results
 */
async function executeQuery(client, query, params) {
  try {
    console.log("Executing query on Railway DB:", query);
    console.log("With parameters:", params || []);
    const result = await client.queryObject(query, params || []);
    console.log(`Query executed successfully, returned ${result.rows.length} rows`);
    
    // Log a sample row to help with debugging (only if there are rows)
    if (result.rows.length > 0) {
      console.log("Sample row:", JSON.stringify(result.rows[0], null, 2));
    }

    return {
      success: true,
      data: result.rows,
      count: result.rows.length
    };
  } catch (queryError) {
    console.error("Error executing query:", queryError.message);
    return {
      success: false,
      error: `Query execution failed: ${queryError.message}`
    };
  }
}

/**
 * Creates an error response with the given status code and message
 */
function createErrorResponse(message, status = 500) {
  return new Response(
    JSON.stringify({ 
      data: null, 
      count: 0, 
      error: message 
    }),
    { 
      status, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    }
  );
}

/**
 * Creates a success response with the query results
 */
function createSuccessResponse(data, count) {
  return new Response(
    JSON.stringify({ data, count, error: null }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

/**
 * Main request handler for the Railway DB edge function
 */
async function handleRequest(req) {
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

// Main entry point
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCorsRequest();
  }

  // Log headers for debugging
  console.log("Request headers:", Array.from(req.headers.entries())
    .filter(([key]) => !key.includes('authorization') && !key.includes('password'))
    .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {}));

  return handleRequest(req);
});
