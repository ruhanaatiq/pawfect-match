"use client";

import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import {
  FaPaw,
  FaPalette,
  FaVenusMars,
  FaNotesMedical,
  FaSyringe,
  FaClock,
  FaRulerCombined,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { GiDogBowl } from "react-icons/gi";
import AvailablePetsCard from "@/components/AvailablePetsCard";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

/* ---------- Slider arrows ---------- */
function NextArrow({ className, style, onClick }) {
  return (
    <div
      className={className}
      style={{
        ...style,
        display: "block",
        background: "#00bc7d",
        borderRadius: "50%",
        right: "-25px",
        zIndex: 1,
      }}
      onClick={onClick}
    />
  );
}
function PrevArrow({ className, style, onClick }) {
  return (
    <div
      className={className}
      style={{
        ...style,
        display: "block",
        background: "#00bc7d",
        borderRadius: "50%",
        left: "-25px",
        zIndex: 1,
      }}
      onClick={onClick}
    />
  );
}

/* ---------- helpers to normalize API shapes safely ---------- */
function normalizeOne(raw) {
  if (!raw) return null;

  const id = raw.id || raw._id || null;

  // images → array + cover
  const imagesArr = Array.isArray(raw.images)
    ? raw.images.filter(Boolean)
    : raw.images
    ? [raw.images]
    : [];
  const cover = imagesArr[0] || raw.image || "/placeholder-pet.jpg";

  // location (stringify for display)
  const loc = raw.petLocation || raw.location || null;
  const locationLine =
    loc && typeof loc === "object"
      ? [loc.address, loc.area, loc.city].filter(Boolean).join(", ")
      : typeof loc === "string"
      ? loc
      : "";

  const statusVal = raw.status == null ? "" : String(raw.status).toLowerCase();

  return {
    id,
    petName: raw.petName || raw.name || "Friend",
    species: raw.species || raw.petCategory || "",
    breed: raw.breed || raw.petBreed || "",
    petAge: raw.petAge ?? raw.age ?? "",
    gender: raw.gender || "",
    size: raw.size || "",
    images: imagesArr,
    coverImage: cover,
    color: raw.color || "",
    // NEW/ENSURED fields:
    temperament: raw.temperament || "",
    healthStatus: raw.healthStatus || "",
    vaccinated: raw.vaccinated ?? null,
    lastCheckup: raw.lastCheckup ?? raw?.vetDetails?.lastCheckup ?? "",
    longDescription: raw.longDescription || raw.description || "",
    status: statusVal,
    petLocation: loc,
    petLocationLine: locationLine,
    shelterInfo: raw.shelterInfo || null,
    vetDetails: raw.vetDetails || null,
  };
}

export default function PetDetail() {
  const { id } = useParams();
  const router = useRouter();

  const [pet, setPet] = useState(null);
  const [allPets, setAllPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        setError("");
        await Promise.all([fetchPetDetails(id), fetchAllPets()]);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function fetchPetDetails(petId) {
    try {
      const res = await fetch(`/api/pets/${petId}`, { cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json?.error || `Failed to load (${res.status})`);
        return;
      }

      // Read { item } first, then fallbacks
      const raw = json?.item ?? json?.data ?? json?.pet ?? null;
      const normalized = normalizeOne(raw);

      if (!normalized?.id) {
        setError("Pet not found");
        return;
      }
      setPet(normalized);
    } catch (e) {
      console.error(e);
      setError("Failed to fetch pet details");
    }
  }

  async function fetchAllPets() {
    try {
      // show other available pets
      const res = await fetch("/api/pets?status=available", { cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) return;

      const arr = json?.data || json?.items || json;
      const list = Array.isArray(arr)
        ? arr.map(normalizeOne).filter(Boolean)
        : [];
      setAllPets(list);
    } catch (e) {
      console.error("Error fetching all pets:", e);
    }
  }

  const settings = {
    dots: false,
    infinite: true,
    speed: 800,
    slidesToShow: 3,
    slidesToScroll: 3,
    arrows: true,
    adaptiveHeight: false,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2, slidesToScroll: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
  };

  if (loading) return <div className="p-8">Loading pet details...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
  if (!pet) return <div className="p-8">Pet not found</div>;

  // Exclude current pet — use normalized id on both sides
  const otherPets = allPets.filter((p) => p?.id && p.id !== pet.id);

  const safeText = (v, fallback = "—") =>
    v == null ? fallback : typeof v === "object" ? fallback : String(v).trim() || fallback;

  return (
    <>
      <div className="my-10">
        <button
          onClick={() => router.back()}
          className="mb-4 px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer "
        >
          ← Back
        </button>

        <div className="flex justify-center items-center mb-20">
          <div className="min-h-[450px] bg-white shadow-lg rounded-2xl overflow-hidden w-full max-w-6xl grid md:grid-cols-2 py-6 md:py-0">
            {/* Left: Image */}
            <div className="relative flex flex-col justify-center items-center md:items-start p-4 md:p-0 ">
              {pet.coverImage ? (
                <Image
                  src={pet.coverImage}
                  alt={pet.petName || "Pet"}
                  className="object-cover h-[400px] md:h-full md:max-h-[520px] rounded-2xl md:rounded-none"
                  width={480}
                  height={360}
                  unoptimized
                />
              ) : (
                <div className="w-[380px] h-[300px] bg-gray-200 rounded-2xl md:rounded-none flex items-center justify-center">
                  <span className="text-gray-500">No Image Available</span>
                </div>
              )}
            </div>

            {/* Right: Details */}
            <div className="p-6 flex flex-col justify-center">
              <h2 className="text-3xl font-bold mb-6 md:mb-8">
                Meet{" "}
                <span className="relative">
                  {safeText(pet.petName, "Friend")}
                  <span className="absolute left-0 -bottom-1 w-full h-[3px] xl:h-1 bg-emerald-500 rounded-full" />
                </span>
              </h2>

              <div className="grid md:grid-cols-2 gap-y-2 mb-6 md:mb-8 text-gray-700">
                <p className="flex items-center gap-2"><FaPaw /> <strong>Species:</strong> {safeText(pet.species, "Not specified")}</p>
                <p className="flex items-center gap-2"><FaPalette /> <strong>Color:</strong> {safeText(pet.color, "Not specified")}</p>
                <p className="flex items-center gap-2"><FaVenusMars /> <strong>Gender:</strong> {safeText(pet.gender, "Not specified")}</p>
                <p className="flex items-center gap-2"><GiDogBowl /> <strong>Breed:</strong> {safeText(pet.breed, "Not specified")}</p>

                {/* NEW lines */}
                <p className="flex items-center gap-2"><FaNotesMedical /> <strong>Health:</strong> {safeText(pet.healthStatus, "Good")}</p>
                <p className="flex items-center gap-2"><FaPaw /> <strong>Temperament:</strong> {safeText(pet.temperament, "Friendly")}</p>

                <p className="flex items-center gap-2">
                  <FaSyringe title="Vaccination Info" /> <strong>Vaccinated:</strong>{" "}
                  {pet.vaccinated === null ? "—" : pet.vaccinated ? "Yes" : "No"}
                </p>
                <p className="flex items-center gap-2"><FaClock /> <strong>Last Checkup:</strong> {safeText(pet.lastCheckup, "Not available")}</p>

                <p className="flex items-center gap-2"><FaClock /> <strong>Age:</strong> {safeText(pet.petAge, "—")}</p>
                <p className="flex items-center gap-2"><FaRulerCombined /> <strong>Size:</strong> {safeText(pet.size, "Medium")}</p>
              </div>

              <div className="flex items-center text-sm text-gray-500 mb-4">
                <FaMapMarkerAlt className="mr-2 text-emerald-600" />
                {pet.petLocationLine || "Location not specified"}
              </div>

              <p className="text-gray-600 mb-4">
                {safeText(pet.longDescription, "—")}
              </p>

              {pet.status === "available" ? (
                <Link
                  href={`/adopt/request/${pet.id}`}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2 rounded-lg shadow-md w-fit transition-all duration-300 cursor-pointer"
                >
                  Adopt Today →
                </Link>
              ) : (
                <div className="bg-yellow-500 px-6 py-2 rounded-lg w-fit">
                  <span className="text-white font-semibold">Already Adopted</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Info Table */}
        {(pet.shelterInfo || pet.vetDetails) && (
          <section className="my-10 md:mt-2 md:mb-26 max-w-5xl mx-auto">
            <h3 className="text-3xl font-bold mb-4 relative">Others Info</h3>
            <div className="bg-white rounded-2xl shadow p-6 md:p-8 md:px-12">
              <table className="table-auto w-full text-left text-gray-700 text-sm md:text-base">
                <tbody className="divide-y divide-emerald-100">
                  {pet.shelterInfo?.name && (
                    <tr>
                      <th className="py-2 pr-4 font-semibold">Shelter Name</th>
                      <td className="py-2">{safeText(pet.shelterInfo.name)}</td>
                    </tr>
                  )}
                  {pet.shelterInfo?.contactNumber && (
                    <tr>
                      <th className="py-2 pr-4 font-semibold">Shelter Contact</th>
                      <td className="py-2">{safeText(pet.shelterInfo.contactNumber)}</td>
                    </tr>
                  )}
                  {pet.shelterInfo?.email && (
                    <tr>
                      <th className="py-2 pr-4 font-semibold">Shelter Email</th>
                      <td className="py-2">{safeText(pet.shelterInfo.email)}</td>
                    </tr>
                  )}
                  {pet.vetDetails?.name && (
                    <tr>
                      <th className="py-2 pr-4 font-semibold">Vet Name</th>
                      <td className="py-2">{safeText(pet.vetDetails.name)}</td>
                    </tr>
                  )}
                  {pet.vetDetails?.clinic && (
                    <tr>
                      <th className="py-2 pr-4 font-semibold">Vet Clinic</th>
                      <td className="py-2">{safeText(pet.vetDetails.clinic)}</td>
                    </tr>
                  )}
                  {pet.vetDetails?.contact && (
                    <tr>
                      <th className="py-2 pr-4 font-semibold">Vet Contact</th>
                      <td className="py-2">{safeText(pet.vetDetails.contact)}</td>
                    </tr>
                  )}
                  {pet.vetDetails?.lastCheckup && (
                    <tr>
                      <th className="py-2 pr-4 font-semibold">Last Checkup</th>
                      <td className="py-2">{safeText(pet.vetDetails.lastCheckup)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      {/* Available section */}
      {otherPets.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 my-16">
          <div className="flex items-start">
            <span className="w-14 mt-2 h-[3px] bg-emerald-500 rounded-full" />
            <h3 className="text-lg font-bold mb-3"> Available Pets</h3>
          </div>
          <h2 className="text-3xl font-bold mb-8">More Pets For Adoption</h2>
          <div className="grid grid-cols-1 gap-6">
            <Slider {...settings}>
              {otherPets.map((p) => (
                <div key={p.id} className="p-2">
                  <AvailablePetsCard pet={p} />
                </div>
              ))}
            </Slider>
          </div>
        </div>
      )}
    </>
  );
}
