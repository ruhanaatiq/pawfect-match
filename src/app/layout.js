import "./globals.css";
import Navbar from "@/components/Navbar";
import Image from "next/image";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="relative">
        {/* Full-page background */}
        <Image
          src="/paw-print-bg.jpg"
          alt="Background"
          fill
          className="object-cover -z-10"
          priority
        />
        <div className="absolute inset-0 bg-black/40 -z-10" />

        <Navbar />
        <main className="mx-auto max-w-6xl px-4">{children}</main>
      </body>
    </html>
  );
}
