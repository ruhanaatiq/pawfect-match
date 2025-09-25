'use client'
import React, { useState } from 'react'

export default function AddPet() {
  const [formData, setFormData] = useState({
    petName: '',
    species: '',
    breed: '',
    petAge: '',
    gender: '',
    size: '',
    color: '',
    petCategory: '',
    petLocation: '',
    vaccinationStatus: '',
    healthCondition: '',
    temperament: '',
    longDescription: '',
    adoptionFee: 0,
    images: '',
    shelterName: '',
    shelterContact: '',
    shelterEmail: '',
    vetName: '',
    vetClinic: '',
    vetContact: '',
    vetLastCheckup: ''
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const res = await fetch('/api/pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          adoptionFee: parseFloat(formData.adoptionFee)
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage('✅ Pet added successfully!')
        setFormData({
          petName: '',
          species: '',
          breed: '',
          petAge: '',
          gender: '',
          size: '',
          color: '',
          petCategory: '',
          petLocation: '',
          vaccinationStatus: '',
          healthCondition: '',
          temperament: '',
          longDescription: '',
          adoptionFee: 0,
          images: '',
          shelterName: '',
          shelterContact: '',
          shelterEmail: '',
          vetName: '',
          vetClinic: '',
          vetContact: '',
          vetLastCheckup: ''
        })
      } else {
        setMessage('❌ ' + (data.error || 'Failed to add pet'))
      }
    } catch (err) {
      setMessage('❌ Error: ' + err.message)
    }

    setLoading(false)
  }

  return (
    <div className="max-w-3xl mx-auto mt-24 mb-12 p-6 border rounded-xl shadow bg-white">
      <h2 className="text-2xl font-bold mb-4 text-center">Add Pet</h2>
      {message && <p className="mb-4 text-center text-green-600">{message}</p>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input name="petName" placeholder="Pet Name" value={formData.petName} onChange={handleChange} required className="border p-2 rounded col-span-2"/>
        <input name="species" placeholder="Species" value={formData.species} onChange={handleChange} required className="border p-2 rounded"/>
        <input name="breed" placeholder="Breed" value={formData.breed} onChange={handleChange} required className="border p-2 rounded"/>
        <input name="petAge" placeholder="Age" value={formData.petAge} onChange={handleChange} required className="border p-2 rounded"/>
        <input name="gender" placeholder="Gender" value={formData.gender} onChange={handleChange} required className="border p-2 rounded"/>
        <input name="size" placeholder="Size" value={formData.size} onChange={handleChange} required className="border p-2 rounded"/>
        <input name="color" placeholder="Color" value={formData.color} onChange={handleChange} required className="border p-2 rounded"/>
        <input name="petCategory" placeholder="Category (e.g. Puppy, Adult)" value={formData.petCategory} onChange={handleChange} required className="border p-2 rounded"/>
        <input name="petLocation" placeholder="Location (City, Area, Address)" value={formData.petLocation} onChange={handleChange} required className="border p-2 rounded col-span-2"/>
        <input name="vaccinationStatus" placeholder="Vaccination Status" value={formData.vaccinationStatus} onChange={handleChange} required className="border p-2 rounded"/>
        <input name="healthCondition" placeholder="Health Condition" value={formData.healthCondition} onChange={handleChange} required className="border p-2 rounded"/>
        <input name="temperament" placeholder="Temperament" value={formData.temperament} onChange={handleChange} required className="border p-2 rounded col-span-2"/>
        <textarea name="longDescription" placeholder="Long Description" value={formData.longDescription} onChange={handleChange} rows={3} className="border p-2 rounded col-span-2"/>
       {/* <input type="number" name="adoptionFee" placeholder="Adoption Fee" value={formData.adoptionFee} onChange={handleChange} className="border p-2 rounded"/> */}
       <div className="col-span-2 flex flex-col">
  <label htmlFor="adoptionFee" className="mb-1 font-medium">Adoption Fee</label>
  <input
    type="number"
    id="adoptionFee"
    name="adoptionFee"
    placeholder="Enter adoption fee"
    value={formData.adoptionFee}
    onChange={handleChange}
    className="border p-2 rounded"
  />
</div>


        <input name="images" placeholder="Image URL" value={formData.images} onChange={handleChange} required className="border p-2 rounded col-span-2"/>
        <input name="shelterName" placeholder="Shelter Name" value={formData.shelterName} onChange={handleChange} required className="border p-2 rounded"/>
        <input name="shelterContact" placeholder="Shelter Contact Number" value={formData.shelterContact} onChange={handleChange} required className="border p-2 rounded"/>
        <input name="shelterEmail" placeholder="Shelter Email" value={formData.shelterEmail} onChange={handleChange} required className="border p-2 rounded"/>
        <input name="vetName" placeholder="Vet Name" value={formData.vetName} onChange={handleChange} className="border p-2 rounded"/>
        <input name="vetClinic" placeholder="Vet Clinic" value={formData.vetClinic} onChange={handleChange} className="border p-2 rounded"/>
        <input name="vetContact" placeholder="Vet Contact" value={formData.vetContact} onChange={handleChange} className="border p-2 rounded"/>
        <input name="vetLastCheckup" placeholder="Last Vet Checkup Date" value={formData.vetLastCheckup} onChange={handleChange} className="border p-2 rounded"/>
        <button type="submit" disabled={loading} className="col-span-2 bg-emerald-500 text-white py-2 px-4 rounded hover:bg-emerald-600 transition">
          {loading ? 'Adding...' : 'Add Pet'}
        </button>
      </form>
    </div>
  )
}
