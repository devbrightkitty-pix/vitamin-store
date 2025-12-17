/**
 * GET /api/products
 * 
 * Fetch a paginated list of products from the Shopify Storefront API.
 * 
 * Query Parameters:
 * - cursor: Pagination cursor for fetching next page
 * - limit: Number of products to fetch (default: 20, max: 100)
 * - search: Search query string
 * - sortKey: Sort key (TITLE, PRICE, BEST_SELLING, etc.)
 * - reverse: Reverse sort order (true/false)
 * 
 * Response:
 * - items: Array of products with id, title, handle, featuredImage, priceRange, availableForSale
 * - pageInfo: { hasNextPage, endCursor }
 */

import { NextResponse } from "next/server";
import { storefrontFetch } from "@/lib/shopify/client";
import { PRODUCTS_QUERY } from "@/lib/shopify/queries/products";
import { ProductsQueryResponse } from "@/lib/shopify/types";
import { mapProductsConnection } from "@/lib/shopify/mappers";
import { withErrorHandling } from "@/lib/api/errors";
import { ProductListQuerySchema, parseSearchParams } from "@/lib/api/validation";

export async function GET(request: Request) {
  return withErrorHandling(async () => {
    const { searchParams } = new URL(request.url);
    
    const query = parseSearchParams(searchParams, ProductListQuerySchema);

    const variables: Record<string, unknown> = {
      first: query.limit,
      after: query.cursor || null,
      query: query.search || null,
      sortKey: query.sortKey || null,
      reverse: query.reverse || false,
    };

    const response = await storefrontFetch<ProductsQueryResponse>(
      PRODUCTS_QUERY,
      variables,
      {
        cache: true,
        cacheTTL: 60 * 1000,
        nextCache: "force-cache",
        revalidate: 60,
      }
    );

    const mappedResponse = mapProductsConnection(response.products);

    return NextResponse.json(mappedResponse);
  });
}
