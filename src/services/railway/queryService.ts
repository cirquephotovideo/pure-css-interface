
/**
 * Core query service for Railway DB
 */
import { toast } from "sonner";
import { QueryResult } from "./types";
import { isReadOnlyQuery } from "./utils";
import { LogLevel, logMessage } from "./logger";
import { validateDbConfig, handleUnexpectedError } from "./errorHandlers";
import { sendQueryToRailwayAPI } from "./apiService";

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
    
    // Send query to Railway DB via API
    return await sendQueryToRailwayAPI<T>(query, params);
  } catch (error) {
    // Catch-all for any unexpected errors
    const errorMessage = handleUnexpectedError(error);
    return { data: null, count: 0, error: errorMessage };
  }
}
