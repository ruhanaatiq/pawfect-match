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
      className="relative p-6 rounded-3xl bg-gradient-to-br from-white/80 via-emerald-50 to-white shadow-lg flex flex-col md:flex-row items-center gap-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border border-gray-100"
    >
      {/* Status ribbon */}
      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold text-white
        ${req.status === "approved" ? "bg-green-500" :
          req.status === "rejected" ? "bg-red-500" : "bg-yellow-500"}`}>
        {req.status.toUpperCase()}
      </div>

      {/* Logo */}
      <div className="w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden shadow-md border border-gray-200">
        <img
          src={req.logoUrl}
          alt={req.companyName}
          className="w-full h-full object-contain bg-white p-2"
        />
      </div>

      {/* Info */}
      <div className="flex-1 space-y-1">
        <p className="font-bold text-xl text-gray-800">{req.companyName}</p>
        <p className="text-gray-600 text-sm"><span className="font-bold">Contact:</span> {req.contactName}</p>
        <p className="text-gray-600 text-sm"><span className="font-bold">Email:</span> {req.email}</p>
        {req.website && (
          <p className="text-blue-600 text-sm">
            Website :{" "}
            <a href={req.website} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">
              {req.website}
            </a>
          </p>
        )}
        <p className="text-gray-500 text-sm">
         <span className="font-bold"> Applied at:</span> {req.appliedAt ? new Date(req.appliedAt).toLocaleDateString() : "—"}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col md:flex-row gap-3 mt-4 md:mt-0">
        {req.status === "pending" && (
          <>
            <button
              onClick={() => handleApprove(req._id)}
              className="px-6 py-2 bg-gradient-to-r from-green-400 to-green-500 text-white font-semibold rounded-xl shadow hover:from-green-500 hover:to-green-600 transition transform hover:-translate-y-0.5"
            >
              Approve
            </button>
            <button
              onClick={() => handleReject(req._id)}
              className="px-6 py-2 bg-gradient-to-r from-red-400 to-red-500 text-white font-semibold rounded-xl shadow hover:from-red-500 hover:to-red-600 transition transform hover:-translate-y-0.5"
            >
              Reject
            </button>
          </>
        )}
        {req.status === "approved" && (
          <button className="px-6 py-2 bg-green-300 text-white rounded-xl cursor-not-allowed shadow">
            Approved
          </button>
        )}
        {req.status === "rejected" && (
          <button className="px-6 py-2 bg-red-300 text-white rounded-xl cursor-not-allowed shadow">
            Rejected
          </button>
        )}
      </div>
    </div>
  ))}
</div>

  );
}
