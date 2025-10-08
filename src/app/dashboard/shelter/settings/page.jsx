"use client";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [shelter, setShelter] = useState(null);
  const [form, setForm] = useState({ name:"", email:"", phone:"", address:"" });

  useEffect(() => {
    (async () => {
      const d = await fetch("/api/shelters").then(r=>r.json());
      const s = d.shelters?.[0] || null;
      setShelter(s);
      if (s) setForm({ name: s.name || "", email: s.email || "", phone: s.phone || "", address: s.address || "" });
    })();
  }, []);

  async function save(e) {
    e.preventDefault();
    if (!shelter) {
      const r = await fetch("/api/shelters", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(form) });
      if (r.ok) location.reload();
    } else {
      await fetch(`/api/shelters/${shelter._id}`, { method:"PATCH", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(form) });
      alert("Saved");
    }
  }

  return (
    <form onSubmit={save} className="rounded-2xl border bg-white p-6 grid gap-3 max-w-xl">
      <h3 className="font-semibold">{shelter ? "Edit Shelter" : "Create Shelter"}</h3>
      <input className="input input-bordered" placeholder="Shelter name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
      <input className="input input-bordered" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
      <input className="input input-bordered" placeholder="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />
      <input className="input input-bordered" placeholder="Address" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} />
      <button className="btn btn-primary">{shelter ? "Save" : "Create"}</button>
    </form>
  );
}
