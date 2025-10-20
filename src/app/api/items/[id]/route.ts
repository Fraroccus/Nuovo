import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const patchSchema = z.union([
  z.object({ quantityDelta: z.number().int() }).strict(),
  z.object({ quantity: z.number().int().min(0) }).strict(),
]);

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
      const existing = await tx.item.findUnique({ where: { id } });
      if (!existing) throw new Error("NOT_FOUND");

      if ("quantityDelta" in parsed.data) {
        const next = existing.quantity + parsed.data.quantityDelta;
        if (next < 0) throw new Error("NEGATIVE_QUANTITY");
        return tx.item.update({ where: { id }, data: { quantity: next } });
      } else if ("quantity" in parsed.data) {
        return tx.item.update({ where: { id }, data: { quantity: parsed.data.quantity } });
      }
      return existing;
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_FOUND") {
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
      }
      if (error.message === "NEGATIVE_QUANTITY") {
        return NextResponse.json(
          { error: "Quantity cannot be negative" },
          { status: 400 }
        );
      }
    }
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
