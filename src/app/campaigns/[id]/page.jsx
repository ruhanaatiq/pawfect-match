"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function CampaignDetailsPage() {
  const { id } = useParams();             // ✅ get [id] here
  const [campaign, setCampaign] = useState(null);
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res  = await fetch(`/api/campaigns/${id}`, { headers: { accept: "application/json" } });
        const text = await res.text();
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0,180)}`);
        const data = JSON.parse(text);
        // normalize fields (in case API names differ)
        setCampaign({
          _id: data._id || data.id,
          title: data.title ?? "Untitled",
          description: data.description ?? "",
          status: data.status ?? "Active",
          targetAmount: Number(data.targetAmount ?? data.goal ?? 0),
          raisedAmount: Number(data.raisedAmount ?? data.raised ?? 0),
          participants: data.participants ?? [],
        });
      } catch (e) {
        setError(e.message || "Failed to load campaign");
      }
    })();
  }, [id]);

  async function handleDonate(e) {
    e.preventDefault();
    setLoading(true); setMsg(""); setError("");
    try {
      const res  = await fetch(`/api/campaigns/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", accept: "application/json" },
        body: JSON.stringify({ amount: Number(amount), participantName: name, participantEmail: email }),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text || "Donation failed");
      setMsg("Donation successful!");

      // refresh
      const r2 = await fetch(`/api/campaigns/${id}`, { headers: { accept: "application/json" } });
      const d2 = await r2.json();
      setCampaign((c) => ({
        ...c,
        raisedAmount: Number(d2.raisedAmount ?? d2.raised ?? 0),
        participants: d2.participants ?? [],
      }));
      setAmount(""); setName(""); setEmail("");
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (error) return <div className="text-red-500 max-w-3xl mx-auto p-6">{error}</div>;
  if (!campaign) return <div className="max-w-3xl mx-auto p-6">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">{campaign.title}</h1>
      <p>{campaign.description}</p>
      <p className="text-gray-600">Raised: ${campaign.raisedAmount || 0} / ${campaign.targetAmount}</p>
      <p>Status: {campaign.status}</p>

      <form onSubmit={handleDonate} className="space-y-4 border p-4 rounded-lg bg-white">
        <h2 className="font-semibold text-lg">Donate / Participate</h2>
        <input className="input input-bordered w-full" type="text" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} required />
        <input className="input input-bordered w-full" type="email" placeholder="Your Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input className="input input-bordered w-full" type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} required />
        <button className="btn btn-success w-full" type="submit" disabled={loading}>{loading ? "Processing..." : "Donate"}</button>
      </form>

      {msg && <div className="text-sm text-green-600">{msg}</div>}

      <div>
        <h2 className="font-semibold text-lg mt-4">Participants</h2>
        {campaign.participants?.length ? (
          <ul className="list-disc pl-5">
            {campaign.participants.map((p, i) => (
              <li key={i}>{p.name} donated ${p.amount}</li>
            ))}
          </ul>
        ) : <p className="text-gray-500">No participants yet.</p>}
      </div>
    </div>
  );
}
