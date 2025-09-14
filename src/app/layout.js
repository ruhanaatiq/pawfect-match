// src/app/layout.jsx
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = { title: "PawfectMatch", description: "Adopt love. Give a home." };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="relative min-h-screen text-[#4C3D3D] overflow-x-hidden">
        {/* Full-page background layer */}
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <div className="absolute inset-0 " />
          <div className="absolute inset-0 bg-[url('/pawprint.png')] bg-repeat opacity-10" />
        </div>

        {/* Content */}
        <Navbar />
        <main className="mx-auto max-w-6xl px-4">{children}</main>
      </body>
    </html>
  );
}
