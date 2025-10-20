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
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  description: z.string().optional().nullable(),
  quantity: z.number().int().nonnegative(),
  price: z.number().nonnegative(),
  category: z.string().min(1, "Category is required"),
  shelfId: z.string().min(1, "shelfId is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Ensure shelf exists
    const shelf = await prisma.shelf.findUnique({ where: { id: parsed.data.shelfId } });
    if (!shelf) {
      return NextResponse.json({ error: "Shelf not found" }, { status: 404 });
    }

    const created = await prisma.item.create({
      data: {
        name: parsed.data.name,
        sku: parsed.data.sku,
        description: parsed.data.description ?? null,
        quantity: parsed.data.quantity,
        price: parsed.data.price,
        category: parsed.data.category,
        shelfId: parsed.data.shelfId,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}
