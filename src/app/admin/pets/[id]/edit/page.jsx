"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditPetPage() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errMsg, setErrMsg] = useState("");

useEffect(() => {
  (async () => {
    const res = await fetch(`/api/pets/${id}`, { cache: "no-store" });
    const j = await res.json().catch(() => ({}));
    if (!res.ok || j?.success === false) {
      alert(j?.error || `Failed to load pet (${res.status})`);
      return;
    }
    const p = j.item ?? j.data ?? {};
    const loc = p.location ?? p.petLocation;
    const locStr = typeof loc === "object"
      ? Object.values(loc).filter(Boolean).join(", ")
      : (loc || "");

    setForm({
      name: p.name || "",
      species: p.species || "Dog",
      breed: p.breed || "",
      age: p.age || "Adult",
      gender: p.gender || "Male",
      size: p.size || "Medium",
      image: (Array.isArray(p.images) && p.images[0]) || p.image || "",
      tags: Array.isArray(p.tags) ? p.tags.join(", ") : "",
      shelter: p.shelter || "",
      distanceKm: p.distanceKm ?? "",
      description: p.description || p.longDescription || "",
      petLocation: locStr,
    });
  })();
}, [id]);


async function onSubmit(e) {
  e.preventDefault();
  setSaving(true);
  try {
    const payload = {
      name: form.name,
      species: form.species,
      breed: form.breed,
      age: form.age,
      gender: form.gender,
      size: form.size,
      images: form.image ? [form.image.trim()] : [],
      tags: form.tags ? form.tags.split(",").map(s => s.trim()).filter(Boolean) : [],
      petLocation: form.petLocation,
      longDescription: form.description,
      shelter: form.shelter,
      distanceKm: form.distanceKm === "" ? undefined : Number(form.distanceKm),
    };

      // Use PATCH if your route exports PATCH; otherwise switch to PUT
      const res = await fetch(`/api/pets/${id}`, {
      method: "PUT", // <— use PUT to match your API
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const raw = await res.text();
    let j; try { j = JSON.parse(raw); } catch {}
    if (!res.ok || j?.success === false) {
      throw new Error(j?.error || `Update failed (${res.status}) ${raw}`);
    }

    // success
    router.push("/admin/pets");
  } catch (err) {
    alert(err.message || "Failed to update pet");
  } finally {
    setSaving(false);
  }
}

  if (errMsg) return <div className="p-6 text-error">{errMsg}</div>;
  if (!form) return <div className="p-6">Loading...</div>;

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h2 className="text-xl font-semibold text-[#4C3D3D] mb-4">Edit Pet</h2>
      <form onSubmit={onSubmit} className="space-y-4 bg-white rounded-2xl p-6 shadow">
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="form-control">
            <span className="label-text">Name</span>
            <input className="input input-bordered" value={form.name} onChange={(e)=>setForm(s=>({...s, name:e.target.value}))} required />
          </label>
          <label className="form-control">
            <span className="label-text">Species</span>
            <select className="select select-bordered" value={form.species} onChange={(e)=>setForm(s=>({...s, species:e.target.value}))}>
              {["Dog","Cat","Bird","Rabbit","Other"].map(s=><option key={s}>{s}</option>)}
            </select>
          </label>
          <label className="form-control">
            <span className="label-text">Breed</span>
            <input className="input input-bordered" value={form.breed} onChange={(e)=>setForm(s=>({...s, breed:e.target.value}))} />
          </label>
          <label className="form-control">
            <span className="label-text">Age</span>
            <input className="input input-bordered" value={form.age} onChange={(e)=>setForm(s=>({...s, age:e.target.value}))} />
          </label>
          <label className="form-control">
            <span className="label-text">Gender</span>
            <select className="select select-bordered" value={form.gender} onChange={(e)=>setForm(s=>({...s, gender:e.target.value}))}>
              {["Male","Female"].map(g=><option key={g}>{g}</option>)}
            </select>
          </label>
          <label className="form-control">
            <span className="label-text">Size</span>
            <select className="select select-bordered" value={form.size} onChange={(e)=>setForm(s=>({...s, size:e.target.value}))}>
              {["Small","Medium","Large"].map(s=><option key={s}>{s}</option>)}
            </select>
          </label>
        </div>

        <label className="form-control">
          <span className="label-text">Main Image URL</span>
          <input className="input input-bordered" value={form.image} onChange={(e)=>setForm(s=>({...s, image:e.target.value}))} />
        </label>

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="form-control">
            <span className="label-text">Tags (comma separated)</span>
            <input className="input input-bordered" value={form.tags} onChange={(e)=>setForm(s=>({...s, tags:e.target.value}))} />
          </label>
          <label className="form-control">
            <span className="label-text">Shelter (name or ID)</span>
            <input className="input input-bordered" value={form.shelter} onChange={(e)=>setForm(s=>({...s, shelter:e.target.value}))} />
          </label>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="form-control">
            <span className="label-text">Distance (km)</span>
            <input type="number" className="input input-bordered" value={form.distanceKm} onChange={(e)=>setForm(s=>({...s, distanceKm:e.target.value}))} />
          </label>
          <label className="form-control">
            <span className="label-text">Location</span>
            <input className="input input-bordered" value={form.petLocation} onChange={(e)=>setForm(s=>({...s, petLocation:e.target.value}))} />
          </label>
        </div>

        <label className="form-control">
          <span className="label-text">Description</span>
          <textarea className="textarea textarea-bordered" rows={4} value={form.description} onChange={(e)=>setForm(s=>({...s, description:e.target.value}))} />
        </label>

        <div className="flex items-center gap-3">
          <button className={`btn btn-success ${saving ? "btn-disabled" : ""}`} disabled={saving} type="submit">
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button type="button" className="btn" onClick={()=>history.back()}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
