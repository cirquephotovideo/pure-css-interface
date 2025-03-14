/**
 * Logger utility for Railway DB services
 */

/**
 * Log levels for internal logging
 */
export enum LogLevel {
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
  DEBUG = "debug"
}

/**
 * Internal logging function 
 */
export function logMessage(level: LogLevel, message: string, data?: any): void {
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
    case LogLevel.DEBUG:
      console.debug(`${timestamp} ${level}: ${message}${logData}`);
      break;
  }
}

// Create a global log buffer for UI display
let logBuffer: Array<{level: LogLevel, message: string, timestamp: string}> = [];
const MAX_LOG_BUFFER = 10; // Keep only the last 10 logs

/**
 * Add message to log buffer and console
 */
export function addToLogBuffer(level: LogLevel, message: string): void {
  const timestamp = new Date().toISOString();
  
  // Add to the beginning of the array for newest-first order
  logBuffer.unshift({
    level,
    message,
    timestamp
  });
  
  // Keep buffer size limited
  if (logBuffer.length > MAX_LOG_BUFFER) {
    logBuffer = logBuffer.slice(0, MAX_LOG_BUFFER);
  }
  
  // Also log to console
  logMessage(level, message);
}

/**
 * Get current log buffer for display
 */
export function getLogBuffer(): Array<{level: LogLevel, message: string, timestamp: string}> {
  return [...logBuffer]; // Return a copy to avoid external modifications
}

/**
 * Clear log buffer
 */
export function clearLogBuffer(): void {
  logBuffer = [];
}
