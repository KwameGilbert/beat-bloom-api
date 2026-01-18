/**
 * Automatic OpenAPI Schema Generator from Zod Schemas
 * Converts Zod validation schemas to OpenAPI 3.0 schemas
 */
export class ZodToOpenAPI {
  /**
   * Convert Zod schema to OpenAPI schema
   */
  static convert(zodSchema, _options = {}) {
    if (!zodSchema || !zodSchema._def) {
      return { type: 'object' };
    }

    const typeName = zodSchema._def.typeName;

    switch (typeName) {
      case 'ZodString':
        return this.convertString(zodSchema);

      case 'ZodNumber':
        return this.convertNumber(zodSchema);

      case 'ZodBoolean':
        return { type: 'boolean' };

      case 'ZodDate':
        return { type: 'string', format: 'date-time' };

      case 'ZodEnum':
        return {
          type: 'string',
          enum: zodSchema._def.values,
        };

      case 'ZodObject':
        return this.convertObject(zodSchema);

      case 'ZodArray':
        return {
          type: 'array',
          items: this.convert(zodSchema._def.type),
        };

      case 'ZodOptional':
      case 'ZodNullable':
        const innerSchema = this.convert(zodSchema._def.innerType);
        if (typeName === 'ZodNullable') {
          innerSchema.nullable = true;
        }
        return innerSchema;

      case 'ZodDefault':
        const defaultSchema = this.convert(zodSchema._def.innerType);
        defaultSchema.default = zodSchema._def.defaultValue();
        return defaultSchema;

      case 'ZodUnion':
        return {
          oneOf: zodSchema._def.options.map((opt) => this.convert(opt)),
        };

      default:
        return { type: 'string' };
    }
  }

  /**
   * Convert Zod string to OpenAPI
   */
  static convertString(zodSchema) {
    const schema = { type: 'string' };
    const checks = zodSchema._def.checks || [];

    for (const check of checks) {
      switch (check.kind) {
        case 'min':
          schema.minLength = check.value;
          break;
        case 'max':
          schema.maxLength = check.value;
          break;
        case 'email':
          schema.format = 'email';
          break;
        case 'url':
          schema.format = 'uri';
          break;
        case 'uuid':
          schema.format = 'uuid';
          break;
        case 'regex':
          schema.pattern = check.regex.source;
          break;
      }
    }

    return schema;
  }

  /**
   * Convert Zod number to OpenAPI
   */
  static convertNumber(zodSchema) {
    const schema = { type: zodSchema._def.typeName === 'ZodNumber' ? 'number' : 'integer' };
    const checks = zodSchema._def.checks || [];

    for (const check of checks) {
      switch (check.kind) {
        case 'min':
          schema.minimum = check.value;
          if (check.inclusive === false) {
            schema.exclusiveMinimum = true;
          }
          break;
        case 'max':
          schema.maximum = check.value;
          if (check.inclusive === false) {
            schema.exclusiveMaximum = true;
          }
          break;
      }
    }

    return schema;
  }

  /**
   * Convert Zod object to OpenAPI
   */
  static convertObject(zodSchema) {
    const shape = zodSchema._def.shape();
    const properties = {};
    const required = [];

    for (const [key, value] of Object.entries(shape)) {
      properties[key] = this.convert(value);

      // Check if field is required
      if (!this.isOptional(value)) {
        required.push(key);
      }
    }

    const schema = {
      type: 'object',
      properties,
    };

    if (required.length > 0) {
      schema.required = required;
    }

    return schema;
  }

  /**
   * Check if Zod schema is optional
   */
  static isOptional(zodSchema) {
    const typeName = zodSchema._def?.typeName;
    return typeName === 'ZodOptional' || typeName === 'ZodNullable' || typeName === 'ZodDefault';
  }
}

export default ZodToOpenAPI;
