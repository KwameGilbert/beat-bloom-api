import pino from 'pino';
import { env, isProduction } from './env.js';
import path from 'path';
import fs from 'fs';

// Base logs directory
const logsDir = path.join(process.cwd(), 'src/logs');

// Create log subdirectories
const logDirs = {
  app: path.join(logsDir, 'app'),
  error: path.join(logsDir, 'error'),
  http: path.join(logsDir, 'http'),
};

// Ensure all log directories exist
Object.values(logDirs).forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Get current date string for log file names
 */
const getDateString = () => {
  const now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD
};

/**
 * Get log file path with date
 */
const getLogFilePath = (type) => {
  return path.join(logDirs[type], `${getDateString()}.log`);
};

/**
 * Base logger configuration
 */
const baseConfig = {
  level: env.LOG_LEVEL,
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label }),
    bindings: (bindings) => ({
      app: env.APP_NAME,
      env: env.NODE_ENV,
      pid: bindings.pid,
    }),
  },
};

/**
 * Create pretty print stream for development
 */
const createPrettyStream = () => {
  if (isProduction) {
    return process.stdout;
  }

  const pretty = pino.transport({
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  });

  return pretty;
};

/**
 * Main application logger
 * Logs to console + logs/app/YYYY-MM-DD.log
 * Errors also go to logs/error/YYYY-MM-DD.log
 */
const appLogFile = fs.createWriteStream(getLogFilePath('app'), { flags: 'a' });
const errorLogFile = fs.createWriteStream(getLogFilePath('error'), { flags: 'a' });

export const logger = pino(
  {
    ...baseConfig,
    hooks: {
      logMethod(inputArgs, method) {
        // Write errors to error log file
        if (method.level >= 50) {
          // error and fatal
          errorLogFile.write(
            JSON.stringify({
              level: method.levelLabel,
              time: new Date().toISOString(),
              ...inputArgs[0],
              msg: inputArgs[1] || inputArgs[0]?.msg || '',
            }) + '\n'
          );
        }
        return method.apply(this, inputArgs);
      },
    },
  },
  pino.multistream([{ stream: createPrettyStream() }, { stream: appLogFile }])
);

/**
 * HTTP request logger
 * Logs to console + logs/http/YYYY-MM-DD.log
 * Errors also go to logs/error/YYYY-MM-DD.log
 */
const httpLogFile = fs.createWriteStream(getLogFilePath('http'), { flags: 'a' });

export const httpLogger = pino(
  {
    ...baseConfig,
    base: {
      app: env.APP_NAME,
      env: env.NODE_ENV,
      type: 'http',
    },
    hooks: {
      logMethod(inputArgs, method) {
        // Write errors to error log file
        if (method.level >= 50) {
          // error and fatal
          errorLogFile.write(
            JSON.stringify({
              level: method.levelLabel,
              time: new Date().toISOString(),
              type: 'http',
              ...inputArgs[0],
              msg: inputArgs[1] || inputArgs[0]?.msg || '',
            }) + '\n'
          );
        }
        return method.apply(this, inputArgs);
      },
    },
  },
  pino.multistream([{ stream: createPrettyStream() }, { stream: httpLogFile }])
);

/**
 * Create a child logger with request context
 */
export const createRequestLogger = (req) => {
  const context = {
    requestId: req.id,
    method: req.method,
    url: req.url,
  };

  if (req.user) {
    context.userId = req.user.id;
  }

  return logger.child(context);
};

export default logger;
