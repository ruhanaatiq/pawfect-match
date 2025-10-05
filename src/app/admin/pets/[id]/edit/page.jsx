"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function EditPetPage() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  // --- load ---------------------------------------------------------------
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/pets/${id}`, { cache: "no-store" });
        const j = await res.json().catch(() => ({}));
        if (!res.ok || j?.success === false) {
          setErrMsg(j?.error || `Failed to load pet (${res.status})`);
          return;
        }
        const p = j.item ?? j.data ?? {};
        const loc = p.location ?? p.petLocation;
        const locStr =
          typeof loc === "object"
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
      } catch (e) {
        setErrMsg(e.message || "Failed to load pet");
      }
    })();
  }, [id]);

  // --- derived ------------------------------------------------------------
  const tagsArr = useMemo(
    () =>
      (form?.tags || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 12),
    [form?.tags]
  );

  const previewImg =
    form?.image?.trim() || "/placeholder-pet.jpg";

  // --- actions ------------------------------------------------------------
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

      const res = await fetch(`/api/pets/${id}`, {
        method: "PUT", // matches your API
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const raw = await res.text();
      let j; try { j = JSON.parse(raw); } catch {}
      if (!res.ok || j?.success === false) {
        throw new Error(j?.error || `Update failed (${res.status}) ${raw}`);
      }

      router.push("/admin/pets");
    } catch (err) {
      alert(err.message || "Failed to update pet");
    } finally {
      setSaving(false);
    }
  }

  // --- ui --------------------------------------------------------------
  if (errMsg) return <div className="p-6 text-error">{errMsg}</div>;
  if (!form) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="skeleton h-7 w-44 mb-4" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl p-6 shadow ring-1 ring-black/5 bg-white space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="grid sm:grid-cols-2 gap-4">
                <div className="skeleton h-4 w-32" />
                <div className="skeleton h-10 w-full" />
              </div>
            ))}
          </div>
          <div className="rounded-2xl p-6 shadow ring-1 ring-black/5 bg-white">
            <div className="skeleton h-40 w-full rounded-xl mb-4" />
            <div className="skeleton h-4 w-28 mb-2" />
            <div className="skeleton h-3 w-20" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 space-y-4">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">
            <Link href="/admin/pets" className="link link-hover">Manage Pets</Link>
            <span className="mx-1">/</span>
            <span>Edit</span>
          </div>
          <h2 className="text-xl font-semibold text-[#4C3D3D]">Edit Pet</h2>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <Link href="/admin/pets" className="btn btn-ghost">Cancel</Link>
          <button onClick={onSubmit} className={`btn btn-success ${saving ? "btn-disabled" : ""}`} disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* content */}
      <form onSubmit={onSubmit} className="grid lg:grid-cols-3 gap-6">
        {/* left: form */}
        <div className="lg:col-span-2 rounded-2xl bg-white shadow ring-1 ring-black/5">
          <div className="px-6 py-4 border-b bg-gradient-to-r from-emerald-50 to-green-50 rounded-t-2xl">
            <div className="font-medium text-emerald-900">Details</div>
            <div className="text-xs text-emerald-800/70">Update core info about this pet</div>
          </div>

          <div className="p-6 space-y-6">
            {/* basic */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Name">
                <input className="input input-bordered w-full"
                  value={form.name}
                  onChange={(e)=>setForm(s=>({...s, name:e.target.value}))}
                  required
                />
              </Field>

              <Field label="Species">
                <select className="select select-bordered w-full"
                  value={form.species}
                  onChange={(e)=>setForm(s=>({...s, species:e.target.value}))}
                >
                  {["Dog","Cat","Bird","Rabbit","Other"].map(s=><option key={s}>{s}</option>)}
                </select>
              </Field>

              <Field label="Breed">
                <input className="input input-bordered w-full"
                  value={form.breed}
                  onChange={(e)=>setForm(s=>({...s, breed:e.target.value}))}
                />
              </Field>

              <Field label="Age" hint="e.g., 3 months, 1 year, Senior">
                <input className="input input-bordered w-full"
                  value={form.age}
                  onChange={(e)=>setForm(s=>({...s, age:e.target.value}))}
                />
              </Field>

              <Field label="Gender">
                <select className="select select-bordered w-full"
                  value={form.gender}
                  onChange={(e)=>setForm(s=>({...s, gender:e.target.value}))}
                >
                  {["Male","Female"].map(g=><option key={g}>{g}</option>)}
                </select>
              </Field>

              <Field label="Size">
                <select className="select select-bordered w-full"
                  value={form.size}
                  onChange={(e)=>setForm(s=>({...s, size:e.target.value}))}
                >
                  {["Small","Medium","Large"].map(s=><option key={s}>{s}</option>)}
                </select>
              </Field>
            </div>

            <Divider />

            {/* media + tags */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Main Image URL" hint="Paste an image URL; preview updates instantly">
                <input className="input input-bordered w-full"
                  value={form.image}
                  onChange={(e)=>setForm(s=>({...s, image:e.target.value}))}
                  placeholder="https://…"
                />
              </Field>

              <Field label="Tags (comma separated)" hint="Examples: vaccinated, friendly, house-trained">
                <input className="input input-bordered w-full"
                  value={form.tags}
                  onChange={(e)=>setForm(s=>({...s, tags:e.target.value}))}
                  placeholder="vaccinated, gentle, playful"
                />
              </Field>
            </div>

            {tagsArr.length ? (
              <div className="flex flex-wrap gap-2">
                {tagsArr.map((t, i) => (
                  <span key={`${t}-${i}`} className="badge badge-ghost">{t}</span>
                ))}
              </div>
            ) : null}

            <Divider />

            {/* logistics */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Distance (km)">
                <input type="number" step="0.1" className="input input-bordered w-full"
                  value={form.distanceKm}
                  onChange={(e)=>setForm(s=>({...s, distanceKm:e.target.value}))}
                />
              </Field>
              <Field label="Shelter (name or ID)">
                <input className="input input-bordered w-full"
                  value={form.shelter}
                  onChange={(e)=>setForm(s=>({...s, shelter:e.target.value}))}
                />
              </Field>
            </div>

            <Field label="Location" hint="City, Area (free text)">
              <input className="input input-bordered w-full"
                value={form.petLocation}
                onChange={(e)=>setForm(s=>({...s, petLocation:e.target.value}))}
              />
            </Field>

            <Field label="Description">
              <textarea className="textarea textarea-bordered w-full min-h-[120px]"
                value={form.description}
                onChange={(e)=>setForm(s=>({...s, description:e.target.value}))}
              />
            </Field>
          </div>

          {/* sticky actions for mobile */}
          <div className="px-4 py-3 border-t bg-base-50 flex sm:hidden justify-end gap-2 rounded-b-2xl">
            <button type="button" className="btn" onClick={()=>router.push("/admin/pets")}>
              Cancel
            </button>
            <button className={`btn btn-success ${saving ? "btn-disabled" : ""}`} disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>

        {/* right: live preview */}
        <aside className="rounded-2xl bg-white shadow ring-1 ring-black/5">
          <div className="px-6 py-4 border-b bg-gradient-to-r from-emerald-50 to-green-50 rounded-t-2xl">
            <div className="font-medium text-emerald-900">Preview</div>
            <div className="text-xs text-emerald-800/70">How it may look in listings</div>
          </div>

          <div className="p-6 space-y-4">
            <div className="relative">
              <img
                src={previewImg}
                alt={form.name || "Pet"}
                className="w-full h-48 object-cover rounded-xl ring-1 ring-black/5"
                onError={(e)=>{ e.currentTarget.src="/placeholder-pet.jpg"; }}
              />
            </div>
            <div>
              <div className="text-lg font-semibold">{form.name || "Unnamed Friend"}</div>
              <div className="text-sm text-gray-500">
                {(form.species || "—")} • {(form.gender || "—")} • {(form.size || "—")}
              </div>
            </div>
            {tagsArr.length ? (
              <div className="flex flex-wrap gap-2">
                {tagsArr.map((t, i) => (
                  <span key={`pv-${t}-${i}`} className="badge badge-outline">{t}</span>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-400 italic">No tags</div>
            )}
            {form.petLocation ? (
              <div className="text-sm">
                <span className="text-gray-500">Location:</span> {form.petLocation}
              </div>
            ) : null}
          </div>
        </aside>
      </form>
    </div>
  );
}

/* --- tiny presentational helpers --- */
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
function Divider() {
  return <div className="divider my-0" />;
}
