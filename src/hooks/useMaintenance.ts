import { useState, useEffect, useCallback } from "react";
import { maintenanceService } from "../services/maintenance.service";
import type {
  MaintenanceRecord,
  CreateMaintenanceDto,
  CompleteMaintenanceDto,
  MaintenanceFilters,
  AsyncState,
} from "../types";

interface UseMaintenanceReturn extends AsyncState<MaintenanceRecord[]> {
  create: (dto: CreateMaintenanceDto) => Promise<MaintenanceRecord>;
  complete: (id: string, dto: CompleteMaintenanceDto) => Promise<MaintenanceRecord>;
  remove: (id: string) => Promise<void>;
  refetch: () => void;
}

export function useMaintenance(filters?: MaintenanceFilters): UseMaintenanceReturn {
  const [data, setData] = useState<MaintenanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await maintenanceService.findAll(filters);
      setData(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [filters?.search, filters?.status, filters?.type]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const create = useCallback(async (dto: CreateMaintenanceDto): Promise<MaintenanceRecord> => {
    const created = await maintenanceService.create(dto);
    setData((prev) => [created, ...prev]);
    return created;
  }, []);

  const complete = useCallback(async (id: string, dto: CompleteMaintenanceDto): Promise<MaintenanceRecord> => {
    const updated = await maintenanceService.complete(id, dto);
    setData((prev) => prev.map((r) => (r.id === id ? updated : r)));
    return updated;
  }, []);

  const remove = useCallback(async (id: string): Promise<void> => {
    await maintenanceService.remove(id);
    setData((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return { data, isLoading, error, create, complete, remove, refetch: fetchData };
}
