import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const warehouses = await prisma.warehouse.findMany({
      include: {
        _count: {
          select: { shelves: true },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
    return NextResponse.json(warehouses);
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    return NextResponse.json(
      { error: "Failed to fetch warehouses" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const warehouse = await prisma.warehouse.create({
      data: body,
    });
    return NextResponse.json(warehouse, { status: 201 });
  } catch (error) {
    console.error("Error creating warehouse:", error);
    return NextResponse.json(
      { error: "Failed to create warehouse" },
      { status: 500 }
    );
  }
}
