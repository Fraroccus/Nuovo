import type { PrismaClient, Warehouse } from "@prisma/client";
import { prisma as defaultPrisma } from "./prisma";

export type EnsureDefaultWarehouseOptions = {
  name?: string;
  location?: string;
  description?: string | null;
  capacity?: number;
  width?: number;
  length?: number;
  height?: number;
  gridSize?: number;
};

const DEFAULTS: Required<Omit<EnsureDefaultWarehouseOptions, "description">> & {
  description: string | null;
} = {
  name: "Default Warehouse",
  location: "1234 Industrial Parkway, Portland, OR 97201",
  description: "Primary distribution facility (default)",
  capacity: 50000,
  width: 20,
  length: 20,
  height: 6,
  gridSize: 1,
};

/**
 * Ensures a default warehouse exists in the database. If none exists, it will be created.
 * Returns the default warehouse.
 */
export async function ensureDefaultWarehouse(
  client: PrismaClient = defaultPrisma,
  options: EnsureDefaultWarehouseOptions = {}
): Promise<Warehouse> {
  const existing = await client.warehouse.findFirst({ where: { isDefault: true } });
  if (existing) return existing;

  const data = {
    name: options.name ?? DEFAULTS.name,
    location: options.location ?? DEFAULTS.location,
    description: options.description ?? DEFAULTS.description,
    capacity: options.capacity ?? DEFAULTS.capacity,
    width: options.width ?? DEFAULTS.width,
    length: options.length ?? DEFAULTS.length,
    height: options.height ?? DEFAULTS.height,
    gridSize: options.gridSize ?? DEFAULTS.gridSize,
    isDefault: true,
  } as const;

  const created = await client.warehouse.create({ data });
  return created;
}
