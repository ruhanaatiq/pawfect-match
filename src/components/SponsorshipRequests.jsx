"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

export default function SponsorshipRequests() {
  const { data: session, status } = useSession();
  const userEmail = session?.user?.email;

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchRequests() {
      // don't fire until session is resolved
      if (status === "loading") return;

      if (!userEmail) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(
          `/api/sponsors?email=${encodeURIComponent(userEmail)}`,
          { cache: "no-store" }
        );

        if (!res.ok) {
          let body = "";
          try { body = await res.text(); } catch {}
          console.error("GET /api/sponsors failed:", res.status, res.statusText, body);
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        if (!cancelled) setRequests(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          toast.error("Failed to fetch sponsorship requests");
          setRequests([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchRequests();
    return () => { cancelled = true; };
  }, [userEmail, status]);

  if (loading) return <div className="p-6 text-center">Loading sponsorship requests…</div>;
  if (!requests.length) return <div className="p-6 text-center text-gray-600">No sponsorship requests found.</div>;

  return (
    <div className="space-y-4">
      {requests.map((req) => {
        const org = req.org ?? req.organization ?? "Unknown Organization";
        const email = req.userEmail ?? req.email ?? "N/A";
        const applied = req.appliedAt ? new Date(req.appliedAt).toLocaleDateString() : "—";
        const statusText = req.status ?? "pending";

        return (
          <div key={req._id || `${org}-${applied}`} className="p-4 rounded-xl bg-white shadow flex flex-col md:flex-row justify-between items-center">
            <div>
              <p className="font-semibold text-lg">{org}</p>
              <p className="text-sm text-gray-500">Email: {email}</p>
              <p className="text-sm text-gray-500">Status: <span className="font-medium">{statusText}</span></p>
              <p className="text-sm text-gray-500">Applied at: {applied}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
