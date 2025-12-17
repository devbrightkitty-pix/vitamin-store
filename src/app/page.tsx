import React from "react";
import Navbar from "@/components/Navbar";
import Card from "@/components/Card";
import Footer from "@/components/Footer";

const sampleProducts = [
  {
    title: "Keep it Movin'",
    description: "Contains traditional botanicals used for centuries",
    image: "/globe.svg",
    price: "$13.99",
    rating: 4.1,
    reviewCount: 110,
    href: "#",
  },
  {
    title: "Women's Multi",
    description: "A Multitasking Blend of Vitamins A, C, D, E, Bs, Biotin & Folic Acid",
    image: "/globe.svg",
    price: "$13.99",
    rating: 4.4,
    reviewCount: 3746,
    href: "#",
  },
  {
    title: "Sleep Blackberry Zen",
    description: "Supports restful sleep with melatonin and botanicals",
    image: "/globe.svg",
    price: "$13.99",
    rating: 4.5,
    reviewCount: 2500,
    href: "#",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-heading-2 font-jost text-fuchsia-600 mb-8">
            Our Products
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {sampleProducts.map((product) => (
              <Card key={product.title} {...product} />
            ))}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
