"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  FaHeart,
  FaPaw,
  FaCog,
  FaSignOutAlt,
  FaUser,
  FaBars,
  FaDownload,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MyBookings from "@/components/MyBookings";
import { useSearchParams } from "next/navigation";

// --- Helpers ---
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
  const d = points
    .map((v, i) => `${i ? "L" : "M"} ${i * dx} ${ny(v)}`)
    .join(" ");
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full h-24"
      role="img"
      aria-label="7-day applications sparkline"
    >
      <path
        d={d}
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        className="text-emerald-500"
        strokeLinecap="round"
      />
      {points.map((v, i) => (
        <circle key={i} cx={i * dx} cy={ny(v)} r="2.5" className="fill-emerald-500" />
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

// --- Dashboard ---
export default function DashboardPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [applications, setApplications] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
const [selectedApp, setSelectedApp] = useState(null);

  const userEmail = session?.user?.email;

  // Sync tab from URL
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl) setActiveTab(tabFromUrl);
  }, [searchParams]);

  // Fetch applications
  useEffect(() => {
    if (!userEmail) return;
    async function fetchApplications() {
      try {
        const res = await fetch(`/api/adoptions?email=${userEmail}`);
        if (!res.ok) throw new Error("Failed to fetch applications");
        const data = await res.json();
        setApplications(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchApplications();
  }, [userEmail]);

  // Fetch favorites
  useEffect(() => {
    if (!userEmail || activeTab !== "favorites") return;
    async function fetchFavorites() {
      try {
        const res = await fetch(`/api/favorites?email=${userEmail}`);
        if (!res.ok) throw new Error("Failed to fetch favorites");
        const data = await res.json();
        setFavorites(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchFavorites();
  }, [activeTab, userEmail]);

  // open modal
const handleCancelClick = (app) => {
  setSelectedApp(app);
  setShowCancelModal(true);
};


// confirm cancel
const confirmCancel = async () => {
  if (!selectedApp) return;
  try {
    const res = await fetch(`/api/adoptions/${selectedApp._id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to cancel application");
    toast.success("Application cancelled successfully!");
    // remove from state
    setApplications((prev) => prev.filter((a) => a._id !== selectedApp._id));
  } catch (err) {
    console.error(err);
    toast.error("Error cancelling application.");
  } finally {
    setShowCancelModal(false);
    setSelectedApp(null);
  }
};

  

  // CSV download
  const downloadApplications = () => {
    if (!applications.length) return toast.info("No applications to download.");
    const headers = ["Pet Name", "Status", "City", "Phone", "Date"];
    const rows = applications.map((app) => [
      app.petName,
      app.status,
      app.applicant?.city || "N/A",
      app.applicant?.phone || "N/A",
      new Date(app.createdAt).toLocaleDateString(),
    ]);
    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my_applications.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Download started!");
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-emerald-50 to-white">
        <p className="mb-4 text-lg text-gray-700">
          You must be logged in to view this page.
        </p>
        <Link
          href="/login"
          className="px-5 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  const user = session.user;
  const totalApps = applications.length;
  const pendingApps = applications.filter((a) => a.status?.toLowerCase() === "pending").length;
  const approvedApps = applications.filter((a) => a.status?.toLowerCase() === "approved").length;

  // Weekly trend
  const keys = dayKeys(7);
  const map = new Map();
  applications.forEach((app) => {
    const date = new Date(app.createdAt).toISOString().slice(0, 10);
    map.set(date, (map.get(date) || 0) + 1);
  });
  const weekly = keys.map((k) => map.get(k) ?? 0);

  return (
    <div className="flex min-h-screen bg-repeat relative">
      {/* Hamburger (mobile) */} <div className="md:hidden fixed top-18 left-1 z-50"> 
        <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-md bg-white shadow-md text-emerald-600 hover:text-emerald-700" >
           <FaBars className="text-2xl" /> </button> </div>

           {/* Sidebar Overlay (mobile only) */} {sidebarOpen && ( <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden" onClick={() => setSidebarOpen(false)} ></div> )}
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-white shadow-xl p-6 z-50 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:relative md:z-auto`}
      >
        <div className="flex justify-between items-center mb-6 md:hidden">
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
          >
            &times;
          </button>
        </div>

        <nav className="flex flex-col space-y-2">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center px-4 py-2 rounded-lg transition ${
              activeTab === "profile"
                ? "bg-emerald-600 text-white"
                : "text-gray-700 hover:bg-emerald-100"
            }`}
          >
            <FaUser className="mr-2" /> Profile
          </button>

          <button
            onClick={() => setActiveTab("applications")}
            className={`flex items-center px-4 py-2 rounded-lg transition ${
              activeTab === "applications"
                ? "bg-emerald-600 text-white"
                : "text-gray-700 hover:bg-emerald-100"
            }`}
          >
            <FaPaw className="mr-2" /> Applications
          </button>

          <button
            onClick={() => setActiveTab("vet-appointments")}
            className={`flex items-center px-4 py-2 rounded-lg transition ${
              activeTab === "vet-appointments"
                ? "bg-emerald-600 text-white"
                : "text-gray-700 hover:bg-emerald-100"
            }`}
          >
            <FaUser className="mr-2" /> Vet Appointments
          </button>

          <button
            onClick={() => setActiveTab("favorites")}
            className={`flex items-center px-4 py-2 rounded-lg transition ${
              activeTab === "favorites"
                ? "bg-emerald-600 text-white"
                : "text-gray-700 hover:bg-emerald-100"
            }`}
          >
            <FaHeart className="mr-2" /> Favorites
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center px-4 py-2 rounded-lg transition ${
              activeTab === "settings"
                ? "bg-emerald-600 text-white"
                : "text-gray-700 hover:bg-emerald-100"
            }`}
          >
            <FaCog className="mr-2" /> Settings
          </button>

          <button
            onClick={() => signOut()}
            className="flex items-center px-4 py-2 text-red-600 hover:bg-red-100 rounded-lg transition mt-4"
          >
            <FaSignOutAlt className="mr-2" /> Logout
          </button>
        </nav>
      </aside>

      {/* Main content */}
      
      <div className="flex-1 p-8 md:p-8 overflow-y-auto">
        {/* Profile */}
        {activeTab === "profile" && (
          <div>
            <div className="mb-6 p-6 rounded-2xl bg-white/90 shadow-sm ring-1 ring-black/5 text-center">
              <img
                src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}`}
                alt="Profile"
                className="w-20 h-20 rounded-full border-2 border-emerald-200 mx-auto mb-4"
              />
              <h2 className="text-2xl font-bold text-[#4C3D3D]">
                Welcome back, {user.name || "User"}!
              </h2>
              <p className="text-gray-600 mt-2">
                Here’s a quick look at your adoption activity.
              </p>
              <p className="text-sm text-gray-500 mt-1">Email: {user.email}</p>
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
          </div>
        )}

        {/* Applications */}
        {activeTab === "applications" && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">My Applications</h3>
              <button
                onClick={downloadApplications}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                <FaDownload /> Download CSV
              </button>
            </div>

            {applications.length === 0 ? (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-white/60 to-rose-50/50 backdrop-blur shadow-xl text-gray-600">
                No applications yet 🐶🐱
              </div>
            ) : (
              <ul className="space-y-3">
                {applications.map((app) => (
                  <li
                    key={app._id}
                    className="p-4 bg-white rounded-xl shadow flex flex-col md:flex-row md:justify-between md:items-center"
                  >
                    <div className="flex-1 space-y-1">
                      <p className="font-semibold text-lg text-[#4C3D3D]">{app.petName || "Unknown Pet"}</p>
                      <p className="text-sm text-gray-600">Status: <span className="font-medium">{app.status}</span></p>
                      <p className="text-sm text-gray-600">City: {app.applicant?.city || "N/A"}</p>
                      <p className="text-sm text-gray-600">Phone: {app.applicant?.phone || "N/A"}</p>

                      <div className="mt-2 w-full bg-gray-200 h-2 rounded-full">
                        <div
                          className={`h-2 rounded-full ${
                            app.status?.toLowerCase() === "pending"
                              ? "bg-yellow-400"
                              : app.status?.toLowerCase() === "approved"
                              ? "bg-green-500"
                              : "bg-gray-400"
                          }`}
                          style={{
                            width:
                              app.status?.toLowerCase() === "pending"
                                ? "50%"
                                : app.status?.toLowerCase() === "approved"
                                ? "100%"
                                : "0%",
                          }}
                        ></div>
                      </div>
                      <div className="mt-3">
  <button
    onClick={() => handleCancelClick(app)}
    className="px-3 py-1.5 text-sm rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition"
  >
    Cancel Application
  </button>
</div>

                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* Vet Appointments */}
        {activeTab === "vet-appointments" && <MyBookings />}

        {/* Favorites */}
        {activeTab === "favorites" && (
          <section>
            <h3 className="text-xl font-semibold mb-4">My Favorites</h3>
            {favorites.length === 0 ? (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-white/60 to-rose-50/50 backdrop-blur shadow-xl text-gray-600">
                No favorite pets yet 💚
              </div>
            ) : (
              <ul className="space-y-4">
                {favorites.map((fav) => (
                  <li
                    key={fav._id}
                    className="p-4 bg-white rounded-xl shadow flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold text-lg text-[#4C3D3D]">{fav.pet?.name || "Unknown Pet"}</p>
                      <p className="text-sm text-gray-600">Type: {fav.pet?.type || "N/A"}</p>
                      <p className="text-sm text-gray-600">Age: {fav.pet?.age || "N/A"}</p>
                    </div>
                    <button
                      onClick={() => toast.info("Remove logic in API")}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaHeart />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* Settings */}
        {activeTab === "settings" && (
          <section>
            <h3 className="text-xl font-semibold mb-4">Settings</h3>
            <div className="space-y-3 p-6 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-white/60 to-rose-50/50 backdrop-blur shadow-xl">
              <Link href="/update-profile" className="block text-emerald-600 hover:underline">
                Update Profile
              </Link>
              <Link href="/change-password" className="block text-emerald-600 hover:underline">
                Change Password
              </Link>
            </div>
          </section>
        )}
      </div>

      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      {showCancelModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
    <div className="bg-white rounded-2xl p-6 shadow-xl w-80 text-center">
      <h3 className="text-lg font-semibold mb-2 text-gray-800">Cancel Application?</h3>
      <p className="text-sm text-gray-600 mb-4">
        Are you sure you want to cancel your adoption for{" "}
        <span className="font-medium">{selectedApp?.petName}</span>?
      </p>
      <div className="flex justify-center gap-3">
        <button
          onClick={confirmCancel}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Yes, Cancel
        </button>
        <button
          onClick={() => setShowCancelModal(false)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          No, Keep
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
