/**
 * POST /api/cart
 * 
 * Create a new cart in the Shopify Storefront API.
 * 
 * Request Body (optional):
 * - lines: Array of initial line items
 *   - merchandiseId: The variant ID (gid://shopify/ProductVariant/...)
 *   - quantity: Number of items
 * 
 * Response:
 * - Cart object with id, checkoutUrl, lines, cost
 */

import { NextResponse } from "next/server";
import { storefrontFetch } from "@/lib/shopify/client";
import { CART_CREATE_MUTATION } from "@/lib/shopify/queries/cart";
import { CartCreateResponse } from "@/lib/shopify/types";
import { reshapeCart } from "@/lib/shopify";
import {
  withErrorHandling,
  createErrorResponse,
  handleCartUserErrors,
} from "@/lib/api/errors";
import { CartCreateBodySchema, parseJsonBody } from "@/lib/api/validation";

export async function POST(request: Request) {
  return withErrorHandling(async () => {
    let body = { lines: undefined };
    
    try {
      const contentType = request.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        body = await parseJsonBody(request, CartCreateBodySchema);
      }
    } catch {
      body = { lines: undefined };
    }

    const variables: Record<string, unknown> = {};
    
    if (body.lines && body.lines.length > 0) {
      variables.lines = body.lines.map((line) => ({
        merchandiseId: line.merchandiseId,
        quantity: line.quantity,
      }));
    }

    const response = await storefrontFetch<CartCreateResponse>(
      CART_CREATE_MUTATION,
      variables,
      { nextCache: "no-store" }
    );

    const userErrorResponse = handleCartUserErrors(
      response.cartCreate.userErrors
    );
    if (userErrorResponse) {
      return userErrorResponse;
    }

    if (!response.cartCreate.cart) {
      return createErrorResponse(
        "Failed to create cart",
        500,
        "CART_CREATE_FAILED"
      );
    }

    const mappedCart = reshapeCart(response.cartCreate.cart);

    return NextResponse.json(mappedCart, { status: 201 });
  });
}
