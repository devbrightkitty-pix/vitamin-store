/**
 * GET /api/cart/[cartId]
 * 
 * Fetch an existing cart by ID from the Shopify Storefront API.
 * 
 * Parameters:
 * - cartId: The cart ID (gid://shopify/Cart/...)
 * 
 * Response:
 * - Cart object with id, lines (items), cost (subtotal, total), checkoutUrl
 */

import { NextResponse } from "next/server";
import { storefrontFetch } from "@/lib/shopify/client";
import { CART_QUERY } from "@/lib/shopify/queries/cart";
import { CartQueryResponse } from "@/lib/shopify/types";
import { mapCart } from "@/lib/shopify/mappers";
import { withErrorHandling, createErrorResponse } from "@/lib/api/errors";
import { CartIdSchema, parseRouteParams } from "@/lib/api/validation";

interface RouteParams {
  params: Promise<{ cartId: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const resolvedParams = await params;
    const { cartId } = parseRouteParams(resolvedParams, CartIdSchema);

    const response = await storefrontFetch<CartQueryResponse>(
      CART_QUERY,
      { id: cartId },
      { nextCache: "no-store" }
    );

    if (!response.cart) {
      return createErrorResponse(
        `Cart with ID "${cartId}" not found`,
        404,
        "CART_NOT_FOUND"
      );
    }

    const mappedCart = mapCart(response.cart);

    return NextResponse.json(mappedCart);
  });
}
