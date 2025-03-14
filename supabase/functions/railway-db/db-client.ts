
/**
 * Database client for the Railway DB edge function
 */
import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

/**
 * Creates a PostgreSQL client with the given configuration
 */
export function createPostgresClient(dbConfig) {
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
export async function executeQuery(client, query, params) {
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
