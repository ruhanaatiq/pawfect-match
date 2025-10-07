// src/app/admin/layout.jsx
export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
// OPTIONAL: uncomment if you want a gentle fade-in
// import { motion } from "framer-motion";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-emerald-50/40">
      {/* Top bar */}
      <header className="border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/paws.png" // your existing logo in /public
              alt="Pawfect Match"
              width={28}
              height={28}
              className="rounded-full"
            />
            <span className="text-lg font-bold tracking-tight text-[#4C3D3D]">
              Admin Dashboard
            </span>
          </div>

          <nav className="flex items-center gap-5 text-sm text-[#4C3D3D]">
            <Link href="/admin" className="hover:text-emerald-700 transition-colors">Overview</Link>
            <Link href="/admin/requests" className="hover:text-emerald-700 transition-colors">Adoption Requests</Link>
            <Link href="/admin/shelters" className="hover:text-emerald-700 transition-colors">Shelters</Link>
            <Link href="/admin/pets" className="hover:text-emerald-700 transition-colors">Pets</Link>
            <Link href="/admin/users" className="hover:text-emerald-700 transition-colors">Users</Link>
          </nav>
        </div>
      </header>

      {/* Subtle banner with decorative image */}
      
        <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#4C3D3D]">Welcome back 👋</h1>
            <p className="text-sm text-emerald-900/70">
              Manage shelters, review requests, and keep everything running smoothly.
            </p>
          </div>

          {/* Decorative illustration (keep it small & subtle) */}
          <div className="relative w-28 h-20 sm:w-36 sm:h-24">
            <Image
              src="/admin1.png" // add a light, friendly illustration to /public
              alt=""
              fill
              className="object-contain opacity-90"
              priority
            />
          </div>
        
      </div>

      {/* Optional: a super subtle patterned strip (paws) */}
      <div
        aria-hidden="true"
        className="h-2 bg-[radial-gradient(circle_at_1rem_1rem,rgba(16,185,129,0.15),transparent_40%)]"
      />

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* If you want a gentle fade-in, wrap children with <motion.div> */}
        {/* <motion.div initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} transition={{duration:0.25}}> */}
          {children}
        {/* </motion.div> */}
      </main>

      {/* Footer (very light) */}
      <footer className="mt-auto border-t bg-white/80">
        <div className="mx-auto max-w-6xl px-6 py-4 text-xs text-emerald-900/70">
          © {new Date().getFullYear()} Pawfect Match — Admin
        </div>
      </footer>
    </div>
  );
}
