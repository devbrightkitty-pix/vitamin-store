import React from "react";
import Navbar from "@/components/Navbar";
import Card from "@/components/Card";
import Footer from "@/components/Footer";
import { getProducts } from "@/lib/shopify";

export default async function Home() {
  const products = await getProducts({});

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-heading-2 font-jost text-fuchsia-600 mb-8">
            Our Products
          </h1>
          {products.length === 0 ? (
            <p className="text-dark-700">
              No products found. Please add products to your Shopify store.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.slice(0, 6).map((product) => (
                <Card
                  key={product.id}
                  title={product.title}
                  description={product.description}
                  image={product.featuredImage?.url || "/globe.svg"}
                  price={`$${parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)}`}
                  href={`/products/${product.handle}`}
                />
              ))}
            </div>
          )}
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
