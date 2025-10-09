"use client";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [shelter, setShelter] = useState(null);
  const [form, setForm] = useState({ name:"", email:"", phone:"", address:"" });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null); // success/error toast

  // Load existing shelter
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/shelters");
        if (!res.ok) throw new Error("Failed to load shelters");
        const d = await res.json();
        const s = d.shelters?.[0] || null;
        setShelter(s);
        if (s) {
          setForm({
            name: s.name || "",
            email: s.email || "",
            phone: s.phone || "",
            address: s.address || ""
          });
        }
      } catch (e) {
        showToast("error", e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function showToast(type, text) {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000); // auto-hide
  }

  async function save(e) {
    e.preventDefault();
    try {
      if (!shelter) {
        // Create new shelter
        const res = await fetch("/api/shelters", {
          method:"POST",
          headers:{ "Content-Type":"application/json" },
          body: JSON.stringify(form)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to create shelter");

        setShelter(data.shelter);
        showToast("success", "Shelter created successfully!");
      } else {
        // Update existing shelter
        const res = await fetch(`/api/shelters/${shelter._id}`, {
          method:"PATCH",
          headers:{ "Content-Type":"application/json" },
          body: JSON.stringify(form)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to update shelter");

        setShelter(data.shelter);
        showToast("success", "Shelter updated successfully!");
      }
    } catch (e) {
      showToast("error", e.message);
    }
  }

  if (loading) {
    return <div className="p-6">Loading…</div>;
  }

  return (
    <div className="space-y-4">
      {/* Toast container */}
      <div className="toast toast-top toast-end z-50">
        {toast && (
          <div className={`alert ${toast.type === "success" ? "alert-success" : "alert-error"}`}>
            <span>{toast.text}</span>
          </div>
        )}
      </div>

      <form onSubmit={save} className="rounded-2xl border bg-white p-6 grid gap-3 max-w-xl">
        <h3 className="font-semibold">{shelter ? "Edit Shelter" : "Create Shelter"}</h3>

        <input
          className="input input-bordered"
          placeholder="Shelter name"
          value={form.name}
          onChange={e=>setForm({...form,name:e.target.value})}
          required
        />
        <input
          className="input input-bordered"
          placeholder="Email"
          value={form.email}
          onChange={e=>setForm({...form,email:e.target.value})}
        />
        <input
          className="input input-bordered"
          placeholder="Phone"
          value={form.phone}
          onChange={e=>setForm({...form,phone:e.target.value})}
        />
        <input
          className="input input-bordered"
          placeholder="Address"
          value={form.address}
          onChange={e=>setForm({...form,address:e.target.value})}
        />
        <button className="btn btn-primary">{shelter ? "Save" : "Create"}</button>
      </form>
    </div>
  );
}
