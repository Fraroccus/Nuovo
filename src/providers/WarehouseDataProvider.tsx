import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import type { FC, ReactNode } from "react";
import type { EditMode } from "../types/warehouse";
import {
  WarehouseApiProvider,
  type WarehouseApiClient,
} from "../api/client";
import { InteractionProvider } from "../context/interactionContext";

export interface WarehouseDataProviderProps {
  apiClient: WarehouseApiClient;
  queryClient?: QueryClient;
  initialEditMode?: EditMode;
  children: ReactNode;
}

const createDefaultQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        refetchOnWindowFocus: false,
      },
    },
  });

export const WarehouseDataProvider: FC<WarehouseDataProviderProps> = ({
  apiClient,
  queryClient,
  initialEditMode,
  children,
}) => {
  const [client] = useState(() => queryClient ?? createDefaultQueryClient());

  return (
    <WarehouseApiProvider client={apiClient}>
      <QueryClientProvider client={client}>
        <InteractionProvider initialEditMode={initialEditMode}>
          {children}
        </InteractionProvider>
      </QueryClientProvider>
    </WarehouseApiProvider>
  );
};
