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
    x: z.number().int().min(0).optional(),
    y: z.number().int().min(0).optional(),
    width: z.number().int().positive().optional(),
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
    const json = await request.json();
    const parsed = patchSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.shelf.findUnique({ where: { id } });
      if (!existing) {
        throw new Error("NOT_FOUND");
      }
      return tx.shelf.update({
        where: { id },
        data: parsed.data,
      });
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Shelf not found" }, { status: 404 });
    }
    console.error("Error updating shelf:", error);
    return NextResponse.json(
      { error: "Failed to update shelf" },
      { status: 500 }
    );
  }
}
