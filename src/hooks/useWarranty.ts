import { useState, useEffect, useCallback } from "react";
import { warrantyService } from "../services/warranty.service";
import type { Warranty, CreateWarrantyDto, WarrantyFilters, AsyncState } from "../types";

interface UseWarrantyReturn extends AsyncState<Warranty[]> {
  create: (dto: CreateWarrantyDto) => Promise<Warranty>;
  remove: (id: string) => Promise<void>;
  refetch: () => void;
}

export function useWarranty(filters?: WarrantyFilters): UseWarrantyReturn {
  const [data, setData] = useState<Warranty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await warrantyService.findAll(filters);
      setData(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [filters?.search, filters?.status, filters?.type]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const create = useCallback(async (dto: CreateWarrantyDto): Promise<Warranty> => {
    const created = await warrantyService.create(dto);
    setData((prev) => [created, ...prev]);
    return created;
  }, []);

  const remove = useCallback(async (id: string): Promise<void> => {
    await warrantyService.remove(id);
    setData((prev) => prev.filter((w) => w.id !== id));
  }, []);

  return { data, isLoading, error, create, remove, refetch: fetchData };
}
