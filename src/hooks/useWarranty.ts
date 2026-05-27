import { useCallback } from "react";
import { DashboardSummaryDocument, WarrantyStatus, WarrantyType, useCreateWarrantyMutation, useWarrantiesQuery } from "../graphql/generated";
import { toCreateWarrantyInput } from "../graphql/inputs";
import { mapWarranty } from "../graphql/mappers";
import type { AsyncState, CreateWarrantyDto, Warranty, WarrantyFilters } from "../graphql/models";

interface UseWarrantyReturn extends AsyncState<Warranty[]> {
  create: (dto: CreateWarrantyDto) => Promise<Warranty>;
  remove: (id: string) => Promise<void>;
  refetch: () => void;
}

const statusMap: Record<string, WarrantyStatus> = {
  Vigente: "ACTIVE",
  Vencendo: "EXPIRING",
  Vencida: "EXPIRED",
};

const typeMap: Record<string, WarrantyType> = {
  Fabricante: "MANUFACTURER",
  Fornecedor: "SUPPLIER",
  Estendida: "EXTENDED",
  Servico: "SERVICE",
  Serviço: "SERVICE",
};

function unsupported(operation: string): never {
  throw new Error(`${operation} is not supported by the current GraphQL contract yet.`);
}

export function useWarranty(filters?: WarrantyFilters): UseWarrantyReturn {
  const { data, loading, error, refetch } = useWarrantiesQuery({
    variables: {
      filters: {
        search: filters?.search || undefined,
        status: filters?.status && filters.status !== "all" ? statusMap[filters.status] : undefined,
        type: filters?.type && filters.type !== "all" ? typeMap[filters.type] : undefined,
      },
      pagination: { page: filters?.page ?? 1, pageSize: filters?.pageSize ?? 100 },
    },
  });
  const [createWarranty] = useCreateWarrantyMutation();

  const create = useCallback(async (dto: CreateWarrantyDto) => {
    const result = await createWarranty({
      variables: { input: toCreateWarrantyInput(dto) },
      refetchQueries: [{ query: DashboardSummaryDocument }],
      awaitRefetchQueries: true,
    });
    await refetch();
    return mapWarranty(result.data!.createWarranty);
  }, [createWarranty, refetch]);

  const remove = useCallback(async (_id: string) => {
    unsupported("Deleting warranties");
  }, []);

  return {
    data: data?.warranties.data.map(mapWarranty) ?? [],
    isLoading: loading,
    error: error?.message ?? null,
    create,
    remove,
    refetch: () => void refetch(),
  };
}
