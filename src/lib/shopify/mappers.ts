/**
 * Data mappers for transforming Shopify Storefront API responses
 * 
 * These functions transform raw Shopify GraphQL responses into cleaner,
 * frontend-friendly data structures.
 */

import {
  Product,
  ProductConnection,
  Cart,
  ProductListItem,
  ProductListResponse,
  ProductDetailResponse,
  ProductDetailVariant,
  CartResponse,
  CartLineItemResponse,
} from "./types";

/**
 * Map a single product from the product list query to a list item
 */
export function mapProductToListItem(product: Product): ProductListItem {
  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    featuredImage: product.featuredImage,
    priceRange: {
      minPrice: product.priceRange.minVariantPrice,
      maxPrice: product.priceRange.maxVariantPrice,
    },
    availableForSale: product.availableForSale,
  };
}

/**
 * Map a product connection (paginated list) to a list response
 */
export function mapProductsConnection(
  connection: ProductConnection
): ProductListResponse {
  return {
    items: connection.edges.map((edge) => mapProductToListItem(edge.node)),
    pageInfo: {
      hasNextPage: connection.pageInfo.hasNextPage,
      endCursor: connection.pageInfo.endCursor,
    },
  };
}

/**
 * Map a single product to a detailed product response
 */
export function mapProductToDetail(product: Product): ProductDetailResponse {
  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    description: product.description,
    descriptionHtml: product.descriptionHtml,
    availableForSale: product.availableForSale,
    images: product.images.edges.map((edge) => ({
      url: edge.node.url,
      altText: edge.node.altText,
      width: edge.node.width,
      height: edge.node.height,
    })),
    variants: product.variants.edges.map((edge): ProductDetailVariant => ({
      id: edge.node.id,
      title: edge.node.title,
      availableForSale: edge.node.availableForSale,
      selectedOptions: edge.node.selectedOptions,
      price: edge.node.price,
      compareAtPrice: edge.node.compareAtPrice,
      quantityAvailable: edge.node.quantityAvailable,
    })),
    seo: product.seo,
  };
}

/**
 * Map a cart line item to a response format
 */
export function mapCartLineItem(
  lineItem: Cart["lines"]["edges"][0]["node"]
): CartLineItemResponse {
  return {
    id: lineItem.id,
    quantity: lineItem.quantity,
    merchandiseId: lineItem.merchandise.id,
    title: lineItem.merchandise.title,
    productTitle: lineItem.merchandise.product.title,
    productHandle: lineItem.merchandise.product.handle,
    featuredImage: lineItem.merchandise.product.featuredImage,
    selectedOptions: lineItem.merchandise.selectedOptions,
    price: lineItem.merchandise.price,
    totalPrice: lineItem.cost.totalAmount,
  };
}

/**
 * Map a cart to a response format
 */
export function mapCart(cart: Cart): CartResponse {
  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    totalQuantity: cart.totalQuantity,
    lines: cart.lines.edges.map((edge) => mapCartLineItem(edge.node)),
    cost: {
      subtotal: cart.cost.subtotalAmount,
      total: cart.cost.totalAmount,
      tax: cart.cost.totalTaxAmount,
    },
  };
}
