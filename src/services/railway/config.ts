
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

// Try to get stored settings first
const getStoredSettings = () => {
  try {
    if (typeof localStorage !== 'undefined') {
      const storedSettings = localStorage.getItem('railway_db_settings');
      if (storedSettings) {
        return JSON.parse(storedSettings);
      }
    }
  } catch (e) {
    console.error("Error accessing or parsing stored DB settings:", e);
  }
  return null;
};

// Get stored settings or use defaults
const storedSettings = getStoredSettings();

// Try to get connection info from potential connection string
const connectionString = import.meta.env.VITE_RAILWAY_DB_CONNECTION_STRING;
const parsedConnection = parseDBConnectionString(connectionString);

// Initialize configuration with env vars or parsed connection string
let initialHost = import.meta.env.VITE_RAILWAY_DB_HOST || (parsedConnection?.host || "autorack.proxy.rlwy.net");
let initialPort = import.meta.env.VITE_RAILWAY_DB_PORT || (parsedConnection?.port || "32112");
let initialDbName = import.meta.env.VITE_RAILWAY_DB_NAME || (parsedConnection?.database || "railway");
let initialUser = import.meta.env.VITE_RAILWAY_DB_USER || (parsedConnection?.user || "postgres");
let initialPassword = import.meta.env.VITE_RAILWAY_DB_PASSWORD || (parsedConnection?.password || "AJJHHgZgkdZwXawcThnbDpwtzxFUuQaU");

// Configuration for Railway DB connection - now prioritizing localStorage values
export const RAILWAY_DB_HOST = storedSettings?.host || initialHost;
export const RAILWAY_DB_PORT = storedSettings?.port || initialPort;
export const RAILWAY_DB_NAME = storedSettings?.database || initialDbName;
export const RAILWAY_DB_USER = storedSettings?.user || initialUser;
export const RAILWAY_DB_PASSWORD = storedSettings?.password || initialPassword;

export const RAILWAY_READ_ONLY_TOKEN = "dbe21f72-1f35-489b-8500-8823ebf152d5";

// Initialize connection values on window for immediate use
if (typeof window !== 'undefined') {
  console.log("Initializing Railway DB configuration on window object");
  // @ts-ignore
  window.RAILWAY_DB_HOST = RAILWAY_DB_HOST;
  // @ts-ignore
  window.RAILWAY_DB_PORT = RAILWAY_DB_PORT;
  // @ts-ignore
  window.RAILWAY_DB_NAME = RAILWAY_DB_NAME;
  // @ts-ignore
  window.RAILWAY_DB_USER = RAILWAY_DB_USER;
  // @ts-ignore
  window.RAILWAY_DB_PASSWORD = RAILWAY_DB_PASSWORD;
}

// Log important configuration values for debugging (omitting sensitive data)
console.log("Railway DB Configuration loaded:", {
  host: RAILWAY_DB_HOST,
  port: RAILWAY_DB_PORT,
  database: RAILWAY_DB_NAME,
  user: RAILWAY_DB_USER,
  passwordProvided: RAILWAY_DB_PASSWORD ? "Yes" : "No",
  source: storedSettings ? "localStorage" : "default/env"
});
