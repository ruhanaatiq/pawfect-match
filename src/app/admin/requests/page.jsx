// src/app/admin/requests/page.jsx
export const dynamic = "force-dynamic";

import RequestsTable from "./RequestsTable";

export default function AdminRequestsPage() {
  return (
    <>
      <h2 className="text-xl font-semibold mb-4">Adoption Requests</h2>
      <RequestsTable />
    </>
  );
}
