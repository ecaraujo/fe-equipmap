export type AppNotificationType =
  | "maintenance_overdue"
  | "maintenance_pending"
  | "warranty_expiring"
  | "warranty_expired";

export type NotificationSeverity = "high" | "medium" | "low";

export interface AppNotification {
  id: string;
  type: AppNotificationType;
  title: string;
  description: string;
  severity: NotificationSeverity;
  date?: string;
  read?: boolean;
}
