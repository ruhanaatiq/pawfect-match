// src/app/dashboard/DashboardClient.jsx
"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import MyBookings from "@/components/MyBookings";
import {
  FaHeart, FaPaw, FaCog, FaSignOutAlt, FaUser, FaBars, FaCalendarCheck,
} from "react-icons/fa";

/* ---------- helpers ---------- */
function dayKeys(n = 7) {
  const out = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const t = new Date(d);
    t.setHours(0, 0, 0, 0);
    t.setDate(t.getDate() - i);
    out.push(t.toISOString().slice(0, 10));
  }
  return out;
}

function Sparkline({ points = [] }) {
  if (!points.length) return <div className="h-24" aria-hidden="true" />;
  const w = 260;
  const h = 80;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const dx = w / Math.max(points.length - 1, 1);
  const ny = (v) => (max === min ? h / 2 : h - ((v - min) / (max - min)) * h);
  const d = points.map((v, i) => `${i ? "L" : "M"} ${i * dx} ${ny(v)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-24" role="img" aria-label="7-day applications sparkline">
      <path d={d} stroke="currentColor" strokeWidth="2.5" fill="none" className="text-emerald-500" strokeLinecap="round" />
      {points.map((v, i) => <circle key={i} cx={i * dx} cy={ny(v)} r="2.5" className="fill-emerald-500" />)}
    </svg>
  );
}

function StatCard({ label, value, delta, icon }) {
  return (
    <div className="rounded-2xl bg-white/90 shadow-sm ring-1 ring-black/5 p-4 flex items-start gap-4">
      <div className="shrink-0 rounded-xl bg-emerald-50 p-3" aria-hidden="true">{icon}</div>
      <div className="flex-1">
        <div className="text-sm text-gray-500">{label}</div>
        <div className="mt-1 text-2xl font-semibold text-gray-900">{value}</div>
        {delta ? <div className="mt-0.5 text-xs text-emerald-600">{delta}</div> : null}
      </div>
    </div>
  );
}

/* ---------- client component ---------- */
export default function DashboardClient({ initialTab = "applications" }) {
  const { data: session, status } = useSession();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [applications, setApplications] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userEmail = session?.user?.email;

  /* fetch applications */
  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!userEmail) return setLoading(false);
      try {
        const res = await fetch(`/api/adoptions?email=${encodeURIComponent(userEmail)}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch applications");
        const data = await res.json();
        if (!cancelled) setApplications(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [userEmail]);

  /* fetch favorites only when tab opened */
  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (activeTab !== "favorites" || !userEmail) return;
      try {
        const res = await fetch(`/api/favorites?email=${encodeURIComponent(userEmail)}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch favorites");
        const data = await res.json();
        if (!cancelled) setFavorites(data || []);
      } catch (e) {
        console.error(e);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [activeTab, userEmail]);

  async function removeFavorite(favId) {
    try {
      const res = await fetch(`/api/favorites/${favId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove favorite");
      setFavorites((prev) => prev.filter((f) => f._id !== favId));
      toast.success("Removed from favorites");
    } catch (e) {
      console.error(e);
      toast.error("Failed to remove favorite");
    }
  }

  async function confirmCancel() {
    if (!selectedApp) return;
    try {
      const res = await fetch(`/api/adoptions/${selectedApp}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to cancel application");
      setApplications((prev) => prev.filter((a) => a._id !== selectedApp));
      toast.success("Application canceled successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to cancel application.");
    } finally {
      setModalOpen(false);
      setSelectedApp(null);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-emerald-50 to-white">
        <p className="mb-4 text-lg text-gray-700">You must be logged in to view this page.</p>
        <Link href="/login" className="px-5 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow">
          Go to Login
        </Link>
      </div>
    );
  }

  const user = session.user;

  /* stats */
  const totalApps = applications.length;
  const pendingApps = applications.filter((a) => a.status?.toLowerCase() === "pending").length;
  const approvedApps = applications.filter((a) => a.status?.toLowerCase() === "approved").length;

  const keys = dayKeys(7);
  const map = new Map();
  applications.forEach((app) => {
    const date = new Date(app.createdAt).toISOString().slice(0, 10);
    map.set(date, (map.get(date) || 0) + 1);
  });
  const weekly = keys.map((k) => map.get(k) ?? 0);

  return (
    <div className="flex min-h-screen bg-[url('/paws-bg.png')] bg-repeat bg-emerald-50/50">
      {/* mobile hamburger */}
      <button
        onClick={() => setSidebarOpen((v) => !v)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow"
        aria-label="Toggle menu"
      >
        <FaBars className="text-emerald-600" />
      </button>

      {/* sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-60 bg-white shadow-lg p-6 transform transition-transform duration-300 z-40
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 md:flex md:flex-col`}
      >
        {/* close on mobile */}
        <div className="flex justify-end md:hidden mb-4">
          <button onClick={() => setSidebarOpen(false)} className="text-gray-500 hover:text-gray-700 text-2xl font-bold" aria-label="Close menu">
            &times;
          </button>
        </div>

        <button onClick={() => { setActiveTab("profile"); setSidebarOpen(false); }}
          className={`flex items-center px-3 py-2 rounded-lg mb-3 ${activeTab === "profile" ? "bg-emerald-600 text-white" : "text-gray-700 hover:bg-emerald-100"}`}>
          <FaUser className="mr-2" /> Profile
        </button>

        <button onClick={() => { setActiveTab("applications"); setSidebarOpen(false); }}
          className={`flex items-center px-3 py-2 rounded-lg mb-3 ${activeTab === "applications" ? "bg-emerald-600 text-white" : "text-gray-700 hover:bg-emerald-100"}`}>
          <FaPaw className="mr-2" /> Applications
        </button>

        <button onClick={() => { setActiveTab("favorites"); setSidebarOpen(false); }}
          className={`flex items-center px-3 py-2 rounded-lg mb-3 ${activeTab === "favorites" ? "bg-emerald-600 text-white" : "text-gray-700 hover:bg-emerald-100"}`}>
          <FaHeart className="mr-2" /> Favorites
        </button>

        <button onClick={() => { setActiveTab("my-bookings"); setSidebarOpen(false); }}
          className={`flex items-center px-3 py-2 rounded-lg mb-3 ${activeTab === "my-bookings" ? "bg-emerald-600 text-white" : "text-gray-700 hover:bg-emerald-100"}`}>
          <FaCalendarCheck className="mr-2" /> My Bookings
        </button>

        <button onClick={() => { setActiveTab("settings"); setSidebarOpen(false); }}
          className={`flex items-center px-3 py-2 rounded-lg mt-auto ${activeTab === "settings" ? "bg-emerald-600 text-white" : "text-gray-700 hover:bg-emerald-100"}`}>
          <FaCog className="mr-2" /> Settings
        </button>

        <button onClick={() => signOut()} className="flex items-center px-3 py-2 rounded-lg mt-4 text-red-600 hover:bg-red-100">
          <FaSignOutAlt className="mr-2" /> Logout
        </button>
      </aside>

      {/* overlay for mobile */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* main content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <>
            <div className="mb-6 p-6 rounded-2xl bg-white/90 shadow-sm ring-1 ring-black/5">
              <h2 className="text-xl font-semibold text-gray-800">Welcome back, {user.name} 👋</h2>
              <p className="text-gray-600 mt-1">Here’s a quick look at your adoption activity.</p>
              <p className="text-sm text-gray-500 mt-2">Email: {user.email}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
              <StatCard label="Total Applications" value={totalApps} icon={<FaPaw className="text-emerald-600" />} />
              <StatCard label="Pending" value={pendingApps} icon={<FaPaw className="text-emerald-600" />} />
              <StatCard label="Approved" value={approvedApps} icon={<FaPaw className="text-emerald-600" />} />
              <StatCard label="Favorites" value={favorites.length} icon={<FaHeart className="text-emerald-600" />} />
            </div>

            <div className="rounded-2xl bg-white/90 shadow-sm ring-1 ring-black/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Weekly Applications</div>
                  <div className="text-lg font-semibold text-gray-900">Last 7 days</div>
                </div>
              </div>
              <div className="mt-2">
                <Sparkline points={weekly} />
              </div>
            </div>
          </>
        )}

        {/* APPLICATIONS TAB */}
        {activeTab === "applications" && (
          <section>
            <h3 className="text-xl font-semibold mb-4">My Adoption Applications</h3>
            {applications.length === 0 ? (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-white/60 to-rose-50/50 backdrop-blur shadow-xl text-gray-600">
                <p>No applications yet 🐶🐱</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {applications.map((app) => (
                  <li key={app._id} className="p-4 bg-white rounded-xl shadow flex flex-col md:flex-row md:justify-between md:items-center w-full">
                    <div className="flex-1 space-y-1">
                      <p className="font-semibold text-lg text-[#4C3D3D]">{app.petName || "Unknown Pet"}</p>
                      <p className="text-sm text-gray-600">Status: <span className="font-medium">{app.status}</span></p>
                      <p className="text-sm text-gray-600">City: {app.applicant?.city || "N/A"}</p>
                      <p className="text-sm text-gray-600">Phone: {app.applicant?.phone || "N/A"}</p>
                    </div>
                    {app.status?.toLowerCase() === "pending" && (
                      <button
                        onClick={() => { setSelectedApp(app._id); setModalOpen(true); }}
                        className="mt-3 md:mt-0 md:ml-6 flex-shrink-0 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Cancel
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* FAVORITES TAB */}
        {activeTab === "favorites" && (
          <section>
            <h3 className="text-xl font-semibold mb-4">My Favorites</h3>
            {favorites.length === 0 ? (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-white/60 to-rose-50/50 backdrop-blur shadow-xl text-gray-600">
                <p>No favorite pets yet 💚</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {favorites.map((fav) => (
                  <li key={fav._id} className="p-4 bg-white rounded-xl shadow flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-lg text-[#4C3D3D]">{fav.pet?.name || "Unknown Pet"}</p>
                      <p className="text-sm text-gray-600">Type: {fav.pet?.type || "N/A"}</p>
                      <p className="text-sm text-gray-600">Age: {fav.pet?.age || "N/A"}</p>
                    </div>
                    <button onClick={() => removeFavorite(fav._id)} className="text-red-600 hover:text-red-800" title="Remove from favorites">
                      <FaHeart />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <section>
            <h3 className="text-xl font-semibold mb-4">Settings</h3>
            <div className="space-y-3 p-6 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-white/60 to-rose-50/50 backdrop-blur shadow-xl">
              <Link href="/update-profile" className="block text-emerald-600 hover:underline">Update Profile</Link>
              <Link href="/change-password" className="block text-emerald-600 hover:underline">Change Password</Link>
            </div>
          </section>
        )}

        {/* MY BOOKINGS TAB */}
        {activeTab === "my-bookings" && (
          <section>
            <h3 className="text-xl font-semibold mb-4">My Bookings</h3>
            <MyBookings />
          </section>
        )}
      </main>

      {/* cancel modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/30" />
          <div className="bg-white rounded-xl p-6 w-80 relative z-10">
            <h3 className="text-lg font-semibold mb-4">Confirm Cancel</h3>
            <p className="mb-6 text-gray-600">Are you sure you want to cancel this adoption application?</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => { setModalOpen(false); setSelectedApp(null); }} className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400">No</button>
              <button onClick={confirmCancel} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
