import { useState, useEffect, useCallback } from "react";
import { equipmentService } from "../services/equipment.service";
import type { Equipment, CreateEquipmentDto, UpdateEquipmentDto, EquipmentFilters, AsyncState } from "../types";

interface UseEquipmentReturn extends AsyncState<Equipment[]> {
  create: (dto: CreateEquipmentDto) => Promise<Equipment>;
  update: (id: string, dto: UpdateEquipmentDto) => Promise<Equipment>;
  remove: (id: string) => Promise<void>;
  refetch: () => void;
}

export function useEquipment(filters?: EquipmentFilters): UseEquipmentReturn {
  const [data, setData] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await equipmentService.findAll(filters);
      setData(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [filters?.search, filters?.type, filters?.status]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const create = useCallback(async (dto: CreateEquipmentDto): Promise<Equipment> => {
    const created = await equipmentService.create(dto);
    setData((prev) => [created, ...prev]);
    return created;
  }, []);

  const update = useCallback(async (id: string, dto: UpdateEquipmentDto): Promise<Equipment> => {
    const updated = await equipmentService.update(id, dto);
    setData((prev) => prev.map((e) => (e.id === id ? updated : e)));
    return updated;
  }, []);

  const remove = useCallback(async (id: string): Promise<void> => {
    await equipmentService.remove(id);
    setData((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return { data, isLoading, error, create, update, remove, refetch: fetchData };
}
