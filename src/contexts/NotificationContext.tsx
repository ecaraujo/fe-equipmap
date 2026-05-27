import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useMarkAllNotificationsReadMutation, useMarkNotificationReadMutation, useNotificationsQuery } from "../graphql/generated";
import { mapNotification } from "../graphql/mappers";
import type { AppNotification } from "../graphql/models";

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { data, refetch } = useNotificationsQuery();
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();

  const notifications = useMemo(
    () => data?.notifications.map(mapNotification) ?? [],
    [data],
  );

  const markAsRead = useCallback((id: string) => {
    void markRead({ variables: { id } }).then(() => refetch());
  }, [markRead, refetch]);

  const markAllAsRead = useCallback(() => {
    void markAllRead().then(() => refetch());
  }, [markAllRead, refetch]);

  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used inside <NotificationProvider>");
  return ctx;
}
