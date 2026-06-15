import { useCallback, useMemo } from "react";
import {
  useApartmentsQuery,
  useCreateApartmentMutation,
  useUpdateApartmentMutation,
  useDeleteApartmentMutation,
  ApartmentsDocument,
  ParkingDataDocument,
} from "../graphql/generated";
import { toCreateApartmentInput, toUpdateApartmentInput } from "../graphql/inputs";
import { mapApartment } from "../graphql/mappers";
import type { Apartment, CreateApartmentDto, UpdateApartmentDto } from "../graphql/models";

export interface UseApartmentsReturn {
  apartments: Apartment[];
  isLoading: boolean;
  error: string | null;
  createApartment: (dto: CreateApartmentDto) => Promise<void>;
  updateApartment: (id: string, dto: UpdateApartmentDto) => Promise<void>;
  removeApartment: (id: string) => Promise<void>;
}

export function useApartments(): UseApartmentsReturn {
  const { data, loading, error } = useApartmentsQuery();
  const [createMutation] = useCreateApartmentMutation();
  const [updateMutation] = useUpdateApartmentMutation();
  const [deleteMutation] = useDeleteApartmentMutation();

  const apartments = useMemo(
    () => data?.apartments.map(mapApartment) ?? [],
    [data],
  );

  const createApartment = useCallback(async (dto: CreateApartmentDto) => {
    const { errors } = await createMutation({
      variables: { input: toCreateApartmentInput(dto) },
      refetchQueries: [{ query: ApartmentsDocument }, { query: ParkingDataDocument }],
      errorPolicy: "all",
    });
    if (errors?.length) {
      throw errors[0];
    }
  }, [createMutation]);

  const updateApartment = useCallback(async (id: string, dto: UpdateApartmentDto) => {
    const { errors } = await updateMutation({
      variables: { id, input: toUpdateApartmentInput(dto) },
      refetchQueries: [{ query: ApartmentsDocument }, { query: ParkingDataDocument }],
      errorPolicy: "all",
    });
    if (errors?.length) {
      throw errors[0];
    }
  }, [updateMutation]);

  const removeApartment = useCallback(async (id: string) => {
    await deleteMutation({
      variables: { id },
      refetchQueries: [{ query: ApartmentsDocument }, { query: ParkingDataDocument }],
    });
  }, [deleteMutation]);

  return {
    apartments,
    isLoading: loading,
    error: error?.message ?? null,
    createApartment,
    updateApartment,
    removeApartment,
  };
}
