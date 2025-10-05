// src/app/join-shelter/page.jsx
export const dynamic = "force-dynamic";   // avoid static prerender

import JoinClient from "./JoinClient";

export default function Page({ searchParams }) {
  const token = searchParams?.token ?? "";
  const shelterId = searchParams?.shelterId ?? "";
  return <JoinClient token={token} shelterId={shelterId} />;
}
