import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export async function runSeed(client: PrismaClient = prisma) {
  console.log("Starting seed...");

  await client.item.deleteMany();
  await client.shelf.deleteMany();
  await client.warehouse.deleteMany();

  const defaultWarehouse = await client.warehouse.create({
    data: {
      name: "Default Warehouse",
      location: "1234 Industrial Parkway, Portland, OR 97201",
      description: "Primary distribution facility (default)",
      capacity: 50000,
      width: 20,
      length: 20,
      height: 6,
      gridSize: 1,
      isDefault: true,
      shelves: {
        create: [
          {
            name: "A1",
            section: "A",
            level: 1,
            capacity: 500,
            positionX: 0,
            positionY: 0,
            positionZ: 0,
            width: 2,
            depth: 1,
            height: 3,
            items: {
              create: [
                {
                  name: "Laptop - Dell XPS 15",
                  sku: "TECH-LAPTOP-001",
                  description: "15-inch laptop with Intel i7 processor",
                  quantity: 25,
                  price: 1499.99,
                  category: "Electronics",
                },
                {
                  name: "Wireless Mouse",
                  sku: "TECH-MOUSE-001",
                  description: "Ergonomic wireless mouse with USB receiver",
                  quantity: 150,
                  price: 29.99,
                  category: "Electronics",
                },
              ],
            },
          },
          {
            name: "A2",
            section: "A",
            level: 1,
            capacity: 500,
            positionX: 3,
            positionY: 0,
            positionZ: 0,
            width: 2,
            depth: 1,
            height: 3,
            items: {
              create: [
                {
                  name: "USB-C Hub",
                  sku: "TECH-HUB-001",
                  description: "7-in-1 USB-C hub with HDMI and ethernet",
                  quantity: 75,
                  price: 49.99,
                  category: "Electronics",
                },
              ],
            },
          },
          {
            name: "B1",
            section: "B",
            level: 1,
            capacity: 800,
            positionX: 0,
            positionY: 0,
            positionZ: 3,
            width: 3,
            depth: 1,
            height: 3,
            items: {
              create: [
                {
                  name: "Office Chair - Ergonomic",
                  sku: "FURN-CHAIR-001",
                  description: "Mesh back office chair with lumbar support",
                  quantity: 40,
                  price: 299.99,
                  category: "Furniture",
                },
                {
                  name: "Standing Desk",
                  sku: "FURN-DESK-001",
                  description: "Electric height-adjustable standing desk",
                  quantity: 20,
                  price: 599.99,
                  category: "Furniture",
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("Seed completed successfully!");
  console.log({ defaultWarehouse });

  return { defaultWarehouse };
}

async function main() {
  await runSeed(prisma);
}

if (process.env.NODE_ENV !== "test") {
  main()
    .catch((e) => {
      console.error("Error during seed:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
