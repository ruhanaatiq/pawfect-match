// src/pages/WorkshopDetails.jsx
import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";

function formatDate(val) {
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return "Date TBA";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

// Render nothing for empty src to avoid empty-src warnings.
function SafeImg({ src, alt, className }) {
  if (typeof src !== "string" || src.trim() === "") return null;
  return (
    <img
      src={src}
      alt={alt || ""}
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
}

export default function WorkshopDetails({ workshops }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const ws = useMemo(() => {
    if (!Array.isArray(workshops)) return null;
    const targetId = String(id);
    return workshops.find((w) => String(w?.id) === targetId) || null;
  }, [workshops, id]);

  if (!Array.isArray(workshops)) {
    return <p className="p-6 text-gray-500">Loading…</p>;
  }

  if (!ws) {
    return (
      <div className="p-6">
        <p className="text-gray-600 mb-4">Workshop not found.</p>
        <button className="btn btn-primary" onClick={() => navigate(-1)}>
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <button className="btn btn-ghost" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h2 className="text-2xl font-bold">{ws.title}</h2>
      <p className="text-gray-500">{formatDate(ws.date)}</p>

      <SafeImg
        src={ws.bgImage}
        alt={ws.title}
        className="rounded-xl w-full max-h-[420px] object-cover"
      />

      <p>{ws.description || "No description available."}</p>
    </div>
  );
}
