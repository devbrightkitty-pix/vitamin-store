import { getProducts } from '@/lib/shopify';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('search') || undefined;
    const sortKey = searchParams.get('sortKey') || undefined;
    const reverse = searchParams.get('reverse') === 'true';

    const products = await getProducts({
      query,
      sortKey,
      reverse,
    });

    const items = products.map((product) => ({
      id: product.id,
      title: product.title,
      handle: product.handle,
      featuredImage: product.featuredImage,
      priceRange: {
        minPrice: product.priceRange.minVariantPrice,
      },
      availableForSale: product.availableForSale,
    }));

    return NextResponse.json({
      items,
      pageInfo: {
        hasNextPage: false,
        endCursor: null,
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
