import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FaArrowRight } from "react-icons/fa";

const AvailablePetsCard = ({pet}) => {
  // console.log(pet)
  const {images, petName, petAge, temperament, longDescription, breed, _id} = pet
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-orange-100 duration-500 overflow-hidden hover:shadow-lg transition flex flex-col h-[440px]">
      {/* Image  */}
      <div className="relative">
        <Image
          src={images}
          alt={petName}
          className="w-full h-64 object-cover hover:scale-105 transition-all duration-500"
          width={600}
          height={300}
        />
        <span className="absolute top-2 right-2 bg-orange-400 text-white text-xs font-semibold px-2 py-1 rounded-full ">
          {petAge}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-xl font-bold">{pet.petName}</h3>
         
        {/* Breed info */}
        <p className="text-orange-500 text-sm font-medium">{breed}</p>
         {/* Description */}
        <p className="text-gray-600 text-sm mt-2 flex-1 ">
          {temperament || (longDescription && longDescription.length > 90 
            ? longDescription.slice(0, 90) + '...' 
            : longDescription) || 'A lovely pet looking for a home!'}
        </p>

        <div className=" flex justify-end items-end">
          <Link href={`/pets/${_id}`} className="mt-4 inline-flex items-center bg-orange-400 text-white px-4 py-1 sm:py-2 rounded-full text-sm font-medium hover:bg-[#FFB22C] transition cursor-pointer">
          Learn More <FaArrowRight className="ml-2" />
        </Link>
        </div>
      </div>
    </div>
  );
};

export default AvailablePetsCard;
