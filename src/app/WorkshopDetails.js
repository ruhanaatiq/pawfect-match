// src/pages/WorkshopDetails.jsx
import { useParams } from "react-router-dom";

const WorkshopDetails = ({ workshops }) => {
  const { id } = useParams();
  const workshop = workshops.find((ws) => ws.id.toString() === id);

  if (!workshop) return <p>Workshop not found.</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-2">{workshop.title}</h2>
      <p className="text-gray-500 mb-4">{new Date(workshop.date).toLocaleString()}</p>
      <img src={workshop.bgImage} alt={workshop.title} className="rounded-xl mb-4" />
      <p>{workshop.description || "No description available."}</p>
    </div>
  );
};

export default WorkshopDetails;
