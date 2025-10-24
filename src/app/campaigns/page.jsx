// src/app/campaigns/page.jsx
"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import EditCampaignModal from "./EditCampaignModal"; // we'll add this below

export default function CampaignsPage() {
  const { data: session } = useSession();
  const isAdmin = ["admin", "superadmin", "shelter"].includes(session?.user?.role);

  const [campaigns, setCampaigns] = useState([]);
  const [editing, setEditing] = useState(null); // campaign being edited

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/campaigns", { headers: { accept: "application/json" } });
      const data = await res.json();
      setCampaigns(Array.isArray(data) ? data : (data.campaigns ?? []));
    })();
  }, []);

  const filtered = useMemo(() => campaigns /* your existing filters/sort here */, [campaigns]);

  function onSaved(updated) {
    setCampaigns(list => list.map(c => c._id === updated._id ? { ...c, ...updated } : c));
    setEditing(null);
  }

  return (
    <div className="max-w-6xl mx-auto p-6 grid md:grid-cols-2 gap-6">
      {filtered.map(c => (
        <div key={c._id} className="p-4 border rounded-lg shadow bg-white">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-xl font-semibold">{c.title}</h2>
            {isAdmin && (
              <button className="btn btn-xs btn-outline" onClick={() => setEditing(c)}>
                Edit
              </button>
            )}
          </div>

          {/* Progress */}
          <div className="mt-2 text-sm text-gray-600">
            Raised ${c.raisedAmount ?? 0} / ${c.targetAmount ?? 0}
          </div>
          <div className="w-full h-2 bg-gray-200 rounded mt-1" aria-hidden>
            <div
              className="h-2 bg-emerald-500 rounded"
              style={{ width: `${Math.min(100, Math.floor(((c.raisedAmount ?? 0) / Math.max(1, c.targetAmount ?? 1)) * 100))}%` }}
            />
          </div>

          <p className="text-gray-600 mt-3">{(c.description ?? "").slice(0, 140)}{(c.description?.length ?? 0) > 140 ? "…" : ""}</p>
          <div className="mt-2 text-xs">
            <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5">
              {c.status || "Active"}
            </span>
            {c.createdAt && <span className="ml-2 text-gray-500">• {new Date(c.createdAt).toLocaleDateString()}</span>}
          </div>

          <div className="mt-3 flex gap-3">
            <Link href={`/campaigns/${c._id}`} className="text-emerald-600 hover:underline">View Details</Link>
            <a
              className="text-gray-600 hover:underline"
              href={`mailto:?subject=Support ${encodeURIComponent(c.title)}&body=${encodeURIComponent(location.origin + "/campaigns/" + c._id)}`}
            >
              Share
            </a>
          </div>
        </div>
      ))}

      {editing && isAdmin && (
        <EditCampaignModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}
