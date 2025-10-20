/**
 * @jest-environment node
 */
import { runSeed } from "../../../../prisma/seed";

describe("prisma seed", () => {
  it("creates a single default warehouse with shelves that include geometry", async () => {
    const createdWarehouses: any[] = [];
    const mockClient: any = {
      item: { deleteMany: jest.fn().mockResolvedValue({}) },
      shelf: { deleteMany: jest.fn().mockResolvedValue({}) },
      warehouse: {
        deleteMany: jest.fn().mockResolvedValue({}),
        create: jest.fn().mockImplementation(async ({ data }: any) => {
          createdWarehouses.push(data);
          return {
            id: "w1",
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        }),
      },
    };

    const { defaultWarehouse } = await runSeed(mockClient);

    expect(mockClient.item.deleteMany).toHaveBeenCalled();
    expect(mockClient.shelf.deleteMany).toHaveBeenCalled();
    expect(mockClient.warehouse.deleteMany).toHaveBeenCalled();

    expect(mockClient.warehouse.create).toHaveBeenCalledTimes(1);
    expect(defaultWarehouse.isDefault).toBe(true);

    const data = createdWarehouses[0];
    expect(data.isDefault).toBe(true);
    expect(Array.isArray(data.shelves.create)).toBe(true);

    for (const shelf of data.shelves.create) {
      expect(typeof shelf.positionX).toBe("number");
      expect(typeof shelf.positionY).toBe("number");
      expect(typeof shelf.positionZ).toBe("number");
      expect(typeof shelf.width).toBe("number");
      expect(typeof shelf.depth).toBe("number");
      expect(typeof shelf.height).toBe("number");

      expect(shelf.width).toBeGreaterThan(0);
      expect(shelf.depth).toBeGreaterThan(0);
      expect(shelf.height).toBeGreaterThan(0);
      expect(shelf.positionX).toBeGreaterThanOrEqual(0);
      expect(shelf.positionY).toBeGreaterThanOrEqual(0);
      expect(shelf.positionZ).toBeGreaterThanOrEqual(0);
    }
  });
});
