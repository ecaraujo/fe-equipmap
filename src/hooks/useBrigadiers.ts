import { useCallback, useState } from "react";
import {
  useBrigadiersQuery,
  useCreateBrigadierMutation,
  useDeleteBrigadierMutation,
  useNotifyBrigadiersMutation,
  useUpdateBrigadierMutation,
} from "../graphql/generated";
import { toCreateBrigadierInput, toNotifyBrigadiersInput, toUpdateBrigadierInput } from "../graphql/inputs";
import { mapBrigadier, mapNotificationLog } from "../graphql/mappers";
import type { Brigadier, CreateBrigadierDto, NotificationLog, SendNotificationDto, UpdateBrigadierDto } from "../graphql/models";

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
  const [query, setQuery] = useState("");
  const { data, loading, error, refetch } = useBrigadiersQuery({
    variables: { filters: { search: query || undefined } },
  });
  const [createBrigadier] = useCreateBrigadierMutation();
  const [updateBrigadier] = useUpdateBrigadierMutation();
  const [deleteBrigadier] = useDeleteBrigadierMutation();
  const [notifyBrigadiers] = useNotifyBrigadiersMutation();

  const create = useCallback(async (dto: CreateBrigadierDto) => {
    const result = await createBrigadier({ variables: { input: toCreateBrigadierInput(dto) } });
    await refetch();
    return mapBrigadier(result.data!.createBrigadier);
  }, [createBrigadier, refetch]);

  const update = useCallback(async (id: string, dto: UpdateBrigadierDto) => {
    const result = await updateBrigadier({ variables: { id, input: toUpdateBrigadierInput(dto) } });
    await refetch();
    return mapBrigadier(result.data!.updateBrigadier);
  }, [refetch, updateBrigadier]);

  const remove = useCallback(async (id: string) => {
    await deleteBrigadier({ variables: { id } });
    await refetch();
  }, [deleteBrigadier, refetch]);

  const sendNotification = useCallback(async (dto: SendNotificationDto) => {
    const result = await notifyBrigadiers({ variables: { input: toNotifyBrigadiersInput(dto) } });
    await refetch();
    return mapNotificationLog(result.data!.notifyBrigadiers);
  }, [notifyBrigadiers, refetch]);

  return {
    brigadiers: data?.brigadiers.map(mapBrigadier) ?? [],
    logs: data?.notificationLogs.map(mapNotificationLog) ?? [],
    isLoading: loading,
    error: error?.message ?? null,
    create,
    update,
    remove,
    sendNotification,
    search: setQuery,
  };
}
