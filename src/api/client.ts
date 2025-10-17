import { createContext, useContext } from "react";
import type { FC, ReactNode } from "react";
import type {
  InventoryItem,
  InventoryMutationInput,
  ShelfMetadata,
  ShelfMutationInput,
  WarehouseLayout,
} from "../types/warehouse";

export interface WarehouseApiClient {
  fetchLayout: () => Promise<WarehouseLayout>;
  fetchShelves: () => Promise<ShelfMetadata[]>;
  fetchInventory: () => Promise<InventoryItem[]>;
  updateShelf: (input: ShelfMutationInput) => Promise<ShelfMetadata>;
  updateInventory: (input: InventoryMutationInput) => Promise<InventoryItem>;
}

const WarehouseApiContext = createContext<WarehouseApiClient | null>(null);

export interface WarehouseApiProviderProps {
  client: WarehouseApiClient;
  children: ReactNode;
}

export const WarehouseApiProvider: FC<WarehouseApiProviderProps> = ({
  client,
  children,
}) => (
  <WarehouseApiContext.Provider value={client}>
    {children}
  </WarehouseApiContext.Provider>
);

export const useWarehouseApi = (): WarehouseApiClient => {
  const context = useContext(WarehouseApiContext);

  if (!context) {
    throw new Error(
      "useWarehouseApi must be used within a WarehouseApiProvider",
    );
  }

  return context;
};

const normalizeBaseUrl = (baseUrl: string): string => {
  if (!baseUrl.endsWith("/")) {
    return baseUrl;
  }

  return baseUrl.slice(0, -1);
};

const ensureOk = async (response: Response): Promise<void> => {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || response.statusText);
  }
};

const jsonHeaders = {
  "Content-Type": "application/json",
};

export const createHttpWarehouseApiClient = (
  baseUrl: string,
  fetchImpl: typeof fetch = globalThis.fetch,
): WarehouseApiClient => {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);

  if (!fetchImpl) {
    throw new Error("A fetch implementation must be provided");
  }

  return {
    async fetchLayout() {
      const response = await fetchImpl(`${normalizedBaseUrl}/layout`, {
        method: "GET",
      });
      await ensureOk(response);
      return (await response.json()) as WarehouseLayout;
    },
    async fetchShelves() {
      const response = await fetchImpl(`${normalizedBaseUrl}/shelves`, {
        method: "GET",
      });
      await ensureOk(response);
      return (await response.json()) as ShelfMetadata[];
    },
    async fetchInventory() {
      const response = await fetchImpl(`${normalizedBaseUrl}/inventory`, {
        method: "GET",
      });
      await ensureOk(response);
      return (await response.json()) as InventoryItem[];
    },
    async updateShelf(input) {
      const response = await fetchImpl(
        `${normalizedBaseUrl}/shelves/${encodeURIComponent(input.id)}`,
        {
          method: "PATCH",
          headers: jsonHeaders,
          body: JSON.stringify(input),
        },
      );
      await ensureOk(response);
      return (await response.json()) as ShelfMetadata;
    },
    async updateInventory(input) {
      const response = await fetchImpl(
        `${normalizedBaseUrl}/inventory/${encodeURIComponent(input.id)}`,
        {
          method: "PATCH",
          headers: jsonHeaders,
          body: JSON.stringify(input),
        },
      );
      await ensureOk(response);
      return (await response.json()) as InventoryItem;
    },
  };
};
