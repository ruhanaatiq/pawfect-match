export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { absoluteUrl } from "@/lib/absolute-url";

export default async function SheltersList({ searchParams }) {
  const session = await auth();
  const isAdmin = ["admin", "superadmin"].includes(session?.user?.role);
  if (!isAdmin) {
    // lightweight guard (API is also guarded)
    return <div className="p-6">Forbidden</div>;
  }

  const q = searchParams?.q || "";
  const page = Number(searchParams?.page || 1);

  const url = absoluteUrl(`/api/admin/shelters?q=${encodeURIComponent(q)}&page=${page}`);
  const res = await fetch(url, { cache: "no-store" });
  const { items = [], total = 0, pageSize = 20 } = res.ok ? await res.json() : {};

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#4C3D3D]">Shelters</h1>
        <a href="/admin/shelters/new" className="rounded-xl bg-emerald-600 text-white text-sm px-4 py-2 hover:bg-emerald-700">
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
        <button className="rounded-xl border px-3 py-2 hover:bg-emerald-50">Search</button>
      </form>

      {/* table */}
      <div className="overflow-x-auto rounded-2xl bg-white/90 shadow-sm ring-1 ring-black/5">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Location</th>
              <th className="px-4 py-3 text-left">Contact</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.length ? (
              items.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {[s.city, s.state, s.country].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {s.email || "—"} {s.phone ? `• ${s.phone}` : ""}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a href={`/admin/shelters/${s._id}`} className="text-emerald-700 hover:underline">
                      Edit
                    </a>
                  </td>
                </tr>
              ))
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

      {/* basic pagination */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          Page {page} / {Math.max(1, Math.ceil(total / pageSize))}
        </div>
        <div className="flex gap-2">
          <a
            className={`rounded border px-3 py-1 ${page <= 1 ? "pointer-events-none opacity-50" : "hover:bg-emerald-50"}`}
            href={`/admin/shelters?q=${encodeURIComponent(q)}&page=${page - 1}`}
          >
            Prev
          </a>
          <a
            className={`rounded border px-3 py-1 ${page * pageSize >= total ? "pointer-events-none opacity-50" : "hover:bg-emerald-50"}`}
            href={`/admin/shelters?q=${encodeURIComponent(q)}&page=${page + 1}`}
          >
            Next
          </a>
        </div>
      </div>
    </div>
  );
}
