import type { AuditFields, BaseFilters } from "./common.types";

export type MaintenanceType = "Preventiva" | "Corretiva" | "Preditiva";
export type MaintenanceStatus =
  | "Pendente"
  | "Em andamento"
  | "Concluída"
  | "Atrasada"
  | "Cancelada";

export interface MaintenanceRecord extends AuditFields {
  id: string;
  equipment: string;
  equipmentId: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  scheduledDate: string;
  completedDate?: string;
  technician?: string;
  provider?: string;
  description: string;
  cost?: number;
  observations?: string;
}

export interface CreateMaintenanceDto {
  equipment: string;
  equipmentId?: string;
  type: MaintenanceType;
  scheduledDate: string;
  technician?: string;
  provider?: string;
  description: string;
}

export interface CompleteMaintenanceDto {
  completedDate: string;
  cost?: number;
  observations?: string;
}

export type UpdateMaintenanceDto = Partial<CreateMaintenanceDto>;

export interface MaintenanceFilters extends BaseFilters {
  status?: MaintenanceStatus | "all";
  type?: MaintenanceType | "all";
}
