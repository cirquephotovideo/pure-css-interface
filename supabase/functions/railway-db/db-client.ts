
/**
 * Database client for the Railway DB edge function
 */
import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

/**
 * Creates a PostgreSQL client with the given configuration
 */
export function createPostgresClient(dbConfig) {
  const { host, port, database, user, password } = dbConfig;
  
  console.log(`Creating PostgreSQL client for ${host}:${port}/${database} with user ${user}`);
  
  return new Client({
    hostname: host,
    port: Number(port),
    database,
    user,
    password,
    tls: {
      enabled: true,
      enforce: false,  // Don't enforce TLS, fallback to non-TLS if needed
      caCertificates: [], // Using an empty array to accept any certificate
    },
    connection: {
      attempts: 5,      // Increased retry attempts
      delay: 1000
    }
  });
}

/**
 * Executes the SQL query and returns the results
 */
export async function executeQuery(client, query, params) {
  try {
    console.log("Executing query on Railway DB:", query);
    console.log("With parameters:", params || []);
    
    // Try to connect with more detailed error logging
    try {
      await client.connect();
      console.log("Successfully connected to Railway DB");
    } catch (connectError) {
      console.error("Error connecting to Railway DB:", connectError);
      console.error("Connection details (sanitized):", {
        hostname: client.connectionParams.hostname,
        port: client.connectionParams.port,
        database: client.connectionParams.database,
        user: client.connectionParams.user,
      });
      
      // Try one more time with TLS disabled if it's a TLS error
      if (connectError.message && connectError.message.includes("TLS")) {
        console.log("TLS connection failed, trying again with TLS disabled");
        client.connectionParams.tls.enabled = false;
        await client.connect();
        console.log("Successfully connected to Railway DB without TLS");
      } else {
        throw connectError;
      }
    }
    
    // Important: Execute the query without parameters if params is empty
    // This fixes the "bind message supplies X parameters, but prepared statement requires 0" error
    let result;
    if (!params || params.length === 0) {
      // Execute without parameters
      result = await client.queryObject(query);
    } else {
      // Execute with parameters
      result = await client.queryObject(query, params);
    }
    
    console.log(`Query executed successfully, returned ${result.rows.length} rows`);
    
    // Log the entire result to help with debugging
    if (result.rows.length > 0) {
      console.log("First row of result:", JSON.stringify(result.rows[0], null, 2));
      // Log row count and column names
      const columns = Object.keys(result.rows[0]);
      console.log(`Result has ${result.rows.length} rows with columns: ${columns.join(', ')}`);
    }

    return {
      success: true,
      data: result.rows,
      count: result.rows.length
    };
  } catch (queryError) {
    console.error("Error executing query:", queryError.message);
    console.error("Query error details:", queryError);
    return {
      success: false,
      error: `Query execution failed: ${queryError.message}`
    };
  } finally {
    try {
      await client.end();
      console.log("PostgreSQL connection closed");
    } catch (error) {
      console.error("Error closing PostgreSQL connection:", error.message);
    }
  }
}
