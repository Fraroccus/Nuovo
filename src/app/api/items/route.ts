import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const ItemAdjustSchema = z.object({
delta: z.number().int(),
});

export async function PATCH(
req: NextRequest,
context: { params: Promise<{ id: string }> }
) {
try {
const { id } = await context.params;
const body: unknown = await req.json();
const { delta } = ItemAdjustSchema.parse(body);

const item = await prisma.item.update({
  where: { id },
  data: { quantity: { increment: delta } },
});

return NextResponse.json(item);
} catch (_error) {
return NextResponse.json(
{ error: "Failed to update item" },
{ status: 400 }
);
}
}
