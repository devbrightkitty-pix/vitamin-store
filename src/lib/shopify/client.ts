/**
 * Shopify Storefront GraphQL Client
 * 
 * This module provides a type-safe wrapper around the Shopify Storefront GraphQL API.
 * All API calls are made server-side only to protect the Storefront API token.
 * 
 * Environment variables required:
 * - SHOPIFY_STORE_DOMAIN: Your Shopify store domain (e.g., your-store.myshopify.com)
 * - SHOPIFY_STOREFRONT_API_TOKEN: Your Storefront API access token
 * - SHOPIFY_STOREFRONT_API_VERSION: API version (e.g., 2024-10)
 */

import { ShopifyGraphQLResponse } from "./types";

// Environment variable validation
const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_STOREFRONT_API_TOKEN = process.env.SHOPIFY_STOREFRONT_API_TOKEN;
const SHOPIFY_STOREFRONT_API_VERSION = process.env.SHOPIFY_STOREFRONT_API_VERSION || "2024-10";

/**
 * Validates that all required environment variables are set
 * @throws Error if any required environment variable is missing
 */
function validateEnvVariables(): void {
  if (!SHOPIFY_STORE_DOMAIN) {
    throw new Error("SHOPIFY_STORE_DOMAIN environment variable is not set");
  }
  if (!SHOPIFY_STOREFRONT_API_TOKEN) {
    throw new Error("SHOPIFY_STOREFRONT_API_TOKEN environment variable is not set");
  }
}

/**
 * Gets the Storefront API endpoint URL
 */
function getStorefrontApiUrl(): string {
  validateEnvVariables();
  return `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_STOREFRONT_API_VERSION}/graphql.json`;
}

/**
 * Simple in-memory cache for product queries
 * This helps reduce API calls for frequently accessed product data
 */
interface CacheEntry<T> {
  data: T;
  /** expiration timestamp (ms since epoch) */
  expiresAt: number;
}

class SimpleCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private defaultTTL: number = 60 * 1000; // 1 minute default TTL

  /**
   * Get a cached value
   * @param key Cache key
   * @returns Cached value or undefined if not found or expired
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.data as T;
  }

  /**
   * Set a cached value
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Optional TTL in milliseconds
   */
  set<T>(key: string, value: T, ttl?: number): void {
    const effectiveTTL = typeof ttl === "number" ? ttl : this.defaultTTL;
    this.cache.set(key, {
      data: value,
      expiresAt: Date.now() + effectiveTTL,
    });
  }

  /**
   * Generate a cache key from query and variables
   */
  generateKey(query: string, variables?: Record<string, unknown>): string {
    return `${query}:${JSON.stringify(variables || {})}`;
  }

  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache.clear();
  }
}

// Singleton cache instance for product queries
const productCache = new SimpleCache();

export interface StorefrontFetchOptions {
  /**
   * Whether to cache the response (only for GET-like operations)
   * Default: false
   */
  cache?: boolean;
  /**
   * Cache TTL in milliseconds
   * Default: 60000 (1 minute)
   */
  cacheTTL?: number;
  /**
   * Next.js fetch cache option
   * Use 'no-store' for cart operations, 'force-cache' for static product data
   */
  nextCache?: RequestCache;
  /**
   * Next.js revalidate option (in seconds)
   */
  revalidate?: number;
}

/**
 * Execute a GraphQL query against the Shopify Storefront API
 * 
 * @param query GraphQL query string
 * @param variables Query variables
 * @param options Fetch options including caching
 * @returns Typed response from the Storefront API
 * @throws Error if the API call fails or returns errors
 * 
 * @example
 *
 * const response = await storefrontFetch<ProductsQueryResponse>(
 *   PRODUCTS_QUERY,
 *   { first: 10 },
 *   { cache: true }
 * );
 * ```
 */
export async function storefrontFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  options: StorefrontFetchOptions = {}
): Promise<T> {
  const { cache = false, cacheTTL, nextCache = "no-store", revalidate } = options;

  // Check cache first if caching is enabled
  if (cache) {
    const cacheKey = productCache.generateKey(query, variables);
    const cachedData = productCache.get<T>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }

  validateEnvVariables();

  const url = getStorefrontApiUrl();

  // Build fetch options
  const fetchOptions: RequestInit & { next?: { revalidate?: number } } = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_API_TOKEN!,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
    cache: nextCache,
  };

  // Add Next.js revalidation if specified
  if (revalidate !== undefined) {
    fetchOptions.next = { revalidate };
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    throw new Error(
      `Shopify Storefront API request failed: ${response.status} ${response.statusText}`
    );
  }

  const json: ShopifyGraphQLResponse<T> = await response.json();

  // Check for GraphQL errors
  if (json.errors && json.errors.length > 0) {
    const errorMessages = json.errors.map((e) => e.message).join(", ");
    throw new Error(`Shopify GraphQL errors: ${errorMessages}`);
  }

  if (!json.data) {
    throw new Error("No data returned from Shopify Storefront API");
  }

  // Cache the response if caching is enabled
  if (cache) {
    const cacheKey = productCache.generateKey(query, variables);
    productCache.set(cacheKey, json.data, cacheTTL);
  }

  return json.data;
}

/**
 * Clear the product cache
 * Useful when you need to force fresh data
 */
export function clearProductCache(): void {
  productCache.clear();
}
