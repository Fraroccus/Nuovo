import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const shelf = await prisma.shelf.findUnique({
      where: { id },
      include: {
        items: true,
        warehouse: true,
      },
    });

    if (!shelf) {
      return NextResponse.json({ error: "Shelf not found" }, { status: 404 });
    }

    return NextResponse.json(shelf);
  } catch (error) {
    console.error("Error fetching shelf:", error);
    return NextResponse.json(
      { error: "Failed to fetch shelf" },
      { status: 500 }
    );
  }
}
