// src/app/vets/page.jsx
import { collectionNamesObj, getCollection } from "@/lib/dbConnect";
import VetsClient from "./VetsClient";

export default async function VetsPage() {
  const vetCollection = await getCollection(collectionNamesObj.vetCollection);
  const vets = await vetCollection.find({}).toArray();

  return <VetsClient vets={JSON.parse(JSON.stringify(vets))} />;
}
