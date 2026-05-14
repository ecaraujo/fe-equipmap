import { useState, useEffect, useCallback } from "react";
import { brigadierService } from "../services/brigadier.service";
import type {
  Brigadier,
  NotificationLog,
  CreateBrigadierDto,
  UpdateBrigadierDto,
  SendNotificationDto,
} from "../types";

export interface UseBrigadiersReturn {
  brigadiers: Brigadier[];
  logs: NotificationLog[];
  isLoading: boolean;
  error: string | null;
  create: (dto: CreateBrigadierDto) => Promise<Brigadier>;
  update: (id: string, dto: UpdateBrigadierDto) => Promise<Brigadier>;
  remove: (id: string) => Promise<void>;
  sendNotification: (dto: SendNotificationDto) => Promise<NotificationLog>;
  search: (query: string) => void;
}

export function useBrigadiers(): UseBrigadiersReturn {
  const [brigadiers, setBrigadiers] = useState<Brigadier[]>([]);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async (query?: string) => {
    setIsLoading(true);
    try {
      const [brs, ls] = await Promise.all([
        brigadierService.findAll(query),
        brigadierService.getNotificationLogs(),
      ]);
      setBrigadiers(brs);
      setLogs(ls);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const create = useCallback(async (dto: CreateBrigadierDto): Promise<Brigadier> => {
    const created = await brigadierService.create(dto);
    setBrigadiers((prev) => [...prev, created]);
    return created;
  }, []);

  const update = useCallback(async (id: string, dto: UpdateBrigadierDto): Promise<Brigadier> => {
    const updated = await brigadierService.update(id, dto);
    setBrigadiers((prev) => prev.map((b) => (b.id === id ? updated : b)));
    return updated;
  }, []);

  const remove = useCallback(async (id: string): Promise<void> => {
    await brigadierService.remove(id);
    setBrigadiers((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const sendNotification = useCallback(async (dto: SendNotificationDto): Promise<NotificationLog> => {
    const log = await brigadierService.sendNotification(dto);
    setLogs((prev) => [log, ...prev]);
    return log;
  }, []);

  const search = useCallback((query: string) => { fetchAll(query); }, [fetchAll]);

  return { brigadiers, logs, isLoading, error, create, update, remove, sendNotification, search };
}
