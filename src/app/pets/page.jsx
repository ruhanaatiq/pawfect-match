import React from 'react'
import pets from '../../../public/pets.json'
export default async function AllPets() {
  return (
    <div>
      <h1>All Pets :{pets.length} </h1>
    </div>
  )
}
