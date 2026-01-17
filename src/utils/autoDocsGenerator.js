import { Router } from 'express';
import { ZodToOpenAPI } from './zodToOpenAPI.js';
import * as schemas from '../validators/schemas.js';

/**
 * Automatic API Documentation Generator
 * Scans routes and generates OpenAPI documentation automatically
 */
export class AutoDocsGenerator {
  constructor() {
    this.routes = [];
    this.schemas = schemas;
  }

  /**
   * Register a route for auto-documentation
   * @param {object} config - Route configuration
   */
  static route(config) {
    const {
      method,
      path,
      summary,
      description,
      tags = [],
      auth = false,
      bodySchema = null,
      querySchema = null,
      paramsSchema = null,
      responseSchema = null,
    } = config;

    return {
      method: method.toLowerCase(),
      path,
      summary,
      description,
      tags,
      auth,
      bodySchema,
      querySchema,
      paramsSchema,
      responseSchema,
    };
  }

  /**
   * Generate OpenAPI paths from route configuration
   */
  static generatePaths(routes) {
    const paths = {};

    for (const route of routes) {
      if (!paths[route.path]) {
        paths[route.path] = {};
      }

      paths[route.path][route.method] = this.generateOperation(route);
    }

    return paths;
  }

  /**
   * Generate operation object for a route
   */
  static generateOperation(route) {
    const operation = {
      summary: route.summary || `${route.method.toUpperCase()} ${route.path}`,
      description: route.description || route.summary,
      tags: route.tags.length > 0 ? route.tags : ['Default'],
    };

    // Add security if auth is required
    if (route.auth) {
      operation.security = [{ BearerAuth: [] }];
    }

    // Add parameters
    const parameters = [];

    // Path parameters
    if (route.paramsSchema) {
      const paramsDoc = this.generateParameters(route.paramsSchema, 'path');
      parameters.push(...paramsDoc);
    }

    // Query parameters
    if (route.querySchema) {
      const queryDoc = this.generateParameters(route.querySchema, 'query');
      parameters.push(...queryDoc);
    }

    if (parameters.length > 0) {
      operation.parameters = parameters;
    }

    // Request body
    if (route.bodySchema && ['post', 'put', 'patch'].includes(route.method)) {
      operation.requestBody = {
        required: true,
        content: {
          'application/json': {
            schema: ZodToOpenAPI.convert(route.bodySchema),
          },
        },
      };
    }

    // Responses
    operation.responses = this.generateResponses(route);

    return operation;
  }

  /**
   * Generate parameters from Zod schema
   */
  static generateParameters(zodSchema, location) {
    const openApiSchema = ZodToOpenAPI.convert(zodSchema);
    const parameters = [];

    if (openApiSchema.properties) {
      for (const [name, schema] of Object.entries(openApiSchema.properties)) {
        parameters.push({
          name,
          in: location,
          required: openApiSchema.required?.includes(name) || false,
          schema,
        });
      }
    }

    return parameters;
  }

  /**
   * Generate responses for a route
   */
  static generateResponses(route) {
    const responses = {
      '200': {
        description: 'Successful operation',
        content: {
          'application/json': {
            schema: route.responseSchema
              ? ZodToOpenAPI.convert(route.responseSchema)
              : { $ref: '#/components/schemas/Success' },
          },
        },
      },
    };

    // Add auth error if route requires authentication
    if (route.auth) {
      responses['401'] = {
        $ref: '#/components/responses/UnauthorizedError',
      };
    }

    // Add validation error for routes with body
    if (route.bodySchema) {
      responses['422'] = {
        $ref: '#/components/responses/ValidationError',
      };
    }

    // Add server error
    responses['500'] = {
      $ref: '#/components/responses/ServerError',
    };

    return responses;
  }

  /**
   * Helper to create route documentation
   */
  static doc(config) {
    return this.route(config);
  }
}

/**
 * Shorthand function for creating documented routes
 */
export const doc = AutoDocsGenerator.doc.bind(AutoDocsGenerator);

export default AutoDocsGenerator;
