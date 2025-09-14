import Hero from "@/components/Hero";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Image from "next/image";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="relative">
        {/* Full-page background */}
       
      

        <Navbar />
        <Hero></Hero>
        <main className="mx-auto max-w-6xl px-4">{children}</main>
      </body>
    </html>
  );
}
