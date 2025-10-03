"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewPetPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", species: "Dog", breed: "", ageMonths: 0, size: "Medium",
    gender: "Unknown", vaccinated: false, spayedNeutered: false,
    goodWithKids: false, description: "", photos: [], status: "available"
  });

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/pets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) router.push("/admin/pets");
    else alert("Failed to create pet");
  }

  function set(k, v) { setForm(s => ({ ...s, [k]: v })); }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h2 className="text-xl font-semibold text-[#4C3D3D] mb-4">Add Pet</h2>
      <form onSubmit={onSubmit} className="space-y-4 bg-white rounded-2xl p-6 shadow">
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="form-control">
            <span className="label-text">Name</span>
            <input className="input input-bordered" value={form.name} onChange={e=>set("name", e.target.value)} required />
          </label>
          <label className="form-control">
            <span className="label-text">Species</span>
            <select className="select select-bordered" value={form.species} onChange={e=>set("species", e.target.value)}>
              {["Dog","Cat","Bird","Rabbit","Other"].map(s=><option key={s}>{s}</option>)}
            </select>
          </label>
          <label className="form-control">
            <span className="label-text">Breed</span>
            <input className="input input-bordered" value={form.breed} onChange={e=>set("breed", e.target.value)} />
          </label>
          <label className="form-control">
            <span className="label-text">Age (months)</span>
            <input type="number" className="input input-bordered" value={form.ageMonths} onChange={e=>set("ageMonths", Number(e.target.value||0))} />
          </label>
          <label className="form-control">
            <span className="label-text">Size</span>
            <select className="select select-bordered" value={form.size} onChange={e=>set("size", e.target.value)}>
              {["Small","Medium","Large"].map(s=><option key={s}>{s}</option>)}
            </select>
          </label>
          <label className="form-control">
            <span className="label-text">Gender</span>
            <select className="select select-bordered" value={form.gender} onChange={e=>set("gender", e.target.value)}>
              {["Male","Female","Unknown"].map(s=><option key={s}>{s}</option>)}
            </select>
          </label>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <label className="label cursor-pointer">
            <span className="label-text">Vaccinated</span>
            <input type="checkbox" className="toggle" checked={form.vaccinated} onChange={e=>set("vaccinated", e.target.checked)} />
          </label>
          <label className="label cursor-pointer">
            <span className="label-text">Spayed/Neutered</span>
            <input type="checkbox" className="toggle" checked={form.spayedNeutered} onChange={e=>set("spayedNeutered", e.target.checked)} />
          </label>
          <label className="label cursor-pointer">
            <span className="label-text">Good with kids</span>
            <input type="checkbox" className="toggle" checked={form.goodWithKids} onChange={e=>set("goodWithKids", e.target.checked)} />
          </label>
        </div>

        <label className="form-control">
          <span className="label-text">Description</span>
          <textarea className="textarea textarea-bordered" rows={4} value={form.description} onChange={e=>set("description", e.target.value)} />
        </label>

        {/* Image URLs (simple) */}
        <label className="form-control">
          <span className="label-text">Photo URLs (comma separated)</span>
          <input className="input input-bordered"
            value={form.photos.join(",")}
            onChange={e=>set("photos", e.target.value.split(",").map(s=>s.trim()).filter(Boolean))}
            placeholder="https://...jpg, https://...png"
          />
        </label>

        <div className="flex items-center gap-3">
          <button className={`btn btn-success ${saving ? "btn-disabled" : ""}`} disabled={saving} type="submit">
            {saving ? "Saving..." : "Create"}
          </button>
          <button type="button" className="btn" onClick={()=>history.back()}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
