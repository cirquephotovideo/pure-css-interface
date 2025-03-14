
/**
 * Error handling utilities for Railway DB services
 */
import { toast } from "sonner";
import { LogLevel, logMessage } from "./logger";

/**
 * Validate Railway DB configuration
 * @returns Object containing validation result and error message if any
 */
export function validateDbConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!import.meta.env.VITE_RAILWAY_DB_HOST) errors.push("RAILWAY_DB_HOST");
  if (!import.meta.env.VITE_RAILWAY_DB_PORT) errors.push("RAILWAY_DB_PORT");
  if (!import.meta.env.VITE_RAILWAY_DB_NAME) errors.push("RAILWAY_DB_NAME");
  if (!import.meta.env.VITE_RAILWAY_DB_USER) errors.push("RAILWAY_DB_USER");
  if (!import.meta.env.VITE_RAILWAY_DB_PASSWORD) errors.push("RAILWAY_DB_PASSWORD");
  
  return { 
    valid: errors.length === 0, 
    errors 
  };
}

/**
 * Format error message for user display
 */
export function formatUserErrorMessage(message: string): string {
  return `Erreur de base de données: ${message}`;
}

/**
 * Handle API response errors
 * @param response Fetch response object
 */
export async function handleApiError(response: Response): Promise<string> {
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
  return errorMessage;
}

/**
 * Handle network or fetch-related errors
 */
export function handleNetworkError(error: unknown): string {
  const errorMessage = error instanceof Error 
    ? `Erreur réseau: ${error.message}`
    : "Erreur réseau inconnue lors de la communication avec l'API Railway";
  
  logMessage(LogLevel.ERROR, "Fetch operation failed", { error });
  toast.error(errorMessage);
  
  return errorMessage;
}

/**
 * Handle unexpected errors
 */
export function handleUnexpectedError(error: unknown): string {
  const errorInstance = error instanceof Error ? error : new Error(String(error));
  const errorMessage = `Erreur inattendue: ${errorInstance.message}`;
  
  logMessage(LogLevel.ERROR, "Unexpected error in executeRailwayQuery", { 
    error: errorInstance.message,
    stack: errorInstance.stack 
  });
  
  toast.error("Erreur de connexion à la base de données: " + errorInstance.message);
  
  return errorMessage;
}
