/**
 * Input validation schemas and utilities for API routes
 * 
 * Uses Zod for runtime type validation of API request parameters and bodies.
 */

import { z } from "zod";

/**
 * Schema for product list query parameters
 */
export const ProductListQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().min(1).max(100)),
  search: z.string().optional(),
  collectionId: z.string().optional(),
  sortKey: z
    .enum(["TITLE", "PRICE", "BEST_SELLING", "CREATED_AT", "UPDATED_AT", "PRODUCT_TYPE", "VENDOR"])
    .optional(),
  reverse: z
    .string()
    .optional()
    .transform((val) => val === "true"),
});

export type ProductListQuery = z.infer<typeof ProductListQuerySchema>;

/**
 * Schema for product handle parameter
 */
export const ProductHandleSchema = z.object({
  handle: z.string().min(1, "Product handle is required"),
});

export type ProductHandle = z.infer<typeof ProductHandleSchema>;

/**
 * Schema for cart line item input
 */
export const CartLineInputSchema = z.object({
  merchandiseId: z.string().min(1, "Merchandise ID is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

export type CartLineInput = z.infer<typeof CartLineInputSchema>;

/**
 * Schema for cart creation request body
 */
export const CartCreateBodySchema = z.object({
  lines: z.array(CartLineInputSchema).optional(),
});

export type CartCreateBody = z.infer<typeof CartCreateBodySchema>;

/**
 * Schema for cart ID parameter
 */
export const CartIdSchema = z.object({
  cartId: z.string().min(1, "Cart ID is required"),
});

export type CartId = z.infer<typeof CartIdSchema>;

/**
 * Schema for adding lines to cart
 */
export const CartLinesAddBodySchema = z.object({
  lines: z
    .array(CartLineInputSchema)
    .min(1, "At least one line item is required"),
});

export type CartLinesAddBody = z.infer<typeof CartLinesAddBodySchema>;

/**
 * Schema for cart line update input
 */
export const CartLineUpdateInputSchema = z.object({
  lineId: z.string().min(1, "Line ID is required"),
  quantity: z.number().int().min(0, "Quantity must be 0 or greater"),
});

export type CartLineUpdateInput = z.infer<typeof CartLineUpdateInputSchema>;

/**
 * Schema for updating lines in cart
 */
export const CartLinesUpdateBodySchema = z.object({
  lines: z
    .array(CartLineUpdateInputSchema)
    .min(1, "At least one line update is required"),
});

export type CartLinesUpdateBody = z.infer<typeof CartLinesUpdateBodySchema>;

/**
 * Schema for removing lines from cart
 */
export const CartLinesRemoveBodySchema = z.object({
  lineIds: z
    .array(z.string().min(1))
    .min(1, "At least one line ID is required"),
});

export type CartLinesRemoveBody = z.infer<typeof CartLinesRemoveBodySchema>;

/**
 * Helper to parse and validate URL search params
 */
export function parseSearchParams<T extends z.ZodType>(
  searchParams: URLSearchParams,
  schema: T
): z.infer<T> {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return schema.parse(params);
}

/**
 * Helper to parse and validate JSON request body
 */
export async function parseJsonBody<T extends z.ZodType>(
  request: Request,
  schema: T
): Promise<z.infer<T>> {
  const body = await request.json();
  return schema.parse(body);
}

/**
 * Helper to parse route params
 */
export function parseRouteParams<T extends z.ZodType>(
  params: Record<string, string | string[]>,
  schema: T
): z.infer<T> {
  const flatParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    flatParams[key] = Array.isArray(value) ? value[0] : value;
  }
  return schema.parse(flatParams);
}
