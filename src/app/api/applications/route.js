import { NextResponse } from "next/server";
   
import { getServerSession } from "next-auth"; 


// ✅ GET user applications
export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apps = await prisma.applications.findMany({
    where: { user_id: session.user.id },
    include: { pet: true }, // include pet details
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(apps);
}

// ✅ POST new application
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { pet_id, document } = await req.json();

  const newApp = await prisma.applications.create({
    data: {
      user_id: session.user.id,
      pet_id,
      status: "pending", // default status
      document: document || null, // save uploaded doc link
      createdAt: new Date(),
    },
  });

  return NextResponse.json(newApp, { status: 201 });
}
