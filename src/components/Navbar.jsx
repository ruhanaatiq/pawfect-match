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
          <Link href="/" className="hover:text-emerald-400">
            Home
          </Link>
          <Link href="/pets" className="hover:text-emerald-400">
            Pet Listings
          </Link>
          <Link href="/adopt" className="hover:text-emerald-400">
            Adopt
          </Link>
          <Link href="/profile" className="hover:text-emerald-400">
            Profile
          </Link>
          <Link href="/dashboard" className="hover:text-emerald-400">
            Dashboard
          </Link>

          {/* Login & Register buttons */}
          <div className="flex items-center gap-3 ml-6">
            <Link
              href="/login"
              className="px-4 py-2 rounded-md border border-emerald-500 text-white hover:bg-emerald-500 hover:text-white transition"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-md bg-emerald-500 text-white hover:bg-emerald-600 transition"
            >
              Register
            </Link>
          </div>
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
            <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
              Dashboard
            </Link>

            {/* Login & Register in Mobile */}
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="mt-3 w-full text-center px-4 py-2 rounded-md border border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white transition"
            >
              Login
            </Link>
            <Link
              href="/register"
              onClick={() => setMenuOpen(false)}
              className="w-full text-center px-4 py-2 rounded-md bg-emerald-500 text-white hover:bg-emerald-600 transition"
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
