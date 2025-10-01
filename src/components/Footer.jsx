"use client";

import Link from "next/link";

const Icon = {
  paw: (p) => (
    <svg viewBox="0 0 24 24" className={`h-5 w-5 ${p.className||""}`} fill="currentColor">
      <path d="M7.5 8.25a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm9 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM10 9.5a2.2 2.2 0 1 0-4.4 0A2.2 2.2 0 0 0 10 9.5Zm8.8 0a2.2 2.2 0 1 0-4.4 0 2.2 2.2 0 0 0 4.4 0ZM12 11.25c-3.2 0-5.75 2.2-5.75 4.75 0 1.5 1.25 2.25 2.75 2.25h6c1.5 0 2.75-.75 2.75-2.25 0-2.55-2.55-4.75-5.75-4.75Z"/>
    </svg>
  ),
  phone: (p) => (
    <svg viewBox="0 0 24 24" className={`h-4 w-4 ${p.className||""}`} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2c-9.4-.8-16.74-8.13-17.54-17.54A2 2 0 0 1 4.26 2h3a2 2 0 0 1 2 1.72c.12.86.32 1.7.59 2.5a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.58-1.31a2 2 0 0 1 2.11-.45c.8.27 1.64.47 2.5.59A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  mail: (p) => (
    <svg viewBox="0 0 24 24" className={`h-4 w-4 ${p.className||""}`} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 4h16v16H4z"/><path d="M22 6 12 13 2 6"/>
    </svg>
  ),
  map: (p) => (
    <svg viewBox="0 0 24 24" className={`h-4 w-4 ${p.className||""}`} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 10c0 6-9 11-9 11S3 16 3 10a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  x: (p) => (
    <svg viewBox="0 0 24 24" className={`h-4 w-4 ${p.className||""}`} fill="currentColor">
      <path d="M18 5h-2l-4 5-4-5H6l5 6-5 8h2l4-6 4 6h2l-5-8 5-6z"/>
    </svg>
  ),
  ig: (p) => (
    <svg viewBox="0 0 24 24" className={`h-4 w-4 ${p.className||""}`} fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17" cy="7" r="1.2" fill="currentColor"/>
    </svg>
  ),
  fb: (p) => (
    <svg viewBox="0 0 24 24" className={`h-4 w-4 ${p.className||""}`} fill="currentColor">
      <path d="M13 22v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2h-3a5 5 0 0 0-5 5v3H6v4h3v8h4z"/>
    </svg>
  ),
  wa: (p) => (
    <svg viewBox="0 0 24 24" className={`h-4 w-4 ${p.className||""}`} fill="currentColor">
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 15.1L2 22l5.1-1.5A10 10 0 1 0 12.04 2zm5.8 14.3c-.25.7-1.24 1.2-2.02 1.3-.54.05-1.23.1-3.55-.73-2.97-1.16-4.9-4.02-5.06-4.22-.15-.2-1.2-1.6-1.2-3.06 0-1.45.76-2.16 1.03-2.46.25-.3.55-.36.74-.36h.52c.17 0 .4.02.6.46.25.54.85 2 .92 2.14.07.15.1.32.01.52-.1.2-.15.32-.3.5-.15.17-.32.38-.46.52-.15.15-.3.31-.14.6.17.3.76 1.24 1.64 2 1.13.98 2.08 1.28 2.39 1.44.31.15.49.13.68-.08.2-.2.79-.92 1-.24.25.7.9 2.44.98 2.62.08.18.08.34.02.5z"/>
    </svg>
  ),
};

export default function Footer() {
  return (
    <footer className="relative mt-16">
      {/* wavy top edge */}
      <svg viewBox="0 0 1440 90" className="block w-full" preserveAspectRatio="none">
        <path d="M0,60 C200,20 400,100 720,60 C1040,20 1240,100 1440,60 L1440,90 L0,90 Z" fill="#F8E7B6" />
      </svg>

      <div className="bg-[#F8E7B6]">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="grid gap-8 md:grid-cols-4">
            {/* Brand / intro */}
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-700">
                  <Icon.paw />
                </span>
                <span className="text-lg font-extrabold text-[#4C3D3D]">
                  Pawfect<span className="ml-1 rounded bg-[#4C3D3D] px-2 py-0.5 text-white">Match</span>
                </span>
              </div>
              <p className="mt-3 text-sm text-[#4C3D3D]/80">
                We connect pets from verified shelters with loving families. Safe,
                simple, and full of joy.
              </p>

              <div className="mt-4 flex gap-2">
                {[
                  { Icon: Icon.x, href: "#" },
                  { Icon: Icon.fb, href: "#" },
                  { Icon: Icon.ig, href: "#" },
                  { Icon: Icon.wa, href: "#" },
                ].map(({ Icon: I, href }, i) => (
                  <a key={i} href={href} aria-label="social link"
                     className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-white/80 text-[#4C3D3D] shadow hover:bg-white">
                    <I />
                  </a>
                ))}
              </div>
            </div>

            {/* Useful links */}
            <div>
              <h4 className="font-semibold text-[#4C3D3D]">Useful Links</h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li><Link href="/#hero" className="hover:text-emerald-700">Home</Link></li>
                <li><Link href="/#about" className="hover:text-emerald-700">About Us</Link></li>
                <li><Link href="/#services" className="hover:text-emerald-700">Services</Link></li>
                <li><Link href="/adopt" className="hover:text-emerald-700">Adopt</Link></li>
                <li><Link href="/#blog" className="hover:text-emerald-700">Blog</Link></li>
                <li><Link href="/#contact" className="hover:text-emerald-700">Contact</Link></li>
              </ul>
            </div>

            {/* Contact info */}
            <div>
              <h4 className="font-semibold text-[#4C3D3D]">Contact Info</h4>
              <ul className="mt-3 space-y-2 text-sm text-[#4C3D3D]/90">
                <li className="flex items-center gap-2">
                  <Icon.phone /><a href="tel:+8801700000000">+880 1700 000 000</a>
                </li>
                <li className="flex items-center gap-2">
                  <Icon.mail /><a href="mailto:hello@pawfectmatch.com">pawfectmatchofficiall11.com</a>
                </li>
                <li className="flex items-start gap-2">
                  <Icon.map /><span> Dhaka, Bangladesh</span>
                </li>
              </ul>
            </div>

            {/* Working hours card */}
            <div className="md:pl-6">
              <div className="rounded-2xl border border-black/10 bg-[#4C3D3D] text-white shadow p-5">
                <h4 className="font-semibold">Working Hours</h4>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between"><span>Mon – Fri:</span><span>7am – 6pm</span></div>
                  <div className="flex justify-between"><span>Saturday:</span><span>9am – 4pm</span></div>
                  <div className="flex justify-between">
                    <span>Sunday:</span>
                    <span className="text-amber-300 font-semibold">Closed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* bottom line */}
          <div className="mt-8 border-t border-[#4C3D3D]/10 pt-4 text-center text-xs text-[#4C3D3D]/70">
            © {new Date().getFullYear()} PawfectMatch — All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
