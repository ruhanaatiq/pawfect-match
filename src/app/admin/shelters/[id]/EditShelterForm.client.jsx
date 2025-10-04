"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditShelterForm({ shelter }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());

    try {
      setSaving(true);
      setError("");
      const res = await fetch(`/api/admin/shelters/${shelter._id || shelter.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || j.ok === false) throw new Error(j.error || `Failed (${res.status})`);
      router.refresh();
    } catch (err) {
      setError(err.message || "Failed");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!confirm("Delete this shelter?")) return;
    const res = await fetch(`/api/admin/shelters/${shelter._id || shelter.id}`, { method: "DELETE" });
    const j = await res.json().catch(() => ({}));
    if (res.ok && j.ok !== false) router.push("/admin/shelters");
    else alert(j.error || "Delete failed");
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 rounded-2xl bg-white/90 p-6 shadow-sm ring-1 ring-black/5">
      {error && <div className="rounded-lg bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>}

      <label className="grid gap-1">
        <span className="text-sm text-gray-600">Name *</span>
        <input name="name" defaultValue={shelter.name} required className="rounded-xl border px-3 py-2" />
      </label>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="grid gap-1">
          <span className="text-sm text-gray-600">Email</span>
          <input name="email" defaultValue={shelter.email ?? ""} className="rounded-xl border px-3 py-2" />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-gray-600">Phone</span>
          <input name="phone" defaultValue={shelter.phone ?? ""} className="rounded-xl border px-3 py-2" />
        </label>
      </div>

      <label className="grid gap-1">
        <span className="text-sm text-gray-600">Website</span>
        <input name="website" defaultValue={shelter.website ?? ""} className="rounded-xl border px-3 py-2" />
      </label>

      <label className="grid gap-1">
        <span className="text-sm text-gray-600">Address</span>
        <input name="address" defaultValue={shelter.address ?? ""} className="rounded-xl border px-3 py-2" />
      </label>

      <div className="grid sm:grid-cols-3 gap-4">
        <label className="grid gap-1">
          <span className="text-sm text-gray-600">City</span>
          <input name="city" defaultValue={shelter.city ?? ""} className="rounded-xl border px-3 py-2" />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-gray-600">State</span>
          <input name="state" defaultValue={shelter.state ?? ""} className="rounded-xl border px-3 py-2" />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-gray-600">Postal Code</span>
          <input name="postalCode" defaultValue={shelter.postalCode ?? shelter.zip ?? ""} className="rounded-xl border px-3 py-2" />
        </label>
      </div>

      <label className="grid gap-1">
        <span className="text-sm text-gray-600">Country</span>
        <input name="country" defaultValue={shelter.country ?? ""} className="rounded-xl border px-3 py-2" />
      </label>

      <label className="grid gap-1">
        <span className="text-sm text-gray-600">Description</span>
        <textarea name="description" rows={4} defaultValue={shelter.description ?? ""} className="rounded-xl border px-3 py-2" />
      </label>

      <div className="flex gap-3">
        <button disabled={saving} className="rounded-xl bg-emerald-600 text-white px-4 py-2 hover:bg-emerald-700 disabled:opacity-50">
          {saving ? "Saving…" : "Save"}
        </button>
        <a href="/admin/shelters" className="rounded-xl border px-4 py-2 hover:bg-emerald-50">Back</a>
        <button type="button" onClick={onDelete} className="ml-auto rounded-xl bg-red-600 text-white px-4 py-2 hover:bg-red-700">
          Delete
        </button>
      </div>
    </form>
  );
}
