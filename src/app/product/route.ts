/**
 * GET /api/product
 * 
 * Fetch a paginated list of product from the Shopify Storefront API.
 * 
 * Query Parameters:
 * - cursor: Pagination cursor for fetching next page
 * - limit: Number of product to fetch (default: 20, max: 100)
 * - search: Search query string
 * - sortKey: Sort key (TITLE, PRICE, BEST_SELLING, etc.)
 * - reverse: Reverse sort order (true/false)
 * 
 * Response:
 * - items: Array of product with id, title, handle, featuredImage, priceRange, availableForSale
 * - pageInfo: { hasNextPage, endCursor }
 */

import { NextResponse } from "next/server";
import { storefrontFetch } from "@/lib/shopify/client";
import { PRODUCTS_QUERY } from "@/lib/shopify/queries/product";
import { ProductsQueryResponse } from "@/lib/shopify/types";
import { removeEdgesAndNodes, reshapeProduct } from "@/lib/shopify";
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

      //  the mapping logic:
      const mappedResponse = {
          items: response.products.edges.map((edge) => reshapeProduct(edge.node)),
          pageInfo: {
              hasNextPage: response.products.pageInfo.hasNextPage,
              endCursor: response.products.pageInfo.endCursor,
          }
      };
  });
}
