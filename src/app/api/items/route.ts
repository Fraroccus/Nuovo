import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Zod schema for PATCH request validation
const ItemAdjustSchema = z.object({
  delta: z.number().int(),
});

// PATCH handler: increment/decrement item quantity
export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
): Promise<Response> {
  const { params } = context;
  try {
    const body = await req.json();
    const { delta } = ItemAdjustSchema.parse(body);
    const item = await prisma.item.update({
      where: { id: params.id },
      data: { quantity: { increment: delta } },
    });
    return NextResponse.json(item);
  } catch (error) {
    console.error("PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
      {
        status: 400,
      }
    );
  }
}

// GET handler: fetch a single item by ID
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
): Promise<Response> {
  const { params } = context;
  try {
    const item = await prisma.item.findUnique({
      where: { id: params.id },
    });
    if (!item) {
      return NextResponse.json(
        { error: "Item not found" },
        {
          status: 404,
        }
      );
    }
    return NextResponse.json(item);
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch item" },
      {
        status: 500,
      }
    );
  }
}

// DELETE handler: remove an item by ID
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
): Promise<Response> {
  const { params } = context;
  try {
    await prisma.item.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: "Item deleted" });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      {
        status: 500,
      }
    );
  }
}
