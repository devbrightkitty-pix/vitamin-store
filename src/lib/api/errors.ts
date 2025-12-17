/**
 * Error handling utilities for API routes
 * 
 * This module provides consistent error response formatting and
 * error handling helpers for the middleware API routes.
 */

import { NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * Standard API error response structure
 */
export interface ApiErrorResponse {
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  message: string,
  status: number,
  code?: string,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  const errorBody: ApiErrorResponse = {
    error: {
      message,
      ...(code && { code }),
      ...(details && { details }),
    },
  };

  return NextResponse.json(errorBody, { status });
}

/**
 * Handle validation errors from Zod
 */
export function handleValidationError(error: ZodError): NextResponse<ApiErrorResponse> {
  const formattedErrors = error.errors.map((err) => ({
    path: err.path.join("."),
    message: err.message,
  }));

  return createErrorResponse(
    "Validation failed",
    400,
    "VALIDATION_ERROR",
    formattedErrors
  );
}

/**
 * Handle Shopify API errors
 */
export function handleShopifyError(error: unknown): NextResponse<ApiErrorResponse> {
  if (error instanceof Error) {
    // Check if it's a Shopify GraphQL error
    if (error.message.includes("Shopify GraphQL errors:")) {
      return createErrorResponse(
        "Shopify API error",
        502,
        "SHOPIFY_API_ERROR",
        { originalMessage: error.message }
      );
    }

    // Check if it's an environment configuration error
    if (error.message.includes("environment variable")) {
      return createErrorResponse(
        "Server configuration error",
        500,
        "CONFIG_ERROR"
      );
    }

    // Check if it's a network/fetch error
    if (error.message.includes("Storefront API request failed")) {
      return createErrorResponse(
        "Failed to communicate with Shopify",
        502,
        "SHOPIFY_NETWORK_ERROR",
        { originalMessage: error.message }
      );
    }

    // Generic error
    return createErrorResponse(
      "An unexpected error occurred",
      500,
      "INTERNAL_ERROR",
      process.env.NODE_ENV === "development" ? { originalMessage: error.message } : undefined
    );
  }

  // Unknown error type
  return createErrorResponse(
    "An unexpected error occurred",
    500,
    "INTERNAL_ERROR"
  );
}

/**
 * Handle Shopify cart user errors
 */
export function handleCartUserErrors(
  userErrors: Array<{ field: string[] | null; message: string; code: string }>
): NextResponse<ApiErrorResponse> | null {
  if (userErrors.length === 0) {
    return null;
  }

  const formattedErrors = userErrors.map((err) => ({
    field: err.field?.join(".") || null,
    message: err.message,
    code: err.code,
  }));

  return createErrorResponse(
    "Cart operation failed",
    400,
    "CART_ERROR",
    formattedErrors
  );
}

/**
 * Wrapper for API route handlers with error handling
 */
export async function withErrorHandling<T>(
  handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<T | ApiErrorResponse>> {
  try {
    return await handler();
  } catch (error) {
    if (error instanceof ZodError) {
      return handleValidationError(error);
    }
    return handleShopifyError(error);
  }
}
