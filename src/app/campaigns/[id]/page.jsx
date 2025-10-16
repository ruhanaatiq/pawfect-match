"use client";
import { useEffect, useState } from "react";

export default function CampaignDetails({ params }) {
  const { id } = params;
  const [campaign, setCampaign] = useState(null);
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function fetchCampaign() {
      const res = await fetch(`/api/campaigns/${id}`);
      const data = await res.json();
      setCampaign(data);
    }
    fetchCampaign();
  }, [id]);

  async function handleDonate(e) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch(`/api/campaigns/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), participantName: name, participantEmail: email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Donation successful!");
        // refresh campaign data
        const refreshed = await fetch(`/api/campaigns/${id}`);
        setCampaign(await refreshed.json());
        setAmount(""); setName(""); setEmail("");
      } else {
        setMsg(data.error || "Donation failed");
      }
    } catch (err) {
      setMsg(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (!campaign) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">{campaign.title}</h1>
      <p>{campaign.description}</p>
      <p className="text-gray-600">Raised: ${campaign.raisedAmount || 0} / ${campaign.targetAmount}</p>
      <p>Status: {campaign.status}</p>

      <form onSubmit={handleDonate} className="space-y-4 border p-4 rounded-lg">
        <h2 className="font-semibold text-lg">Donate / Participate</h2>
        <input className="input input-bordered w-full" type="text" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} required />
        <input className="input input-bordered w-full" type="email" placeholder="Your Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input className="input input-bordered w-full" type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} required />
        <button className="btn btn-emerald w-full" type="submit" disabled={loading}>{loading ? "Processing..." : "Donate"}</button>
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
