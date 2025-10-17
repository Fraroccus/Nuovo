import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  await prisma.item.deleteMany();
  await prisma.shelf.deleteMany();
  await prisma.warehouse.deleteMany();

  const warehouse1 = await prisma.warehouse.create({
    data: {
      name: "Main Distribution Center",
      location: "1234 Industrial Parkway, Portland, OR 97201",
      description: "Primary distribution facility for Pacific Northwest region",
      capacity: 50000,
      shelves: {
        create: [
          {
            name: "A1",
            section: "A",
            level: 1,
            capacity: 500,
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
            level: 2,
            capacity: 500,
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

  const warehouse2 = await prisma.warehouse.create({
    data: {
      name: "East Coast Hub",
      location: "567 Commerce Drive, Newark, NJ 07102",
      description: "Secondary distribution center serving East Coast markets",
      capacity: 35000,
      shelves: {
        create: [
          {
            name: "A1",
            section: "A",
            level: 1,
            capacity: 600,
            items: {
              create: [
                {
                  name: "Monitor - 27 inch 4K",
                  sku: "TECH-MON-001",
                  description: "27-inch 4K IPS monitor with USB-C",
                  quantity: 30,
                  price: 449.99,
                  category: "Electronics",
                },
                {
                  name: "Keyboard - Mechanical",
                  sku: "TECH-KB-001",
                  description: "RGB mechanical keyboard with brown switches",
                  quantity: 60,
                  price: 129.99,
                  category: "Electronics",
                },
              ],
            },
          },
          {
            name: "C1",
            section: "C",
            level: 1,
            capacity: 400,
            items: {
              create: [
                {
                  name: "Desk Lamp - LED",
                  sku: "OFF-LAMP-001",
                  description: "Adjustable LED desk lamp with USB charging",
                  quantity: 100,
                  price: 39.99,
                  category: "Office Supplies",
                },
                {
                  name: "Notebook Set",
                  sku: "OFF-NOTE-001",
                  description: "Set of 5 ruled notebooks, A5 size",
                  quantity: 200,
                  price: 12.99,
                  category: "Office Supplies",
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("Seed completed successfully!");
  console.log({ warehouse1, warehouse2 });
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
