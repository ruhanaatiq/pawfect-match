// src/app/reset-password/page.jsx
import { Suspense } from "react";
import ResetPasswordClient from "./ResetPasswordClient";

// prevent static prerender; make it dynamic at runtime
export const dynamic = "force-dynamic"; // or: export const revalidate = 0;

export default function Page() {
  return (
    <Suspense>
      <ResetPasswordClient />
    </Suspense>
  );
}
