// src/app/admin/shelters/page.jsx
export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { absoluteUrl } from "@/lib/absolute-url";
import { headers } from "next/headers";
import DeleteShelterButton from "./_components/DeleteShelterButton.client";

export default async function SheltersList({ searchParams }) {
  // Auth gate
  const session = await auth();
  const isAdmin = ["admin", "superadmin"].includes(session?.user?.role);
  if (!isAdmin) return <div className="p-6">Forbidden</div>;

  // Next 15: await searchParams
  const sp = await searchParams;
  const q = String(sp?.q ?? "");
  const page = Math.max(1, Number(sp?.page ?? 1) || 1);

  // Build absolute API URL
  const qs = new URLSearchParams({ q, page: String(page) }).toString();
  const url = await absoluteUrl(`/api/admin/shelters?${qs}`);

  // Forward cookies for auth-protected API
  const h = await headers();
  const cookie = h.get("cookie") ?? "";

  let items = [];
  let total = 0;
  let pageSize = 20;

  try {
    const res = await fetch(url, { cache: "no-store", headers: { cookie } });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        items = data;
        total = data.length;
      } else {
        items = Array.isArray(data.items) ? data.items : [];
        total = Number(data.total ?? items.length ?? 0) || 0;
        pageSize = Number(data.pageSize ?? data.limit ?? 20) || 20;
      }
    }
  } catch {
    // show empty state
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const prevHref = `/admin/shelters?${new URLSearchParams({
    q,
    page: String(Math.max(1, page - 1)),
  })}`;
  const nextHref = `/admin/shelters?${new URLSearchParams({
    q,
    page: String(page + 1),
  })}`;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#4C3D3D]">Shelters</h1>
        <a
          href="/admin/shelters/new"
          className="rounded-xl bg-emerald-600 text-white text-sm px-4 py-2 hover:bg-emerald-700"
        >
          Add Shelter
        </a>
      </div>

      {/* search */}
      <form className="flex gap-2" action="/admin/shelters" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name, city, state…"
          className="flex-1 rounded-xl border px-3 py-2"
        />
        <button className="rounded-xl border px-3 py-2 hover:bg-emerald-50">
          Search
        </button>
      </form>

      {/* table */}
      <div className="overflow-x-auto rounded-2xl bg-white/90 shadow-sm ring-1 ring-black/5">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Location</th>
              <th className="px-4 py-3 text-left">Contact</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.length ? (
              items.map((s) => {
                const id = s._id || s.id;
                const loc = s.location || {};
                const city = s.city ?? loc.city;
                const state = s.state ?? loc.state;
                const country = s.country ?? loc.country;
                return (
                  <tr key={id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {[city, state, country].filter(Boolean).join(", ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {s.email || "—"} {s.phone ? `• ${s.phone}` : ""}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a
                        href={`/admin/shelters/${id}`}
                        className="rounded-lg border px-3 py-1.5 text-emerald-700 hover:bg-emerald-50"
                      >
                        Edit
                      </a>
                      <DeleteShelterButton id={id} />
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
  <a
    href={`/admin/shelters/${id}`}
    className="inline-block rounded-lg border px-3 py-1.5 text-emerald-700 hover:bg-emerald-50"
  >
    Edit
  </a>
  <a
    href={`/admin/shelters/${id}?tab=invites`}
    className="inline-block rounded-lg border px-3 py-1.5 text-blue-700 hover:bg-blue-50"
  >
    Invite
  </a>
  <DeleteShelterButton id={id} />
</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td className="px-4 py-8 text-center text-gray-500" colSpan={4}>
                  No shelters found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          Page {page} / {totalPages}
        </div>
        <div className="flex gap-2">
          <a
            className={`rounded border px-3 py-1 ${
              page <= 1 ? "pointer-events-none opacity-50" : "hover:bg-emerald-50"
            }`}
            href={prevHref}
          >
            Prev
          </a>
          <a
            className={`rounded border px-3 py-1 ${
              page >= totalPages ? "pointer-events-none opacity-50" : "hover:bg-emerald-50"
            }`}
            href={nextHref}
          >
            Next
          </a>
        </div>
      </div>
    </div>
  );
}
