'use client'

import { createContext, useContext, useState, ReactNode } from 'react';
import {Product, ProductVariant} from '@/lib/shopify/types';



interface ProductContextType {
    product: Product;
    selectedVariant: ProductVariant;
    setSelectedVariant: (variant: ProductVariant) => void;
    quantity: number;
    setQuantity: (quantity: number) => void;
    isAddingToCart: boolean;
    setIsAddingToCart: (isAdding: boolean) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

interface ProductProviderProps {
    product: Product;
    children:ReactNode;

}

export function ProductProvider({ children,product }: ProductProviderProps) {
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
        product.variants[0] || {} as ProductVariant
    );
    const [quantity, setQuantity] = useState(1);
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    return (
        <ProductContext.Provider
            value={{
                product,
                selectedVariant,
                setSelectedVariant,
                quantity,
                setQuantity,
                isAddingToCart,
                setIsAddingToCart,
            }}
        >
            {children}
        </ProductContext.Provider>
    );
}

export function useProduct () {
    const context = useContext(ProductContext);
    if (context === undefined) {
        throw new Error('useProduct must be used within a ProductProvider')
    }
    return context;
}