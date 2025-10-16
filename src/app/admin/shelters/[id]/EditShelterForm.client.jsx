// src/app/admin/shelters/[id]/EditShelterForm.client.jsx
"use client";
import { useEffect, useMemo, useState } from "react";

export default function EditShelterForm({ id, shelter: initialShelter }) {
  const [shelter, setShelter] = useState(initialShelter || null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const shelterId = useMemo(
    () => id || initialShelter?._id || initialShelter?.id || null,
    [id, initialShelter]
  );

  // Fetch only if we have an id but not a shelter object
  useEffect(() => {
    if (!shelterId || shelter) return;
    (async () => {
      try {
        setError("");
        const res = await fetch(`/api/admin/shelters/${shelterId}`, { cache: "no-store" });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.error || `Failed to load (${res.status})`);
        setShelter(json?.shelter ?? json);
      } catch (e) {
        setError(e.message || "Failed to load shelter");
      }
    })();
  }, [shelterId, shelter]);

  if (!shelterId && !shelter) {
    return <p className="text-red-500">Missing shelter id.</p>;
  }
  if (error) return <p className="text-red-500">{error}</p>;
  if (!shelter) return <p>Loading…</p>;

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name")?.trim() || "",
      email: form.get("email")?.trim() || "",
      phone: form.get("phone")?.trim() || "",
      address: form.get("address")?.trim() || "",
      status: form.get("status")?.trim() || shelter.status || "pending",
    };

    try {
      const res = await fetch(`/api/admin/shelters/${shelterId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || `Update failed (${res.status})`);
      // optimistic local update
      setShelter((prev) => ({ ...(prev || {}), ...payload }));
    } catch (e) {
      setError(e.message || "Update failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="grid gap-1">
          <span className="text-sm text-gray-600">Name *</span>
          <input
            name="name"
            defaultValue={shelter.name || ""}
            required
            className="rounded-xl border px-3 py-2"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-gray-600">Email</span>
          <input
            type="email"
            name="email"
            defaultValue={shelter.email || ""}
            className="rounded-xl border px-3 py-2"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-gray-600">Phone</span>
          <input
            name="phone"
            defaultValue={shelter.phone || ""}
            className="rounded-xl border px-3 py-2"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-gray-600">Status</span>
          <select
            name="status"
            defaultValue={shelter.status || "pending"}
            className="rounded-xl border px-3 py-2"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="suspended">Suspended</option>
          </select>
        </label>
      </div>

      <label className="grid gap-1">
        <span className="text-sm text-gray-600">Address</span>
        <input
          name="address"
          defaultValue={shelter.address || ""}
          className="rounded-xl border px-3 py-2"
        />
      </label>

      {error && <p className="text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2 rounded-lg shadow-md w-fit transition-all"
      >
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
