import { getCollection, collectionNamesObj } from "@/lib/dbConnect";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) return new Response(JSON.stringify([]));

  const appointmentCollection = await getCollection(
    collectionNamesObj.appointmentCollection
  );
  const appointments = await appointmentCollection
    .find({ user_email: email })
    .toArray();

  return new Response(JSON.stringify(appointments));
}
