import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const DEFAULTS = {
  name: "Default Warehouse",
  location: "",
  description: null as string | null,
  capacity: 0,
  width: 10,
  length: 10,
  height: 5,
  gridSize: 1,
};

const patchSchema = z
  .object({
    name: z.string().min(1).optional(),
    location: z.string().optional(),
    description: z.string().nullable().optional(),
    capacity: z.number().int().min(0).optional(),
    width: z.number().int().positive().optional(),
    length: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    gridSize: z.number().int().positive().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

async function ensureWarehouse() {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.warehouse.findFirst();
    if (existing) return existing;
    return tx.warehouse.create({
      data: DEFAULTS,
    });
  });
}

export async function GET() {
  try {
    const warehouse = await ensureWarehouse();
    return NextResponse.json(warehouse);
  } catch (error) {
    console.error("Error ensuring warehouse:", error);
    return NextResponse.json(
      { error: "Failed to fetch warehouse" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const json = await request.json();
    const parsed = patchSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const wh = await tx.warehouse.findFirst();
      const base =
        wh ??
        (await tx.warehouse.create({
          data: DEFAULTS,
        }));

      return tx.warehouse.update({
        where: { id: base.id },
        data: parsed.data,
      });
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating warehouse:", error);
    return NextResponse.json(
      { error: "Failed to update warehouse" },
      { status: 500 }
    );
  }
}
