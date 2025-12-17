/**
 * GET /api/products/[handle]
 * 
 * Fetch a single product by its handle from the Shopify Storefront API.
 * 
 * Parameters:
 * - handle: The product handle (URL slug)
 * 
 * Response:
 * - Full product details including id, title, handle, description, descriptionHtml,
 *   images, variants (with pricing and availability), and SEO fields
 */

import { NextResponse } from "next/server";
import { storefrontFetch } from "@/lib/shopify/client";
import { PRODUCT_BY_HANDLE_QUERY } from "@/lib/shopify/queries/products";
import { ProductByHandleQueryResponse } from "@/lib/shopify/types";
import { mapProductToDetail } from "@/lib/shopify/mappers";
import { withErrorHandling, createErrorResponse } from "@/lib/api/errors";
import { ProductHandleSchema, parseRouteParams } from "@/lib/api/validation";

interface RouteParams {
  params: Promise<{ handle: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const resolvedParams = await params;
    const { handle } = parseRouteParams(resolvedParams, ProductHandleSchema);

    const response = await storefrontFetch<ProductByHandleQueryResponse>(
      PRODUCT_BY_HANDLE_QUERY,
      { handle },
      {
        cache: true,
        cacheTTL: 60 * 1000,
        nextCache: "force-cache",
        revalidate: 60,
      }
    );

    if (!response.productByHandle) {
      return createErrorResponse(
        `Product with handle "${handle}" not found`,
        404,
        "PRODUCT_NOT_FOUND"
      );
    }

    const mappedProduct = mapProductToDetail(response.productByHandle);

    return NextResponse.json(mappedProduct);
  });
}
