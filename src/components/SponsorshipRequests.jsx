"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";

export default function SponsorshipRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchRequests() {
      setLoading(true);
      try {
        const res = await fetch("/api/sponsors", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch");

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
  }, []);

  // Approve request
  async function handleApprove(id) {
    try {
      const res = await fetch(`/api/sponsors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });
      if (!res.ok) throw new Error("Failed to approve request");

      setRequests((prev) =>
        prev.map((req) => (req._id === id ? { ...req, status: "approved" } : req))
      );
      toast.success("Request approved");
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve request");
    }
  }

  // Reject request
  async function handleReject(id) {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to reject this sponsorship request?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, reject it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/sponsors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      });
      if (!res.ok) throw new Error("Failed to reject request");

      setRequests((prev) =>
        prev.map((req) => (req._id === id ? { ...req, status: "rejected" } : req))
      );
      toast.success("Request rejected");
    } catch (err) {
      console.error(err);
      toast.error("Failed to reject request");
    }
  }

  if (loading)
    return <div className="p-6 text-center">Loading sponsorship requests…</div>;
  if (!requests.length)
    return <div className="p-6 text-center text-gray-600">No sponsorship requests found.</div>;

  return (
    <div className="space-y-6">
      {requests.map((req) => (
        <div
          key={req._id}
          className="p-6 rounded-2xl bg-white shadow-lg flex flex-col md:flex-row items-center gap-6 hover:shadow-xl transition-shadow duration-300"
        >
          {/* Logo */}
          <img
            src={req.logoUrl}
            alt={req.companyName}
            className="w-28 h-28 object-contain rounded-lg border border-gray-200"
          />

          {/* Info */}
          <div className="flex-1">
            <p className="font-bold text-xl text-gray-800">{req.companyName}</p>
            <p className="text-gray-600 text-sm mt-1">Contact: {req.contactName}</p>
            <p className="text-gray-600 text-sm">Email: {req.email}</p>
            {req.website && (
              <p className="text-blue-600 text-sm mt-1">
                Website:{" "}
                <a href={req.website} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">
                  {req.website}
                </a>
              </p>
            )}
            <p className="text-sm mt-2">
              Status:{" "}
              <span
                className={`font-medium ${
                  req.status === "approved"
                    ? "text-green-600"
                    : req.status === "rejected"
                    ? "text-red-600"
                    : "text-yellow-600"
                }`}
              >
                {req.status}
              </span>
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Applied at: {req.appliedAt ? new Date(req.appliedAt).toLocaleDateString() : "—"}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col md:flex-row gap-3 mt-4 md:mt-0">
            {req.status === "pending" && (
              <>
                <button
                  onClick={() => handleApprove(req._id)}
                  className="px-5 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(req._id)}
                  className="px-5 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
                >
                  Reject
                </button>
              </>
            )}
            {req.status === "approved" && (
              <button className="px-5 py-2 bg-green-300 text-white rounded-lg cursor-not-allowed">
                Approved
              </button>
            )}
            {req.status === "rejected" && (
              <button className="px-5 py-2 bg-red-300 text-white rounded-lg cursor-not-allowed">
                Rejected
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
