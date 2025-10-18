import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shelfId = searchParams.get("shelfId");
    const category = searchParams.get("category");

    import type { Prisma } from '@prisma/client';

const where: Prisma.ItemWhereInput = {};
if (shelfId) where.shelfId = shelfId;
if (category) where.category = category;

const items = await prisma.item.findMany({
where,
include: {
shelf: { include: { warehouse: true } },
},
orderBy: { name: 'asc' },
});

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}
