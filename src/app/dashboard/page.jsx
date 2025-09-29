"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="mb-4 text-lg">You must be logged in to view this page.</p>
        <Link
          href="/login"
          className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  const user = session.user;

  return (
    <div className="min-h-screen bg-gray-50">
     

      {/* Content */}
      <main className="max-w-5xl mx-auto mt-10 bg-white rounded-lg shadow p-6 space-y-8">
        {/* Profile */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Profile</h2>
          <div className="flex items-center space-x-4">
            <img
              src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}`}
              alt="Profile"
              className="w-20 h-20 rounded-full border"
            />
            <div>
              <p><span className="font-medium">Name:</span> {user.name || "N/A"}</p>
              <p><span className="font-medium">Email:</span> {user.email}</p>
            </div>
          </div>
        </section>

        {/* Applications */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">My Adoption Applications</h2>
          <div className="p-4 border rounded-lg text-gray-600">
            <p>No applications yet.</p>
          </div>
        </section>

        {/* Favorites */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">My Favorites</h2>
          <div className="p-4 border rounded-lg text-gray-600">
            <p>No favorite pets yet.</p>
          </div>
        </section>

        {/* Settings */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Settings</h2>
          <div className="space-y-2">
            <Link href="/update-profile" className="block text-emerald-600 hover:underline">
              Update Profile
            </Link>
            <Link href="/change-password" className="block text-emerald-600 hover:underline">
              Change Password
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
