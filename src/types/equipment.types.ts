import type { AuditFields, BaseFilters } from "./common.types";

export type EquipmentStatus = "Ativo" | "Manutenção" | "Alerta" | "Inativo";
export type EquipmentType =
  | "Climatização"
  | "Transporte"
  | "Elétrica"
  | "Hidráulica"
  | "Segurança"
  | "Outros";

export interface Equipment extends AuditFields {
  id: string;
  name: string;
  type: EquipmentType;
  brand: string;
  model: string;
  serialNumber: string;
  patrimonyCode: string;
  location: string;
  status: EquipmentStatus;
  acquisitionDate: string;
  warrantyExpiry: string;
  lastMaintenance: string;
  nextMaintenance: string;
  value: number;
}

export interface CreateEquipmentDto {
  name: string;
  type: EquipmentType;
  brand: string;
  model: string;
  serialNumber: string;
  location: string;
  status: EquipmentStatus;
  acquisitionDate: string;
  warrantyExpiry: string;
  nextMaintenance: string;
  value: number;
}

export type UpdateEquipmentDto = Partial<CreateEquipmentDto>;

export interface EquipmentFilters extends BaseFilters {
  type?: EquipmentType | "all";
  status?: EquipmentStatus | "all";
}

export const EQUIPMENT_TYPES: EquipmentType[] = [
  "Climatização",
  "Transporte",
  "Elétrica",
  "Hidráulica",
  "Segurança",
  "Outros",
];
