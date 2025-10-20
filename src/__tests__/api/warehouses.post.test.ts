/**
 * @jest-environment node
 */
import { GET, PATCH } from "@/app/api/warehouse/route";

jest.mock("@/lib/prisma", () => {
  return {
    prisma: {
      $transaction: jest.fn(async (cb: any) => cb(prisma)),
      warehouse: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    },
  };
});

const { prisma } = jest.requireMock("@/lib/prisma");

describe("Single-warehouse API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET ensures and returns the lone warehouse when none exists", async () => {
    prisma.warehouse.findFirst.mockResolvedValueOnce(null);
    const created = {
      id: "w1",
      name: "Default Warehouse",
      location: "",
      description: null,
      capacity: 0,
      width: 10,
      length: 10,
      height: 5,
      gridSize: 1,
    };
    prisma.warehouse.create.mockResolvedValueOnce(created);

    const res = (await GET()) as Response;
    const json = await res.json();

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(prisma.warehouse.findFirst).toHaveBeenCalled();
    expect(prisma.warehouse.create).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(json).toEqual(created);
  });

  it("GET returns existing warehouse if present", async () => {
    const existing = { id: "w9", name: "Main", location: "", description: null, capacity: 0, width: 10, length: 10, height: 5, gridSize: 1 };
    prisma.warehouse.findFirst.mockResolvedValue(existing);

    const res = (await GET()) as Response;
    const json = await res.json();

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(prisma.warehouse.create).not.toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(json).toEqual(existing);
  });

  it("PATCH validates input and updates warehouse", async () => {
    const existing = { id: "w1" };
    prisma.warehouse.findFirst.mockResolvedValue(existing);
    const updated = { id: "w1", name: "Updated" };
    prisma.warehouse.update.mockResolvedValue(updated);

    const req = new Request("http://localhost/api/warehouse", {
      method: "PATCH",
      body: JSON.stringify({ name: "Updated" }),
    });

    const res = (await PATCH(req as any)) as Response;
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(prisma.warehouse.update).toHaveBeenCalledWith({
      where: { id: existing.id },
      data: { name: "Updated" },
    });
    expect(json).toEqual(updated);
  });

  it("PATCH returns 400 on invalid input", async () => {
    const req = new Request("http://localhost/api/warehouse", {
      method: "PATCH",
      body: JSON.stringify({}),
    });

    const res = (await PATCH(req as any)) as Response;
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe("Invalid input");
    expect(prisma.warehouse.update).not.toHaveBeenCalled();
  });
});
