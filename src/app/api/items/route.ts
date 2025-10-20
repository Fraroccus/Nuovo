import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shelfId = searchParams.get("shelfId") ?? undefined;
    const category = searchParams.get("category") ?? undefined;

    const where: Prisma.ItemWhereInput = {};
    if (shelfId) where.shelfId = shelfId;
    if (category && category.trim() !== "") where.category = category;

    const items = await prisma.item.findMany({
      where,
      include: {
        shelf: { include: { warehouse: true } },
      },
      orderBy: { name: "asc" },
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

const createSchema = z.object({
  shelfId: z.string().min(1),
  name: z.string().min(1),
  sku: z.string().min(1),
  category: z.string().min(1),
  description: z.string().optional(),
  quantity: z.number().int().min(0).optional(),
  price: z.number().min(0).optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = createSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const created = await prisma.$transaction(async (tx) => {
      const shelf = await tx.shelf.findUnique({
        where: { id: parsed.data.shelfId },
      });
      if (!shelf) {
        throw new Error("SHELF_NOT_FOUND");
      }
      return tx.item.create({
        data: {
          shelfId: parsed.data.shelfId,
          name: parsed.data.name,
          sku: parsed.data.sku,
          category: parsed.data.category,
          description: parsed.data.description ?? null,
          quantity: parsed.data.quantity ?? 0,
          price: parsed.data.price ?? 0,
        },
      });
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "SHELF_NOT_FOUND") {
      return NextResponse.json(
        { error: "Shelf not found" },
        { status: 404 }
      );
    }
    console.error("Error creating item:", error);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}
