type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getLogLevel(): LogLevel {
  const env = process.env.NODE_ENV;
  const isProduction = env === 'production';

  if (isProduction) {
    return 'error';
  }

  return 'debug';
}

interface LogData {
  [key: string]: unknown;
}

function log(level: LogLevel, message: string, data?: LogData) {
  const currentLevel = getLogLevel();

  if (LOG_LEVELS[level] < LOG_LEVELS[currentLevel]) {
    return;
  }

  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...(data && { data }),
  };

  console.log(JSON.stringify(logEntry));
}

export const logger = {
  debug: (message: string, data?: LogData) => log('debug', message, data),
  info: (message: string, data?: LogData) => log('info', message, data),
  warn: (message: string, data?: LogData) => log('warn', message, data),
  error: (message: string, data?: LogData) => log('error', message, data),
};
