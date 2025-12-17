# Shopify Storefront API Middleware

This document describes the middleware layer that sits between the Next.js frontend and the Shopify Storefront GraphQL API.

## Overview

The middleware provides a clean REST-style HTTP API for the frontend to interact with Shopify's Storefront API. All GraphQL complexity is abstracted away, and the frontend receives normalized, typed JSON responses.

Key features:
- Type-safe TypeScript implementation
- Input validation with Zod
- Consistent error handling
- Caching for product queries
- Cart operations with no shared state between users

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# Shopify Storefront API Configuration
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_API_TOKEN=your-storefront-access-token
SHOPIFY_STOREFRONT_API_VERSION=2024-10
```

### How to get these values:

1. **SHOPIFY_STORE_DOMAIN**: Your Shopify store's domain (e.g., `my-vitamin-store.myshopify.com`)

2. **SHOPIFY_STOREFRONT_API_TOKEN**: 
   - Go to your Shopify Admin → Settings → Apps and sales channels
   - Click "Develop apps" → Create an app
   - Configure Storefront API scopes (at minimum: `unauthenticated_read_product_listings`, `unauthenticated_write_checkouts`, `unauthenticated_read_checkouts`)
   - Install the app and copy the Storefront API access token

3. **SHOPIFY_STOREFRONT_API_VERSION**: The API version to use (e.g., `2024-10`). Check [Shopify's API versioning](https://shopify.dev/docs/api/usage/versioning) for available versions.

## Running Locally

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at http://localhost:3000

## API Endpoints

### Products

#### GET /api/products

Fetch a paginated list of products.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| cursor | string | - | Pagination cursor for next page |
| limit | number | 20 | Number of products (1-100) |
| search | string | - | Search query |
| sortKey | string | - | Sort by: TITLE, PRICE, BEST_SELLING, CREATED_AT, etc. |
| reverse | boolean | false | Reverse sort order |

**Example Request:**
```bash
curl "http://localhost:3000/api/products?limit=10"
```

**Example Response:**
```json
{
  "items": [
    {
      "id": "gid://shopify/Product/123",
      "title": "Vitamin D3",
      "handle": "vitamin-d3",
      "featuredImage": {
        "url": "https://cdn.shopify.com/...",
        "altText": "Vitamin D3 bottle",
        "width": 800,
        "height": 800
      },
      "priceRange": {
        "minPrice": { "amount": "19.99", "currencyCode": "USD" },
        "maxPrice": { "amount": "19.99", "currencyCode": "USD" }
      },
      "availableForSale": true
    }
  ],
  "pageInfo": {
    "hasNextPage": true,
    "endCursor": "eyJsYXN0X2lkIjo..."
  }
}
```

#### GET /api/products/[handle]

Fetch a single product by handle.

**Example Request:**
```bash
curl "http://localhost:3000/api/products/vitamin-d3"
```

**Example Response:**
```json
{
  "id": "gid://shopify/Product/123",
  "title": "Vitamin D3",
  "handle": "vitamin-d3",
  "description": "High-potency Vitamin D3...",
  "descriptionHtml": "<p>High-potency Vitamin D3...</p>",
  "availableForSale": true,
  "images": [
    {
      "url": "https://cdn.shopify.com/...",
      "altText": "Vitamin D3 bottle",
      "width": 800,
      "height": 800
    }
  ],
  "variants": [
    {
      "id": "gid://shopify/ProductVariant/456",
      "title": "60 Count",
      "availableForSale": true,
      "selectedOptions": [{ "name": "Size", "value": "60 Count" }],
      "price": { "amount": "19.99", "currencyCode": "USD" },
      "compareAtPrice": null,
      "quantityAvailable": 100
    }
  ],
  "seo": {
    "title": "Vitamin D3 | My Store",
    "description": "High-potency Vitamin D3..."
  }
}
```

### Cart

#### POST /api/cart

Create a new cart.

**Request Body (optional):**
```json
{
  "lines": [
    {
      "merchandiseId": "gid://shopify/ProductVariant/456",
      "quantity": 2
    }
  ]
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:3000/api/cart" \
  -H "Content-Type: application/json" \
  -d '{"lines": [{"merchandiseId": "gid://shopify/ProductVariant/456", "quantity": 1}]}'
```

**Example Response:**
```json
{
  "id": "gid://shopify/Cart/abc123",
  "checkoutUrl": "https://your-store.myshopify.com/cart/c/abc123",
  "totalQuantity": 1,
  "lines": [
    {
      "id": "gid://shopify/CartLine/xyz",
      "quantity": 1,
      "merchandiseId": "gid://shopify/ProductVariant/456",
      "title": "60 Count",
      "productTitle": "Vitamin D3",
      "productHandle": "vitamin-d3",
      "featuredImage": { "url": "...", "altText": "..." },
      "selectedOptions": [{ "name": "Size", "value": "60 Count" }],
      "price": { "amount": "19.99", "currencyCode": "USD" },
      "totalPrice": { "amount": "19.99", "currencyCode": "USD" }
    }
  ],
  "cost": {
    "subtotal": { "amount": "19.99", "currencyCode": "USD" },
    "total": { "amount": "19.99", "currencyCode": "USD" },
    "tax": null
  }
}
```

#### GET /api/cart/[cartId]

Fetch an existing cart.

**Example Request:**
```bash
curl "http://localhost:3000/api/cart/gid://shopify/Cart/abc123"
```

#### POST /api/cart/[cartId]/lines

Add items to a cart.

**Request Body:**
```json
{
  "lines": [
    {
      "merchandiseId": "gid://shopify/ProductVariant/789",
      "quantity": 1
    }
  ]
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:3000/api/cart/gid://shopify/Cart/abc123/lines" \
  -H "Content-Type: application/json" \
  -d '{"lines": [{"merchandiseId": "gid://shopify/ProductVariant/789", "quantity": 1}]}'
```

#### PATCH /api/cart/[cartId]/lines

Update item quantities in a cart.

**Request Body:**
```json
{
  "lines": [
    {
      "lineId": "gid://shopify/CartLine/xyz",
      "quantity": 3
    }
  ]
}
```

**Example Request:**
```bash
curl -X PATCH "http://localhost:3000/api/cart/gid://shopify/Cart/abc123/lines" \
  -H "Content-Type: application/json" \
  -d '{"lines": [{"lineId": "gid://shopify/CartLine/xyz", "quantity": 3}]}'
```

#### DELETE /api/cart/[cartId]/lines

Remove items from a cart.

**Request Body:**
```json
{
  "lineIds": ["gid://shopify/CartLine/xyz"]
}
```

**Example Request:**
```bash
curl -X DELETE "http://localhost:3000/api/cart/gid://shopify/Cart/abc123/lines" \
  -H "Content-Type: application/json" \
  -d '{"lineIds": ["gid://shopify/CartLine/xyz"]}'
```

#### POST /api/cart/[cartId]/checkout

Get the checkout URL to redirect the user to Shopify's checkout.

**Example Request:**
```bash
curl -X POST "http://localhost:3000/api/cart/gid://shopify/Cart/abc123/checkout"
```

**Example Response:**
```json
{
  "checkoutUrl": "https://your-store.myshopify.com/cart/c/abc123"
}
```

## Error Responses

All errors follow a consistent format:

```json
{
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "details": { ... }
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Invalid request parameters or body |
| CART_ERROR | 400 | Cart operation failed (e.g., invalid variant) |
| PRODUCT_NOT_FOUND | 404 | Product with given handle not found |
| CART_NOT_FOUND | 404 | Cart with given ID not found |
| CONFIG_ERROR | 500 | Server configuration error (missing env vars) |
| INTERNAL_ERROR | 500 | Unexpected server error |
| SHOPIFY_API_ERROR | 502 | Shopify API returned an error |
| SHOPIFY_NETWORK_ERROR | 502 | Failed to communicate with Shopify |

## Frontend Usage Examples

### TypeScript/JavaScript

```typescript
// Fetch products
const response = await fetch('/api/products?limit=12');
const data = await response.json();

// Create cart and add item
const cartResponse = await fetch('/api/cart', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    lines: [{ merchandiseId: variantId, quantity: 1 }]
  })
});
const cart = await cartResponse.json();

// Store cart ID for later use
localStorage.setItem('cartId', cart.id);

// Proceed to checkout
const checkoutResponse = await fetch(`/api/cart/${cartId}/checkout`, {
  method: 'POST'
});
const { checkoutUrl } = await checkoutResponse.json();
window.location.href = checkoutUrl;
```

## Caching

Product endpoints (`GET /api/products` and `GET /api/products/[handle]`) are cached for 60 seconds using:
1. In-memory cache for repeated requests
2. Next.js fetch cache with `revalidate: 60`

Cart endpoints are never cached (`cache: 'no-store'`) to ensure fresh data.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── products/
│   │   │   ├── route.ts              # GET /api/products
│   │   │   └── [handle]/
│   │   │       └── route.ts          # GET /api/products/[handle]
│   │   └── cart/
│   │       ├── route.ts              # POST /api/cart
│   │       └── [cartId]/
│   │           ├── route.ts          # GET /api/cart/[cartId]
│   │           ├── lines/
│   │           │   └── route.ts      # POST/PATCH/DELETE /api/cart/[cartId]/lines
│   │           └── checkout/
│   │               └── route.ts      # POST /api/cart/[cartId]/checkout
│   └── (storefront)/
│       ├── layout.tsx
│       ├── page.tsx                  # Home page
│       ├── products/
│       │   ├── page.tsx              # Products listing
│       │   └── [handle]/
│       │       └── page.tsx          # Product detail
│       └── cart/
│           └── page.tsx              # Cart page
└── lib/
    ├── shopify/
    │   ├── client.ts                 # Storefront GraphQL client
    │   ├── types.ts                  # TypeScript types
    │   ├── mappers.ts                # Data transformation
    │   └── queries/
    │       ├── products.ts           # Product queries
    │       └── cart.ts               # Cart queries/mutations
    └── api/
        ├── errors.ts                 # Error handling
        └── validation.ts             # Input validation schemas
```
