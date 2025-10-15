// src/app/dashboard/page.jsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { Suspense } from "react";
import DashboardClient from "./DashboardClient";

export default function DashboardPage({ searchParams }) {
  const initialTab = (searchParams?.tab || "applications").toLowerCase();

  return (
    <Suspense fallback={<div className="p-6">Loading dashboard…</div>}>
      <DashboardClient initialTab={initialTab} />
    </Suspense>
  );
}
