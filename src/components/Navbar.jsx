"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isShelterMember, setIsShelterMember] = useState(false); // ← NEW
  const { data: session, status } = useSession();
  const role = session?.user?.role;

  const userName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "";
  const userImage =
    session?.user?.image ||
    `https://api.dicebear.com/9.x/identicon/png?seed=${encodeURIComponent(
      userEmail || userName
    )}&size=128`;

  const dropdownRef = useRef(null);

  // Detect shelter membership once user is authenticated
  useEffect(() => {
    let abort = false;
    async function checkMembership() {
      try {
        if (status !== "authenticated") {
          setIsShelterMember(false);
          return;
        }
        const res = await fetch("/api/shelters/mine", {
          cache: "no-store",
          credentials: "same-origin",
        });
        if (!abort) setIsShelterMember(res.ok); // 200 => member, 404/401 => not
      } catch {
        if (!abort) setIsShelterMember(false);
      }
    }
    checkMembership();
    return () => { abort = true; };
  }, [status]);

  // Close avatar dropdown on outside click
  useEffect(() => {
    function handleOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // Close avatar dropdown on Escape
  useEffect(() => {
    function onEsc(e) {
      if (e.key === "Escape") setProfileOpen(false);
    }
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b bg-[#4C3D3D] text-[#FFF7D4]">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <Image src="/paws.png" alt="Paw Logo" width={28} height={28} className="rounded-full" />
          Pawfect
          <span className="px-1 rounded bg-black text-white dark:bg-white dark:text-black">Match</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-emerald-400">Home</Link>
          <Link href="/pets" className="hover:text-emerald-400">Pet Listings</Link>
          <Link href="/adopt" className="hover:text-emerald-400">Adopt</Link>
          <Link href="/vets" className="hover:text-emerald-400">Vet Details</Link>
          <Link href="/pet-care" className="hover:text-emerald-400">Pet Care</Link>
          <Link href="/campaigns" className="hover:text-emerald-400">Campaigns</Link>
          <Link href="/workshop" className="hover:text-emerald-400">Workshop</Link>
          <Link href="/shelters" className="hover:text-emerald-400">Shelters</Link>
          <Link href="/support" className="hover:text-emerald-400">Support</Link>

          <Link href="/give-feedback" className="hover:text-emerald-400">Give Feedback</Link>

          {isShelterMember && (
            <Link href="/dashboard/shelter" className="hover:text-emerald-400">
              Shelter Dashboard
            </Link>
          )}

          {role === "admin" && (
            <Link href="/admin" className="hover:text-emerald-400">Admin Dashboard</Link>
          )}

          {!session ? (
            <div className="flex items-center gap-3 ml-6">
              <Link
                href="/login"
                className="px-4 py-2 rounded-md border border-emerald-500 hover:bg-emerald-500 hover:text-white transition"
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
          ) : (
            <div className="relative ml-6" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-2 focus:outline-none"
              >
                {userImage ? (
                  <Image
                    src={userImage}
                    alt={userName}
                    width={36}
                    height={36}
                    unoptimized
                    className="rounded-full cursor-pointer border-2 border-emerald-500"
                  />
                ) : (
                  <div className="w-9 h-9 flex items-center justify-center rounded-full bg-emerald-600 text-white font-bold cursor-pointer">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white text-gray-800 shadow-lg border p-2 z-50">
                  <div className="px-3 py-2 text-sm text-gray-700 border-b truncate">{userName}</div>

                  <Link
                    href="/dashboard"
                    role="menuitem"
                    className="block px-3 py-2 text-sm rounded hover:bg-emerald-50"
                    onClick={() => setProfileOpen(false)}
                  >
                    User Dashboard
                  </Link>

                  {isShelterMember && (
                    <Link
                      href="/dashboard/shelter"
                      className="block px-3 py-2 text-sm rounded hover:bg-emerald-50"
                      onClick={() => setProfileOpen(false)}
                    >
                      Shelter Dashboard
                    </Link>
                  )}

                  {role === "admin" && (
                    <Link
                      href="/admin"
                      className="block px-3 py-2 text-sm rounded hover:bg-emerald-50"
                      onClick={() => setProfileOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => signOut()}
                    className="w-full text-left px-3 py-2 text-sm rounded hover:bg-red-50 text-red-600"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden rounded-md p-2 hover:bg-slate-100/20"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          ☰
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white text-[#4C3D3D] border-t">
          <div className="flex flex-col items-start p-4 gap-3 text-sm">
            {session && (
              <div className="flex items-center gap-3 mb-2">
                <Image
                  src={userImage}
                  alt={userName}
                  width={36}
                  height={36}
                  className="rounded-full border-2 border-emerald-500"
                  unoptimized
                />
                <div className="text-gray-800 font-medium truncate">{userName}</div>
              </div>
            )}

            <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link href="/pets" onClick={() => setMenuOpen(false)}>Pet Listings</Link>
            <Link href="/adopt" onClick={() => setMenuOpen(false)}>Adopt</Link>
            <Link href="/vets" onClick={() => setMenuOpen(false)}>Vet Details</Link>
            <Link href="/pet-care" onClick={() => setMenuOpen(false)}>Pet Care</Link>
            <Link href="/workshop" onClick={() => setMenuOpen(false)}>Workshop</Link>
            <Link href="/shelters" onClick={() => setMenuOpen(false)}>Shelters</Link>
            <Link href="/support" onClick={() => setMenuOpen(false)}>Support</Link>

            <Link href="/give-feedback" className="hover:text-emerald-400">Give Feedback</Link>

            {session && (
              <>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)}>User Dashboard</Link>
                {isShelterMember && (
                  <Link href="/dashboard/shelter" onClick={() => setMenuOpen(false)}>
                    Shelter Dashboard
                  </Link>
                )}
                {role === "admin" && (
                  <Link href="/admin" onClick={() => setMenuOpen(false)}>Admin Dashboard</Link>
                )}
              </>
            )}

            {!session ? (
              <>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="mt-3 w-full text-center px-4 py-2 rounded-md border border-emerald-500 text-emerald-600 hover:bg-emerald-50 transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-center px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition"
                >
                  Register
                </Link>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  signOut();
                }}
                className="mt-3 w-full text-center px-4 py-2 rounded-md border border-red-500 text-red-600 hover:bg-red-50 transition"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
