// src/app/pets/new/NewPetClient.jsx
"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function NewPetClient({ shelterId = "" }) {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    species: "Dog",
    breed: "",
    ageMonths: 0,
    size: "Medium",
    gender: "Unknown",
    vaccinated: false,
    spayedNeutered: false,
    goodWithKids: false,
    description: "",
    photos: [],
    status: "available",
    tags: "",
    petLocation: "",
    shelter: "",
    distanceKm: "",
  });

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const photos = useMemo(
    () => (Array.isArray(form.photos) ? form.photos : []),
    [form.photos]
  );
  const mainPhoto = photos[0] || "/placeholder-pet.jpg";
  const tagsArr = useMemo(
    () =>
      (form.tags || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 12),
    [form.tags]
  );

  async function onSubmit(e) {
    e?.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        species: form.species,
        breed: form.breed,
        age: form.ageMonths,
        gender: form.gender,
        size: form.size,
        images: photos,
        longDescription: form.description,
        status: form.status,
        vaccinated: form.vaccinated,
        spayedNeutered: form.spayedNeutered,
        goodWithKids: form.goodWithKids,
        tags: tagsArr,
        petLocation: form.petLocation,
        shelterId: shelterId || undefined,
        distanceKm: form.distanceKm === "" ? undefined : Number(form.distanceKm),
      };

      const res = await fetch("/api/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `Failed to create pet (${res.status})`);
      }

      router.push("/pets");
    } catch (err) {
      alert(err.message || "Failed to create pet");
    } finally {
      setSaving(false);
    }
  }

  function onPhotosChange(val) {
    const arr = val
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    set("photos", arr);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 space-y-4">
      {/* header */}
      <div className="rounded-2xl p-5 bg-gradient-to-r from-emerald-50 to-green-50 ring-1 ring-black/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-1 ring-black/5">
            <svg width="18" height="18" viewBox="0 0 24 24" className="text-emerald-700">
              <path d="M7.5 8.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Zm4.5.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm4.5-.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM6 14.5c0 2.209 2.91 3.5 6 3.5s6-1.291 6-3.5c0-1.933-2.239-3.5-6-3.5s-6 1.567-6 3.5Z" fill="currentColor"/>
            </svg>
          </span>
          <div>
            <div className="text-xs text-emerald-800/80">Pets</div>
            <h2 className="text-xl font-semibold text-[#4C3D3D]">Add Pet</h2>
          </div>
        </div>
        {shelterId ? (
          <div className="text-xs text-emerald-900/70">Shelter ID: {shelterId}</div>
        ) : (
          <div className="text-xs text-amber-700">No shelter ID provided</div>
        )}
      </div>

      {/* content */}
      <form onSubmit={onSubmit} className="grid lg:grid-cols-3 gap-6">
        {/* left: form */}
        <div className="lg:col-span-2 rounded-2xl bg-white shadow ring-1 ring-black/5">
          <div className="px-6 py-4 border-b bg-emerald-50/60 rounded-t-2xl">
            <div className="font-medium text-emerald-900">Details</div>
            <div className="text-xs text-emerald-800/70">Core information</div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Name">
                <input className="input input-bordered w-full" value={form.name} onChange={(e) => set("name", e.target.value)} required />
              </Field>

              <Field label="Species">
                <select className="select select-bordered w-full" value={form.species} onChange={(e) => set("species", e.target.value)}>
                  {["Dog", "Cat", "Bird", "Rabbit", "Other"].map((s) => (<option key={s}>{s}</option>))}
                </select>
              </Field>

              <Field label="Breed">
                <input className="input input-bordered w-full" value={form.breed} onChange={(e) => set("breed", e.target.value)} />
              </Field>

              <Field label="Age (months)" hint="Use numeric months (e.g., 6, 24)">
                <input type="number" className="input input-bordered w-full" value={form.ageMonths} onChange={(e) => set("ageMonths", Number(e.target.value || 0))} />
              </Field>

              <Field label="Size">
                <select className="select select-bordered w-full" value={form.size} onChange={(e) => set("size", e.target.value)}>
                  {["Small", "Medium", "Large"].map((s) => (<option key={s}>{s}</option>))}
                </select>
              </Field>

              <Field label="Gender">
                <select className="select select-bordered w-full" value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                  {["Male", "Female", "Unknown"].map((s) => (<option key={s}>{s}</option>))}
                </select>
              </Field>
            </div>

            <Divider />

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Status">
                <select className="select select-bordered w-full" value={form.status} onChange={(e) => set("status", e.target.value)}>
                  {["available", "pending", "adopted", "inactive"].map((s) => (<option key={s}>{s}</option>))}
                </select>
              </Field>

              <Field label="Tags (comma separated)" hint="e.g., vaccinated, friendly, house-trained">
                <input className="input input-bordered w-full" value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="gentle, playful, calm" />
              </Field>
            </div>

            {tagsArr.length ? (
              <div className="flex flex-wrap gap-2">
                {tagsArr.map((t, i) => (<span key={`${t}-${i}`} className="badge badge-ghost">{t}</span>))}
              </div>
            ) : null}

            <Divider />

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Photo URLs (comma separated)" hint="First image becomes the cover">
                <input className="input input-bordered w-full" value={photos.join(",")} onChange={(e) => onPhotosChange(e.target.value)} placeholder="https://...jpg, https://...png" />
              </Field>

              <Field label="Location" hint="Free text (City, Area)">
                <input className="input input-bordered w-full" value={form.petLocation} onChange={(e) => set("petLocation", e.target.value)} />
              </Field>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <label className="label cursor-pointer justify-between border rounded-xl px-4 py-2">
                <span className="label-text">Vaccinated</span>
                <input type="checkbox" className="toggle" checked={form.vaccinated} onChange={(e) => set("vaccinated", e.target.checked)} />
              </label>
              <label className="label cursor-pointer justify-between border rounded-xl px-4 py-2">
                <span className="label-text">Spayed / Neutered</span>
                <input type="checkbox" className="toggle" checked={form.spayedNeutered} onChange={(e) => set("spayedNeutered", e.target.checked)} />
              </label>
              <label className="label cursor-pointer justify-between border rounded-xl px-4 py-2">
                <span className="label-text">Good with kids</span>
                <input type="checkbox" className="toggle" checked={form.goodWithKids} onChange={(e) => set("goodWithKids", e.target.checked)} />
              </label>
            </div>

            <Field label="Description" hint="A short, friendly bio">
              <textarea className="textarea textarea-bordered w-full min-h-[120px]" rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} />
            </Field>
          </div>

          {/* mobile actions */}
          <div className="px-4 py-3 border-t bg-base-50 flex sm:hidden justify-end gap-2 rounded-b-2xl">
            <button type="button" className="btn" onClick={() => history.back()}>Cancel</button>
            <button type="submit" className={`btn btn-success ${saving ? "btn-disabled" : ""}`} disabled={saving}>
              {saving ? "Saving…" : "Create"}
            </button>
          </div>
        </div>

        {/* right: preview */}
        <aside className="rounded-2xl bg-white shadow ring-1 ring-black/5">
          <div className="px-6 py-4 border-b bg-emerald-50/60 rounded-t-2xl">
            <div className="font-medium text-emerald-900">Preview</div>
            <div className="text-xs text-emerald-800/70">How it may look in listings</div>
          </div>

          <div className="p-6 space-y-4">
            <img
              src={mainPhoto}
              alt={form.name || "Pet"}
              className="w-full h-48 object-cover rounded-xl ring-1 ring-black/5"
              onError={(e) => { e.currentTarget.src = "/placeholder-pet.jpg"; }}
            />
            <div>
              <div className="text-lg font-semibold">{form.name || "Unnamed Friend"}</div>
              <div className="text-sm text-gray-500">
                {(form.species || "—")} • {(form.gender || "—")} • {(form.size || "—")}
              </div>
            </div>

            {tagsArr.length ? (
              <div className="flex flex-wrap gap-2">
                {tagsArr.map((t, i) => (<span key={`pv-${t}-${i}`} className="badge badge-outline">{t}</span>))}
              </div>
            ) : (<div className="text-xs text-gray-400 italic">No tags</div>)}

            {form.petLocation ? (
              <div className="text-sm"><span className="text-gray-500">Location:</span> {form.petLocation}</div>
            ) : null}

            {photos.length > 1 && (
              <>
                <div className="divider my-2" />
                <div className="grid grid-cols-3 gap-2">
                  {photos.slice(0, 6).map((src, i) => (
                    <img
                      key={`${src}-${i}`} src={src} alt={`photo-${i}`}
                      className="h-16 w-full object-cover rounded-lg ring-1 ring-black/5"
                      onError={(e) => { e.currentTarget.src = "/placeholder-pet.jpg"; }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </aside>
      </form>

      {/* desktop actions */}
      <div className="hidden sm:flex items-center justify-end gap-2">
        <button type="button" className="btn" onClick={() => history.back()}>Cancel</button>
        <button type="submit" form="" onClick={onSubmit}
          className={`btn btn-success ${saving ? "btn-disabled" : ""}`} disabled={saving}>
          {saving ? "Saving…" : "Create"}
        </button>
      </div>
    </div>
  );
}

/* --- UI helpers --- */
function Field({ label, hint, children }) {
  return (
    <label className="form-control">
      <div className="label pb-1">
        <span className="label-text font-medium">{label}</span>
        {hint ? <span className="label-text-alt text-gray-400">{hint}</span> : null}
      </div>
      {children}
    </label>
  );
}
function Divider() { return <div className="divider my-0" />; }
