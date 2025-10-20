import { NextResponse } from "next/server";
import { ensureDefaultWarehouse } from "@/lib/defaultWarehouse";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const defaultW = await ensureDefaultWarehouse(prisma);
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: defaultW.id },
      include: {
        shelves: {
          include: {
            _count: { select: { items: true } },
          },
        },
      },
    });

    if (!warehouse) {
      return NextResponse.json({ error: "Warehouse not found" }, { status: 404 });
    }

    return NextResponse.json(warehouse);
  } catch (error) {
    console.error("Error fetching default warehouse:", error);
    return NextResponse.json(
      { error: "Failed to fetch default warehouse" },
      { status: 500 }
    );
  }
}
