"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

export default function SponsorshipRequests() {
  const { data: session, status } = useSession();
  const userEmail = session?.user?.email || "";

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

   async function fetchRequests() {
  if (status === "loading") return;

  if (!userEmail) {
    setRequests([]);
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
      const body = await res.text().catch(() => "");
      console.error("GET /api/sponsors failed:", res.status, res.statusText, body);
      throw new Error(`HTTP ${res.status}`);
    }

    const json = await res.json();
    const arr = Array.isArray(json?.data)
      ? json.data
      : Array.isArray(json)
      ? json
      : [];

    setRequests(arr);
  } catch (err) {
    console.error("GET /api/sponsors error:", err);
    toast.error("Failed to fetch sponsorship requests");
    setRequests([]);
  } finally {
    setLoading(false);
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
        const {
          _id,
          companyName = "Unknown Company",
          contactName = "",
          email = "N/A",
          phone = "",
          website = "",
          logoUrl = "",
          message = "",
          status: st = "pending",
          appliedAt,
        } = req || {};

        const applied = appliedAt ? new Date(appliedAt).toLocaleString() : "—";

        return (
          <div
            key={_id || `${companyName}-${applied}`}
            className="p-4 rounded-xl bg-white shadow flex flex-col md:flex-row md:items-center md:justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt={companyName} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center font-semibold">
                  {companyName.slice(0,1)}
                </div>
              )}
              <div>
                <p className="font-semibold text-lg">{companyName}</p>
                <p className="text-sm text-gray-500">Contact: {contactName || "—"}</p>
                <p className="text-sm text-gray-500">Email: {email}{phone ? ` · ${phone}` : ""}</p>
                <p className="text-sm text-gray-500">Website: {website || "—"}</p>
              </div>
            </div>

            <div className="text-sm">
              <p className="text-gray-500">
                Status: <span className="font-medium capitalize">{st}</span>
              </p>
              <p className="text-gray-500">Applied: {applied}</p>
            </div>

            {message ? (
              <p className="text-sm text-gray-700 md:max-w-xl">{message}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
