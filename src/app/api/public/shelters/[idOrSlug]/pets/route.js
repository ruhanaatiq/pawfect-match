// src/app/api/public/shelters/[idOrSlug]/pets/route.js
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

export async function GET(req, { params }) {
  try {
    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page") || 1));
    const species = url.searchParams.get("species") || "";
    const vaccinated = url.searchParams.get("vaccinated") || "";
    const adoptable = url.searchParams.get("adoptable");

    const shelters = await getCollection("shelters");
    const pets = await getCollection("pets");

    // Resolve shelter id from idOrSlug
    const key = params.idOrSlug;
    let shelter = null;
    if (ObjectId.isValid(key)) {
      shelter = await shelters.findOne({ _id: new ObjectId(key) });
      if (!shelter) shelter = await shelters.findOne({ slug: key });
    } else {
      shelter = await shelters.findOne({ slug: key });
    }
    if (!shelter) return NextResponse.json({ items: [], total: 0, page, pageSize: 12 });

    const pageSize = 12;
    const query = { shelterId: String(shelter._id) };
    if (species) query.species = species;
    if (vaccinated === "true") query.vaccinated = true;
    if (vaccinated === "false") query.vaccinated = false;
    if (adoptable) query.status = { $in: ["available", "adoptable"] };

    const [items, total] = await Promise.all([
      pets.find(query).sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).toArray(),
      pets.countDocuments(query),
    ]);

    // normalize cover fields a bit
    const shape = (doc) => ({
      ...doc,
      _id: String(doc._id),
      images: Array.isArray(doc.images) ? doc.images : (doc.images ? [doc.images] : (doc.photos || [])),
    });

    return NextResponse.json({ items: items.map(shape), total, page, pageSize });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
