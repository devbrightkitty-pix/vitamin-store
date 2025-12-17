"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: Array<{ name: string; value: string }>;
  price: { amount: string; currencyCode: string };
  compareAtPrice: { amount: string; currencyCode: string } | null;
  quantityAvailable: number | null;
}

interface ProductDetail {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  availableForSale: boolean;
  images: Array<{
    url: string;
    altText: string | null;
    width: number;
    height: number;
  }>;
  variants: ProductVariant[];
  seo: { title: string | null; description: string | null };
}

export default function ProductDetailPage() {
  const params = useParams();
  const handle = params.handle as string;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`/api/products/${handle}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Product not found");
          }
          throw new Error("Failed to fetch product");
        }
        const data: ProductDetail = await response.json();
        setProduct(data);
        if (data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    if (handle) {
      fetchProduct();
    }
  }, [handle]);

  async function addToCart() {
    if (!selectedVariant) return;

    setAddingToCart(true);
    try {
      const cartId = localStorage.getItem("cartId");

      if (!cartId) {
        const createResponse = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lines: [{ merchandiseId: selectedVariant.id, quantity }],
          }),
        });

        if (!createResponse.ok) {
          throw new Error("Failed to create cart");
        }

        const cart = await createResponse.json();
        localStorage.setItem("cartId", cart.id);
      } else {
        const addResponse = await fetch(`/api/cart/${cartId}/lines`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lines: [{ merchandiseId: selectedVariant.id, quantity }],
          }),
        });

        if (!addResponse.ok) {
          throw new Error("Failed to add to cart");
        }
      }

      alert("Added to cart!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  }

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-light-200 animate-pulse rounded-lg aspect-square" />
          <div className="space-y-4">
            <div className="bg-light-200 animate-pulse h-10 w-3/4 rounded" />
            <div className="bg-light-200 animate-pulse h-6 w-1/4 rounded" />
            <div className="bg-light-200 animate-pulse h-32 rounded" />
          </div>
        </div>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-heading-2 font-jost text-fuchsia-600 mb-4">
          {error || "Product not found"}
        </h1>
        <Link href="/products" className="text-fuchsia-600 hover:underline">
          Back to products
        </Link>
      </section>
    );
  }

  const currentImage = product.images[selectedImageIndex] || product.images[0];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-4">
          <div className="relative aspect-square bg-light-100 rounded-lg overflow-hidden">
            {currentImage ? (
              <Image
                src={currentImage.url}
                alt={currentImage.altText || product.title}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-dark-500">
                No image available
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 ${
                    index === selectedImageIndex
                      ? "border-fuchsia-600"
                      : "border-transparent"
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={image.altText || `${product.title} ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h1 className="text-heading-2 font-jost text-dark-900">
            {product.title}
          </h1>

          {selectedVariant && (
            <p className="text-heading-3 font-jost text-fuchsia-600">
              ${parseFloat(selectedVariant.price.amount).toFixed(2)}{" "}
              {selectedVariant.price.currencyCode}
              {selectedVariant.compareAtPrice && (
                <span className="ml-2 text-dark-500 line-through text-body">
                  ${parseFloat(selectedVariant.compareAtPrice.amount).toFixed(2)}
                </span>
              )}
            </p>
          )}

          {product.variants.length > 1 && (
            <div className="space-y-2">
              <label className="block text-body-medium text-dark-700">
                Variant
              </label>
              <select
                value={selectedVariant?.id || ""}
                onChange={(e) => {
                  const variant = product.variants.find(
                    (v) => v.id === e.target.value
                  );
                  if (variant) setSelectedVariant(variant);
                }}
                className="w-full px-4 py-2 border border-dark-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
              >
                {product.variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.title} - $
                    {parseFloat(variant.price.amount).toFixed(2)}
                    {!variant.availableForSale && " (Out of stock)"}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-body-medium text-dark-700">
              Quantity
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center border border-dark-500 rounded-lg hover:bg-light-200"
              >
                -
              </button>
              <span className="text-body-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 flex items-center justify-center border border-dark-500 rounded-lg hover:bg-light-200"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={addToCart}
            disabled={
              addingToCart ||
              !selectedVariant ||
              !selectedVariant.availableForSale
            }
            className="w-full py-3 bg-fuchsia-600 text-white rounded-full font-medium hover:bg-fuchsia-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addingToCart
              ? "Adding..."
              : !selectedVariant?.availableForSale
                ? "Out of Stock"
                : "Add to Cart"}
          </button>

          <div className="prose prose-sm max-w-none">
            <h3 className="text-body-medium font-jost text-dark-900">
              Description
            </h3>
            <div
              className="text-body text-dark-700"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
