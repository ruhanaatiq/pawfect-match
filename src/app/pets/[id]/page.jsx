"use client";
import React, { useEffect, useState } from "react";

import Slider from "react-slick";
// import pets from "../../../../public/pets.json";
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
import UpdateHealthForm from "@/components/UpdateHealthRecords";
import Link from "next/link";

function NextArrow(props) {
  const { className, style, onClick } = props;
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

function PrevArrow(props) {
  const { className, style, onClick } = props;
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

export default function PetDetail() {
  // console.log(pets)
  // const { id } = React.use(params);
  // const pet1 = pets.filter((p) => p.id === parseInt(id));
  //   console.log(pet1)

  const { id } = useParams()
  const router = useRouter()
  const [pet, setPet] = useState(null)
  const [allPets, setAllPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (id) {
      fetchPetDetails()
      fetchAllPets()
    }
  }, [id])

  //one pet
  const fetchPetDetails = async () => {
    try {
      const response = await fetch(`/api/pets/${id}`)
      const result = await response.json()
      
      if (result.success) {
        setPet(result.data)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to fetch pet details')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  //all pets
  const fetchAllPets = async () => {
    try {
      const response = await fetch('/api/pets')
      const result = await response.json()
      
      if (result.success) {
        setAllPets(result.data)
      }
    } catch (err) {
      console.error('Error fetching all pets:', err)
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
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

   if (loading) return <div className="p-8">Loading pet details...</div>
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>
  if (!pet) return <div className="p-8">Pet not found</div>

    // Filter other pets (exclude current pet)
  const otherPets = allPets.filter(p => p.id !== pet._id)

  // console.log(otherPets.map(p => p.id))
  console.log(otherPets)
  // console.log(pet._id)

  return (
    <>
      <div className="my-10">
         <button 
        onClick={() => router.back()} 
        className="mb-4 px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer "
      >
        ← Back
      </button>
        <div className=" flex justify-center items-center mb-20">
          <div className="min-h-[450px] bg-white shadow-lg rounded-2xl overflow-hidden w-full max-w-6xl grid md:grid-cols-2 py-6 md:py-0">
            {/* Left: Image */}
            <div className="relative flex flex-col justify-center items-center md:items-start p-4 md:p-0 ">
              {pet.images ? (
                <Image
                  src={pet.images}
                  alt={pet.petName}
                  className=" object-cover h-[400] md:h-full rounded-2xl md:rounded-none"
                  width={380}
                  height={300}
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
                  {pet.petName}
                  <span className="absolute left-0 -bottom-1 w-full h-[3px] xl:h-1 bg-emerald-500 rounded-full"></span>
                </span>
              </h2>
              <div className="grid md:grid-cols-2 gap-y-2 mb-6 md:mb-8 text-gray-700 icons">
                <p className="flex items-center gap-2">
                  <FaPaw /> <strong>Species:</strong> {pet.species || 'Not specified'}
                </p>
                <p className="flex items-center gap-2">
                  <FaPalette /> <strong>Color:</strong> {pet.color || 'Not specified'}
                </p>
                <p className="flex items-center gap-2">
                  <FaVenusMars /> <strong>Gender:</strong> {pet.gender || 'Not specified'}
                </p>
                <p className="flex items-center gap-2">
                  <GiDogBowl /> <strong>Breed:</strong> {pet.breed}
                </p>
                <p className="flex items-center gap-2">
                  <FaNotesMedical /> <strong>Health:</strong> {pet.healthStatus || 'Good'}
                </p>
                <p className="flex items-center gap-2">
                  <FaSyringe title="Vaccination Info" />{" "}
                  <strong>Vaccinated:</strong> {pet.vaccinated || 'Yes'}
                </p>
                <p className="flex items-center gap-2">
                  <FaClock /> <strong>Age:</strong> {pet.petAge}
                </p>
                <p className="flex items-center gap-2">
                  <FaRulerCombined /> <strong>Size:</strong> {pet.size || 'Medium'}
                </p>
              </div>

              <div className="flex items-center text-sm text-gray-500 mb-4">
                <FaMapMarkerAlt className="mr-2 text-emerald-600" />
                {pet.location || 'Location not specified'}
              </div>

              <p className="text-gray-600 mb-4">{pet.longDescription}</p>

              {pet.status === 'Available' ? (

                 <Link
                 href={`/adopt/request/${pet._id}`}
                 className="bg-[#FFB22C] hover:bg-orange-400 text-white font-semibold px-6 py-2 rounded-lg shadow-md w-fit transition-all duration-300 inline-block"
                 >
                 Adopt Today →
                </Link>
                

              ) : (
                <div className="bg-yellow-500 px-6 py-2 rounded-lg w-fit">
                  <span className="text-white font-semibold">Already Adopted </span>
                </div>
              )}
            </div>
          </div>
        </div>
         

         {/* Health Records Section */}
<section className="my-10 md:mt-2 md:mb-26 max-w-5xl mx-auto">
  <h3 className="text-3xl font-bold mb-4 relative">Health Records</h3>
  <div className=" bg-white rounded-2xl shadow p-6 md:p-8 md:px-12 ">
    <table className="table-auto w-full text-left text-gray-700 text-sm md:text-base">
      <tbody className="divide-y divide-orange-100 ">
        <tr>
          <th className="py-2 pr-4 font-semibold">Health Condition</th>
          <td className="py-2">{pet.healthCondition || 'N/A'}</td>
        </tr>
        <tr>
          <th className="py-2 pr-4 font-semibold">Vaccination Status</th>
          <td className="py-2">{pet.vaccinationStatus || 'N/A'}</td>
        </tr>
        <tr>
          <th className="py-2 pr-4 font-semibold">Last Vet Checkup</th>
          <td className="py-2">{pet.vetDetails?.lastCheckup || 'N/A'}</td>
        </tr>
        <tr>
        <th className="py-2 pr-4 font-semibold">Temperament</th>
        <td className="py-2">{pet.temperament || 'N/A'}</td>
        </tr>
      </tbody>
    </table>
    {/* <UpdateHealthForm petId={pet._id} existing={pet}></UpdateHealthForm> */}
  </div>
</section>

        {/* Additional Info Table */}
        {(pet.shelterInfo || pet.vetDetails) && (
          <section className="my-10 md:mt-2 md:mb-26 max-w-5xl mx-auto">
            <h3 className="text-3xl font-bold mb-4 relative">
              Others Info
            </h3>
            <div className=" bg-white rounded-2xl shadow p-6 md:p-8 md:px-12 ">
              <table className="table-auto w-full text-left text-gray-700 text-sm md:text-base">
                <tbody className="divide-y divide-emerald-100 ">
                  {pet.shelterInfo?.name && (
                    <tr>
                      <th className="py-2 pr-4 font-semibold">Shelter Name</th>
                      <td className="py-2">{pet.shelterInfo.name}</td>
                    </tr>
                  )}
                  {pet.shelterInfo?.contactNumber && (
                    <tr>
                      <th className="py-2 pr-4 font-semibold">Shelter Contact</th>
                      <td className="py-2">{pet.shelterInfo.contactNumber}</td>
                    </tr>
                  )}
                  {pet.shelterInfo?.email && (
                    <tr>
                      <th className="py-2 pr-4 font-semibold">Shelter Email</th>
                      <td className="py-2">{pet.shelterInfo.email}</td>
                    </tr>
                  )}
                  {pet.vetDetails?.name && (
                    <tr>
                      <th className="py-2 pr-4 font-semibold">Vet Name</th>
                      <td className="py-2">{pet.vetDetails.name}</td>
                    </tr>
                  )}
                  {pet.vetDetails?.clinic && (
                    <tr>
                      <th className="py-2 pr-4 font-semibold">Vet Clinic</th>
                      <td className="py-2">{pet.vetDetails.clinic}</td>
                    </tr>
                  )}
                  {pet.vetDetails?.contact && (
                    <tr>
                      <th className="py-2 pr-4 font-semibold">Vet Contact</th>
                      <td className="py-2">{pet.vetDetails.contact}</td>
                    </tr>
                  )}
                  {pet.vetDetails?.lastCheckup && (
                    <tr>
                      <th className="py-2 pr-4 font-semibold">Last Checkup</th>
                      <td className="py-2">{pet.vetDetails.lastCheckup}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
        </div>

 {/* Available section */}
      {otherPets.length > 0 &&  (
        <div className="max-w-4xl mx-auto px-4 my-16 ">
          <div className="flex items-start">
            <span className="w-14 mt-2 h-[3px] bg-emerald-500 rounded-full"></span>
            <h3 className="text-lg font-bold mb-3"> Available Pets</h3>
          </div>
          <h2 className="text-3xl font-bold mb-8">More Pets For Adoption</h2>
          <div className="grid grid-cols-1 gap-6">
              <Slider {...settings}>
                {otherPets.map((pet) => (
                  <div key={pet.id} className="p-2">
                   {/* {pet.status === 'Available' && */}
                     <AvailablePetsCard pet={pet} />
                   {/* } */}
                  </div>
                ))}
              </Slider>
          </div>
        </div>
      )}
    </>
  );
}
