import { useState, useEffect, useCallback } from "react";
import { parkingService } from "../services/parking.service";
import type {
  Apartment,
  ParkingSpot,
  LotteryResult,
  CreateApartmentDto,
  UpdateApartmentDto,
  CreateSpotDto,
  UpdateSpotDto,
} from "../types";

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
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [results, setResults] = useState<LotteryResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunningLottery, setIsRunningLottery] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      parkingService.findAllApartments(),
      parkingService.findAllSpots(),
      parkingService.getLotteryResults(),
    ])
      .then(([apts, spts, res]) => {
        setApartments(apts);
        setSpots(spts);
        setResults(res);
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setIsLoading(false));
  }, []);

  const createApartment = useCallback(async (dto: CreateApartmentDto) => {
    const created = await parkingService.createApartment(dto);
    setApartments((prev) => [...prev, created]);
  }, []);

  const updateApartment = useCallback(async (id: string, dto: UpdateApartmentDto) => {
    const updated = await parkingService.updateApartment(id, dto);
    setApartments((prev) => prev.map((a) => (a.id === id ? updated : a)));
  }, []);

  const removeApartment = useCallback(async (id: string) => {
    await parkingService.removeApartment(id);
    setApartments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const createSpot = useCallback(async (dto: CreateSpotDto) => {
    const created = await parkingService.createSpot(dto);
    setSpots((prev) => [...prev, created]);
  }, []);

  const updateSpot = useCallback(async (id: string, dto: UpdateSpotDto) => {
    const updated = await parkingService.updateSpot(id, dto);
    setSpots((prev) => prev.map((s) => (s.id === id ? updated : s)));
  }, []);

  const removeSpot = useCallback(async (id: string) => {
    await parkingService.removeSpot(id);
    setSpots((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const runLottery = useCallback(async () => {
    setIsRunningLottery(true);
    try {
      const newResults = await parkingService.runLottery();
      setResults(newResults);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsRunningLottery(false);
    }
  }, []);

  const resetLottery = useCallback(async () => {
    await parkingService.resetLottery();
    setResults([]);
  }, []);

  return {
    apartments, spots, results,
    isLoading, isRunningLottery, error,
    createApartment, updateApartment, removeApartment,
    createSpot, updateSpot, removeSpot,
    runLottery, resetLottery,
  };
}
