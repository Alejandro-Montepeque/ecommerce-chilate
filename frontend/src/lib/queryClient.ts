import { QueryClient } from "@tanstack/react-query";

// Cliente único de React Query. Config sensata por defecto:
// - reintenta 1 vez ante error
// - datos "frescos" por 30s para evitar refetch excesivo
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});
