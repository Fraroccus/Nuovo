import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  width: z.number().int().positive().optional(),
  length: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  gridSize: z.number().int().positive().optional(),
});

const DEFAULTS = {
  width: 10,
  length: 10,
  height: 5,
  gridSize: 1,
};

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
    const json = await request.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = {
      name: parsed.data.name,
      width: parsed.data.width ?? DEFAULTS.width,
      length: parsed.data.length ?? DEFAULTS.length,
      height: parsed.data.height ?? DEFAULTS.height,
      gridSize: parsed.data.gridSize ?? DEFAULTS.gridSize,
    };

    const warehouse = await prisma.warehouse.create({
      data,
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
