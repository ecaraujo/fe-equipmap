import { useCallback } from "react";
import { DashboardSummaryDocument, MaintenanceStatus, MaintenanceType, useCompleteMaintenanceMutation, useCreateMaintenanceMutation, useDeleteMaintenanceMutation, useMaintenancesQuery } from "../graphql/generated";
import { toCompleteMaintenanceInput, toCreateMaintenanceInput } from "../graphql/inputs";
import { mapMaintenance } from "../graphql/mappers";
import type { AsyncState, CompleteMaintenanceDto, CreateMaintenanceDto, MaintenanceFilters, MaintenanceRecord } from "../graphql/models";

interface UseMaintenanceReturn extends AsyncState<MaintenanceRecord[]> {
  create: (dto: CreateMaintenanceDto) => Promise<MaintenanceRecord>;
  complete: (id: string, dto: CompleteMaintenanceDto) => Promise<MaintenanceRecord>;
  remove: (id: string) => Promise<void>;
  refetch: () => void;
}

const statusMap: Record<string, MaintenanceStatus> = {
  Pendente: "PENDING",
  "Em andamento": "IN_PROGRESS",
  Concluida: "COMPLETED",
  Concluída: "COMPLETED",
  Atrasada: "OVERDUE",
  Cancelada: "CANCELED",
};

const typeMap: Record<string, MaintenanceType> = {
  Preventiva: "PREVENTIVE",
  Corretiva: "CORRECTIVE",
  Preditiva: "PREDICTIVE",
};

export function useMaintenance(filters?: MaintenanceFilters): UseMaintenanceReturn {
  const { data, loading, error, refetch } = useMaintenancesQuery({
    variables: {
      filters: {
        search: filters?.search || undefined,
        status: filters?.status && filters.status !== "all" ? statusMap[filters.status] : undefined,
        type: filters?.type && filters.type !== "all" ? typeMap[filters.type] : undefined,
      },
      pagination: { page: filters?.page ?? 1, pageSize: filters?.pageSize ?? 100 },
    },
  });
  const [createMaintenance] = useCreateMaintenanceMutation();
  const [completeMaintenance] = useCompleteMaintenanceMutation();
  const [deleteMaintenance] = useDeleteMaintenanceMutation();

  const create = useCallback(async (dto: CreateMaintenanceDto) => {
    const result = await createMaintenance({
      variables: { input: toCreateMaintenanceInput(dto) },
      refetchQueries: [{ query: DashboardSummaryDocument }],
      awaitRefetchQueries: true,
    });
    await refetch();
    return mapMaintenance(result.data!.createMaintenance);
  }, [createMaintenance, refetch]);

  const complete = useCallback(async (id: string, dto: CompleteMaintenanceDto) => {
    const result = await completeMaintenance({
      variables: { id, input: toCompleteMaintenanceInput(dto) },
      refetchQueries: [{ query: DashboardSummaryDocument }],
      awaitRefetchQueries: true,
    });
    await refetch();
    return mapMaintenance(result.data!.completeMaintenance);
  }, [completeMaintenance, refetch]);

  const remove = useCallback(async (id: string) => {
    await deleteMaintenance({
      variables: { id },
      refetchQueries: [{ query: DashboardSummaryDocument }],
      awaitRefetchQueries: true,
    });
    await refetch();
  }, [deleteMaintenance, refetch]);

  return {
    data: data?.maintenances.data.map(mapMaintenance) ?? [],
    isLoading: loading,
    error: error?.message ?? null,
    create,
    complete,
    remove,
    refetch: () => void refetch(),
  };
}
