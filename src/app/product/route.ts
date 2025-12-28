import { NextResponse } from "next/server";
import { shopifyFetch } from "@/lib/shopify";
import { getProductsQuery } from "@/lib/shopify/queries/product";
import { ShopifyProductsOperation } from "@/lib/shopify/types";
import { removeEdgesAndNodes, reshapeProduct } from "@/lib/shopify";
import { withErrorHandling } from "@/lib/api/errors";
import { ProductListQuerySchema, parseSearchParams } from "@/lib/api/validation";

export async function GET(request: Request): Promise<NextResponse> {
    return withErrorHandling(async () => {
        const { searchParams } = new URL(request.url);
        const query = parseSearchParams(searchParams, ProductListQuerySchema);

        const variables = {
            first: query.limit,
            after: query.cursor || null,
            query: query.search || null,
            sortKey: query.sortKey || null,
            reverse: query.reverse || false,
        };

        const response = await shopifyFetch<ShopifyProductsOperation>({
            query: getProductsQuery,
            variables,
        });

        const product = removeEdgesAndNodes(response.body.data.products);
        const mappedResponse = {
            items: reshapeProduct(product),
            pageInfo: {
                //hasNextPage: response.body.data.products.pageInfo.hasNextPage,
                //endCursor: response.body.data.products.pageInfo.endCursor,
            }
        };

        return NextResponse.json(mappedResponse);
    });
}