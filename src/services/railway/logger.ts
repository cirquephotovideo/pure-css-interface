
/**
 * Logger utility for Railway DB services
 */

/**
 * Log levels for internal logging
 */
export enum LogLevel {
  INFO = "info",
  WARN = "warn",
  ERROR = "error"
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
  }
}
