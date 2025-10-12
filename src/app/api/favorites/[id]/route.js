import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 
import { getServerSession } from "next-auth"; 

// DELETE favorite
export async function DELETE(req, { params }) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const fav = await prisma.favorites.findUnique({
    where: { id: parseInt(params.id) },
  });

  if (!fav || fav.user_id !== session.user.id) {
    return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });
  }

  await prisma.favorites.delete({ where: { id: fav.id } });

  return NextResponse.json({ success: true });
}
