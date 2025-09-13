"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur dark:bg-black/30">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-lg font-bold tracking-tight">
          Pet<span className="px-1 rounded bg-black text-white dark:bg-white dark:text-black">Adoption</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-emerald-600">Home</Link>
          <Link href="/adopt" className="hover:text-emerald-600">Adopt</Link>
          <Link href="/profile" className="hover:text-emerald-600">Profile</Link>
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
            <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link href="/adopt" onClick={() => setMenuOpen(false)}>Adopt</Link>
            <Link href="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
