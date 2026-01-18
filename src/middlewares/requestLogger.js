import { generateUUID } from '../utils/helpers.js';
import pinoHttp from 'pino-http';
import { httpLogger } from '../config/logger.js';
import { isProduction } from '../config/env.js';

/**
 * Request ID middleware
 */
export const requestId = (req, res, next) => {
  req.id = req.headers['x-request-id'] || generateUUID();
  res.setHeader('X-Request-ID', req.id);
  next();
};

/**
 * HTTP request logging middleware
 * Uses separate httpLogger for HTTP-specific logs
 */
export const requestLogger = pinoHttp({
  logger: httpLogger,
  genReqId: (req) => req.id,
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500 || err) {return 'error';}
    if (res.statusCode >= 400) {return 'warn';}
    return 'info';
  },
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },
  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} ${res.statusCode} - ${err.message}`;
  },
  customAttributeKeys: {
    req: 'request',
    res: 'response',
    err: 'error',
    responseTime: 'duration',
  },
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      query: req.query,
      params: req.params,
      headers: {
        'user-agent': req.headers['user-agent'],
        'content-type': req.headers['content-type'],
        host: req.headers.host,
      },
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
  // Don't log health check requests in production
  autoLogging: {
    ignore: (req) => {
      if (isProduction && req.url === '/health') {return true;}
      return false;
    },
  },
});

export default {
  requestId,
  requestLogger,
};
