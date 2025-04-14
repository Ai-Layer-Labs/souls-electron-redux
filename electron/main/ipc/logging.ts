/**
 * Simple logging utility for embedder
 */

// Log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

// Current log level
let currentLogLevel = LogLevel.INFO;

// Set log level
export function setLogLevel(level: LogLevel): void {
  currentLogLevel = level;
}

// Debug log
export function debug(message: string): void {
  if (currentLogLevel <= LogLevel.DEBUG) {
    console.debug(`[Embedder] ${message}`);
  }
}

// Info log
export function info(message: string): void {
  if (currentLogLevel <= LogLevel.INFO) {
    console.info(`[Embedder] ${message}`);
  }
}

// Warning log
export function warn(message: string): void {
  if (currentLogLevel <= LogLevel.WARN) {
    console.warn(`[Embedder] ${message}`);
  }
}

// Error log
export function error(message: string): void {
  if (currentLogLevel <= LogLevel.ERROR) {
    console.error(`[Embedder] ${message}`);
  }
}

// Log with timestamp
export function logWithTime(level: LogLevel, message: string): void {
  const timestamp = new Date().toISOString();
  
  switch (level) {
    case LogLevel.DEBUG:
      debug(`[${timestamp}] ${message}`);
      break;
    case LogLevel.INFO:
      info(`[${timestamp}] ${message}`);
      break;
    case LogLevel.WARN:
      warn(`[${timestamp}] ${message}`);
      break;
    case LogLevel.ERROR:
      error(`[${timestamp}] ${message}`);
      break;
  }
} 