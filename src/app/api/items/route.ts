import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Define a schema for input validation
const ItemAdjustSchema = z.object({
  delta: z.number().int(),
});

// Define the PATCH route handler
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Parse request body
    const body = await req.json();
    const { delta } = ItemAdjustSchema.parse(body);

    // Update item in the database
    const item = await prisma.item.update({
      where: { id: params.id },
      data: { quantity: { increment: delta } },
    });

    // Return updated item
    return NextResponse.json(item);
  } catch (error) {
    console.error("Error updating item:", error);

    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 400 }
    );
  }
}
