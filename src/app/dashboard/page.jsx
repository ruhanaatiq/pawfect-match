// src/app/dashboard/page.jsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { Suspense } from "react";
import DashboardClient from "./DashboardClient";

const ALLOWED_TABS = new Set([
  "applications",
  "favorites",
  "my-bookings",
  "settings",
  "profile",
  "my-feedback",
  "users-reviews",
]);

export default function DashboardPage({ searchParams }) {
  const raw = (searchParams?.tab || "profile").toLowerCase();
  const initialTab = ALLOWED_TABS.has(raw) ? raw : "profile";

  return (
    <Suspense fallback={<div className="p-6">Loading dashboard…</div>}>
      <DashboardClient initialTab={initialTab} />
    </Suspense>
  );
}
