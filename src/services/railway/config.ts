
/**
 * Configuration and connection settings for Railway DB
 */

// Parse DB connection string if available
export function parseDBConnectionString(connectionString: string | null | undefined) {
  if (!connectionString) return null;
  
  try {
    // Pattern for PostgreSQL connection string: postgresql://user:password@host:port/database
    const regex = /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
    const matches = connectionString.match(regex);
    
    if (matches && matches.length === 6) {
      return {
        user: matches[1],
        password: matches[2],
        host: matches[3],
        port: matches[4],
        database: matches[5]
      };
    }
    return null;
  } catch (error) {
    console.error("Error parsing connection string:", error);
    return null;
  }
}

// Try to get connection info from potential connection string
const connectionString = import.meta.env.VITE_RAILWAY_DB_CONNECTION_STRING;
const parsedConnection = parseDBConnectionString(connectionString);

// Configuration for Railway DB connection
// Use connection string values if available, otherwise use individual settings
export const RAILWAY_DB_HOST = parsedConnection?.host || "containers-us-west-146.railway.app";
export const RAILWAY_DB_PORT = parsedConnection?.port || "7739";
export const RAILWAY_DB_NAME = parsedConnection?.database || "railway";
export const RAILWAY_DB_USER = parsedConnection?.user || "postgres";
// Use explicit password if provided, otherwise use parsed connection string password or hardcoded fallback
export const RAILWAY_DB_PASSWORD = import.meta.env.VITE_RAILWAY_DB_PASSWORD || 
                                 parsedConnection?.password || 
                                 "AJJHHgZgkdZwXawcThnbDpwtzxFUuQaU";
export const RAILWAY_READ_ONLY_TOKEN = "dbe21f72-1f35-489b-8500-8823ebf152d5";

// Debug log to check configuration
console.log("Railway DB Configuration:", {
  host: RAILWAY_DB_HOST,
  port: RAILWAY_DB_PORT,
  database: RAILWAY_DB_NAME,
  user: RAILWAY_DB_USER,
  passwordProvided: RAILWAY_DB_PASSWORD ? "Yes" : "No",
  connectionStringParsed: parsedConnection ? "Yes" : "No"
});
