/**
 * @jest-environment node
 */
import { PATCH } from "@/app/api/shelves/[id]/route";

jest.mock("@/lib/prisma", () => {
  return {
    prisma: {
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

  it("returns 404 when shelf missing", async () => {
    prisma.shelf.findUnique.mockResolvedValue(null);

    const req = new Request("http://localhost/api/shelves/s1", {
      method: "PATCH",
      body: JSON.stringify({ positionX: 2 }),
    });

    const res = await PATCH(req as any, { params: Promise.resolve({ id: "s1" }) } as any);
    expect((res as Response).status).toBe(404);
  });

  it("validates dimensions and rejects invalid", async () => {
    prisma.shelf.findUnique.mockResolvedValue({ id: "s1", width: 2, depth: 2, height: 2, positionX: 0, positionY: 0, positionZ: 0 });

    const req = new Request("http://localhost/api/shelves/s1", {
      method: "PATCH",
      body: JSON.stringify({ width: 0 }),
    });

    const res = await PATCH(req as any, { params: Promise.resolve({ id: "s1" }) } as any);
    const json = await (res as Response).json();

    expect((res as Response).status).toBe(400);
    expect(json.error).toBeDefined();
    expect(prisma.shelf.update).not.toHaveBeenCalled();
  });

  it("updates shelf and returns updated", async () => {
    const existing = { id: "s1", width: 2, depth: 2, height: 3, positionX: 0, positionY: 0, positionZ: 0 };
    prisma.shelf.findUnique.mockResolvedValue(existing);
    prisma.shelf.update.mockImplementation(async ({ data }: any) => ({ ...existing, ...data }));

    const payload = { positionX: 5, positionZ: 7, width: 4 };
    const req = new Request("http://localhost/api/shelves/s1", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

    const res = await PATCH(req as any, { params: Promise.resolve({ id: "s1" }) } as any);
    const json = await (res as Response).json();

    expect(prisma.shelf.update).toHaveBeenCalledWith({
      where: { id: "s1" },
      data: { positionX: 5, positionY: 0, positionZ: 7, width: 4, depth: 2, height: 3 },
    });
    expect(json.width).toBe(4);
    expect(json.positionX).toBe(5);
  });
});
