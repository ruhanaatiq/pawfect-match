"use client";

import { useSearchParams } from "next/navigation";
import UpdateHealthForm from "@/components/UpdateHealthRecords";
import { useEffect, useState } from "react";

export default function HealthRecordsPage() {
  const searchParams = useSearchParams();
  const petId = searchParams.get("petId");

  const [existing, setExisting] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!petId) return;
    (async () => {
      try {
        const res = await fetch(`/api/pets/${petId}`);
        const data = await res.json();
        setExisting(data?.data || data?.item || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [petId]);

  if (!petId) return <div className="p-6">Pet ID missing</div>;
  if (loading) return <div className="p-6">Loading...</div>;
  if (!existing) return <div className="p-6">Pet not found</div>;

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h2 className="text-2xl font-bold mb-6">Update Health Records</h2>
      <UpdateHealthForm petId={petId} existing={existing} />
    </div>
  );
}
