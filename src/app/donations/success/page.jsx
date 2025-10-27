// app/donations/success/page.jsx
import { Suspense } from "react";

export const dynamic = "force-dynamic"; // don’t prerender
export const revalidate = 0;
export const runtime = "nodejs";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-600">
          Loading…
        </div>
      }
    >
      {/* Client-only UI lives here */}
      <DonationSuccessClient />
    </Suspense>
  );
}

// Lazy import keeps the server layer light
import DonationSuccessClient from "./success.client";
