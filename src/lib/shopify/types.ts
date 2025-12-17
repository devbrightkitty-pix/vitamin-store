/**
 * TypeScript types for Shopify Storefront API responses
 * These types represent the data structures returned by the Storefront GraphQL API
 */

// Base types
export interface Money {
  amount: string;
  currencyCode: string;
}

export interface Image {
  url: string;
  altText: string | null;
  width: number;
  height: number;
}

export interface SEO {
  title: string | null;
  description: string | null;
}

// Product types
export interface ProductPriceRange {
  minVariantPrice: Money;
  maxVariantPrice: Money;
}

export interface ProductVariantSelectedOption {
  name: string;
  value: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: ProductVariantSelectedOption[];
  price: Money;
  compareAtPrice: Money | null;
  quantityAvailable: number | null;
}

export interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  availableForSale: boolean;
  featuredImage: Image | null;
  images: {
    edges: Array<{
      node: Image;
    }>;
  };
  priceRange: ProductPriceRange;
  variants: {
    edges: Array<{
      node: ProductVariant;
    }>;
  };
  seo: SEO;
}

export interface ProductEdge {
  cursor: string;
  node: Product;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface ProductConnection {
  edges: ProductEdge[];
  pageInfo: PageInfo;
}

// Cart types
export interface CartLineItem {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    product: {
      id: string;
      title: string;
      handle: string;
      featuredImage: Image | null;
    };
    selectedOptions: ProductVariantSelectedOption[];
    price: Money;
  };
  cost: {
    totalAmount: Money;
    amountPerQuantity: Money;
  };
}

export interface CartCost {
  subtotalAmount: Money;
  totalAmount: Money;
  totalTaxAmount: Money | null;
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: {
    edges: Array<{
      node: CartLineItem;
    }>;
  };
  cost: CartCost;
}

export interface CartUserError {
  field: string[] | null;
  message: string;
  code: string;
}

// API Response types (mapped/transformed for frontend consumption)
export interface ProductListItem {
  id: string;
  title: string;
  handle: string;
  featuredImage: Image | null;
  priceRange: {
    minPrice: Money;
    maxPrice: Money;
  };
  availableForSale: boolean;
}

export interface ProductListResponse {
  items: ProductListItem[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
}

export interface ProductDetailVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: ProductVariantSelectedOption[];
  price: Money;
  compareAtPrice: Money | null;
  quantityAvailable: number | null;
}

export interface ProductDetailResponse {
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
  variants: ProductDetailVariant[];
  seo: SEO;
}

export interface CartLineItemResponse {
  id: string;
  quantity: number;
  merchandiseId: string;
  title: string;
  productTitle: string;
  productHandle: string;
  featuredImage: Image | null;
  selectedOptions: ProductVariantSelectedOption[];
  price: Money;
  totalPrice: Money;
}

export interface CartResponse {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: CartLineItemResponse[];
  cost: {
    subtotal: Money;
    total: Money;
    tax: Money | null;
  };
}

// GraphQL response wrappers
export interface ShopifyGraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: string[];
    extensions?: {
      code?: string;
      [key: string]: unknown;
    };
  }>;
}

export interface ProductsQueryResponse {
  products: ProductConnection;
}

export interface ProductByHandleQueryResponse {
  productByHandle: Product | null;
}

export interface CartCreateResponse {
  cartCreate: {
    cart: Cart | null;
    userErrors: CartUserError[];
  };
}

export interface CartQueryResponse {
  cart: Cart | null;
}

export interface CartLinesAddResponse {
  cartLinesAdd: {
    cart: Cart | null;
    userErrors: CartUserError[];
  };
}

export interface CartLinesUpdateResponse {
  cartLinesUpdate: {
    cart: Cart | null;
    userErrors: CartUserError[];
  };
}

export interface CartLinesRemoveResponse {
  cartLinesRemove: {
    cart: Cart | null;
    userErrors: CartUserError[];
  };
}
