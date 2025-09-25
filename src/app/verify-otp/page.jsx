// app/verify-otp/page.jsx
import { Suspense } from "react";
import VerifyOtpClient from "./VerifyOtpClient";

export default function VerifyOtpPage({ searchParams }) {
  const email =
    Array.isArray(searchParams?.email) ? searchParams?.email[0] : searchParams?.email || "";

  return (
    <Suspense fallback={<div>Loading…</div>}>
      <VerifyOtpClient initialEmail={email} />
    </Suspense>
  );
}
