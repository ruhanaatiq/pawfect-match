// src/app/dashboard/shelter/layout.jsx
export const dynamic = "force-dynamic";
export default function ShelterLayout({ children }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-[260px_1fr]">
      <aside className="border-r bg-white">
        <div className="px-5 py-4 font-bold text-[#4C3D3D]">Shelter</div>
        <nav className="menu p-2">
          <a className="menu-item" href="/dashboard/shelter">Overview</a>
          <a className="menu-item" href="/dashboard/shelter/pets">Pets</a>
          <a className="menu-item" href="/dashboard/shelter/requests">Requests</a>
          <a className="menu-item" href="/dashboard/shelter/messages">Messages</a>
          <a className="menu-item" href="/dashboard/shelter/appointments">Appointments</a>
          <a className="menu-item" href="/dashboard/shelter/reviews">Reviews</a>
          <a className="menu-item" href="/dashboard/shelter/reports">Reports</a>
          <a className="menu-item" href="/dashboard/shelter/settings">Settings</a>
        </nav>
      </aside>
      <main className="bg-emerald-50/40">{children}</main>
    </div>
  );
}
