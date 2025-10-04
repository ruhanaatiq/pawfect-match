"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function EditShelterForm({ id, shelter }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!id) return <p className="text-red-600">Missing shelter id.</p>;
  if (!shelter) return <p className="text-red-600">Shelter not found.</p>;

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setSaving(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") || "").trim(),
      country: String(form.get("country") || "").trim(),
      description: String(form.get("description") || "").trim(),
    };

    try {
      // ✅ assign fetch to res
      const res = await fetch(`/api/admin/shelters/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const j = await safeJson(res);
      if (!res.ok) throw new Error(j?.error || `Save failed (${res.status})`);

      // ✅ redirect to Manage Shelters after saving
      startTransition(() => {
        router.push("/admin/shelters");
        router.refresh();
      });
    } catch (err) {
      setError(err.message || "Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!confirm("Delete this shelter? This cannot be undone.")) return;

    setError("");
    setInfo("");
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/shelters/${id}`, { method: "DELETE" });
      const j = await safeJson(res);
      if (!res.ok) throw new Error(j?.error || `Delete failed (${res.status})`);

      router.push("/admin/shelters");
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err.message || "Something went wrong while deleting.");
      setSaving(false);
    }
  }

  const disabled = saving || isPending;

  return (
    <form
      onSubmit={onSubmit}
      className="grid grid-cols-1 gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5"
      noValidate
    >
      {info && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700">
          {info}
        </p>
      )}
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-red-700">
          {error}
        </p>
      )}

      <label className="grid gap-1">
        <span className="text-sm text-gray-600">Name *</span>
        <input
          name="name"
          defaultValue={shelter.name ?? ""}
          required
          className="rounded-xl border px-3 py-2"
          aria-required="true"
        />
      </label>

      <label className="grid gap-1">
        <span className="text-sm text-gray-600">Country</span>
        <input
          name="country"
          defaultValue={shelter.country ?? ""}
          className="rounded-xl border px-3 py-2"
        />
      </label>

      <label className="grid gap-1">
        <span className="text-sm text-gray-600">Description</span>
        <textarea
          name="description"
          rows={4}
          defaultValue={shelter.description ?? ""}
          className="rounded-xl border px-3 py-2"
        />
      </label>

      <div className="mt-2 flex gap-3">
        <button
          disabled={disabled}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save"}
        </button>

        <a
          href="/admin/shelters"
          className="rounded-xl border px-4 py-2 hover:bg-emerald-50"
        >
          Back
        </a>

        <button
          type="button"
          onClick={onDelete}
          disabled={disabled}
          className="ml-auto rounded-xl bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-60"
        >
          Delete
        </button>
      </div>
    </form>
  );
}

// Safely parse JSON (handles empty bodies)
async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
