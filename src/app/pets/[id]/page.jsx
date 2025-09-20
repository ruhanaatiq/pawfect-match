"use client";
import React from "react";
import Image from "next/image";
import Slider from "react-slick";
import pets from "../../../../public/pets.json";
// import { FaSyringe} from "react-icons/fa";
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

function NextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{
        ...style,
        display: "block",
        background: "#FFB22C",
        borderRadius: "50%",
        right: "-25px",
        zIndex: 1,
      }}
      onClick={onClick}
    />
  );
}

function PrevArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{
        ...style,
        display: "block",
        background: "#FFB22C",
        borderRadius: "50%",
        left: "-25px",
        zIndex: 1,
      }}
      onClick={onClick}
    />
  );
}

export default function PetDetail({ params }) {
  // console.log(pets)
  const { id } = React.use(params);
  const pet1 = pets.filter((p) => p.id === parseInt(id));
  //   console.log(pet1)
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    adaptiveHeight: false,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };
  return (
    <>
      {/* details card */}
      {pet1.map((pet) => (
        <div key={pet.id} className="">
          <div className=" flex justify-center items-center my-14 md:my-20 ">
            <div className="min-h-[450px] bg-white shadow-lg rounded-2xl overflow-hidden w-full max-w-6xl grid md:grid-cols-2 py-6 md:py-0">
              {/* Left: Image */}
              <div className="relative flex flex-col justify-center items-center md:items-start p-4 md:p-0 ">
                <Image
                  src={pet.images}
                  alt={pet.petName}
                  className=" object-cover h-[400] md:h-full rounded-2xl md:rounded-none"
                  width={380}
                  height={300}
                />
              </div>

              {/* Right: Details */}
              <div className="p-6 flex flex-col justify-center">
                <h2 className="text-3xl font-bold mb-6 md:mb-8">
                  Meet{" "}
                  <span className="relative">
                    {pet.petName}
                    <span className="absolute left-0 -bottom-1 w-full h-[3px] bg-[#fccc49] rounded-full"></span>
                  </span>
                </h2>
                <div className="grid md:grid-cols-2 gap-y-2 mb-6 md:mb-8 text-gray-700 icons">
                  <p className="flex items-center gap-2">
                    <FaPaw /> <strong>Species:</strong> {pet.species}
                  </p>
                  <p className="flex items-center gap-2">
                    <FaPalette /> <strong>Color:</strong> {pet.color}
                  </p>
                  <p className="flex items-center gap-2">
                    <FaVenusMars /> <strong>Gender:</strong> {pet.gender}
                  </p>
                  <p className="flex items-center gap-2">
                    <GiDogBowl /> <strong>Breed:</strong> {pet.breed}
                  </p>
                  <p className="flex items-center gap-2">
                    <FaNotesMedical /> <strong>Neutered:</strong>{" "}
                    {pet.healthCondition.includes("Neutered") ? "Yes" : "No"}
                  </p>
                  <p className="flex items-center gap-2">
                    <FaSyringe title="Vaccination Info" />{" "}
                    <strong>Vaccinated:</strong> {pet.vaccinationStatus}
                  </p>
                  <p className="flex items-center gap-2">
                    <FaClock /> <strong>Age:</strong> {pet.petAge}
                  </p>
                  <p className="flex items-center gap-2">
                    <FaRulerCombined /> <strong>Size:</strong> {pet.size}
                  </p>
                </div>

                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <FaMapMarkerAlt className="mr-2 text-[#FFB22C]" />
                  {pet.petLocation?.address}
                </div>

                <p className="text-gray-600 mb-4">{pet.longDescription}</p>

                <button className="bg-[#FFB22C] hover:bg-orange-400 text-white font-semibold px-6 py-2 rounded-lg shadow-md w-fit transition-all duration-300 cursor-pointer">
                  Adopt Today →
                </button>
              </div>
            </div>
          </div>
          {/* table */}
          <section className="my-10 md:mt-2 md:mb-26  max-w-5xl mx-auto">
            <h3 className="text-3xl font-bold mb-4 relative">

              Others Info
            </h3>
            <div className=" bg-white rounded-2xl shadow p-6 md:p-8 md:px-12 ">
              <table className="table-auto w-full text-left text-gray-700 text-sm md:text-base">
                <tbody className="divide-y divide-orange-100 ">
                  <tr>
                    <th className="py-2 pr-4 font-semibold">Shelter Name</th>
                    <td className="py-2">{pet.shelterInfo.name}</td>
                  </tr>
                  <tr>
                    <th className="py-2 pr-4 font-semibold">
                      Shelter Contact Number
                    </th>
                    <td className="py-2">
                      <br />
                      {pet.shelterInfo.contactNumber}
                    </td>
                  </tr>
                  <tr>
                    <th className="py-2 pr-4 font-semibold">Shelter Email</th>
                    <td className="py-2">
                      <br />
                      {pet.shelterInfo.email}
                    </td>
                  </tr>
                  <tr>
                    <th className="py-2 pr-4 font-semibold">Vet Name</th>
                    <td className="py-2"> {pet.vetDetails.name}</td>
                  </tr>
                  <tr>
                    <th className="py-2 pr-4 font-semibold">Vet Clinic</th>
                    <td className="py-2">{pet.vetDetails.clinic}</td>
                  </tr>
                  <tr>
                    <th className="py-2 pr-4 font-semibold">
                      Vet Contact Number
                    </th>
                    <td className="py-2">{pet.vetDetails.contact}</td>
                  </tr>
                  <tr>
                    <th className="py-2 pr-4 font-semibold">Last Checkup</th>
                    <td className="py-2">{pet.vetDetails.lastCheckup}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ))}

      {/* //Available section */}
      <div className="max-w-4xl mx-auto px-4 my-16 ">
        <div className="flex items-start">
          <span className="w-14 mt-2 h-[3px] bg-[#fccc49] rounded-full"></span>
          <h3 className="text-lg font-bold mb-3"> Available Pets</h3>
        </div>
        <h2 className="text-3xl font-bold mb-8">More Pets For Adoption</h2>
        <div className="grid grid-cols-1 gap-6">
          <div className="">
            <Slider {...settings}>
              {pets
                .filter((p) => p.id !== parseInt(id))
                .map((pet) => (
                  <div key={pet.id} className="p-2">
                    <AvailablePetsCard pet={pet} />
                  </div>
                ))}
            </Slider>
          </div>
        </div>
      </div>
    </>
  );
}
