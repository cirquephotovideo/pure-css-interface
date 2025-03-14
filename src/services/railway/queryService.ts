
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
    console.log("Executing Railway query:", query, "with params:", params);
    
    // Check that environment variables are defined
    if (!RAILWAY_DB_HOST || !RAILWAY_DB_PORT || !RAILWAY_DB_NAME || !RAILWAY_DB_USER) {
      const missingVars = [];
      if (!RAILWAY_DB_HOST) missingVars.push("RAILWAY_DB_HOST");
      if (!RAILWAY_DB_PORT) missingVars.push("RAILWAY_DB_PORT");
      if (!RAILWAY_DB_NAME) missingVars.push("RAILWAY_DB_NAME");
      if (!RAILWAY_DB_USER) missingVars.push("RAILWAY_DB_USER");
      
      const errorMessage = `Configuration Railway DB incomplète: ${missingVars.join(', ')}. Vérifiez les variables d'environnement.`;
      console.error(errorMessage);
      toast.error(errorMessage);
      return { data: null, count: 0, error: errorMessage };
    }
    
    // Check if the query is a read-only operation
    const isReadOperation = isReadOnlyQuery(query);
    if (!isReadOperation) {
      const errorMessage = "Opération d'écriture détectée. Le token Railway fourni est en lecture seule.";
      console.error(errorMessage);
      toast.error(errorMessage);
      return {
        data: null,
        count: 0,
        error: errorMessage
      };
    }
    
    // Log the DB configuration being sent (without the actual password)
    console.log("Railway DB Config:", {
      host: RAILWAY_DB_HOST,
      port: RAILWAY_DB_PORT,
      database: RAILWAY_DB_NAME,
      user: RAILWAY_DB_USER,
      passwordProvided: RAILWAY_DB_PASSWORD ? "Yes" : "No"
    });
    
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
      const errorText = await response.text();
      console.error("Railway API error:", response.status, errorText);
      const errorMessage = `Erreur de l'API Railway (${response.status}): ${errorText}`;
      toast.error(errorMessage);
      return { data: null, count: 0, error: errorMessage };
    }
    
    const result = await response.json();
    console.log("Railway query result:", result);
    
    if (result.error) {
      console.error("Database error returned:", result.error);
      toast.error("Erreur de base de données: " + result.error);
      return result;
    }
    
    return {
      data: result.data || [],
      count: result.data?.length || 0,
      error: null
    };
  } catch (error) {
    console.error("Error executing Railway DB query:", error);
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    
    toast.error("Erreur de connexion à la base de données: " + errorMessage);
    
    return { data: null, count: 0, error: errorMessage };
  }
}
