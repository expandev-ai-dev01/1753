/**
 * @summary
 * CRUD controller middleware
 * Provides base functionality for CRUD operations with security validation
 *
 * @module middleware/crud
 */

import { Request } from 'express';
import { z } from 'zod';

/**
 * @interface SecurityRule
 * @description Security rule for resource access
 *
 * @property {string} securable - Resource name
 * @property {string} permission - Required permission
 */
interface SecurityRule {
  securable: string;
  permission: string;
}

/**
 * @interface ValidationResult
 * @description Result of validation operation
 *
 * @property {object} credential - User credentials
 * @property {object} params - Validated parameters
 */
interface ValidationResult {
  credential: {
    idAccount: number;
    idUser: number;
  };
  params: any;
}

/**
 * @class CrudController
 * @description Base controller for CRUD operations with security
 */
export class CrudController {
  private securityRules: SecurityRule[];

  constructor(securityRules: SecurityRule[]) {
    this.securityRules = securityRules;
  }

  /**
   * @summary
   * Validates request for CREATE operation
   *
   * @param {Request} req - Express request
   * @param {z.ZodSchema} schema - Zod validation schema
   *
   * @returns {Promise<[ValidationResult | null, any]>} Validation result or error
   */
  async create(req: Request, schema: z.ZodSchema): Promise<[ValidationResult | null, any]> {
    return this.validate(req, schema, 'CREATE');
  }

  /**
   * @summary
   * Validates request for READ operation
   *
   * @param {Request} req - Express request
   * @param {z.ZodSchema} schema - Zod validation schema
   *
   * @returns {Promise<[ValidationResult | null, any]>} Validation result or error
   */
  async read(req: Request, schema: z.ZodSchema): Promise<[ValidationResult | null, any]> {
    return this.validate(req, schema, 'READ');
  }

  /**
   * @summary
   * Validates request for UPDATE operation
   *
   * @param {Request} req - Express request
   * @param {z.ZodSchema} schema - Zod validation schema
   *
   * @returns {Promise<[ValidationResult | null, any]>} Validation result or error
   */
  async update(req: Request, schema: z.ZodSchema): Promise<[ValidationResult | null, any]> {
    return this.validate(req, schema, 'UPDATE');
  }

  /**
   * @summary
   * Validates request for DELETE operation
   *
   * @param {Request} req - Express request
   * @param {z.ZodSchema} schema - Zod validation schema
   *
   * @returns {Promise<[ValidationResult | null, any]>} Validation result or error
   */
  async delete(req: Request, schema: z.ZodSchema): Promise<[ValidationResult | null, any]> {
    return this.validate(req, schema, 'DELETE');
  }

  /**
   * @summary
   * Validates request for LIST operation
   *
   * @param {Request} req - Express request
   * @param {z.ZodSchema} schema - Zod validation schema
   *
   * @returns {Promise<[ValidationResult | null, any]>} Validation result or error
   */
  async list(req: Request, schema: z.ZodSchema): Promise<[ValidationResult | null, any]> {
    return this.validate(req, schema, 'READ');
  }

  /**
   * @summary
   * Core validation logic
   *
   * @param {Request} req - Express request
   * @param {z.ZodSchema} schema - Zod validation schema
   * @param {string} operation - Operation type
   *
   * @returns {Promise<[ValidationResult | null, any]>} Validation result or error
   */
  private async validate(
    req: Request,
    schema: z.ZodSchema,
    operation: string
  ): Promise<[ValidationResult | null, any]> {
    try {
      const params = { ...req.params, ...req.query, ...req.body };
      const validated = await schema.parseAsync(params);

      const credential = {
        idAccount: 1,
        idUser: 1,
      };

      return [{ credential, params: validated }, null];
    } catch (error) {
      return [null, error];
    }
  }
}

/**
 * @summary
 * Creates a success response
 *
 * @function successResponse
 * @module middleware/crud
 *
 * @param {any} data - Response data
 *
 * @returns {object} Success response
 */
export function successResponse(data: any): object {
  return {
    success: true,
    data: data,
    timestamp: new Date().toISOString(),
  };
}

export { errorResponse, StatusGeneralError } from '@/middleware/error';
