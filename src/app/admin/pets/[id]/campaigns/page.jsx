"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function PetCampaignsPage() {
  const { id } = useParams(); // pet ID
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    goal: "",
    status: "Active",
  });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Fetch campaigns
  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const res = await fetch(`/api/pets/${id}/campaigns`);
        const j = await res.json();
        if (!res.ok || !j.success) throw new Error(j.error || "Failed to fetch campaigns");
        setCampaigns(j.campaigns);
      } catch (err) {
        setError(err.message || "Error fetching campaigns");
      } finally {
        setLoading(false);
      }
    }
    fetchCampaigns();
  }, [id]);

  // Handle form input
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  // Submit new or updated campaign
  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      let res;
      if (editingId) {
        res = await fetch(`/api/pets/${id}/campaigns`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ campaignId: editingId, ...form }),
        });
      } else {
        res = await fetch(`/api/pets/${id}/campaigns`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
      const j = await res.json();
      if (!res.ok || !j.success) throw new Error(j.error || "Failed to save campaign");

      // Refresh campaigns list
      const updated = editingId
        ? campaigns.map((c) => (c._id === editingId ? { ...c, ...form } : c))
        : [...campaigns, j.campaign];
      setCampaigns(updated);

      // Reset form
      setForm({ title: "", description: "", goal: "", status: "Active" });
      setEditingId(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(campaign) {
    setForm({
      title: campaign.title,
      description: campaign.description,
      goal: campaign.goal,
      status: campaign.status,
    });
    setEditingId(campaign._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Delete campaign
  async function handleDelete(campaignId) {
    if (!confirm("Are you sure you want to delete this campaign?")) return;

    try {
      const res = await fetch(`/api/pets/${id}/campaigns`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId }),
      });
      const j = await res.json();
      if (!res.ok || !j.success) throw new Error(j.error || "Failed to delete campaign");

      setCampaigns(campaigns.filter((c) => c._id !== campaignId));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <h2 className="text-2xl font-bold">Pet Campaigns</h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow space-y-4">
        <h3 className="font-semibold">{editingId ? "Edit Campaign" : "Add New Campaign"}</h3>
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="input input-bordered w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            className="textarea textarea-bordered w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Goal Amount</label>
          <input
  type="number"
  name="goal"
  value={form.goal}
  onChange={(e) => setForm({ ...form, goal: e.target.value })}
  placeholder="Enter goal amount"
  className="input input-bordered w-full"
/>

        </div>
        <div>
          <label className="block text-sm font-medium">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="select select-bordered w-full"
          >
            <option>Active</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>
        </div>
        <button
          type="submit"
          className="btn btn-success"
          disabled={saving}
        >
          {saving ? "Saving..." : editingId ? "Update Campaign" : "Add Campaign"}
        </button>
      </form>

      {/* Error / Loading */}
      {loading && <p>Loading campaigns...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Campaigns List */}
      {!loading && campaigns.length > 0 && (
        <div className="space-y-4">
          {campaigns.map((c) => (
            <div key={c._id} className="bg-white rounded-xl shadow p-4 flex justify-between items-start">
              <div>
                <h4 className="font-semibold">{c.title}</h4>
                <p>{c.description}</p>
                <p>
                  Goal: ${c.goal} • Raised: ${c.raised || 0} • Status: {c.status}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleEdit(c)}
                  className="btn btn-sm btn-outline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(c._id)}
                  className="btn btn-sm btn-error"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && campaigns.length === 0 && <p>No campaigns yet.</p>}
    </div>
  );
}
