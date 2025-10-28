// src/app/dashboard/DashboardClient.jsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";

import MyBookings from "@/components/MyBookings";
import MyFeedback from "@/components/Feedbacks";
import FeedbackCards from "@/components/FeedbackCard";
import SponsorshipRequests from "@/components/SponsorshipRequests";

import {
  FaHeart,
  FaPaw,
  FaCog,
  FaSignOutAlt,
  FaUser,
  FaBars,
  FaCalendarCheck,
  FaDownload,
  FaComments,
  FaStar,
  FaHandshake,
} from "react-icons/fa";

import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

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

function Sparkline({ points = [], className = "text-emerald-500" }) {
  if (!points.length) return <div className="h-24" aria-hidden="true" />;

  const w = 260;
  const h = 80;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const dx = w / Math.max(points.length - 1, 1);
  const ny = (v) => (max === min ? h / 2 : h - ((v - min) / (max - min)) * h);
  const d = points.map((v, i) => `${i ? "L" : "M"} ${i * dx} ${ny(v)}`).join(" ");

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={`w-full h-24 ${className}`}
      role="img"
      aria-label="7-day applications sparkline"
    >
      <path
        d={d}
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      {points.map((v, i) => (
        <circle
          key={i}
          cx={i * dx}
          cy={ny(v)}
          r="2.5"
          fill="currentColor"
        />
      ))}
    </svg>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="rounded-2xl bg-white/90 shadow-sm ring-1 ring-black/5 p-4 flex items-start gap-4">
      <div className="shrink-0 rounded-xl bg-emerald-50 p-3" aria-hidden="true">
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-sm text-gray-500">{label}</div>
        <div className="mt-1 text-2xl font-semibold text-gray-900">{value}</div>
      </div>
    </div>
  );
}

/* countdown + workshops helpers */
const getCountdown = (dateStr, nowRef = new Date()) => {
  const date = new Date(dateStr);
  const diff = date - nowRef;
  if (Number.isNaN(date.getTime())) return "Date TBA";
  if (diff <= 0) return "Live now!";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

/* ---------- client component ---------- */
export default function DashboardClient({ initialTab = "profile" }) {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [applications, setApplications] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Workshops / calendar enhancements
  const [workshops, setWorkshops] = useState([]);
  const [joinedWorkshops, setJoinedWorkshops] = useState({});
  const [now, setNow] = useState(new Date());

  const userEmail = session?.user?.email;

  /* keep tab in sync with URL (?tab=) */
  useEffect(() => {
    const tabFromUrl = (searchParams.get("tab") || initialTab).toLowerCase();
    setActiveTab(tabFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  /* fetch applications */
  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!userEmail) return setLoading(false);
      try {
        const res = await fetch(`/api/adoptions?email=${encodeURIComponent(userEmail)}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch applications");
        const data = await res.json();
        if (!cancelled) setApplications(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        toast.error("Couldn't load applications.");
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
        if (!cancelled) setFavorites(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        toast.error("Couldn't load favorites.");
      }
    }
    run();
    return () => { cancelled = true; };
  }, [activeTab, userEmail]);

  /* workshops list */
  useEffect(() => {
    let cancelled = false;
    async function fetchWorkshops() {
      try {
        const res = await fetch("/api/workshops", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch workshops");
        const data = await res.json();
        if (!cancelled) setWorkshops(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load workshops");
      }
    }
    fetchWorkshops();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("joinedWorkshops");
      if (stored) setJoinedWorkshops(JSON.parse(stored));
    } catch {}
  }, []);

  // tick "now" every 1s for countdowns (optional)
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const workshopList = useMemo(() => {
    return workshops
      .slice()
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((ws) => ({
        ...ws,
        countdown: getCountdown(ws.date, now),
        joined: !!joinedWorkshops[ws.id],
      }));
  }, [workshops, joinedWorkshops, now]);

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
    if (!selectedApp?._id) return;
    try {
      const res = await fetch(`/api/adoptions/${selectedApp._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to cancel application");
      setApplications((prev) => prev.filter((a) => a._id !== selectedApp._id));
      toast.success("Application canceled successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to cancel application.");
    } finally {
      setModalOpen(false);
      setSelectedApp(null);
    }
  }

  /* CSV download */
  function downloadApplications() {
    if (!applications.length) return toast("No applications to download.");
    const headers = ["Pet Name", "Status", "City", "Phone", "Date"];
    const rows = applications.map((app) => [
      app.petName,
      app.status,
      app.applicant?.city || "N/A",
      app.applicant?.phone || "N/A",
      app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "",
    ]);
    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my_applications.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Download started");
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
    const t = app?.createdAt ? new Date(app.createdAt) : null;
    if (t && !Number.isNaN(t.getTime())) {
      const date = t.toISOString().slice(0, 10);
      map.set(date, (map.get(date) || 0) + 1);
    }
  });
  const weekly = keys.map((k) => map.get(k) ?? 0);
  const trendColor = weekly[weekly.length - 1] >= weekly[0] ? "text-emerald-500" : "text-red-500";

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
        className={`fixed inset-y-0 left-0 w-60 p-6 transform transition-transform duration-300 z-40
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        md:relative md:translate-x-0 md:flex md:flex-col
        bg-white/30 backdrop-blur-lg bg-gradient-to-b from-emerald-200/20 via-white/10 to-emerald-300/20
        border-r border-white/20 shadow-lg`}
      >
        {/* close on mobile */}
        <div className="flex justify-end md:hidden mb-4">
          <button onClick={() => setSidebarOpen(false)} className="text-gray-500 hover:text-gray-700 text-2xl font-bold" aria-label="Close menu">
            &times;
          </button>
        </div>

        {[
          { tab: "profile", icon: <FaUser className="mr-2" />, label: "Profile" },
          { tab: "applications", icon: <FaPaw className="mr-2" />, label: "Applications" },
          { tab: "favorites", icon: <FaHeart className="mr-2" />, label: "Favorites" },
          { tab: "my-bookings", icon: <FaCalendarCheck className="mr-2" />, label: "My Bookings" },
          { tab: "my-feedback", icon: <FaComments className="mr-2" />, label: "My Feedback" },
          { tab: "users-reviews", icon: <FaStar className="mr-2" />, label: "Reviews" },
          { tab: "sponsorships", icon: <FaHandshake className="mr-2" />, label: "Sponsorship" },
          { tab: "settings", icon: <FaCog className="mr-2" />, label: "Settings" },
        ].map((btn) => (
          <button
            key={btn.tab}
            onClick={() => { setActiveTab(btn.tab); setSidebarOpen(false); }}
            className={`flex items-center px-3 py-2 rounded-2xl mb-3 ${
              activeTab === btn.tab ? "bg-emerald-600 text-white" : "text-gray-700 hover:bg-emerald-100"
            }`}
          >
            {btn.icon} {btn.label}
          </button>
        ))}

        <button onClick={() => signOut()} className="flex items-center px-3 py-0 rounded-lg mt-4 text-red-600 hover:bg-red-100">
          <FaSignOutAlt className="mr-2" /> Logout
        </button>

        <div className="mt-auto flex justify-center relative">
          <img src="welcomedog.png" alt="Cute Dog Hug" className="w-60 h-85 rounded-2xl relative z-10" />
          <div className="absolute inset-0 rounded-2xl pointer-events-none" />
        </div>
      </aside>

      {/* overlay for mobile */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* main content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* left: profile + stats + sparkline */}
            <div className="flex-1 space-y-6">
              <div className="mb-6 p-6 rounded-3xl bg-gradient-to-br from-amber-100 via-pink-100 to-rose-100 shadow-lg ring-1 ring-rose-200 text-center relative overflow-hidden">
                <div className="absolute -top-4 -left-4 text-amber-300 text-5xl opacity-30 rotate-12">🐾</div>
                <div className="absolute bottom-0 right-0 text-rose-300 text-6xl opacity-30 -rotate-12">🐾</div>

                <div className="relative inline-block">
                  <img
                    src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=FBCFE8&color=4C3D3D`}
                    alt="Profile"
                    className="w-24 h-24 rounded-full border-4 border-pink-200 shadow-md mx-auto mb-3"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow">🐕</div>
                </div>

                <h2 className="text-2xl font-bold text-[#4C3D3D] mt-2">
                  Welcome back, {user.name || "User"}!
                </h2>
                <p className="text-gray-700 mt-1">Here’s a quick look at your adoption activity.</p>
                <p className="text-sm text-gray-500 mt-2">✉️ Email: {user.email}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
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
                  <Sparkline points={weekly} className={trendColor} />
                </div>
              </div>
            </div>

            {/* right: calendar + workshops */}
            <div className="lg:w-72 flex flex-col gap-4">
              <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 border border-emerald-100">
                <h4 className="text-center font-semibold mb-2 text-[#4C3D3D]">Your Calendar</h4>
                <Calendar
                  className="rounded-xl text-sm border-0 w-full"
                  tileClassName={({ date }) => {
                    const day = date.getDate();
                    if (day % 5 === 0) return "bg-orange-100 text-orange-700 rounded-md";
                    if (day % 3 === 0) return "bg-yellow-100 text-yellow-700 rounded-md";
                    if (day % 2 === 0) return "bg-green-100 text-green-700 rounded-md";
                    return "";
                  }}
                />
              </div>

              <div className="rounded-2xl bg-amber-100 shadow-sm ring-1 ring-black/5 p-4 border border-emerald-100 h-50 overflow-y-auto">
                <h4 className="text-center font-semibold mb-2 text-amber-900">Upcoming Workshops</h4>
                {workshopList.map((ws) => (
                  <div
                    key={ws.id}
                    className="relative bg-cover bg-center rounded-xl shadow overflow-hidden h-28 mb-3"
                    style={{ backgroundImage: `url(${ws.bgImage})` }}
                  >
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="relative z-10 p-3 flex flex-col justify-between h-full text-white">
                      <div>
                        <h5 className="font-semibold">{ws.title}</h5>
                        <p className="text-xs">
                          {new Date(ws.date).toLocaleDateString()} | {new Date(ws.date).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-yellow-300 text-xs font-medium">{ws.countdown}</span>
                        <button
                          onClick={() => router.push(`/workshops/${ws.id}`)}
                          className="px-2 py-1 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700"
                        >
                          Join
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* APPLICATIONS TAB */}
        {activeTab === "applications" && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">My Adoption Applications</h3>
              <button
                onClick={downloadApplications}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                <FaDownload /> Download CSV
              </button>
            </div>

            {applications.length === 0 ? (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-white/60 to-rose-50/50 backdrop-blur shadow-xl text-gray-600">
                <p>No applications yet 🐶🐱</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {applications.map((app) => {
                  const status = app.status?.toLowerCase();
                  const width =
                    status === "approved" ? "100%" :
                    status === "pending" ? "50%" : "0%";
                  const bar =
                    status === "approved" ? "bg-green-500" :
                    status === "pending" ? "bg-yellow-400" : "bg-gray-400";
                  return (
                    <li key={app._id} className="p-4 bg-white rounded-xl shadow flex flex-col md:flex-row md:justify-between md:items-center w-full">
                      <div className="flex-1 space-y-1">
                        <p className="font-semibold text-lg text-[#4C3D3D]">{app.petName || "Unknown Pet"}</p>
                        <p className="text-sm text-gray-600">Status: <span className="font-medium">{app.status}</span></p>
                        <p className="text-sm text-gray-600">City: {app.applicant?.city || "N/A"}</p>
                        <p className="text-sm text-gray-600">Phone: {app.applicant?.phone || "N/A"}</p>

                        <div className="mt-2 w-full bg-gray-200 h-2 rounded-full">
                          <div className={`h-2 rounded-full ${bar}`} style={{ width }} />
                        </div>
                      </div>

                      {status === "pending" && (
                        <button
                          onClick={() => { setSelectedApp(app); setModalOpen(true); }}
                          className="mt-3 md:mt-0 md:ml-6 flex-shrink-0 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          Cancel
                        </button>
                      )}
                    </li>
                  );
                })}
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

        {/* MY BOOKINGS TAB */}
        {activeTab === "my-bookings" && (
          <section>
            <h3 className="text-xl font-semibold mb-4">My Bookings</h3>
            <MyBookings />
          </section>
        )}

        {/* MY FEEDBACK TAB */}
        {activeTab === "my-feedback" && (
          <section>
            <h3 className="text-xl font-semibold mb-4">My Feedback</h3>
            <MyFeedback />
          </section>
        )}

        {/* REVIEWS TAB */}
        {activeTab === "users-reviews" && (
          <section>
            <h3 className="text-xl font-semibold mb-4">All Users Reviews</h3>
            <FeedbackCards limit={null} showHeader={false} grid={2} />
          </section>
        )}

        {/* SPONSORSHIPS TAB */}
        {activeTab === "sponsorships" && (
          <section>
            <h3 className="text-xl font-semibold mb-4">All Sponsorship Requests</h3>
            <SponsorshipRequests userEmail={userEmail} />
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
      </main>

      {/* cancel modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/30" />
          <div className="bg-white rounded-xl p-6 w-80 relative z-10">
            <h3 className="text-lg font-semibold mb-2">Cancel Application?</h3>
            <p className="mb-6 text-gray-600">
              Are you sure you want to cancel your adoption for{" "}
              <span className="font-medium">{selectedApp?.petName || "this pet"}</span>?
            </p>
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
