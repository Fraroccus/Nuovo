import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

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

const patchSchema = z
  .object({
    positionX: z.number().int().optional(),
    positionY: z.number().int().optional(),
    positionZ: z.number().int().optional(),
    width: z.number().int().positive().optional(),
    depth: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.shelf.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Shelf not found" }, { status: 404 });
    }

    // Prevent invalid dimensions at the API level as an extra guard
    const MIN_DIM = 1;
    const width = parsed.data.width ?? existing.width;
    const depth = parsed.data.depth ?? existing.depth;
    const height = parsed.data.height ?? existing.height;
    if (width < MIN_DIM || depth < MIN_DIM || height < MIN_DIM) {
      return NextResponse.json(
        { error: "Dimensions must be at least 1 unit" },
        { status: 400 }
      );
    }

    const updated = await prisma.shelf.update({
      where: { id },
      data: {
        positionX: parsed.data.positionX ?? existing.positionX,
        positionY: parsed.data.positionY ?? existing.positionY,
        positionZ: parsed.data.positionZ ?? existing.positionZ,
        width,
        depth,
        height,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating shelf:", error);
    return NextResponse.json(
      { error: "Failed to update shelf" },
      { status: 500 }
    );
  }
}
