import { ZodError } from 'zod';
import { ValidationError } from '../utils/errors.js';

/**
 * Validate request data against a Zod schema
 * @param {Object} schema - Object containing body, query, and/or params schemas
 */
export const validate = (schema) => {
  return async (req, res, next) => {
    try {
      const validationPromises = [];
      const validationTargets = [];

      if (schema.body) {
        validationPromises.push(schema.body.parseAsync(req.body));
        validationTargets.push('body');
      }

      if (schema.query) {
        validationPromises.push(schema.query.parseAsync(req.query));
        validationTargets.push('query');
      }

      if (schema.params) {
        validationPromises.push(schema.params.parseAsync(req.params));
        validationTargets.push('params');
      }

      const results = await Promise.all(validationPromises);

      // Assign validated data back to request
      results.forEach((result, index) => {
        req[validationTargets[index]] = result;
      });

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
          code: e.code,
        }));

        return next(new ValidationError('Validation failed', errors));
      }

      next(error);
    }
  };
};

/**
 * Validate only request body
 */
export const validateBody = (schema) => validate({ body: schema });

/**
 * Validate only query parameters
 */
export const validateQuery = (schema) => validate({ query: schema });

/**
 * Validate only route parameters
 */
export const validateParams = (schema) => validate({ params: schema });

export default {
  validate,
  validateBody,
  validateQuery,
  validateParams,
};
