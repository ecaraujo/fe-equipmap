import type { AuditFields, BaseFilters } from "./common.types";

export type WarrantyType = "Fabricante" | "Fornecedor" | "Estendida" | "Serviço";
export type WarrantyStatus = "Vigente" | "Vencendo" | "Vencida";

export interface Warranty extends AuditFields {
  id: string;
  equipment: string;
  equipmentId: string;
  brand: string;
  model: string;
  serialNumber: string;
  supplier: string;
  supplierContact: string;
  purchaseDate: string;
  warrantyStart: string;
  warrantyEnd: string;
  warrantyMonths: number;
  type: WarrantyType;
  status: WarrantyStatus;
  observations?: string;
  documentUrl?: string;
}

export interface CreateWarrantyDto {
  equipment: string;
  equipmentId?: string;
  brand: string;
  model: string;
  serialNumber?: string;
  supplier: string;
  supplierContact?: string;
  purchaseDate: string;
  warrantyStart: string;
  warrantyEnd: string;
  warrantyMonths?: number;
  type: WarrantyType;
  observations?: string;
}

export type UpdateWarrantyDto = Partial<CreateWarrantyDto>;

export interface WarrantyFilters extends BaseFilters {
  status?: WarrantyStatus | "all";
  type?: WarrantyType | "all";
}
