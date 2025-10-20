/**
 * @jest-environment node
 */
import { PATCH } from "@/app/api/shelves/[id]/route";

jest.mock("@/lib/prisma", () => {
  return {
    prisma: {
      $transaction: jest.fn(async (cb: any) => cb(prisma)),
      shelf: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    },
  };
});

const { prisma } = jest.requireMock("@/lib/prisma");

describe("PATCH /api/shelves/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("updates position and size when valid", async () => {
    prisma.shelf.findUnique.mockResolvedValue({ id: "s1" });
    const updated = { id: "s1", x: 10, y: 0, width: 3, height: 2 };
    prisma.shelf.update.mockResolvedValue(updated);

    const req = new Request("http://localhost/api/shelves/s1", {
      method: "PATCH",
      body: JSON.stringify({ x: 10, width: 3, height: 2 }),
    });

    const res = (await PATCH(req as any, { params: Promise.resolve({ id: "s1" }) } as any)) as Response;
    const json = await res.json();

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(prisma.shelf.update).toHaveBeenCalledWith({
      where: { id: "s1" },
      data: { x: 10, width: 3, height: 2 },
    });
    expect(res.status).toBe(200);
    expect(json).toEqual(updated);
  });

  it("returns 400 when validation fails", async () => {
    const req = new Request("http://localhost/api/shelves/s1", {
      method: "PATCH",
      body: JSON.stringify({ width: -1 }),
    });

    const res = (await PATCH(req as any, { params: Promise.resolve({ id: "s1" }) } as any)) as Response;
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe("Invalid input");
    expect(prisma.shelf.update).not.toHaveBeenCalled();
  });

  it("returns 404 when shelf not found", async () => {
    prisma.shelf.findUnique.mockResolvedValue(null);

    const req = new Request("http://localhost/api/shelves/s1", {
      method: "PATCH",
      body: JSON.stringify({ x: 1 }),
    });

    const res = (await PATCH(req as any, { params: Promise.resolve({ id: "s1" }) } as any)) as Response;
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toBe("Shelf not found");
  });
});
