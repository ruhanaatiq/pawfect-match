"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

/** Minimal defensive fetch helper (avoids JSON.parse errors) */
async function fetchJson(url, options) {
  const res = await fetch(url, options);
  const ct = res.headers.get("content-type") || "";
  const body = ct.includes("application/json") ? await res.json() : await res.text();
  if (!res.ok) {
    const msg = (body && body.error) || (typeof body === "string" ? body : res.statusText) || "Request failed";
    throw new Error(msg);
  }
  return body;
}

const SPECIES = ["dog", "cat", "bird", "rabbit", "other"];
const SEX = ["male", "female", "unknown"];
const SIZE = ["xs", "sm", "md", "lg", "xl"];
const STATUS = ["available", "reserved", "adopted"];

export default function PetsPage() {
  const [loading, setLoading] = useState(true);
  const [shelterId, setShelterId] = useState(null);
  const [pets, setPets] = useState([]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  // Create form state
  const [form, setForm] = useState({
    name: "",
    species: SPECIES[0],
    breed: "",
    ageMonths: "",
    sex: SEX[2],
    size: SIZE[2],
    vaccinated: false,
    goodWithKids: false,
    spayedNeutered: false,
    status: STATUS[0],
    photos: [],
    description: "",
  });

  useEffect(() => {
    (async () => {
      try {
        setError("");
        // get first shelter this user belongs to
        const { shelters } = await fetchJson("/api/shelters");
        const first = shelters?.[0]?._id;
        setShelterId(first || null);
        if (first) {
          const { pets } = await fetchJson(`/api/shelters/${first}/pets`);
          setPets(pets || []);
        }
      } catch (e) {
        setError(e.message || "Failed to load pets");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleAddPet(e) {
    e.preventDefault();
    if (!shelterId) return;

    const payload = {
      ...form,
      ageMonths: form.ageMonths ? Number(form.ageMonths) : undefined,
    };

    try {
      setError("");
      const { pet } = await fetchJson(`/api/shelters/${shelterId}/pets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setPets((prev) => [pet, ...prev]);
      // reset minimal fields
      setForm((f) => ({
        ...f,
        name: "",
        breed: "",
        ageMonths: "",
        description: "",
        status: STATUS[0],
      }));
    } catch (e) {
      setError(e.message || "Failed to add pet");
    }
  }

  async function markStatus(petId, status) {
    try {
      setError("");
      // optimistic update
      setPets((prev) => prev.map((p) => (p._id === petId ? { ...p, status } : p)));
      await fetchJson(`/api/pets/${petId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } catch (e) {
      setError(e.message || "Failed to update status");
      // reload list to revert optimistic if error
      startTransition(async () => {
        if (!shelterId) return;
        const { pets } = await fetchJson(`/api/shelters/${shelterId}/pets`);
        setPets(pets || []);
      });
    }
  }

  async function deletePet(petId) {
    if (!confirm("Delete this pet?")) return;
    try {
      setError("");
      setPets((prev) => prev.filter((p) => p._id !== petId));
      await fetchJson(`/api/pets/${petId}`, { method: "DELETE" });
    } catch (e) {
      setError(e.message || "Failed to delete pet");
      // soft refresh
      startTransition(async () => {
        if (!shelterId) return;
        const { pets } = await fetchJson(`/api/shelters/${shelterId}/pets`);
        setPets(pets || []);
      });
    }
  }

  const availableCount = useMemo(() => pets.filter((p) => p.status === "available").length, [pets]);
  const adoptedCount = useMemo(() => pets.filter((p) => p.status === "adopted").length, [pets]);

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-6">
        <div className="animate-pulse grid gap-4">
          <div className="h-6 w-48 rounded bg-gray-200" />
          <div className="h-10 w-full rounded bg-gray-200" />
          <div className="h-32 w-full rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  if (!shelterId) {
    return (
      <div className="rounded-2xl border bg-white p-6">
        <h3 className="text-lg font-semibold">No shelter found</h3>
        <p className="text-sm text-gray-600 mt-1">
          Create one in <a href="/dashboard/shelter/settings" className="link">Settings</a> or join with an invite in{" "}
          <a href="/dashboard/shelter/staff" className="link">Staff</a>.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {/* header + stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold">Pets</h1>
        <div className="flex gap-3">
          <Stat pill title="Total" value={pets.length} />
          <Stat pill title="Available" value={availableCount} />
          <Stat pill title="Adopted" value={adoptedCount} />
        </div>
      </div>

      {error ? (
        <div className="alert alert-error text-sm">
          <span>{error}</span>
        </div>
      ) : null}

      {/* create form */}
      <form onSubmit={handleAddPet} className="rounded-2xl border bg-white p-5 grid gap-4">
        <h3 className="font-semibold">Add a new pet</h3>
        <div className="grid md:grid-cols-3 gap-3">
          <Input label="Name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <Select
            label="Species"
            value={form.species}
            onChange={(v) => setForm({ ...form, species: v })}
            options={SPECIES}
          />
          <Input label="Breed" value={form.breed} onChange={(v) => setForm({ ...form, breed: v })} />
          <Input
            label="Age (months)"
            type="number"
            min="0"
            value={form.ageMonths}
            onChange={(v) => setForm({ ...form, ageMonths: v })}
          />
          <Select label="Sex" value={form.sex} onChange={(v) => setForm({ ...form, sex: v })} options={SEX} />
          <Select label="Size" value={form.size} onChange={(v) => setForm({ ...form, size: v })} options={SIZE} />
          <Toggle
            label="Vaccinated"
            checked={form.vaccinated}
            onChange={(v) => setForm({ ...form, vaccinated: v })}
          />
          <Toggle
            label="Good with kids"
            checked={form.goodWithKids}
            onChange={(v) => setForm({ ...form, goodWithKids: v })}
          />
          <Toggle
            label="Spayed/Neutered"
            checked={form.spayedNeutered}
            onChange={(v) => setForm({ ...form, spayedNeutered: v })}
          />
          <Select label="Status" value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={STATUS} />
          <div className="md:col-span-3">
            <Label text="Description" />
            <textarea
              className="textarea textarea-bordered w-full"
              rows={3}
              placeholder="Short description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-primary" disabled={isPending || !form.name}>Add Pet</button>
          {isPending && <span className="text-sm text-gray-500">Saving…</span>}
        </div>
      </form>

      {/* table */}
      <div className="rounded-2xl border bg-white overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Species</th>
              <th>Status</th>
              <th className="hidden md:table-cell">Breed</th>
              <th className="hidden md:table-cell">Age</th>
              <th className="hidden md:table-cell">Tags</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pets.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-sm text-gray-500">
                  No pets yet.
                </td>
              </tr>
            ) : (
              pets.map((p) => (
                <tr key={p._id}>
                  <td className="font-medium">{p.name}</td>
                  <td className="capitalize">{p.species}</td>
                  <td className="capitalize">{p.status}</td>
                  <td className="hidden md:table-cell">{p.breed || "-"}</td>
                  <td className="hidden md:table-cell">{p.ageMonths ?? "-"}</td>
                  <td className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-2">
                      {p.vaccinated && <Tag>Vaccinated</Tag>}
                      {p.goodWithKids && <Tag>Good w/ kids</Tag>}
                      {p.spayedNeutered && <Tag>Spayed/Neutered</Tag>}
                    </div>
                  </td>
                  <td className="flex flex-wrap gap-2">
                    <button
                      className="btn btn-xs"
                      onClick={() => markStatus(p._id, "adopted")}
                      disabled={p.status === "adopted"}
                    >
                      Mark adopted
                    </button>
                    <div className="dropdown dropdown-end">
                      <div tabIndex={0} role="button" className="btn btn-xs">Status</div>
                      <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-40">
                        {STATUS.map((s) => (
                          <li key={s}>
                            <button onClick={() => markStatus(p._id, s)} className="capitalize">{s}</button>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button className="btn btn-xs btn-error" onClick={() => deletePet(p._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- small UI helpers ---------- */

function Label({ text }) {
  return <span className="text-sm text-gray-600">{text}</span>;
}

function Input({ label, type = "text", value, onChange, required, min }) {
  return (
    <label className="grid gap-1">
      <Label text={label} />
      <input
        className="input input-bordered w-full"
        type={type}
        value={value}
        min={min}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="grid gap-1">
      <Label text={label} />
      <select className="select select-bordered w-full capitalize" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o} value={o} className="capitalize">
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3">
      <input
        type="checkbox"
        className="toggle toggle-success"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <Label text={label} />
    </label>
  );
}

function Tag({ children }) {
  return <span className="badge badge-ghost">{children}</span>;
}

function Stat({ title, value, pill = false }) {
  return (
    <div className={`rounded-2xl border bg-white px-4 py-3 ${pill ? "inline-flex items-center gap-2" : ""}`}>
      <span className="text-sm text-gray-500">{title}</span>
      <span className="text-lg font-semibold">{value}</span>
    </div>
  );
}
