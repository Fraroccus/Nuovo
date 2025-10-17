import { renderHook, act } from "@testing-library/react";
import type { FC, ReactNode } from "react";
import { describe, expect, it } from "vitest";
import {
  InteractionProvider,
  useEditMode,
  useHighlighting,
  useSelection,
} from "../src/context/interactionContext";

const createWrapper = (): FC<{ children: ReactNode }> => ({ children }) => (
  <InteractionProvider>{children}</InteractionProvider>
);

describe("Interaction context", () => {
  it("manages selection state across shelves and inventory", () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useSelection(), { wrapper });

    act(() => {
      result.current.selectShelves(["shelf-1"]);
      result.current.selectInventoryItems(["item-1"]);
    });

    expect(result.current.selectedShelfIds).toEqual(["shelf-1"]);
    expect(result.current.selectedInventoryIds).toEqual(["item-1"]);

    act(() => {
      result.current.toggleShelfSelection("shelf-1");
    });

    expect(result.current.selectedShelfIds).toHaveLength(0);

    act(() => {
      result.current.selectShelves(["shelf-1", "shelf-2"], { append: true });
      result.current.toggleInventorySelection("item-1");
    });

    expect(result.current.selectedShelfIds.sort()).toEqual([
      "shelf-1",
      "shelf-2",
    ]);
    expect(result.current.isInventorySelected("item-1")).toBe(false);
  });

  it("updates edit mode state via context", () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useEditMode(), { wrapper });

    expect(result.current.editMode).toBe("view");

    act(() => {
      result.current.setEditMode("shelf");
    });

    expect(result.current.editMode).toBe("shelf");
  });

  it("tracks highlight metadata and clears highlights", () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useHighlighting(), { wrapper });

    act(() => {
      result.current.setHighlightedMetadata([
        {
          id: "shelf-1",
          type: "shelf",
          level: "warning",
          message: "Low stock",
        },
      ]);
    });

    expect(result.current.highlightedMetadata).toHaveLength(1);
    expect(result.current.hasHighlight("shelf-1")).toBe(true);

    act(() => {
      result.current.setHighlightedMetadata(
        [
          {
            id: "item-2",
            type: "inventory",
            level: "info",
          },
        ],
        { merge: true },
      );
    });

    expect(result.current.highlightedMetadata).toHaveLength(2);
    expect(result.current.hasHighlight("item-2")).toBe(true);

    act(() => {
      result.current.clearHighlighting();
    });

    expect(result.current.highlightedMetadata).toHaveLength(0);
  });
});
