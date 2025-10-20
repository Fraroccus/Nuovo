/**
 * @jest-environment node
 */
import { GET as GET_ITEMS, POST as POST_ITEM } from "@/app/api/items/route";
import { PATCH as PATCH_ITEM, DELETE as DELETE_ITEM } from "@/app/api/items/[id]/route";

jest.mock("@/lib/prisma", () => {
  return {
    prisma: {
      $transaction: jest.fn(async (cb: any) => cb(prisma)),
      item: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      shelf: {
        findUnique: jest.fn(),
      },
    },
  };
});

const { prisma } = jest.requireMock("@/lib/prisma");

describe("Items API CRUD", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("POST creates an item under a shelf", async () => {
    prisma.shelf.findUnique.mockResolvedValue({ id: "s1" });
    const created = { id: "i1", name: "Item", sku: "SKU-1", category: "Cat", shelfId: "s1", quantity: 0, price: 0 };
    prisma.item.create.mockResolvedValue(created);

    const req = new Request("http://localhost/api/items", {
      method: "POST",
      body: JSON.stringify({ shelfId: "s1", name: "Item", sku: "SKU-1", category: "Cat" }),
    });

    const res = (await POST_ITEM(req as any)) as Response;
    const json = await res.json();

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(prisma.item.create).toHaveBeenCalled();
    expect(res.status).toBe(201);
    expect(json).toEqual(created);
  });

  it("POST returns 400 on invalid input", async () => {
    const req = new Request("http://localhost/api/items", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const res = (await POST_ITEM(req as any)) as Response;
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe("Invalid input");
    expect(prisma.item.create).not.toHaveBeenCalled();
  });

  it("POST returns 404 when shelf is missing", async () => {
    prisma.shelf.findUnique.mockResolvedValue(null);

    const req = new Request("http://localhost/api/items", {
      method: "POST",
      body: JSON.stringify({ shelfId: "missing", name: "Item", sku: "S", category: "C" }),
    });

    const res = (await POST_ITEM(req as any)) as Response;
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toBe("Shelf not found");
  });

  it("PATCH adjusts quantity by delta", async () => {
    prisma.item.findUnique.mockResolvedValue({ id: "i1", quantity: 5 });
    const updated = { id: "i1", quantity: 7 };
    prisma.item.update.mockResolvedValue(updated);

    const req = new Request("http://localhost/api/items/i1", {
      method: "PATCH",
      body: JSON.stringify({ quantityDelta: 2 }),
    });

    const res = (await PATCH_ITEM(req as any, { params: Promise.resolve({ id: "i1" }) } as any)) as Response;
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual(updated);
  });

  it("PATCH returns 400 when resulting quantity would be negative", async () => {
    prisma.item.findUnique.mockResolvedValue({ id: "i1", quantity: 1 });

    const req = new Request("http://localhost/api/items/i1", {
      method: "PATCH",
      body: JSON.stringify({ quantityDelta: -5 }),
    });

    const res = (await PATCH_ITEM(req as any, { params: Promise.resolve({ id: "i1" }) } as any)) as Response;
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe("Quantity cannot be negative");
  });

  it("PATCH returns 404 when item not found", async () => {
    prisma.item.findUnique.mockResolvedValue(null);

    const req = new Request("http://localhost/api/items/i1", {
      method: "PATCH",
      body: JSON.stringify({ quantity: 1 }),
    });

    const res = (await PATCH_ITEM(req as any, { params: Promise.resolve({ id: "i1" }) } as any)) as Response;
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toBe("Item not found");
  });

  it("DELETE removes an item", async () => {
    prisma.item.delete.mockResolvedValue({});

    const res = (await DELETE_ITEM({} as any, { params: Promise.resolve({ id: "i1" }) } as any)) as Response;
    const json = await res.json();

    expect(prisma.item.delete).toHaveBeenCalledWith({ where: { id: "i1" } });
    expect(res.status).toBe(200);
    expect(json).toEqual({ success: true });
  });
});
