"use client";

import { useState } from "react";


export default function UpdateHealthForm({ petId, existing, onUpdated }) {

  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");


  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setPending(true);

    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    payload.petId = petId;

    try {
      const res = await fetch(`/api/pets/${petId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Update failed");

      // Call parent refresh
      if (onUpdated) onUpdated();

      alert("Health records updated successfully!");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setPending(false);
    }
  }


  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-black/5 bg-white/80 p-6 space-y-4"
    >
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
          {error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#4C3D3D]">
            Vaccination Status
          </label>
          <input
            name="vaccinationStatus"
            defaultValue={existing?.vetDetails?.vaccinationStatus}
            required
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#4C3D3D]">
            Health Condition
          </label>
          <input
            name="healthCondition"
            defaultValue={existing?.vetDetails?.healthCondition}
            required
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#4C3D3D]">
            Temperament
          </label>
          <input
            name="temperament"
            defaultValue={existing?.vetDetails?.temperament}
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#4C3D3D]">
            Last Checkup Date
          </label>
          <input
            type="date"
            name="lastCheckup"
            defaultValue={existing?.vetDetails?.lastCheckup}
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#4C3D3D]">
          Notes (optional)
        </label>
        <textarea
          name="notes"
          rows={4}
          defaultValue={existing?.vetDetails?.notes}
          className="mt-1 w-full rounded-md border px-3 py-2"
        />
      </div>

      <button
        disabled={pending}
        className="rounded-md bg-emerald-600 px-4 py-2 text-white font-semibold disabled:opacity-50"
      >
        {pending ? "Updating..." : "Save Health Records"}
      </button>
    </form>
  );
}
