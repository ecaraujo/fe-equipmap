import { useCallback, useMemo } from "react";
import {
  useCreateParkingApartmentMutation,
  useCreateParkingSpotMutation,
  useDeleteParkingApartmentMutation,
  useDeleteParkingSpotMutation,
  useExecuteLotteryMutation,
  useParkingDataQuery,
  useResetLotteryMutation,
  useUpdateParkingApartmentMutation,
  useUpdateParkingSpotMutation,
} from "../graphql/generated";
import { toCreateApartmentInput, toCreateSpotInput, toUpdateApartmentInput, toUpdateSpotInput } from "../graphql/inputs";
import { mapApartment, mapLotteryResult, mapSpot } from "../graphql/mappers";
import type { Apartment, CreateApartmentDto, CreateSpotDto, LotteryResult, ParkingSpot, UpdateApartmentDto, UpdateSpotDto } from "../graphql/models";

export interface UseParkingReturn {
  apartments: Apartment[];
  spots: ParkingSpot[];
  results: LotteryResult[];
  isLoading: boolean;
  isRunningLottery: boolean;
  error: string | null;
  createApartment: (dto: CreateApartmentDto) => Promise<void>;
  updateApartment: (id: string, dto: UpdateApartmentDto) => Promise<void>;
  removeApartment: (id: string) => Promise<void>;
  createSpot: (dto: CreateSpotDto) => Promise<void>;
  updateSpot: (id: string, dto: UpdateSpotDto) => Promise<void>;
  removeSpot: (id: string) => Promise<void>;
  runLottery: () => Promise<void>;
  resetLottery: () => Promise<void>;
}

export function useParking(): UseParkingReturn {
  const { data, loading, error, refetch } = useParkingDataQuery();
  const [createApartmentMutation] = useCreateParkingApartmentMutation();
  const [updateApartmentMutation] = useUpdateParkingApartmentMutation();
  const [deleteApartmentMutation] = useDeleteParkingApartmentMutation();
  const [createSpotMutation] = useCreateParkingSpotMutation();
  const [updateSpotMutation] = useUpdateParkingSpotMutation();
  const [deleteSpotMutation] = useDeleteParkingSpotMutation();
  const [executeLottery, { loading: isRunningLottery }] = useExecuteLotteryMutation();
  const [resetLotteryMutation] = useResetLotteryMutation();

  const realData = useMemo(() => ({
    apartments: data?.parkingApartments.map(mapApartment) ?? [],
    spots: data?.parkingSpots.map(mapSpot) ?? [],
    results: data?.parkingResults.map(mapLotteryResult) ?? [],
  }), [data]);

  const createApartment = useCallback(async (dto: CreateApartmentDto) => {
    await createApartmentMutation({ variables: { input: toCreateApartmentInput(dto) } });
    await refetch();
  }, [createApartmentMutation, refetch]);

  const updateApartment = useCallback(async (id: string, dto: UpdateApartmentDto) => {
    await updateApartmentMutation({ variables: { id, input: toUpdateApartmentInput(dto) } });
    await refetch();
  }, [refetch, updateApartmentMutation]);

  const removeApartment = useCallback(async (id: string) => {
    await deleteApartmentMutation({ variables: { id } });
    await refetch();
  }, [deleteApartmentMutation, refetch]);

  const createSpot = useCallback(async (dto: CreateSpotDto) => {
    await createSpotMutation({ variables: { input: toCreateSpotInput(dto) } });
    await refetch();
  }, [createSpotMutation, refetch]);

  const updateSpot = useCallback(async (id: string, dto: UpdateSpotDto) => {
    await updateSpotMutation({ variables: { id, input: toUpdateSpotInput(dto) } });
    await refetch();
  }, [refetch, updateSpotMutation]);

  const removeSpot = useCallback(async (id: string) => {
    await deleteSpotMutation({ variables: { id } });
    await refetch();
  }, [deleteSpotMutation, refetch]);

  const runLottery = useCallback(async () => {
    await executeLottery({ variables: { input: { seed: Date.now() % 100000 } } });
    await refetch();
  }, [executeLottery, refetch]);

  const resetLottery = useCallback(async () => {
    await resetLotteryMutation();
    await refetch();
  }, [refetch, resetLotteryMutation]);

  return {
    apartments: realData.apartments,
    spots: realData.spots,
    results: realData.results,
    isLoading: loading,
    isRunningLottery,
    error: error?.message ?? null,
    createApartment,
    updateApartment,
    removeApartment,
    createSpot,
    updateSpot,
    removeSpot,
    runLottery,
    resetLottery,
  };
}
