import { getCollection } from "@/lib/dbConnect";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const vetId = searchParams.get("vetId");
  const userEmail = searchParams.get("userEmail");

  if (!vetId || !userEmail) {
    return Response.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    const bookingCollection = await getCollection("bookings");
    const existing = await bookingCollection.findOne({ vetId, userEmail });

    return Response.json({ alreadyBooked: !!existing });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Error checking booking" }, { status: 500 });
  }
}
