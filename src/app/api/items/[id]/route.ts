import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const patchSchema = z
  .object({
    quantity: z.number().int().nonnegative().optional(),
    delta: z.number().int().optional(),
    name: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    price: z.number().nonnegative().optional(),
    category: z.string().min(1).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: "At least one field must be provided",
  })
  .refine((d) => !(d.quantity !== undefined && d.delta !== undefined), {
    message: "Specify either quantity or delta, not both",
  });

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body: unknown = await request.json();
    const parsed = patchSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.item.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    
    if (parsed.data.name !== undefined) data.name = parsed.data.name;
    if (parsed.data.description !== undefined) data.description = parsed.data.description;
    if (parsed.data.price !== undefined) data.price = parsed.data.price;
    if (parsed.data.category !== undefined) data.category = parsed.data.category;

    if (parsed.data.quantity !== undefined) {
      data.quantity = parsed.data.quantity;
    } else if (parsed.data.delta !== undefined) {
      const nextQty = existing.quantity + parsed.data.delta;
      if (nextQty < 0) {
        return NextResponse.json(
          { error: "Quantity cannot be negative" },
          { status: 400 }
        );
      }
      data.quantity = nextQty;
    }

    const updated = await prisma.item.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    // confirm exists
    const existing = await prisma.item.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    await prisma.item.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}
