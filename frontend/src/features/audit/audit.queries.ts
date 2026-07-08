import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface AuditLog {
  id: string;
  actorEmail: string;
  actorRole: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  entity: string;
  entityId?: string | null;
  details?: string | null;
  createdAt: string;
}

interface AuditPage {
  items: AuditLog[];
  total: number;
}

// Bitácora de acciones (solo ADMIN). Paginada por skip/take.
export function useAuditLogs(take: number, skip: number, enabled = true) {
  return useQuery({
    queryKey: ["audit", take, skip],
    queryFn: () => api.get<AuditPage>(`/audit?take=${take}&skip=${skip}`),
    enabled,
  });
}
