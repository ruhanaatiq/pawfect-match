"use client";
import React from "react";
import Image from "next/image";
import pets from "../../../../public/pets.json";
import { FaSyringe, FaMapMarkerAlt } from 'react-icons/fa';
import { GiDogBowl } from 'react-icons/gi';

export default function PetDetail({ params }){
    // console.log(pets)
    const {id} = React.use(params);
  const pet1 = pets.filter(p => p.id === parseInt(id));
  console.log(pet1)
    return (
       <>
       {
        pet1.map(pet =>(
               <div key={pet.id} className=" min-h-screen flex justify-center items-center">
      <div className="bg-white shadow-lg rounded-2xl overflow-hidden w-full max-w-5xl grid md:grid-cols-2">
        {/* Left: Image */}
        <div className="relative flex flex-col justify-center items-center md:items-start p-4 md:p-0 ">
          <Image
            src={pet.images}
            alt={pet.petName}
            className=" object-cover h-[300] md:h-full rounded-2xl md:rounded-none"
            width={300}
            height={300}
          />
        </div>

        {/* Right: Details */}
        <div className="p-6 flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-4">
            Meet <span className="relative">{pet.petName}
                 <span className="absolute left-0 -bottom-1 w-full h-[3px] bg-[#FFB22C] rounded-full"></span>
            </span>
          </h2>
          <div className="grid grid-cols-2 gap-y-2 mb-4 text-gray-700">
            <p><strong>Gender:</strong> {pet.gender}</p>
            <p><strong>Breed:</strong> {pet.breed}</p>
            <p><strong>Neutered:</strong> {pet.healthCondition.includes('Neutered') ? 'Yes' : 'No'}</p>
            <p><strong>Vaccinated:</strong> {pet.vaccinationStatus}</p>
            <p><strong>Age:</strong> {pet.petAge}</p>
            <p><strong>Size:</strong> {pet.size}</p>
          </div>

          <div className="flex items-center text-sm text-gray-500 mb-4">
            <FaMapMarkerAlt className="mr-2 text-orange-500" />
            {pet.petLocation?.address}, {pet.petLocation.city}
          </div>

          <p className="text-gray-600 mb-4">{pet.longDescription}</p>

          <button className="bg-[#FFB22C] hover:bg-[#FA812F] text-white font-semibold px-6 py-2 rounded-lg shadow-md w-fit transition-all duration-300 cursor-pointer">
            Adopt Today →
          </button>

          {/* Optional Icons */}
          <div className="flex space-x-4 mt-5 text-gray-400">
            {/* <FaSyringe title="Vaccination Info" className="text-xl" />
            <GiDogBowl title="Pet Care Info" className="text-xl" /> */}
          </div>
        </div>
      </div>
    </div>
        )
        )
       }
       </>
    );
};
 