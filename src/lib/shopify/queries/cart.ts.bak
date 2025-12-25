/**
 * GraphQL queries and mutations for Shopify Storefront API - Cart
 * 
 * These queries and mutations handle all cart operations including:
 * - Creating a new cart
 * - Fetching cart details
 * - Adding, updating, and removing line items
 * 
 * Reference: https://shopify.dev/docs/api/storefront/latest/objects/Cart
 */

/**
 * Fragment containing all cart fields we need
 * Used across multiple cart queries/mutations for consistency
 */
const CART_FRAGMENT = `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              product {
                id
                title
                handle
                featuredImage {
                  url
                  altText
                  width
                  height
                }
              }
              selectedOptions {
                name
                value
              }
              price {
                amount
                currencyCode
              }
            }
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
            amountPerQuantity {
              amount
              currencyCode
            }
          }
        }
      }
    }
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
      totalTaxAmount {
        amount
        currencyCode
      }
    }
  }
`;

/**
 * Mutation to create a new cart
 * 
 * Variables:
 * - lines: Optional array of initial line items
 *   - merchandiseId: The variant ID (gid://shopify/ProductVariant/...)
 *   - quantity: Number of items
 * 
 * Reference: https://shopify.dev/docs/api/storefront/latest/mutations/cartCreate
 */
export const CART_CREATE_MUTATION = `
  ${CART_FRAGMENT}
  
  mutation CartCreate($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

/**
 * Query to fetch an existing cart by ID
 * 
 * Variables:
 * - id: The cart ID (gid://shopify/Cart/...)
 * 
 * Reference: https://shopify.dev/docs/api/storefront/latest/queries/cart
 */
export const CART_QUERY = `
  ${CART_FRAGMENT}
  
  query Cart($id: ID!) {
    cart(id: $id) {
      ...CartFields
    }
  }
`;

/**
 * Mutation to add line items to an existing cart
 * 
 * Variables:
 * - cartId: The cart ID
 * - lines: Array of line items to add
 *   - merchandiseId: The variant ID
 *   - quantity: Number of items
 * 
 * Reference: https://shopify.dev/docs/api/storefront/latest/mutations/cartLinesAdd
 */
export const CART_LINES_ADD_MUTATION = `
  ${CART_FRAGMENT}
  
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

/**
 * Mutation to update line items in an existing cart
 * 
 * Variables:
 * - cartId: The cart ID
 * - lines: Array of line item updates
 *   - id: The line item ID
 *   - quantity: New quantity (set to 0 to remove)
 * 
 * Reference: https://shopify.dev/docs/api/storefront/latest/mutations/cartLinesUpdate
 */
export const CART_LINES_UPDATE_MUTATION = `
  ${CART_FRAGMENT}
  
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

/**
 * Mutation to remove line items from an existing cart
 * 
 * Variables:
 * - cartId: The cart ID
 * - lineIds: Array of line item IDs to remove
 * 
 * Reference: https://shopify.dev/docs/api/storefront/latest/mutations/cartLinesRemove
 */
export const CART_LINES_REMOVE_MUTATION = `
  ${CART_FRAGMENT}
  
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;
