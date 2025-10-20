import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ItemAdjustSchema = z.object({ delta: z.number().int() });

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body: unknown = await req.json();
    const { delta } = ItemAdjustSchema.parse(body);
    const { id } = params;

    const item = await prisma.item.update({
      where: { id },
      data: { quantity: { increment: delta } },
    });

    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 400 }
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
