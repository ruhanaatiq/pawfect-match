"use client";

import MyBookings from "@/components/MyBookings";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useSearchParams,  } from "next/navigation";

import { useState ,useEffect} from "react";
import {
  FaHeart,
  FaCalendarCheck,
  FaPaw,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaCalendarAlt,
} from "react-icons/fa";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  //const [activeTab, setActiveTab] = useState("applications");
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "applications";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl) setActiveTab(tabFromUrl);
  }, [searchParams]);

  if (status === "loading") {
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

  return (
    <div className="flex h-screen w-screen bg-[url('/paws-bg.png')] bg-repeat bg-emerald-50/60 overflow-hidden">
      <aside
        className={`md:flex top-16 left-0 h-[calc(100%-4rem)] w-56 lg:w-60 bg-white shadow-lg p-6  flex-col transform transition-transform duration-300 ease-in-out z-40
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Profile Button */}
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center w-full px-2 py-2 rounded-lg text-left transition ${
            activeTab === "profile"
              ? "bg-emerald-600 text-white"
              : "text-gray-700 hover:bg-emerald-100"
          }`}
        >
          <img
            src={
              user.image ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user.name || "User"
              )}`
            }
            alt="Profile"
            className="w-5 h-5 rounded-full mr-2"
          />
          Profile
        </button>

        {/* Menu */}
        <nav className="space-y-2 flex-1 mt-4">
          <button
            onClick={() => setActiveTab("applications")}
            className={`flex items-center w-full px-3 py-2 rounded-lg text-left transition ${
              activeTab === "applications"
                ? "bg-emerald-600 text-white"
                : "text-gray-700 hover:bg-emerald-100"
            }`}
          >
            <FaPaw className="mr-2" /> Applications
          </button>

          <button
            onClick={() => setActiveTab("favorites")}
            className={`flex items-center w-full px-3 py-2 rounded-lg text-left transition ${
              activeTab === "favorites"
                ? "bg-emerald-600 text-white"
                : "text-gray-700 hover:bg-emerald-100"
            }`}
          >
            <FaHeart className="mr-2" /> Favorites
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center w-full px-3 py-2 rounded-lg text-left transition ${
              activeTab === "settings"
                ? "bg-emerald-600 text-white"
                : "text-gray-700 hover:bg-emerald-100"
            }`}
          >
            <FaCog className="mr-2" /> Settings
          </button>
          <button
            onClick={() => setActiveTab("my-bookings")}
            className={`flex items-center w-full px-3 py-2 rounded-lg text-left transition ${
              activeTab === "my-bookings"
                ? "bg-emerald-600 text-white"
                : "text-gray-700 hover:bg-emerald-100"
            }`}
          >
            <FaCalendarCheck className="mr-2" /> My Bookings
          </button>
        </nav>

        {/* Logout */}
        <button
          onClick={() => signOut()}
          className="flex items-center w-full px-3 py-2 rounded-lg text-left text-red-600 hover:bg-red-100 mt-4"
        >
          <FaSignOutAlt className="mr-2" /> Logout
        </button>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 md:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-2 md:p-8 overflow-y-auto">
        {/* Hamburger */}
        <div
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden fixed top-18 left-7 flex flex-col gap-[6px] cursor-pointer z-50"
        >
          <span
            className={`w-5 h-0.5  bg-[#4C3D3D] transition-transform duration-300 ${
              sidebarOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`w-5 h-0.5   bg-yellow-500 dark:bg-yellow-40 transition-opacity duration-300 ${
              sidebarOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`w-5 h-0.5 0  bg-[#4C3D3D] transition-transform duration-300 ${
              sidebarOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </div>

        <div className="flex flex-col space-y-6 max-w-7xl mx-auto w-full">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <section>
              <div className="p-6 max-w-md mx-auto  text-center">
                <img
                  src={
                    user.image ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user.name || "User"
                    )}`
                  }
                  alt="Profile"
                  className="w-20 h-20 rounded-full border-2 border-emerald-200 mx-auto mb-4"
                />
                <h2 className="text-2xl font-bold text-[#4C3D3D]">
                  Welcome back, {user.name || "User"}!
                </h2>

                <p className="text-gray-600 mt-2">
                  Here’s your dashboard. Track applications, favorites, and
                  update settings.
                </p>
              </div>
            </section>
          )}

          {/* Applications */}
          {activeTab === "applications" && (
            <section>
              <h3 className="text-xl font-semibold mb-4">
                My Adoption Applications
              </h3>
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-white/60 to-rose-50/50 backdrop-blur shadow-xl text-gray-600">
                <p>No applications yet 🐶🐱</p>
              </div>
            </section>
          )}

          {/* Favorites */}
          {activeTab === "favorites" && (
            <section>
              <h3 className="text-xl font-semibold mb-4">My Favorites</h3>
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-white/60 to-rose-50/50 backdrop-blur shadow-xl text-gray-600">
                <p>No favorite pets yet 💚</p>
              </div>
            </section>
          )}

          {/* Settings */}
          {activeTab === "settings" && (
            <section>
              <h3 className="text-xl font-semibold mb-4">Settings</h3>
              <div className="space-y-3 p-6 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-white/60 to-rose-50/50 backdrop-blur shadow-xl">
                <Link
                  href="/update-profile"
                  className="block text-emerald-600 hover:underline"
                >
                  Update Profile
                </Link>
                <Link
                  href="/change-password"
                  className="block text-emerald-600 hover:underline"
                >
                  Change Password
                </Link>
              </div>
            </section>
          )}
          {/* My Bookings */}
          {activeTab === "my-bookings" && (
            <section>
              <h3 className="text-xl font-semibold mb-4">My Bookings</h3>
              <MyBookings />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
