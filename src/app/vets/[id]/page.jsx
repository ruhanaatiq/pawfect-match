// src/app/vets/[id]/page.jsx
import { getCollection, collectionNamesObj } from "@/lib/dbConnect";
import VetDetailClient from "./VetDetailClient";
import { ObjectId } from "mongodb";

export default async function VetDetailPage({ params }) {
  const { id } = params;

  const vetCollection = await getCollection(collectionNamesObj.vetCollection);
  //const vet = await vetCollection.findOne({ _id: id }); // ⚠️ If your _id is ObjectId, convert below
  const vet = await vetCollection.findOne({ _id: new ObjectId(id) });


  if (!vet) {
    return <p className="text-center mt-10 text-gray-500">Vet not found.</p>;
  }

  return (
    <VetDetailClient vet={JSON.parse(JSON.stringify(vet))} />
  );
}
