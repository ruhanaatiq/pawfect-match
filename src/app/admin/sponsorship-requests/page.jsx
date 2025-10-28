// src/app/admin/sponsorship-requests/page.jsx
export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import AdminSponsorshipRequests from "./AdminSponsorshipRequests.client.jsx";

export default async function SponsorshipRequestsAdminPage() {
  const session = await auth();
  const isAdmin = ["admin", "superadmin"].includes(session?.user?.role);
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Forbidden</h2>
        <p className="mt-2 text-gray-600">
          You don’t have access to this page.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Sponsorship Requests</h1>
        <span className="text-sm text-gray-500">Admin tools · Approve / Reject / Delete</span>
      </div>
      <AdminSponsorshipRequests />
    </div>
  );
}
