'use client';

import {useState} from "react";
import {useProduct} from "@/components/Product-context";
import {Money} from "@/lib/shopify/types";



export function ProductDescription() {
    const {
        product,
        selectedVariant,
        setSelectedVariant,
        quantity,
        setQuantity,
        isAddingToCart,
        setIsAddingToCart
    } = useProduct();

    const handleAddToCart =async () => {
        setIsAddingToCart(true);
        try {
            // TODO: Implement cart add logic
            console.log('Adding to cart', {
                variantId: selectedVariant.id,
                quantity
            });
        } catch (error) {
            console.error('Failed to add to cart',error);
        } finally {
            setIsAddingToCart(false);
        }
    };

    const formatPrice = (price: Money) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: price.currencyCode
        }).format(parseFloat(price.amount));
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Title */}
            <div>
                <h1 className="text-4x1 font-bold tracking-tight text-neutral-900 dark:text-white">
                    {product.title}
                </h1>
                <div className="mt-s text-2x1 text-fuchsia-600">
                    {formatPrice(selectedVariant.price)}
                    {selectedVariant.compareAtPrice && (
                        <span className="ml-2 text-lg text-neutral-500 line-through">
                            {formatPrice(selectedVariant.compareAtPrice)}
                        </span>
                    ) }
                </div>
            </div>
            {/* Description */}
            <div className="prose prose-sm text-neutral-600 dark:text-neutral-400">
                <p>{product.description}</p>
            </div>

            {/* Variant Selector */}
            {product.variants.length > 1 && (
                <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Options
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {product.variants.map((variant) => (
                            <button
                                key={variant.id}
                                onClick={() => setSelectedVariant(variant)}
                                disabled={!variant.availableForSale}
                                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                                    selectedVariant.id === variant.id
                                        ? 'border-fuchsia-600 bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-900/20 dark:text-fuchsia-300'
                                        : 'border-neutral-200 text-neutral-700 hover:border-neutral-300 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-600'
                                } ${
                                    !variant.availableForSale
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'cursor-pointer'
                                }`}
                            >
                                {variant.title}
                                {!variant.availableForSale && ' - Out of Stock'}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center border border-neutral-200 rounded-lg dark:border-neutral-700">
                    <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="px-3 py-2 text-neutral-600 hover:text-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed dark:text-neutral-400 dark:hover:text-white"
                    >
                        -
                    </button>
                    <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 text-center border-x border-neutral-200 py-2 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-white"
                    />
                    <button
                        onClick={() => setQuantity(quantity + 1)}
                        disabled={!selectedVariant.availableForSale}
                        className="px-3 py-2 text-neutral-600 hover:text-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed dark:text-neutral-400 dark:hover:text-white"
                    >
                        +
                    </button>
                </div>

                <button
                    onClick={handleAddToCart}
                    disabled={!selectedVariant.availableForSale || isAddingToCart}
                    className="flex-1 bg-fuchsia-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isAddingToCart ? 'Adding...' :
                        !selectedVariant.availableForSale ? 'Out of Stock' :
                            'Add to Cart'}
                </button>
            </div>

            {/* Product Details */}
            <div className="border-t border-neutral-200 pt-6 dark:border-neutral-700">
                <h2 className="text-sm font-medium text-neutral-900 dark:text-white mb-4">
                    Product Details
                </h2>
                <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <div>
                        <span className="font-medium">SKU:</span> {selectedVariant.sku || 'N/A'}
                    </div>
                    {selectedVariant.quantityAvailable !== undefined && (
                        <div>
                            <span className="font-medium">Availability:</span>{' '}
                            {selectedVariant.quantityAvailable > 0
                                ? `${selectedVariant.quantityAvailable} in stock`
                                : 'Out of stock'}
                        </div>
                    )}
                    {product.tags.length > 0 && (
                        <div>
                            <span className="font-medium">Tags:</span> {product.tags.join(', ')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
