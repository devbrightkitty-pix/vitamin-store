"use client";

import React, { useEffect, useState } from "react";
import Card from "@/components/Card";

interface Product {
  id: string;
  title: string;
  handle: string;
  featuredImage: {
    url: string;
    altText: string | null;
  } | null;
  priceRange: {
    minPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  availableForSale: boolean;
}

interface ProductsResponse {
  items: Product[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  async function fetchProducts(nextCursor?: string | null) {
    try {
      const url = nextCursor
        ? `/api/products?limit=12&cursor=${encodeURIComponent(nextCursor)}`
        : "/api/product?limit=12";
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch product");
      }
      const data: ProductsResponse = await response.json();
      
      if (nextCursor) {
        setProducts((prev) => [...prev, ...data.items]);
      } else {
        setProducts(data.items);
      }
      
      setCursor(data.pageInfo.endCursor);
      setHasNextPage(data.pageInfo.hasNextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  }

  useEffect(() => {
    fetchProducts().finally(() => setLoading(false));
  }, []);

  async function loadMore() {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    await fetchProducts(cursor);
    setLoadingMore(false);
  }

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-heading-2 font-jost text-fuchsia-600 mb-8">
          All Products
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="bg-light-200 animate-pulse rounded-lg h-96"
            />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-heading-2 font-jost text-fuchsia-600 mb-8">
          All Products
        </h1>
        <p className="text-dark-700">
          Unable to load products. Please configure your Shopify environment
          variables.
        </p>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-heading-2 font-jost text-fuchsia-600 mb-8">
        All Products
      </h1>
      {products.length === 0 ? (
        <p className="text-dark-700">
          No products found. Please add products to your Shopify store.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <Card
                key={product.id}
                title={product.title}
                description=""
                image={product.featuredImage?.url || "/globe.svg"}
                price={`$${parseFloat(product.priceRange.minPrice.amount).toFixed(2)}`}
                href={`/products/${product.handle}`}
              />
            ))}
          </div>
          {hasNextPage && (
            <div className="mt-12 text-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-8 py-3 bg-fuchsia-600 text-white rounded-full font-medium hover:bg-fuchsia-800 transition-colors disabled:opacity-50"
              >
                {loadingMore ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
