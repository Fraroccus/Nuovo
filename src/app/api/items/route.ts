import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Schema for request validation
const ItemAdjustSchema = z.object({
  delta: z.number().int(),
});

// PATCH handler for updating item quantity
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<Response> {
  try {
    const body = await req.json();
    const { delta } = ItemAdjustSchema.parse(body);

    const item = await prisma.item.update({
      where: { id: params.id },
      data: { quantity: { increment: delta } },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error updating item:", error);

    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 400 }
    );
  }
}

// Optional: GET handler to fetch a single item
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<Response> {
  try {
    const item = await prisma.item.findUnique({
      where: { id: params.id },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error fetching item:", error);
    return NextResponse.json(
      { error: "Failed to fetch item" },
      { status: 500 }
    );
  }
}

// Optional: DELETE handler to remove an item
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<Response> {
  try {
    await prisma.item.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Item deleted" });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}
