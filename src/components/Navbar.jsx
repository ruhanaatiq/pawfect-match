"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b bg-[#4C3D3D] backdrop-blur text-[#FFF7D4]">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        {/* Logo with image */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight"
        >
          <Image
            src="/paws.png"
            alt="Paw Logo"
            width={28}
            height={28}
            className="rounded-full"
          />
          Pawfect
          <span className="px-1 rounded bg-black text-white dark:bg-white dark:text-black">
            Match
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-emerald-600">
            Home
          </Link>
          <Link href="/pets" className="hover:text-emerald-600">
            Pet Listings
          </Link>

          <Link href="/adopt" className="hover:text-emerald-600">
            Adopt
          </Link>
          <Link href="/profile" className="hover:text-emerald-600">
            Profile
          </Link>
           <Link href="/dashboard" className="hover:text-emerald-600">
            Dashboard
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          ☰
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-black border-t">
          <div className="flex flex-col items-start p-4 gap-3 text-sm">
            <Link href="/" onClick={() => setMenuOpen(false)}>
              Home
            </Link>
            <Link href="/pets" onClick={() => setMenuOpen(false)}>
              Pet Listings
            </Link>
            <Link href="/adopt" onClick={() => setMenuOpen(false)}>
              Adopt
            </Link>
            <Link href="/profile" onClick={() => setMenuOpen(false)}>
              Profile
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
