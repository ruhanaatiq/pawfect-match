export const dynamic = "force-dynamic";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-emerald-50/40">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#4C3D3D]">Admin Dashboard</h1>
          <nav className="flex items-center gap-4 text-sm">
            <a href="/admin" className="hover:underline">Overview</a>
            <a href="/admin/requests" className="hover:underline">Adoption Requests</a>
            {/* add more: /admin/pets, /admin/users */}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
