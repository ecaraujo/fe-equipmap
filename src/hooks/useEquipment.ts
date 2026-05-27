import { useCallback } from "react";
import {
  DashboardSummaryDocument,
  EquipmentStatus,
  EquipmentType,
  useCreateEquipmentMutation,
  useDeleteEquipmentMutation,
  useEquipmentsQuery,
  useUpdateEquipmentMutation,
} from "../graphql/generated";
import { toCreateEquipmentInput, toUpdateEquipmentInput } from "../graphql/inputs";
import { mapEquipment } from "../graphql/mappers";
import type { AsyncState, CreateEquipmentDto, Equipment, EquipmentFilters, UpdateEquipmentDto } from "../graphql/models";

interface UseEquipmentReturn extends AsyncState<Equipment[]> {
  create: (dto: CreateEquipmentDto) => Promise<Equipment>;
  update: (id: string, dto: UpdateEquipmentDto) => Promise<Equipment>;
  remove: (id: string) => Promise<void>;
  refetch: () => void;
}

const typeToGraphql: Record<string, EquipmentType> = {
  Climatizacao: "CLIMATIZATION",
  Climatização: "CLIMATIZATION",
  Transporte: "TRANSPORT",
  Eletrica: "ELECTRICAL",
  Elétrica: "ELECTRICAL",
  Hidraulica: "HYDRAULIC",
  Hidráulica: "HYDRAULIC",
  Seguranca: "SECURITY",
  Segurança: "SECURITY",
  Outros: "OTHER",
};

const statusToGraphql: Record<string, EquipmentStatus> = {
  Ativo: "ACTIVE",
  Manutencao: "MAINTENANCE",
  Manutenção: "MAINTENANCE",
  Alerta: "ALERT",
  Inativo: "INACTIVE",
};

export function useEquipment(filters?: EquipmentFilters): UseEquipmentReturn {
  const { data, loading, error, refetch } = useEquipmentsQuery({
    variables: {
      filters: {
        search: filters?.search || undefined,
        type: filters?.type && filters.type !== "all" ? typeToGraphql[filters.type] : undefined,
        status: filters?.status && filters.status !== "all" ? statusToGraphql[filters.status] : undefined,
      },
      pagination: {
        page: filters?.page ?? 1,
        pageSize: filters?.pageSize ?? 100,
      },
    },
  });
  const [createEquipment] = useCreateEquipmentMutation();
  const [updateEquipment] = useUpdateEquipmentMutation();
  const [deleteEquipment] = useDeleteEquipmentMutation();

  const create = useCallback(async (dto: CreateEquipmentDto) => {
    const result = await createEquipment({
      variables: { input: toCreateEquipmentInput(dto) },
      refetchQueries: [{ query: DashboardSummaryDocument }],
      awaitRefetchQueries: true,
    });
    await refetch();
    return mapEquipment(result.data!.createEquipment);
  }, [createEquipment, refetch]);

  const update = useCallback(async (id: string, dto: UpdateEquipmentDto) => {
    const result = await updateEquipment({
      variables: { id, input: toUpdateEquipmentInput(dto) },
      refetchQueries: [{ query: DashboardSummaryDocument }],
      awaitRefetchQueries: true,
    });
    await refetch();
    return mapEquipment(result.data!.updateEquipment);
  }, [refetch, updateEquipment]);

  const remove = useCallback(async (id: string) => {
    await deleteEquipment({
      variables: { id },
      refetchQueries: [{ query: DashboardSummaryDocument }],
      awaitRefetchQueries: true,
    });
    await refetch();
  }, [deleteEquipment, refetch]);

  return {
    data: data?.equipments.data.map(mapEquipment) ?? [],
    isLoading: loading,
    error: error?.message ?? null,
    create,
    update,
    remove,
    refetch: () => void refetch(),
  };
}
