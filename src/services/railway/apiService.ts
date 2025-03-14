
/**
 * API service for communicating with Railway DB Edge Function
 */
import { QueryResult } from "./types";
import { LogLevel, logMessage, addToLogBuffer } from "./logger";
import { handleApiError, handleNetworkError } from "./errorHandlers";
import { 
  RAILWAY_DB_HOST, 
  RAILWAY_DB_PORT, 
  RAILWAY_DB_NAME, 
  RAILWAY_DB_USER, 
  RAILWAY_DB_PASSWORD,
  RAILWAY_READ_ONLY_TOKEN
} from "./config";

/**
 * Send query to Railway DB through Supabase Edge Function
 */
export async function sendQueryToRailwayAPI<T>(
  query: string, 
  params: any[] = []
): Promise<QueryResult<T>> {
  try {
    // Log the DB configuration being sent (without the actual password)
    logMessage(LogLevel.INFO, "Railway DB Config", {
      host: RAILWAY_DB_HOST,
      port: RAILWAY_DB_PORT,
      database: RAILWAY_DB_NAME,
      user: RAILWAY_DB_USER,
      passwordProvided: RAILWAY_DB_PASSWORD ? "Yes" : "No"
    });
    
    addToLogBuffer(LogLevel.INFO, `Connexion à la base de données: ${RAILWAY_DB_HOST}:${RAILWAY_DB_PORT}/${RAILWAY_DB_NAME}`);
    
    // Use the edge function Supabase to execute the PostgreSQL query
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
      const errorMessage = await handleApiError(response);
      addToLogBuffer(LogLevel.ERROR, `Erreur API: ${errorMessage}`);
      return { data: null, count: 0, error: errorMessage };
    }
    
    // Handle successful response
    const result = await response.json();
    logMessage(LogLevel.INFO, "Railway query result received", { rowCount: result.data?.length || 0 });
    addToLogBuffer(LogLevel.INFO, `Résultat: ${result.data?.length || 0} lignes trouvées`);
    
    if (result.error) {
      logMessage(LogLevel.ERROR, "Database error returned", { error: result.error });
      addToLogBuffer(LogLevel.ERROR, `Erreur base de données: ${result.error}`);
      return result;
    }
    
    return {
      data: result.data || [],
      count: result.data?.length || 0,
      error: null
    };
  } catch (fetchError) {
    // Network or fetch-related errors
    const errorMessage = handleNetworkError(fetchError);
    addToLogBuffer(LogLevel.ERROR, `Erreur réseau: ${errorMessage}`);
    return { data: null, count: 0, error: errorMessage };
  }
}
