// src/app/pets/new/page.jsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { Suspense } from "react";
import NewPetClient from "./NewPetClient";

export default function NewPetPage({ searchParams }) {
  // read once on the server
  const shelterId = (searchParams?.shelter ?? "").toString();

  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <NewPetClient shelterId={shelterId} />
    </Suspense>
  );
}
