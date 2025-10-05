"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function DeleteShelterButton({ id, onDone }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function onDelete() {
    if (!id) return;
    if (!confirm("Delete this shelter? This cannot be undone.")) return;

    setBusy(true);
    try {
      const res = await fetch(`/api/admin/shelters/${id}`, { method: "DELETE" });
      const j = await res.json().catch(() => null);
      if (!res.ok) throw new Error(j?.error || `Delete failed (${res.status})`);

      // refresh the list from server
      startTransition(() => {
        onDone?.();
        router.refresh();
      });
    } catch (e) {
      alert(e.message || "Failed to delete.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={busy || isPending}
      className="ml-3 rounded-lg bg-red-600 px-3 py-1.5 text-white hover:bg-red-700 disabled:opacity-60"
      title="Delete"
    >
      {busy ? "Deleting…" : "Delete"}
    </button>
  );
}
