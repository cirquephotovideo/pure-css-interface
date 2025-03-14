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
  
  // Check if DB configuration is available from various sources
  // First check window object for runtime config
  let hasWindowConfig = false;
  
  if (typeof window !== 'undefined') {
    const hasAllWindowConfig = 
      // @ts-ignore
      window.RAILWAY_DB_HOST && 
      // @ts-ignore
      window.RAILWAY_DB_PORT && 
      // @ts-ignore
      window.RAILWAY_DB_NAME && 
      // @ts-ignore
      window.RAILWAY_DB_USER && 
      // @ts-ignore
      window.RAILWAY_DB_PASSWORD;
      
    if (hasAllWindowConfig) {
      hasWindowConfig = true;
      console.log("Found complete Railway DB config in window object");
    }
  }
  
  // If already validated from window object, we're good
  if (hasWindowConfig) {
    return { valid: true, errors: [] };
  }
  
  // Check localStorage for config
  let hasLocalStorageConfig = false;
  if (typeof localStorage !== 'undefined') {
    const storedSettings = localStorage.getItem('railway_db_settings');
    if (storedSettings) {
      try {
        const settings = JSON.parse(storedSettings);
        if (settings.host && settings.port && settings.database && settings.user && settings.password) {
          hasLocalStorageConfig = true;
          console.log("Found complete Railway DB config in localStorage");
        }
      } catch (e) {
        console.error("Error parsing stored DB settings:", e);
      }
    }
  }
  
  // If validated from localStorage, we're good
  if (hasLocalStorageConfig) {
    return { valid: true, errors: [] };
  }
  
  // Check for connection string in environment
  if (import.meta.env.VITE_RAILWAY_DB_CONNECTION_STRING) {
    console.log("Found Railway DB connection string in environment");
    return { valid: true, errors: [] };
  }
  
  // Check if individual environment variables are present and not empty
  const missingEnvVars = [];
  
  if (!import.meta.env.VITE_RAILWAY_DB_HOST) {
    missingEnvVars.push("RAILWAY_DB_HOST");
  }
  
  if (!import.meta.env.VITE_RAILWAY_DB_PORT) {
    missingEnvVars.push("RAILWAY_DB_PORT");
  }
  
  if (!import.meta.env.VITE_RAILWAY_DB_NAME) {
    missingEnvVars.push("RAILWAY_DB_NAME");
  }
  
  if (!import.meta.env.VITE_RAILWAY_DB_USER) {
    missingEnvVars.push("RAILWAY_DB_USER");
  }
  
  if (!import.meta.env.VITE_RAILWAY_DB_PASSWORD) {
    missingEnvVars.push("RAILWAY_DB_PASSWORD");
  }
  
  // If any environment variables are missing, add them to errors
  if (missingEnvVars.length > 0) {
    errors.push(...missingEnvVars);
  }
  
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
