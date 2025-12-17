/**
 * POST /api/cart/[cartId]/checkout
 * 
 * Get the checkout URL for a cart to hand off to Shopify's checkout.
 * 
 * Parameters:
 * - cartId: The cart ID
 * 
 * Response:
 * - { checkoutUrl: string }
 */

import { NextResponse } from "next/server";
import { storefrontFetch } from "@/lib/shopify/client";
import { CART_QUERY } from "@/lib/shopify/queries/cart";
import { CartQueryResponse } from "@/lib/shopify/types";
import { withErrorHandling, createErrorResponse } from "@/lib/api/errors";
import { CartIdSchema, parseRouteParams } from "@/lib/api/validation";

interface RouteParams {
  params: Promise<{ cartId: string }>;
}

interface CheckoutResponse {
  checkoutUrl: string;
}

export async function POST(request: Request, { params }: RouteParams) {
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

    const checkoutResponse: CheckoutResponse = {
      checkoutUrl: response.cart.checkoutUrl,
    };

    return NextResponse.json(checkoutResponse);
  });
}
