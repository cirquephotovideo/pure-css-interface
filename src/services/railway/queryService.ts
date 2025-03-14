
/**
 * Core query service for Railway DB
 */
import { toast } from "sonner";
import { QueryResult } from "./types";
import { isReadOnlyQuery } from "./utils";
import { LogLevel, logMessage, addToLogBuffer } from "./logger";
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
      const errorMsg = `Configuration Railway DB incomplète: ${configValidation.errors.join(', ')}. Vérifiez les variables d'environnement.`;
      logMessage(LogLevel.ERROR, errorMsg);
      addToLogBuffer(LogLevel.ERROR, errorMsg);
      toast.error(errorMsg);
      return { data: null, count: 0, error: errorMsg };
    }
    
    // Check if the query is a read-only operation
    const isReadOperation = isReadOnlyQuery(query);
    if (!isReadOperation) {
      const errorMsg = "Opération d'écriture détectée. Le token Railway fourni est en lecture seule.";
      logMessage(LogLevel.ERROR, errorMsg, { query });
      addToLogBuffer(LogLevel.ERROR, errorMsg);
      toast.error(errorMsg);
      return {
        data: null,
        count: 0,
        error: errorMsg
      };
    }
    
    // Send query to Railway DB via API
    return await sendQueryToRailwayAPI<T>(query, params);
  } catch (error) {
    // Catch-all for any unexpected errors
    const errorMessage = handleUnexpectedError(error);
    addToLogBuffer(LogLevel.ERROR, errorMessage);
    return { data: null, count: 0, error: errorMessage };
  }
}
