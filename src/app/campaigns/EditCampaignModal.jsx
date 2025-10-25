// src/app/campaigns/EditCampaignModal.jsx
"use client";
import { useState } from "react";

export default function EditCampaignModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: initial.title ?? "",
    description: initial.description ?? "",
    goal: String(initial.targetAmount ?? initial.goal ?? 0),
    status: initial.status ?? "Active",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  function setField(name, value) {
    setForm(f => ({ ...f, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true); setErr("");
    try {
      const res = await fetch(`/api/campaigns/${initial._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", accept: "application/json" },
        body: JSON.stringify({ title: form.title, description: form.description, goal: Number(form.goal), status: form.status }),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text || "Failed to update campaign");
      const updated = {
        _id: initial._id,
        title: form.title,
        description: form.description,
        targetAmount: Number(form.goal),
        status: form.status,
      };
      onSaved(updated);
    } catch (e) {
      setErr(e.message || "Error saving");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Edit Campaign</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm">✕</button>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <input className="input input-bordered w-full" value={form.title} onChange={e=>setField("title", e.target.value)} required />
          <textarea className="textarea textarea-bordered w-full" value={form.description} onChange={e=>setField("description", e.target.value)} required />
          <input className="input input-bordered w-full" type="number" min="0" value={form.goal} onChange={e=>setField("goal", e.target.value)} required />
          <select className="select select-bordered w-full" value={form.status} onChange={e=>setField("status", e.target.value)}>
            <option>Active</option>
            <option>Completed</option>
            <option>Cancelled</option>
            <option>Pending</option>
          </select>
          <div className="flex gap-2 justify-end">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-success" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
          </div>
          {err && <div className="text-red-500 text-sm">{err}</div>}
        </form>
      </div>
    </div>
  );
}
