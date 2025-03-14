
/**
 * Core query service for Railway DB
 */
import { toast } from "sonner";
import { QueryResult } from "./types";
import { isReadOnlyQuery } from "./utils";
import { 
  RAILWAY_DB_HOST, 
  RAILWAY_DB_PORT, 
  RAILWAY_DB_NAME, 
  RAILWAY_DB_USER, 
  RAILWAY_DB_PASSWORD,
  RAILWAY_READ_ONLY_TOKEN
} from "./config";

/**
 * Log levels for internal logging
 */
enum LogLevel {
  INFO = "info",
  WARN = "warn",
  ERROR = "error"
}

/**
 * Internal logging function 
 */
function logMessage(level: LogLevel, message: string, data?: any): void {
  const timestamp = new Date().toISOString();
  const logData = data ? `: ${JSON.stringify(data, null, 2)}` : '';
  
  switch (level) {
    case LogLevel.INFO:
      console.log(`${timestamp} ${level}: ${message}${logData}`);
      break;
    case LogLevel.WARN:
      console.warn(`${timestamp} ${level}: ${message}${logData}`);
      break;
    case LogLevel.ERROR:
      console.error(`${timestamp} ${level}: ${message}${logData}`);
      break;
  }
}

/**
 * Validate Railway DB configuration
 * @returns Object containing validation result and error message if any
 */
function validateDbConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!RAILWAY_DB_HOST) errors.push("RAILWAY_DB_HOST");
  if (!RAILWAY_DB_PORT) errors.push("RAILWAY_DB_PORT");
  if (!RAILWAY_DB_NAME) errors.push("RAILWAY_DB_NAME");
  if (!RAILWAY_DB_USER) errors.push("RAILWAY_DB_USER");
  if (!RAILWAY_DB_PASSWORD) errors.push("RAILWAY_DB_PASSWORD");
  
  return { 
    valid: errors.length === 0, 
    errors 
  };
}

/**
 * Format error message for user display
 */
function formatUserErrorMessage(message: string): string {
  return `Erreur de base de données: ${message}`;
}

/**
 * Execute a query on the Railway PostgreSQL database
 * @param query SQL query to execute
 * @param params Parameters for the query (for prepared statements)
 * @returns Query result
 */
export async function executeRailwayQuery<T>(
  query: string, 
  params: any[] = []
): Promise<QueryResult<T>> {
  try {
    logMessage(LogLevel.INFO, "Executing Railway query", { query, params });
    
    // Validate DB configuration
    const configValidation = validateDbConfig();
    if (!configValidation.valid) {
      const errorMessage = `Configuration Railway DB incomplète: ${configValidation.errors.join(', ')}. Vérifiez les variables d'environnement.`;
      logMessage(LogLevel.ERROR, errorMessage);
      toast.error(errorMessage);
      return { data: null, count: 0, error: errorMessage };
    }
    
    // Check if the query is a read-only operation
    const isReadOperation = isReadOnlyQuery(query);
    if (!isReadOperation) {
      const errorMessage = "Opération d'écriture détectée. Le token Railway fourni est en lecture seule.";
      logMessage(LogLevel.ERROR, errorMessage, { query });
      toast.error(errorMessage);
      return {
        data: null,
        count: 0,
        error: errorMessage
      };
    }
    
    // Log the DB configuration being sent (without the actual password)
    logMessage(LogLevel.INFO, "Railway DB Config", {
      host: RAILWAY_DB_HOST,
      port: RAILWAY_DB_PORT,
      database: RAILWAY_DB_NAME,
      user: RAILWAY_DB_USER,
      passwordProvided: RAILWAY_DB_PASSWORD ? "Yes" : "No"
    });
    
    // Use the edge function Supabase to execute the PostgreSQL query
    try {
      const response = await fetch("https://hspgrehyavlqiilrajor.supabase.co/functions/v1/railway-db", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzcGdyZWh5YXZscWlpbHJham9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5NTEwNzAsImV4cCI6MjA1NzUyNzA3MH0.wGPKekL1VBzO3WpqsnyahS7ncSBXrFMJA5ZjTwljDEE",
          "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzcGdyZWh5YXZscWlpbHJham9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5NTEwNzAsImV4cCI6MjA1NzUyNzA3MH0.wGPKekL1VBzO3WpqsnyahS7ncSBXrFMJA5ZjTwljDEE",
          "X-Railway-Token": RAILWAY_READ_ONLY_TOKEN
        },
        body: JSON.stringify({
          query,
          params,
          readOnly: true,
          dbConfig: {
            host: RAILWAY_DB_HOST,
            port: RAILWAY_DB_PORT,
            database: RAILWAY_DB_NAME,
            user: RAILWAY_DB_USER,
            password: RAILWAY_DB_PASSWORD
          }
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        const statusCode = response.status;
        
        logMessage(LogLevel.ERROR, `Railway API response error (${statusCode})`, { errorText });
        
        // Handle specific HTTP status codes
        let errorMessage = '';
        switch (statusCode) {
          case 401:
            errorMessage = `Erreur d'authentification API Railway (${statusCode}): Vérifiez le token et les permissions.`;
            break;
          case 404:
            errorMessage = `Service Railway non disponible (${statusCode}): L'API n'a pas été trouvée.`;
            break;
          case 500:
            errorMessage = `Erreur serveur Railway (${statusCode}): Problème interne au serveur.`;
            break;
          case 503:
            errorMessage = `Service Railway indisponible (${statusCode}): Le service est temporairement indisponible.`;
            break;
          default:
            errorMessage = `Erreur de l'API Railway (${statusCode}): ${errorText}`;
        }
        
        toast.error(errorMessage);
        return { data: null, count: 0, error: errorMessage };
      }
      
      // Handle successful response
      const result = await response.json();
      logMessage(LogLevel.INFO, "Railway query result received", { rowCount: result.data?.length || 0 });
      
      if (result.error) {
        logMessage(LogLevel.ERROR, "Database error returned", { error: result.error });
        toast.error(formatUserErrorMessage(result.error));
        return result;
      }
      
      return {
        data: result.data || [],
        count: result.data?.length || 0,
        error: null
      };
    } catch (fetchError) {
      // Network or fetch-related errors
      const errorMessage = fetchError instanceof Error 
        ? `Erreur réseau: ${fetchError.message}`
        : "Erreur réseau inconnue lors de la communication avec l'API Railway";
      
      logMessage(LogLevel.ERROR, "Fetch operation failed", { error: fetchError });
      toast.error(errorMessage);
      
      return { data: null, count: 0, error: errorMessage };
    }
  } catch (error) {
    // Catch-all for any unexpected errors
    const errorInstance = error instanceof Error ? error : new Error(String(error));
    const errorMessage = `Erreur inattendue: ${errorInstance.message}`;
    
    logMessage(LogLevel.ERROR, "Unexpected error in executeRailwayQuery", { 
      error: errorInstance.message,
      stack: errorInstance.stack 
    });
    
    toast.error("Erreur de connexion à la base de données: " + errorInstance.message);
    
    return { data: null, count: 0, error: errorMessage };
  }
}
