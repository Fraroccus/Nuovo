/**
 * @jest-environment node
 */
import { POST } from "@/app/api/warehouses/route";

jest.mock("@/lib/prisma", () => {
  return {
    prisma: {
      warehouse: {
        create: jest.fn(),
      },
    },
  };
});

const { prisma } = jest.requireMock("@/lib/prisma");

describe("POST /api/warehouses", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a warehouse with defaults when optional fields are missing", async () => {
    const created = {
      id: "w1",
      name: "New W",
      width: 10,
      length: 10,
      height: 5,
      gridSize: 1,
    };
    prisma.warehouse.create.mockResolvedValue(created);

    const req = new Request("http://localhost/api/warehouses", {
      method: "POST",
      body: JSON.stringify({ name: "New W" }),
    });

    const res = await POST(req as any);
    const json = await (res as Response).json();

    expect(prisma.warehouse.create).toHaveBeenCalledWith({
      data: {
        name: "New W",
        width: 10,
        length: 10,
        height: 5,
        gridSize: 1,
      },
    });
    expect((res as Response).status).toBe(201);
    expect(json).toEqual(created);
  });

  it("returns 400 when input is invalid", async () => {
    const req = new Request("http://localhost/api/warehouses", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const res = await POST(req as any);
    const json = await (res as Response).json();

    expect((res as Response).status).toBe(400);
    expect(json.error).toBe("Invalid input");
    expect(prisma.warehouse.create).not.toHaveBeenCalled();
  });

  it("creates a warehouse with provided dimensions", async () => {
    const created = {
      id: "w2",
      name: "Dim W",
      width: 20,
      length: 30,
      height: 8,
      gridSize: 2,
    };
    prisma.warehouse.create.mockResolvedValue(created);

    const payload = {
      name: "Dim W",
      width: 20,
      length: 30,
      height: 8,
      gridSize: 2,
    };
    const req = new Request("http://localhost/api/warehouses", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const res = await POST(req as any);

    expect(prisma.warehouse.create).toHaveBeenCalledWith({ data: payload });
    expect((res as Response).status).toBe(201);
  });
});
