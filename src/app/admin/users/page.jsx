// src/app/admin/users/page.jsx
export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import Link from "next/link";
import UsersTable from "./UsersTable.client";

export default async function ManageUsersPage() {
  const session = await auth();
  if (!["admin", "superadmin"].includes(session?.user?.role)) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Forbidden</h2>
        <p className="mt-2 text-gray-600">You don’t have access to Manage Users.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#4C3D3D]">Manage Users</h2>
        <Link href="/admin" className="text-sm text-emerald-700 hover:underline">Back to Admin</Link>
      </div>

      <UsersTable />
    </div>
  );
}
