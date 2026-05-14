import type { AuditFields } from "./common.types";

export type BrigadierRole = "Brigadista" | "Brigadista Chefe" | "Sub-Chefe";
export type NotificationChannel = "whatsapp" | "sms";
export type NotificationStatus = "sent" | "failed";

export interface Brigadier extends AuditFields {
  id: string;
  name: string;
  apartment: string;
  block: string;
  phone: string;
  role: BrigadierRole;
  certificationDate: string;
  certificationExpiry: string;
  certificationBody: string;
  active: boolean;
  observations?: string;
}

export interface NotificationLog extends AuditFields {
  id: string;
  channel: NotificationChannel;
  recipients: string[];
  message: string;
  sentAt: string;
  status: NotificationStatus;
}

export interface CreateBrigadierDto {
  name: string;
  apartment: string;
  block: string;
  phone: string;
  role: BrigadierRole;
  certificationDate: string;
  certificationExpiry: string;
  certificationBody: string;
  active: boolean;
  observations?: string;
}

export type UpdateBrigadierDto = Partial<CreateBrigadierDto>;

export interface SendNotificationDto {
  channel: NotificationChannel;
  recipientIds: string[];
  message: string;
}

export type CertificationStatus = "valid" | "expiring" | "expired";
