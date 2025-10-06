"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FaArrowRight } from "react-icons/fa";

const FALLBACK = "/pet-placeholder.jpg"; 

const AvailablePetsCard = ({ pet }) => {
  const {
    image,
    name,
    age,
    temperament,
    description,
    breed,
    id,
  } = pet;

  // choose either the pet image or fallback
  const src = image && image.trim() !== "" ? image : FALLBACK;

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-emerald-100 duration-500 overflow-hidden hover:shadow-lg transition flex flex-col h-[440px]">
      {/* Image */}
      <div className="relative">
        <Image
          src={src}
          alt={name || "Pet"}
          className="w-full h-64 object-cover hover:scale-105 transition-all duration-500"
          width={600}
          height={300}
          unoptimized
        />
        {age && (
          <span className="absolute top-2 right-2 bg-emerald-600 text-white text-xs font-semibold px-2 py-1 rounded-full ">
            {age}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-xl font-bold">{name}</h3>
        <p className="text-emerald-600 text-sm font-medium">{breed}</p>

        <p className="text-gray-600 text-sm mt-2 flex-1">
          {temperament ||
            (description && description.length > 90
              ? description.slice(0, 90) + "..."
              : description) ||
            "A lovely pet looking for a home!"}
        </p>

        <div className="flex justify-end items-end">
          <Link
            href={`/pets/${id}`}
            className="mt-4 inline-flex items-center bg-emerald-600 text-white px-4 py-1 sm:py-2 rounded-full text-sm font-medium hover:bg-emerald-500 transition cursor-pointer"
          >
            Learn More <FaArrowRight className="ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AvailablePetsCard;
