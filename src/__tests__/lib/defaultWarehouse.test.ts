/**
 * @jest-environment node
 */
import { ensureDefaultWarehouse } from "@/lib/defaultWarehouse";

describe("ensureDefaultWarehouse", () => {
  it("creates a default warehouse when none exists", async () => {
    const mockClient: any = {
      warehouse: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation(async ({ data }: any) => ({
          id: "w_default",
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      },
    };

    const result = await ensureDefaultWarehouse(mockClient);

    expect(mockClient.warehouse.findFirst).toHaveBeenCalledWith({
      where: { isDefault: true },
    });
    expect(mockClient.warehouse.create).toHaveBeenCalled();

    const callArg = mockClient.warehouse.create.mock.calls[0][0];
    expect(callArg.data.isDefault).toBe(true);
    expect(callArg.data.width).toBeGreaterThan(0);
    expect(callArg.data.length).toBeGreaterThan(0);
    expect(callArg.data.height).toBeGreaterThan(0);
    expect(callArg.data.gridSize).toBeGreaterThan(0);

    expect(result.isDefault).toBe(true);
  });

  it("returns the existing default without creating a new one", async () => {
    const existing = {
      id: "w_existing",
      name: "Default Warehouse",
      location: "Loc",
      description: null,
      capacity: 1,
      width: 10,
      length: 10,
      height: 5,
      gridSize: 1,
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockClient: any = {
      warehouse: {
        findFirst: jest.fn().mockResolvedValue(existing),
        create: jest.fn(),
      },
    };

    const result = await ensureDefaultWarehouse(mockClient);

    expect(mockClient.warehouse.findFirst).toHaveBeenCalled();
    expect(mockClient.warehouse.create).not.toHaveBeenCalled();
    expect(result).toBe(existing as any);
  });
});
