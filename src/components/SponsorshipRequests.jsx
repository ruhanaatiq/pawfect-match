"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

export default function SponsorshipRequests() {
  const { data: session } = useSession();
  const userEmail = session?.user?.email;

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchRequests() {
      if (!userEmail) return setLoading(false);

      try {
        const res = await fetch(`/api/sponsor?email=${encodeURIComponent(userEmail)}`);
        if (!res.ok) throw new Error("Failed to fetch sponsorship requests");

        const data = await res.json();
        if (!cancelled) setRequests(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch sponsorship requests");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchRequests();

    return () => { cancelled = true; };
  }, [userEmail]);

  if (loading) {
    return <div className="p-6 text-center">Loading sponsorship requests…</div>;
  }

  if (!requests.length) {
    return <div className="p-6 text-center text-gray-600">No sponsorship requests found.</div>;
  }

  return (
    <div className="space-y-4">
      {requests.map((req) => (
        <div key={req._id} className="p-4 rounded-xl bg-white shadow flex flex-col md:flex-row justify-between items-center">
          <div>
            <p className="font-semibold text-lg">{req.organization || "Unknown Organization"}</p>
            <p className="text-sm text-gray-500">Email: {req.email || "N/A"}</p>
            <p className="text-sm text-gray-500">Status: <span className="font-medium">{req.status}</span></p>
            <p className="text-sm text-gray-500">Applied at: {new Date(req.appliedAt).toLocaleDateString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
