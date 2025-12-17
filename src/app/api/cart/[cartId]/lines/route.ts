/**
 * Cart Lines API Routes
 * 
 * POST /api/cart/[cartId]/lines - Add line items to cart
 * PATCH /api/cart/[cartId]/lines - Update line items in cart
 * DELETE /api/cart/[cartId]/lines - Remove line items from cart
 */

import { NextResponse } from "next/server";
import { storefrontFetch } from "@/lib/shopify/client";
import {
  CART_LINES_ADD_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_LINES_REMOVE_MUTATION,
} from "@/lib/shopify/queries/cart";
import {
  CartLinesAddResponse,
  CartLinesUpdateResponse,
  CartLinesRemoveResponse,
} from "@/lib/shopify/types";
import { mapCart } from "@/lib/shopify/mappers";
import {
  withErrorHandling,
  createErrorResponse,
  handleCartUserErrors,
} from "@/lib/api/errors";
import {
  CartIdSchema,
  CartLinesAddBodySchema,
  CartLinesUpdateBodySchema,
  CartLinesRemoveBodySchema,
  parseRouteParams,
  parseJsonBody,
} from "@/lib/api/validation";

interface RouteParams {
  params: Promise<{ cartId: string }>;
}

/**
 * POST /api/cart/[cartId]/lines
 * 
 * Add line items to an existing cart.
 * 
 * Request Body:
 * - lines: Array of line items to add
 *   - merchandiseId: The variant ID
 *   - quantity: Number of items
 * 
 * Response:
 * - Updated cart object
 */
export async function POST(request: Request, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const resolvedParams = await params;
    const { cartId } = parseRouteParams(resolvedParams, CartIdSchema);
    const body = await parseJsonBody(request, CartLinesAddBodySchema);

    const lines = body.lines.map((line) => ({
      merchandiseId: line.merchandiseId,
      quantity: line.quantity,
    }));

    const response = await storefrontFetch<CartLinesAddResponse>(
      CART_LINES_ADD_MUTATION,
      { cartId, lines },
      { nextCache: "no-store" }
    );

    const userErrorResponse = handleCartUserErrors(
      response.cartLinesAdd.userErrors
    );
    if (userErrorResponse) {
      return userErrorResponse;
    }

    if (!response.cartLinesAdd.cart) {
      return createErrorResponse(
        "Failed to add lines to cart",
        500,
        "CART_LINES_ADD_FAILED"
      );
    }

    const mappedCart = mapCart(response.cartLinesAdd.cart);

    return NextResponse.json(mappedCart);
  });
}

/**
 * PATCH /api/cart/[cartId]/lines
 * 
 * Update line items in an existing cart.
 * 
 * Request Body:
 * - lines: Array of line item updates
 *   - lineId: The line item ID
 *   - quantity: New quantity (set to 0 to remove)
 * 
 * Response:
 * - Updated cart object
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const resolvedParams = await params;
    const { cartId } = parseRouteParams(resolvedParams, CartIdSchema);
    const body = await parseJsonBody(request, CartLinesUpdateBodySchema);

    const lines = body.lines.map((line) => ({
      id: line.lineId,
      quantity: line.quantity,
    }));

    const response = await storefrontFetch<CartLinesUpdateResponse>(
      CART_LINES_UPDATE_MUTATION,
      { cartId, lines },
      { nextCache: "no-store" }
    );

    const userErrorResponse = handleCartUserErrors(
      response.cartLinesUpdate.userErrors
    );
    if (userErrorResponse) {
      return userErrorResponse;
    }

    if (!response.cartLinesUpdate.cart) {
      return createErrorResponse(
        "Failed to update cart lines",
        500,
        "CART_LINES_UPDATE_FAILED"
      );
    }

    const mappedCart = mapCart(response.cartLinesUpdate.cart);

    return NextResponse.json(mappedCart);
  });
}

/**
 * DELETE /api/cart/[cartId]/lines
 * 
 * Remove line items from an existing cart.
 * 
 * Request Body:
 * - lineIds: Array of line item IDs to remove
 * 
 * Response:
 * - Updated cart object
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const resolvedParams = await params;
    const { cartId } = parseRouteParams(resolvedParams, CartIdSchema);
    const body = await parseJsonBody(request, CartLinesRemoveBodySchema);

    const response = await storefrontFetch<CartLinesRemoveResponse>(
      CART_LINES_REMOVE_MUTATION,
      { cartId, lineIds: body.lineIds },
      { nextCache: "no-store" }
    );

    const userErrorResponse = handleCartUserErrors(
      response.cartLinesRemove.userErrors
    );
    if (userErrorResponse) {
      return userErrorResponse;
    }

    if (!response.cartLinesRemove.cart) {
      return createErrorResponse(
        "Failed to remove cart lines",
        500,
        "CART_LINES_REMOVE_FAILED"
      );
    }

    const mappedCart = mapCart(response.cartLinesRemove.cart);

    return NextResponse.json(mappedCart);
  });
}
