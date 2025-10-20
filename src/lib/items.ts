export type ItemCreatePayload = {
  name: string;
  sku: string;
  description?: string | null;
  quantity: number;
  price: number;
  category: string;
  shelfId: string;
};

export type Item = {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  quantity: number;
  price: number;
  category: string;
  shelfId: string;
};

export async function fetchShelfItems(shelfId: string) {
  const res = await fetch(`/api/items?shelfId=${encodeURIComponent(shelfId)}`);
  if (!res.ok) throw new Error("Failed to fetch items");
  return res.json() as Promise<Item[]>;
}

export async function createItem(data: ItemCreatePayload) {
  const res = await fetch("/api/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to create item");
  }
  return res.json() as Promise<Item>;
}

export async function adjustItemQuantity(id: string, delta: number) {
  const res = await fetch(`/api/items/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ delta }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to update item");
  }
  return res.json() as Promise<Item>;
}

export async function removeItem(id: string) {
  const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to delete item");
  }
  return res.json() as Promise<{ success: true }>;
}
