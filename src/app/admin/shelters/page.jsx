// src/app/admin/shelters/page.jsx
export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { absoluteUrl } from "@/lib/absolute-url";
import { headers } from "next/headers";
import DeleteShelterButton from "./_components/DeleteShelterButton.client"
import { IoSearch, IoAdd, IoMail, IoCall, IoLocationSharp, IoSettingsSharp, IoPersonAdd, IoTrash } from "react-icons/io5";

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border bg-white/80 p-4 text-center shadow-sm">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-gray-900">{value}</div>
    </div>
  );
}

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
    // empty state will render
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const prevHref = `/admin/shelters?${new URLSearchParams({ q, page: String(Math.max(1, page - 1)) })}`;
  const nextHref = `/admin/shelters?${new URLSearchParams({ q, page: String(page + 1) })}`;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#4C3D3D]">Shelters</h1>
          <p className="text-sm text-gray-500">Manage organizations, invite members, and keep contact details up to date.</p>
        </div>
        <a
          href="/admin/shelters/new"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700"
        >
          <IoAdd className="text-lg" /> Add Shelter
        </a>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total" value={total} />
        <Stat label="Per Page" value={pageSize} />
        <Stat label="Page" value={`${page} / ${totalPages}`} />
        <Stat label="Filtered" value={q ? "Yes" : "No"} />
      </div>

      {/* Toolbar */}
      <div className="sticky top-0 z-10 -mx-6 bg-gradient-to-b from-white/80 to-white/40 px-6 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <form className="flex w-full items-center gap-2" action="/admin/shelters" method="get">
          <div className="relative w-full">
            <IoSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by name, city, state…"
              className="w-full rounded-xl border bg-white/90 pl-9 pr-3 py-2 text-sm shadow-sm outline-none ring-emerald-600/20 focus:ring-2"
            />
          </div>
          <button className="rounded-xl border px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-emerald-50">Search</button>
        </form>
      </div>

      {/* Responsive list: cards on mobile, table on desktop */}
      <div className="space-y-4">
        {/* Mobile / Card layout */}
        <div className="grid gap-4 md:hidden">
          {items.length ? (
            items.map((s) => {
              const id = s._id || s.id;
              const loc = s.location || {};
              const city = s.city ?? loc.city;
              const state = s.state ?? loc.state;
              const country = s.country ?? loc.country;
              const place = [city, state, country].filter(Boolean).join(", ") || "—";
              const initials = String(s.name || "S").trim().split(/\s+/).map(w => w[0]).slice(0,2).join("");
              return (
                <div key={id} className="group rounded-2xl border bg-white/80 p-4 shadow-sm ring-1 ring-black/5 transition hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-700 font-semibold">
                        {initials}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{s.name}</div>
                        <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-600">
                          <IoLocationSharp /> <span>{place}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={`/admin/shelters/${id}`} className="rounded-lg border px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50">
                        <IoSettingsSharp className="inline -mt-0.5" /> Edit
                      </a>
                      <a href={`/admin/shelters/${id}?tab=invites`} className="rounded-lg border px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50">
                        <IoPersonAdd className="inline -mt-0.5" /> Invite
                      </a>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-1 text-sm text-gray-700">
                    <div className="flex items-center gap-2"><IoMail /> {s.email || "—"}</div>
                    <div className="flex items-center gap-2"><IoCall /> {s.phone || "—"}</div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    {/* Client button lives here */}
                    {/* @ts-expect-error Server/Client boundary handled by Next */}
                    <DeleteShelterButton id={id}>
                      <span className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50">
                        <IoTrash className="-mt-0.5" /> Delete
                      </span>
                    </DeleteShelterButton>
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyState />
          )}
        </div>

        {/* Desktop / Table layout */}
        <div className="overflow-x-auto rounded-2xl bg-white/90 shadow-sm ring-1 ring-black/5 hidden md:block">
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
                      <td className="px-4 py-3 text-gray-600">{[city, state, country].filter(Boolean).join(", ") || "—"}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {s.email || "—"} {s.phone ? `• ${s.phone}` : ""}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <a href={`/admin/shelters/${id}`} className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-emerald-700 hover:bg-emerald-50">
                          <IoSettingsSharp /> Edit
                        </a>
                        <a href={`/admin/shelters/${id}?tab=invites`} className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-blue-700 hover:bg-blue-50">
                          <IoPersonAdd /> Invite
                        </a>
                        {/* @ts-expect-error Server/Client boundary handled by Next */}
                        <DeleteShelterButton id={id} />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="px-4 py-8 text-center text-gray-500" colSpan={4}>
                    <EmptyState />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* pagination */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          Showing <span className="font-medium text-gray-800">{items.length}</span> of {total}
        </div>
        <div className="flex gap-2">
          <a
            className={`rounded-xl border px-3 py-1.5 ${page <= 1 ? "pointer-events-none opacity-50" : "hover:bg-emerald-50"}`}
            href={prevHref}
          >
            Prev
          </a>
          <a
            className={`rounded-xl border px-3 py-1.5 ${page >= totalPages ? "pointer-events-none opacity-50" : "hover:bg-emerald-50"}`}
            href={nextHref}
          >
            Next
          </a>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto max-w-md rounded-2xl border bg-white/70 p-8 text-center shadow-sm">
      <div className="text-3xl">🐾</div>
      <h3 className="mt-2 text-lg font-semibold text-gray-900">No shelters found</h3>
      <p className="mt-1 text-sm text-gray-600">Try a different search term or add a new shelter.</p>
      <a
        href="/admin/shelters/new"
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700"
      >
        <IoAdd className="text-lg" /> Add Shelter
      </a>
    </div>
  );
}
