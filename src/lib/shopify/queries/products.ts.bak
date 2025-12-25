/**
 * GraphQL queries for Shopify Storefront API - Products
 * 
 * These queries are used to fetch product data from the Storefront API.
 * They include pagination support and all fields needed for product listing
 * and product detail pages.
 */

/**
 * Query to fetch a paginated list of products
 * 
 * Variables:
 * - first: Number of products to fetch (default: 20)
 * - after: Cursor for pagination
 * - query: Optional search/filter query string
 * - sortKey: Sort key (TITLE, PRICE, BEST_SELLING, CREATED_AT, etc.)
 * - reverse: Whether to reverse the sort order
 */
export const PRODUCTS_QUERY = `
  query Products(
    $first: Int!
    $after: String
    $query: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
  ) {
    products(
      first: $first
      after: $after
      query: $query
      sortKey: $sortKey
      reverse: $reverse
    ) {
      edges {
        cursor
        node {
          id
          title
          handle
          availableForSale
          featuredImage {
            url
            altText
            width
            height
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

/**
 * Query to fetch a single product by its handle
 * 
 * Variables:
 * - handle: The product handle (URL slug)
 * 
 * Returns full product details including:
 * - Basic info (id, title, handle, description)
 * - All images with metadata
 * - All variants with pricing and availability
 * - SEO metadata
 */
export const PRODUCT_BY_HANDLE_QUERY = `
  query ProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      handle
      description
      descriptionHtml
      availableForSale
      featuredImage {
        url
        altText
        width
        height
      }
      images(first: 20) {
        edges {
          node {
            url
            altText
            width
            height
          }
        }
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      variants(first: 100) {
        edges {
          node {
            id
            title
            availableForSale
            quantityAvailable
            selectedOptions {
              name
              value
            }
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
          }
        }
      }
      seo {
        title
        description
      }
    }
  }
`;

/**
 * Query to fetch products by collection handle
 * 
 * Variables:
 * - handle: The collection handle
 * - first: Number of products to fetch
 * - after: Cursor for pagination
 */
export const PRODUCTS_BY_COLLECTION_QUERY = `
  query ProductsByCollection(
    $handle: String!
    $first: Int!
    $after: String
  ) {
    collectionByHandle(handle: $handle) {
      id
      title
      description
      products(first: $first, after: $after) {
        edges {
          cursor
          node {
            id
            title
            handle
            availableForSale
            featuredImage {
              url
              altText
              width
              height
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
                currencyCode
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
  }
`;
