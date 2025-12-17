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

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/products?limit=6");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data: ProductsResponse = await response.json();
        setProducts(data.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-heading-2 font-jost text-fuchsia-600 mb-8">
          Our Products
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
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
          Our Products
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
        Our Products
      </h1>
      {products.length === 0 ? (
        <p className="text-dark-700">
          No products found. Please add products to your Shopify store.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
      )}
    </section>
  );
}
