import type { Metadata } from "next";
import { Jost} from "next/font/google";
import "./globals.css";
import React from "react";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Core6 Wellness",
  description: "An ECommerce Platform that focused on Human health",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jost.variable}  antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
