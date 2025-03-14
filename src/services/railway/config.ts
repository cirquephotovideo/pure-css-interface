
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

// Get connection values from localStorage if available
const getStoredSetting = (key: string, defaultValue: string): string => {
  if (typeof window !== 'undefined') {
    // @ts-ignore - Check if we have a window object with Railway DB settings
    if (window[key]) {
      // @ts-ignore
      return window[key];
    }
    
    // Try to get from localStorage
    const storedSettings = localStorage.getItem('railway_db_settings');
    if (storedSettings) {
      try {
        const settings = JSON.parse(storedSettings);
        if (key === 'RAILWAY_DB_HOST' && settings.host) return settings.host;
        if (key === 'RAILWAY_DB_PORT' && settings.port) return settings.port;
        if (key === 'RAILWAY_DB_NAME' && settings.database) return settings.database;
        if (key === 'RAILWAY_DB_USER' && settings.user) return settings.user;
        if (key === 'RAILWAY_DB_PASSWORD' && settings.password) return settings.password;
      } catch (e) {
        console.error("Error parsing stored DB settings:", e);
      }
    }
  }
  
  return defaultValue;
};

// Configuration for Railway DB connection
// First try to get from localStorage/window, then use default/hardcoded values
export const RAILWAY_DB_HOST = getStoredSetting('RAILWAY_DB_HOST', "autorack.proxy.rlwy.net");
export const RAILWAY_DB_PORT = getStoredSetting('RAILWAY_DB_PORT', "32112");
export const RAILWAY_DB_NAME = getStoredSetting('RAILWAY_DB_NAME', "railway");
export const RAILWAY_DB_USER = getStoredSetting('RAILWAY_DB_USER', "postgres");
export const RAILWAY_DB_PASSWORD = getStoredSetting('RAILWAY_DB_PASSWORD', "AJJHHgZgkdZwXawcThnbDpwtzxFUuQaU");

export const RAILWAY_READ_ONLY_TOKEN = "dbe21f72-1f35-489b-8500-8823ebf152d5";

// Log important configuration values for debugging (omitting sensitive data)
console.log("Railway DB Configuration loaded:", {
  host: RAILWAY_DB_HOST,
  port: RAILWAY_DB_PORT,
  database: RAILWAY_DB_NAME,
  user: RAILWAY_DB_USER,
  passwordProvided: RAILWAY_DB_PASSWORD ? "Yes" : "No"
});
