
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

// Clear any existing settings from localStorage to start fresh
const clearExistingSettings = () => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('railway_db_settings');
      console.log("Cleared existing Railway DB settings from localStorage");
    }
  } catch (e) {
    console.error("Error clearing localStorage:", e);
  }
};

// Try to get connection info from potential connection string
const connectionString = import.meta.env.VITE_RAILWAY_DB_CONNECTION_STRING;
const parsedConnection = parseDBConnectionString(connectionString);

// Initialize configuration with env vars or parsed connection string
let initialHost = import.meta.env.VITE_RAILWAY_DB_HOST || (parsedConnection?.host || "autorack.proxy.rlwy.net");
let initialPort = import.meta.env.VITE_RAILWAY_DB_PORT || (parsedConnection?.port || "32112");
let initialDbName = import.meta.env.VITE_RAILWAY_DB_NAME || (parsedConnection?.database || "railway");
let initialUser = import.meta.env.VITE_RAILWAY_DB_USER || (parsedConnection?.user || "postgres");
let initialPassword = import.meta.env.VITE_RAILWAY_DB_PASSWORD || (parsedConnection?.password || "AJJHHgZgkdZwXawcThnbDpwtzxFUuQaU");

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
// First try to get from localStorage/window, then use env vars or defaults
export const RAILWAY_DB_HOST = getStoredSetting('RAILWAY_DB_HOST', initialHost);
export const RAILWAY_DB_PORT = getStoredSetting('RAILWAY_DB_PORT', initialPort);
export const RAILWAY_DB_NAME = getStoredSetting('RAILWAY_DB_NAME', initialDbName);
export const RAILWAY_DB_USER = getStoredSetting('RAILWAY_DB_USER', initialUser);
export const RAILWAY_DB_PASSWORD = getStoredSetting('RAILWAY_DB_PASSWORD', initialPassword);

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
  passwordProvided: RAILWAY_DB_PASSWORD ? "Yes" : "No"
});

// Export a function to reset settings
export function resetRailwayDBSettings() {
  clearExistingSettings();
  
  if (typeof window !== 'undefined') {
    // @ts-ignore
    window.RAILWAY_DB_HOST = initialHost;
    // @ts-ignore
    window.RAILWAY_DB_PORT = initialPort;
    // @ts-ignore
    window.RAILWAY_DB_NAME = initialDbName;
    // @ts-ignore
    window.RAILWAY_DB_USER = initialUser;
    // @ts-ignore
    window.RAILWAY_DB_PASSWORD = initialPassword;
    
    // Save default settings to localStorage
    const defaultSettings = {
      host: initialHost,
      port: initialPort,
      database: initialDbName,
      user: initialUser,
      password: initialPassword
    };
    
    localStorage.setItem('railway_db_settings', JSON.stringify(defaultSettings));
    
    console.log("Railway DB settings reset to defaults");
    return defaultSettings;
  }
  
  return null;
}
