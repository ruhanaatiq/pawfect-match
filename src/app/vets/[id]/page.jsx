"use client";
import React from "react";
import vets from "../../../../public/vets.json";
import { FaPhone, FaEnvelope, FaCalendarAlt, FaStar, FaLink } from "react-icons/fa";

export default function VetDetail({ params }) {
  const { id } = React.use(params);
  const vet = vets.find((v) => v.id === id);

  if (!vet) {
    return <p className="text-center mt-10 text-gray-500">Vet not found.</p>;
  }

  return (
    <div className="px-4 py-8 max-w-5xl mx-auto space-y-10">

      {/* Vet Card */}
      <div className="bg-white shadow-lg rounded-2xl overflow-hidden flex flex-col md:flex-row gap-6">
        {/* Left: Photo */}
        <div className="flex-shrink-0 w-full md:w-1/2 p-4 md:p-0">
          <img
            src={vet.photo}
            alt={vet.name}
            className="object-cover w-full h-80 md:h-full rounded-2xl md:rounded-none"
          />
        </div>

        {/* Right: Details */}
        <div className="flex-1 p-6 flex flex-col justify-start space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold">{vet.name}</h2>

          <p className="text-gray-700"><strong>Specialties:</strong> {vet.specialties.join(", ")}</p>
          <p className="text-gray-700"><strong>Organization:</strong> {vet.organization}</p>
          <p className="text-gray-700"><strong>Education:</strong> {vet.education}</p>
          <p className="text-gray-700"><strong>Experience:</strong> {vet.experienceYears} years</p>
          <p className="text-gray-700"><strong>Services Offered:</strong> {vet.servicesOffered.join(", ")}</p>
          <p className="text-gray-700"><strong>Consultation Fee:</strong> {vet.consultationFee} BDT</p>
          <p className="text-gray-700 flex items-center gap-2"><FaCalendarAlt /> <strong>Availability:</strong> {vet.availability}</p>
          <p className="text-gray-700"><strong>License Number:</strong> {vet.licenseNumber}</p>
          <p className="text-gray-700"><strong>Last Checkup:</strong> {vet.lastCheckup}</p>
          <p className="text-gray-700 flex items-center gap-2">
            <FaLink /> <strong>Health Record:</strong> 
            <a href={vet.healthRecordLink} target="_blank" className="text-blue-500 hover:underline ml-1">View Record</a>
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 mt-4">
            <a href={`tel:${vet.contact.phone}`} className="flex items-center gap-2 text-blue-500 hover:underline">
              <FaPhone /> {vet.contact.phone}
            </a>
            <a href={`mailto:${vet.contact.email}`} className="flex items-center gap-2 text-blue-500 hover:underline">
              <FaEnvelope /> {vet.contact.email}
            </a>
            <p className="text-gray-700"><strong>Address:</strong> {vet.contact.address}</p>
          </div>

          <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md w-fit transition-all duration-300 cursor-pointer mt-4">
            Book Appointment
          </button>
        </div>
      </div>

      {/* Reviews */}
      <section className="space-y-4">
        <h3 className="text-xl sm:text-2xl font-bold">Reviews ({vet.totalReviews})</h3>
        {vet.reviews.length > 0 ? (
          <div className="space-y-4">
            {vet.reviews.map((review, index) => (
              <div key={index} className="bg-white shadow rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{review.userName}</h4>
                  <div className="flex items-center gap-1 text-yellow-500">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <FaStar key={i} />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700">{review.comment}</p>
                <p className="text-gray-400 text-sm mt-1">{review.date}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No reviews yet.</p>
        )}
      </section>

      {/* Metadata */}
      <section className="bg-white shadow rounded-xl p-6 flex flex-col sm:flex-row gap-4 sm:gap-12 text-gray-700 text-sm sm:text-base">
        <p><strong>Created At:</strong> {vet.createdAt}</p>
        <p><strong>Last Updated:</strong> {vet.updatedAt}</p>
      </section>
    </div>
  );
}
