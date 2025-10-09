// src/app/dashboard/shelter/new/page.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewShelterPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") || "").trim(),
      country: String(form.get("country") || "").trim(),
      phone: String(form.get("phone") || "").trim(),
      address: String(form.get("address") || "").trim(),
      description: String(form.get("description") || "").trim(),
    };

    try {
      const res = await fetch("/api/shelters/mine", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const j = await res.json().catch(() => null);
      if (!res.ok) throw new Error(j?.error || `Create failed (${res.status})`);

      // Go to the shelter dashboard after creating
      router.push("/dashboard/shelter");
      router.refresh();
    } catch (err) {
      setError(err.message || "Something went wrong while creating the shelter.");
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Create Shelter</h1>

      <form
        onSubmit={onSubmit}
        className="grid gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5"
        noValidate
      >
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-red-700">{error}</p>
        )}

        <label className="grid gap-1">
          <span className="text-sm text-gray-600">Name *</span>
          <input
            name="name"
            required
            className="rounded-xl border px-3 py-2"
            placeholder="Happy Tails Shelter"
          />
        </label>

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="grid gap-1">
            <span className="text-sm text-gray-600">Country</span>
            <input name="country" className="rounded-xl border px-3 py-2" placeholder="Bangladesh" />
          </label>

          <label className="grid gap-1">
            <span className="text-sm text-gray-600">Phone</span>
            <input name="phone" className="rounded-xl border px-3 py-2" placeholder="+880…" />
          </label>
        </div>

        <label className="grid gap-1">
          <span className="text-sm text-gray-600">Address</span>
          <input name="address" className="rounded-xl border px-3 py-2" placeholder="Road, Area, City" />
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-gray-600">Description</span>
          <textarea
            name="description"
            rows={4}
            className="rounded-xl border px-3 py-2"
            placeholder="Tell adopters about your shelter, mission, and policies."
          />
        </label>

        <div className="mt-2 flex gap-3">
          <button
            disabled={saving}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? "Creating..." : "Create Shelter"}
          </button>

          <a
            href="/dashboard/shelter"
            className="rounded-xl border px-4 py-2 hover:bg-emerald-50"
          >
            Cancel
          </a>
        </div>
      </form>
    </main>
  );
}
