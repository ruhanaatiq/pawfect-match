"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

/* ---------- helpers ---------- */
function normalize(raw) {
  if (!raw) return null;
  const imagesArr = Array.isArray(raw.images) ? raw.images : raw.images ? [raw.images] : [];
  return {
    id: raw._id || raw.id,
    name: raw.name || raw.petName || "",
    species: raw.species || "Dog",
    breed: raw.breed || "",
    ageMonths: raw.age ?? raw.petAge ?? 0,
    size: raw.size || "Medium",
    gender: raw.gender || "Unknown",
    vaccinated: !!raw.vaccinated,
    spayedNeutered: !!raw.spayedNeutered,
    goodWithKids: !!raw.goodWithKids,
    description: raw.longDescription || raw.description || "",
    images: imagesArr,
    status: (raw.status || "available").toLowerCase(),
    petLocation: raw.petLocation || raw.location || "",
  };
}

export default function EditPetPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(null);

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));
  const photosCSV = useMemo(() => (form?.images || []).join(","), [form]);
  const cover = useMemo(
    () => (form?.images?.length ? form.images[0] : "/placeholder-pet.jpg"),
    [form?.images]
  );

  /* ---------- load ---------- */
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`/api/pets/${id}`, { cache: "no-store" });
        const j = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(j?.error || `Failed (${res.status})`);
        const raw = j?.data || j?.pet || j;
        const n = normalize(raw);
        if (!n?.id) throw new Error("Pet not found");
        setForm(n);
      } catch (e) {
        setError(e.message || "Failed to load pet");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  /* ---------- save ---------- */
  async function onSubmit(e) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        species: form.species,
        breed: form.breed,
        age: Number(form.ageMonths || 0),
        size: form.size,
        gender: form.gender,
        images: form.images,
        longDescription: form.description,
        status: form.status,
        vaccinated: !!form.vaccinated,
        spayedNeutered: !!form.spayedNeutered,
        goodWithKids: !!form.goodWithKids,
        petLocation: form.petLocation,
      };

      const res = await fetch(`/api/pets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || `Update failed (${res.status})`);

      router.push(`/pets/${id}`);
    } catch (e) {
      setError(e.message || "Failed to update pet");
      // optional toast could go here
    } finally {
      setSaving(false);
    }
  }

  function onPhotosChange(v) {
    const arr = v.split(",").map((s) => s.trim()).filter(Boolean);
    set("images", arr);
  }

  if (loading) return <div className="p-8">Loading…</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!form) return null;

  return (
    <main className="mx-auto max-w-6xl px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between rounded-2xl p-4 md:p-5 bg-gradient-to-r from-emerald-50 to-green-50 ring-1 ring-black/5">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white ring-1 ring-black/5">
            <svg width="18" height="18" viewBox="0 0 24 24" className="text-emerald-700">
              <path d="M7.5 8.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Zm4.5.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm4.5-.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM6 14.5c0 2.209 2.91 3.5 6 3.5s6-1.291 6-3.5c0-1.933-2.239-3.5-6-3.5s-6 1.567-6 3.5Z" fill="currentColor"/>
            </svg>
          </span>
          <div>
            <div className="text-xs text-emerald-900/70">Pets</div>
            <h1 className="text-xl md:text-2xl font-semibold text-[#3b3b3b]">
              Edit {form.name || "Pet"}
            </h1>
          </div>
        </div>

        <div className="hidden md:flex gap-2">
          <button type="button" className="btn" onClick={() => router.back()}>
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className={`btn btn-success ${saving ? "btn-disabled" : ""}`}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      {/* Main grid */}
      <form onSubmit={onSubmit} className="grid lg:grid-cols-3 gap-6">
        {/* Left: Form */}
        <section className="lg:col-span-2 rounded-2xl bg-white shadow ring-1 ring-black/5 overflow-hidden">
          <Header title="Details" subtitle="Core information" />

          <div className="p-6 space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Name">
                <input
                  className="input input-bordered w-full"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  required
                />
              </Field>

              <Field label="Species">
                <select
                  className="select select-bordered w-full"
                  value={form.species}
                  onChange={(e) => set("species", e.target.value)}
                >
                  {["Dog", "Cat", "Bird", "Rabbit", "Other"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>

              <Field label="Breed">
                <input
                  className="input input-bordered w-full"
                  value={form.breed}
                  onChange={(e) => set("breed", e.target.value)}
                />
              </Field>

              <Field label="Age (months)">
                <input
                  type="number"
                  className="input input-bordered w-full"
                  value={form.ageMonths}
                  onChange={(e) => set("ageMonths", Number(e.target.value || 0))}
                />
              </Field>

              <Field label="Size">
                <select
                  className="select select-bordered w-full"
                  value={form.size}
                  onChange={(e) => set("size", e.target.value)}
                >
                  {["Small", "Medium", "Large"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>

              <Field label="Gender">
                <select
                  className="select select-bordered w-full"
                  value={form.gender}
                  onChange={(e) => set("gender", e.target.value)}
                >
                  {["Male", "Female", "Unknown"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Divider />

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Status">
                <select
                  className="select select-bordered w-full"
                  value={form.status}
                  onChange={(e) => set("status", e.target.value)}
                >
                  {["available", "pending", "adopted", "inactive"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>

              <Field label="Location" hint="Free text (City, Area)">
                <input
                  className="input input-bordered w-full"
                  value={form.petLocation}
                  onChange={(e) => set("petLocation", e.target.value)}
                />
              </Field>
            </div>

            {/* Switches */}
            <div className="grid sm:grid-cols-3 gap-4">
              <Switch label="Vaccinated" checked={form.vaccinated} onChange={(v) => set("vaccinated", v)} />
              <Switch label="Spayed / Neutered" checked={form.spayedNeutered} onChange={(v) => set("spayedNeutered", v)} />
              <Switch label="Good with kids" checked={form.goodWithKids} onChange={(v) => set("goodWithKids", v)} />
            </div>

            <Divider />

            {/* Photos */}
            <Field label="Photo URLs (comma separated)" hint="First image is used as the cover">
              <input
                className="input input-bordered w-full"
                value={photosCSV}
                onChange={(e) => onPhotosChange(e.target.value)}
                placeholder="https://...jpg, https://...png"
              />
            </Field>

            {/* Description */}
            <Field label="Description" hint="A short, friendly bio">
              <textarea
                className="textarea textarea-bordered w-full min-h-[120px]"
                rows={4}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </Field>
          </div>

          {/* mobile action bar */}
          <div className="px-4 py-3 border-t bg-base-50 flex sm:hidden justify-end gap-2">
            <button type="button" className="btn" onClick={() => router.back()}>
              Cancel
            </button>
            <button className={`btn btn-success ${saving ? "btn-disabled" : ""}`} disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </section>

        {/* Right: Preview */}
        <aside className="rounded-2xl bg-white shadow ring-1 ring-black/5 overflow-hidden">
          <Header title="Preview" subtitle="Live view" />
          <div className="p-6 space-y-4">
            {/* Cover */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cover}
              alt={form.name || "Pet"}
              className="w-full h-56 object-cover rounded-xl ring-1 ring-black/5"
              onError={(e) => {
                e.currentTarget.src = "/placeholder-pet.jpg";
              }}
            />

            {/* Basic */}
            <div>
              <div className="text-lg font-semibold">{form.name || "Unnamed Friend"}</div>
              <div className="text-sm text-gray-500">
                {form.species || "—"} • {form.gender || "—"} • {form.size || "—"}
              </div>
            </div>

            {/* Gallery thumbnails */}
            {form.images?.length > 1 && (
              <>
                <div className="divider my-2" />
                <div className="grid grid-cols-3 gap-2">
                  {form.images.slice(0, 6).map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={`${src}-${i}`}
                      src={src}
                      alt={`thumb-${i}`}
                      className="h-16 w-full object-cover rounded-lg ring-1 ring-black/5"
                      onError={(e) => (e.currentTarget.src = "/placeholder-pet.jpg")}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Meta */}
            <div className="text-sm">
              <span className="text-gray-500">Age:</span> {form.ageMonths || "—"} months
            </div>
            {form.petLocation && (
              <div className="text-sm">
                <span className="text-gray-500">Location:</span> {form.petLocation}
              </div>
            )}
            <span className="inline-flex w-fit text-xs rounded-full px-2 py-0.5 ring-1 ring-gray-200">
              {form.status}
            </span>
          </div>
        </aside>
      </form>

      {/* sticky actions (desktop) */}
      <div className="hidden md:flex sticky bottom-4 justify-end gap-2">
        <button type="button" className="btn" onClick={() => router.back()}>
          Cancel
        </button>
        <button
          onClick={onSubmit}
          className={`btn btn-success ${saving ? "btn-disabled" : ""}`}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </main>
  );
}

/* ---------- small UI helpers ---------- */
function Header({ title, subtitle }) {
  return (
    <div className="px-6 py-4 border-b bg-emerald-50/60">
      <div className="font-medium text-emerald-900">{title}</div>
      {subtitle && <div className="text-xs text-emerald-800/70">{subtitle}</div>}
    </div>
  );
}
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
function Switch({ label, checked, onChange }) {
  return (
    <label className="label cursor-pointer justify-between border rounded-xl px-4 py-2">
      <span className="label-text">{label}</span>
      <input
        type="checkbox"
        className="toggle"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}
