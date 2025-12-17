"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

interface CartLineItem {
  id: string;
  quantity: number;
  merchandiseId: string;
  title: string;
  productTitle: string;
  productHandle: string;
  featuredImage: {
    url: string;
    altText: string | null;
  } | null;
  selectedOptions: Array<{ name: string; value: string }>;
  price: { amount: string; currencyCode: string };
  totalPrice: { amount: string; currencyCode: string };
}

interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: CartLineItem[];
  cost: {
    subtotal: { amount: string; currencyCode: string };
    total: { amount: string; currencyCode: string };
    tax: { amount: string; currencyCode: string } | null;
  };
}

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    const cartId = localStorage.getItem("cartId");
    if (!cartId) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/cart/${cartId}`);
      if (!response.ok) {
        if (response.status === 404) {
          localStorage.removeItem("cartId");
          setCart(null);
          return;
        }
        throw new Error("Failed to fetch cart");
      }
      const data: Cart = await response.json();
      setCart(data);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  async function updateQuantity(lineId: string, quantity: number) {
    if (!cart) return;

    setUpdating(lineId);
    try {
      const response = await fetch(`/api/cart/${cart.id}/lines`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: [{ lineId, quantity }],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update cart");
      }

      const updatedCart: Cart = await response.json();
      setCart(updatedCart);
    } catch (err) {
      console.error("Failed to update quantity:", err);
      alert("Failed to update quantity");
    } finally {
      setUpdating(null);
    }
  }

  async function removeItem(lineId: string) {
    if (!cart) return;

    setUpdating(lineId);
    try {
      const response = await fetch(`/api/cart/${cart.id}/lines`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lineIds: [lineId],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove item");
      }

      const updatedCart: Cart = await response.json();
      setCart(updatedCart);
    } catch (err) {
      console.error("Failed to remove item:", err);
      alert("Failed to remove item");
    } finally {
      setUpdating(null);
    }
  }

  async function proceedToCheckout() {
    if (!cart) return;

    try {
      const response = await fetch(`/api/cart/${cart.id}/checkout`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to get checkout URL");
      }

      const data = await response.json();
      window.location.href = data.checkoutUrl;
    } catch (err) {
      console.error("Failed to proceed to checkout:", err);
      alert("Failed to proceed to checkout");
    }
  }

  if (loading) {
    return (
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-heading-2 font-jost text-fuchsia-600 mb-8">
          Your Cart
        </h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-light-200 animate-pulse rounded-lg h-32"
            />
          ))}
        </div>
      </section>
    );
  }

  if (!cart || cart.lines.length === 0) {
    return (
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-heading-2 font-jost text-fuchsia-600 mb-8">
          Your Cart
        </h1>
        <div className="text-center py-12">
          <p className="text-dark-700 mb-6">Your cart is empty</p>
          <Link
            href="/products"
            className="inline-block px-8 py-3 bg-fuchsia-600 text-white rounded-full font-medium hover:bg-fuchsia-800 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-heading-2 font-jost text-fuchsia-600 mb-8">
        Your Cart
      </h1>

      <div className="space-y-6">
        {cart.lines.map((item) => (
          <div
            key={item.id}
            className="flex gap-4 p-4 bg-light-100 rounded-lg"
          >
            <div className="relative w-24 h-24 flex-shrink-0 bg-white rounded-lg overflow-hidden">
              {item.featuredImage ? (
                <Image
                  src={item.featuredImage.url}
                  alt={item.featuredImage.altText || item.productTitle}
                  fill
                  className="object-contain"
                  sizes="96px"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-dark-500 text-xs">
                  No image
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <Link
                href={`/products/${item.productHandle}`}
                className="text-body-medium font-jost text-dark-900 hover:text-fuchsia-600"
              >
                {item.productTitle}
              </Link>
              {item.title !== "Default Title" && (
                <p className="text-caption text-dark-500">{item.title}</p>
              )}
              <p className="text-body text-dark-700 mt-1">
                ${parseFloat(item.price.amount).toFixed(2)} each
              </p>

              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateQuantity(item.id, Math.max(0, item.quantity - 1))
                    }
                    disabled={updating === item.id}
                    className="w-8 h-8 flex items-center justify-center border border-dark-500 rounded hover:bg-light-200 disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={updating === item.id}
                    className="w-8 h-8 flex items-center justify-center border border-dark-500 rounded hover:bg-light-200 disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  disabled={updating === item.id}
                  className="text-caption text-dark-500 hover:text-fuchsia-600 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="text-right">
              <p className="text-body-medium font-jost text-dark-900">
                ${parseFloat(item.totalPrice.amount).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-light-100 rounded-lg">
        <div className="flex justify-between text-body mb-2">
          <span className="text-dark-700">Subtotal</span>
          <span className="text-dark-900">
            ${parseFloat(cart.cost.subtotal.amount).toFixed(2)}
          </span>
        </div>
        {cart.cost.tax && (
          <div className="flex justify-between text-body mb-2">
            <span className="text-dark-700">Tax</span>
            <span className="text-dark-900">
              ${parseFloat(cart.cost.tax.amount).toFixed(2)}
            </span>
          </div>
        )}
        <div className="flex justify-between text-body-medium font-jost border-t border-dark-500 pt-4 mt-4">
          <span className="text-dark-900">Total</span>
          <span className="text-fuchsia-600">
            ${parseFloat(cart.cost.total.amount).toFixed(2)}{" "}
            {cart.cost.total.currencyCode}
          </span>
        </div>

        <button
          onClick={proceedToCheckout}
          className="w-full mt-6 py-3 bg-fuchsia-600 text-white rounded-full font-medium hover:bg-fuchsia-800 transition-colors"
        >
          Proceed to Checkout
        </button>

        <Link
          href="/products"
          className="block text-center mt-4 text-fuchsia-600 hover:underline"
        >
          Continue Shopping
        </Link>
      </div>
    </section>
  );
}
