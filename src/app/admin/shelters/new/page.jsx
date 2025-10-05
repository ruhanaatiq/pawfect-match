"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewShelterPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());
    if (!body.name) return setError("Name is required");
    try {
      setSaving(true);
      setError("");
      const res = await fetch("/api/admin/shelters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await res.json();
      if (!res.ok || j.ok === false) throw new Error(j.error || "Failed");
      router.push(`/admin/shelters/${j.shelter._id}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 space-y-4">
      <h1 className="text-xl font-semibold text-[#4C3D3D]">Add Shelter</h1>
      {error && <div className="rounded-lg bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>}

      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 rounded-2xl bg-white/90 p-6 shadow-sm ring-1 ring-black/5">
        <label className="grid gap-1">
          <span className="text-sm text-gray-600">Name *</span>
          <input name="name" className="rounded-xl border px-3 py-2" required />
        </label>

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="grid gap-1">
            <span className="text-sm text-gray-600">Email</span>
            <input name="email" type="email" className="rounded-xl border px-3 py-2" />
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-gray-600">Phone</span>
            <input name="phone" className="rounded-xl border px-3 py-2" />
          </label>
        </div>

        <label className="grid gap-1">
          <span className="text-sm text-gray-600">Website</span>
          <input name="website" className="rounded-xl border px-3 py-2" placeholder="https://…" />
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-gray-600">Address</span>
          <input name="address" className="rounded-xl border px-3 py-2" />
        </label>

        <div className="grid sm:grid-cols-3 gap-4">
          <label className="grid gap-1">
            <span className="text-sm text-gray-600">City</span>
            <input name="city" className="rounded-xl border px-3 py-2" />
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-gray-600">State</span>
            <input name="state" className="rounded-xl border px-3 py-2" />
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-gray-600">Postal Code</span>
            <input name="postalCode" className="rounded-xl border px-3 py-2" />
          </label>
        </div>

        <label className="grid gap-1">
          <span className="text-sm text-gray-600">Country</span>
          <input name="country" className="rounded-xl border px-3 py-2" />
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-gray-600">Description</span>
          <textarea name="description" rows={4} className="rounded-xl border px-3 py-2" />
        </label>

        <div className="flex gap-3">
          <button disabled={saving} className="rounded-xl bg-emerald-600 text-white px-4 py-2 hover:bg-emerald-700 disabled:opacity-50">
            {saving ? "Saving…" : "Create"}
          </button>
          <a href="/admin/shelters" className="rounded-xl border px-4 py-2 hover:bg-emerald-50">Cancel</a>
        </div>
      </form>
    </div>
  );
}
