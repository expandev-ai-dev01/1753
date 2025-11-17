/**
 * @summary
 * Zod validation utilities
 * Provides reusable validation schemas and helpers
 *
 * @module utils/zodValidation
 */

import { z } from 'zod';

/**
 * String validations
 */
export const zString = z.string().min(1);
export const zNullableString = (maxLength?: number) => {
  let schema = z.string();
  if (maxLength) {
    schema = schema.max(maxLength);
  }
  return schema.nullable();
};

/**
 * Name validations
 */
export const zName = z.string().min(1).max(200);
export const zNullableName = z.string().max(200).nullable();

/**
 * Description validations
 */
export const zDescription = z.string().min(1).max(500);
export const zNullableDescription = z.string().max(500).nullable();

/**
 * Numeric validations
 */
export const zNumber = z.number();
export const zPositiveNumber = z.number().positive();
export const zNonNegativeNumber = z.number().min(0);

/**
 * ID validations
 */
export const zID = z.coerce.number().int().positive();
export const zFK = z.coerce.number().int().positive();
export const zNullableFK = z.coerce.number().int().positive().nullable();

/**
 * Boolean validations
 */
export const zBit = z.coerce.number().int().min(0).max(1);
export const zBoolean = z.boolean();

/**
 * Date validations
 */
export const zDate = z.coerce.date();
export const zDateString = z.string().datetime();
export const zNullableDate = z.coerce.date().nullable();

/**
 * Email validation
 */
export const zEmail = z.string().email().max(100);

/**
 * Decimal validations
 */
export const zDecimal = z.number();
export const zPrice = z.number().min(0);
export const zQuantity = z.number().min(0);
