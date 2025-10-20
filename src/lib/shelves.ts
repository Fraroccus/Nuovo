export type ShelfUpdatePayload = {
  positionX?: number;
  positionY?: number;
  positionZ?: number;
  width?: number;
  depth?: number;
  height?: number;
};

export async function patchShelf(id: string, data: ShelfUpdatePayload) {
  const res = await fetch(`/api/shelves/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to update shelf");
  }
  return res.json();
}
