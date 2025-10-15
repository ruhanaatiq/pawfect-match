// src/app/layout.jsx
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import "./globals.css";
import { NextAuthProvider } from "./providers";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "PawfectMatch",
  description: "Adopt love. Give a home.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="relative min-h-screen text-[#4C3D3D] overflow-x-hidden">
        {/* Full-page background layer */}
        <div className="fixed inset-0 -z-10 pointer-events-none">
          {/* Soft gradient base */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-emerald-100 opacity-40" />
          {/* Pawprint pattern overlay */}
          <div className="absolute inset-0 bg-[url('/pawprint.png')] bg-repeat opacity-10" />
        </div>

        {/* Wrap everything with NextAuthProvider */}
        <NextAuthProvider>
          <Navbar />
          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
          <Footer />
        </NextAuthProvider>

        {/* Toast Notifications */}
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            style: {
              background: "#4C3D3D",
              color: "#FFF7D4",
              borderRadius: "0.75rem",
              padding: "12px 16px",
              fontSize: "0.9rem",
            },
            success: { iconTheme: { primary: "#10B981", secondary: "#FFF" } },
            error: { iconTheme: { primary: "#EF4444", secondary: "#FFF" } },
          }}
        />
      </body>
    </html>
  );
}
