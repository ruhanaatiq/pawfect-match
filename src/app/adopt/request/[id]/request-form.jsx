"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RequestForm({ petId }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setPending(true);

    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    payload.petId = petId;
    payload.hasOtherPets = form.get("hasOtherPets") === "on";
    payload.agree = form.get("agree") === "on";

    if (!payload.agree) {
      setPending(false);
      setError("You must agree to the adoption terms.");
      return;
    }

    try {
      const res = await fetch("/api/adoptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error((await res.json()).error || "Request failed");
      // success → go back to listing or show a thank-you page
// success → go to Dashboard Applications tab
router.push("/dashboard?tab=applications");

    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-black/5 bg-white/80 p-6 space-y-4">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
          {error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#4C3D3D]">Full name</label>
          <input name="fullName" required className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#4C3D3D]">Email</label>
          <input type="email" name="email" required className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#4C3D3D]">Phone</label>
          <input name="phone" required className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#4C3D3D]">City</label>
          <input name="city" className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#4C3D3D]">Home type</label>
          <select name="homeType" className="mt-1 w-full rounded-md border px-3 py-2">
            <option>Apartment</option>
            <option>House</option>
            <option>Shared</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#4C3D3D]">Do you have other pets?</label>
          <div className="mt-2">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" name="hasOtherPets" />
              <span className="text-sm text-[#4C3D3D]/80">Yes</span>
               <input type="checkbox" name="hasOtherPets" />
              <span className="text-sm text-[#4C3D3D]/80">No</span>
            </label>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#4C3D3D]">Why do you want to adopt?</label>
        <textarea name="message" rows={4} className="mt-1 w-full rounded-md border px-3 py-2" />
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" name="agree" id="agree" />
        <label htmlFor="agree" className="text-sm text-[#4C3D3D]/80">
          I agree to the adoption terms and allow the shelter to contact me.
        </label>
      </div>

      <button
        disabled={pending}
        className="rounded-md bg-emerald-600 px-4 py-2 text-white font-semibold disabled:opacity-50"
      >
        {pending ? "Submitting..." : "Submit Request"}
      </button>
    </form>
  );
}
