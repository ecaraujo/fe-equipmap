import {
  BrigadierRole,
  EquipmentStatus,
  EquipmentType,
  MaintenanceType,
  NotificationChannel,
  ParkingSpotType,
  WarrantyType,
  type CreateApartmentInput,
  type CreateBrigadierInput,
  type CreateEquipmentInput,
  type CreateMaintenanceInput,
  type CompleteMaintenanceInput,
  type CreateParkingSpotInput,
  type CreateWarrantyInput,
  type NotifyBrigadiersInput,
  type UpdateApartmentInput,
  type UpdateBrigadierInput,
  type UpdateEquipmentInput,
  type UpdateParkingSpotInput,
} from "./generated";
import type {
  CreateApartmentDto,
  CreateBrigadierDto,
  CompleteMaintenanceDto,
  CreateEquipmentDto,
  CreateMaintenanceDto,
  CreateSpotDto,
  CreateWarrantyDto,
  SendNotificationDto,
  UpdateApartmentDto,
  UpdateBrigadierDto,
  UpdateEquipmentDto,
  UpdateSpotDto,
} from "./models";

function toIsoDate(value?: string | null): string {
  if (!value) return new Date().toISOString().slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const pt = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (pt) return `${pt[3]}-${pt[2]}-${pt[1]}`;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString().slice(0, 10) : date.toISOString().slice(0, 10);
}

function monthsBetween(startIso: string, endIso: string): number {
  const [startYear, startMonth, startDay] = startIso.split("-").map(Number);
  const [endYear, endMonth, endDay] = endIso.split("-").map(Number);
  let months = (endYear - startYear) * 12 + (endMonth - startMonth);
  if (endDay < startDay) months -= 1;
  return Math.max(1, months);
}

const equipmentTypeMap: Record<string, EquipmentType> = {
  Climatizacao: "CLIMATIZATION",
  "ClimatizaÃ§Ã£o": "CLIMATIZATION",
  "Climatiza\u00e7\u00e3o": "CLIMATIZATION",
  Transporte: "TRANSPORT",
  Eletrica: "ELECTRICAL",
  "ElÃ©trica": "ELECTRICAL",
  "El\u00e9trica": "ELECTRICAL",
  Hidraulica: "HYDRAULIC",
  "HidrÃ¡ulica": "HYDRAULIC",
  "Hidr\u00e1ulica": "HYDRAULIC",
  Seguranca: "SECURITY",
  "SeguranÃ§a": "SECURITY",
  "Seguran\u00e7a": "SECURITY",
  Outros: "OTHER",
};

const equipmentStatusMap: Record<string, EquipmentStatus> = {
  Ativo: "ACTIVE",
  Manutencao: "MAINTENANCE",
  "ManutenÃ§Ã£o": "MAINTENANCE",
  "Manuten\u00e7\u00e3o": "MAINTENANCE",
  Alerta: "ALERT",
  Inativo: "INACTIVE",
};

const maintenanceTypeMap: Record<string, MaintenanceType> = {
  Preventiva: "PREVENTIVE",
  Corretiva: "CORRECTIVE",
  Preditiva: "PREDICTIVE",
};

const warrantyTypeMap: Record<string, WarrantyType> = {
  Fabricante: "MANUFACTURER",
  Fornecedor: "SUPPLIER",
  Estendida: "EXTENDED",
  "ServiÃ§o": "SERVICE",
  "Servi\u00e7o": "SERVICE",
};

const spotTypeMap: Record<string, ParkingSpotType> = {
  Padrao: "STANDARD",
  "PadrÃ£o": "STANDARD",
  "Padr\u00e3o": "STANDARD",
  Deficiente: "ACCESSIBLE",
  Moto: "MOTORCYCLE",
  Especial: "SPECIAL",
};

const brigadierRoleMap: Record<string, BrigadierRole> = {
  Brigadista: "BRIGADIER",
  "Brigadista Chefe": "CHIEF",
  "Sub-Chefe": "DEPUTY_CHIEF",
};

const channelMap: Record<string, NotificationChannel> = {
  whatsapp: "WHATSAPP",
  sms: "SMS",
};

function requiredMappedValue<T>(map: Record<string, T>, value: string | undefined, field: string): T {
  const mapped = value ? map[value] : undefined;
  if (!mapped) {
    throw new Error(`Valor invalido para ${field}: ${value ?? ""}`);
  }
  return mapped;
}

function optionalMappedValue<T>(map: Record<string, T>, value: string | undefined, field: string): T | undefined {
  if (!value) return undefined;
  return requiredMappedValue(map, value, field);
}

export function toCreateEquipmentInput(dto: CreateEquipmentDto): CreateEquipmentInput {
  return {
    name: dto.name,
    type: requiredMappedValue(equipmentTypeMap, dto.type, "tipo do equipamento"),
    brand: dto.brand,
    model: dto.model ?? "",
    serialNumber: dto.serialNumber ?? "",
    location: dto.location,
    status: requiredMappedValue(equipmentStatusMap, dto.status ?? "Ativo", "status do equipamento"),
    acquisitionDate: toIsoDate(dto.acquisitionDate),
    warrantyExpiry: toIsoDate(dto.warrantyExpiry),
    nextMaintenance: toIsoDate(dto.nextMaintenance),
    value: dto.value ?? 0,
  };
}

export function toUpdateEquipmentInput(dto: UpdateEquipmentDto): UpdateEquipmentInput {
  return {
    name: dto.name,
    type: optionalMappedValue(equipmentTypeMap, dto.type, "tipo do equipamento"),
    brand: dto.brand,
    model: dto.model,
    serialNumber: dto.serialNumber,
    location: dto.location,
    status: optionalMappedValue(equipmentStatusMap, dto.status, "status do equipamento"),
    acquisitionDate: dto.acquisitionDate ? toIsoDate(dto.acquisitionDate) : undefined,
    warrantyExpiry: dto.warrantyExpiry ? toIsoDate(dto.warrantyExpiry) : undefined,
    nextMaintenance: dto.nextMaintenance ? toIsoDate(dto.nextMaintenance) : undefined,
    value: dto.value,
  };
}

export function toCreateMaintenanceInput(dto: CreateMaintenanceDto): CreateMaintenanceInput {
  return {
    equipment: dto.equipment,
    equipmentId: dto.equipmentId,
    type: requiredMappedValue(maintenanceTypeMap, dto.type, "tipo de manutencao"),
    scheduledDate: toIsoDate(dto.scheduledDate),
    technician: dto.technician,
    provider: dto.provider,
    description: dto.description,
  };
}

export function toCompleteMaintenanceInput(dto: CompleteMaintenanceDto): CompleteMaintenanceInput {
  return {
    completedDate: toIsoDate(dto.completedDate),
    cost: dto.cost,
    observations: dto.observations,
  };
}

export function toCreateWarrantyInput(dto: CreateWarrantyDto): CreateWarrantyInput {
  const warrantyStart = toIsoDate(dto.warrantyStart);
  const warrantyEnd = toIsoDate(dto.warrantyEnd);
  return {
    equipment: dto.equipment,
    equipmentId: dto.equipmentId,
    brand: dto.brand,
    model: dto.model ?? "",
    serialNumber: dto.serialNumber,
    supplier: dto.supplier,
    supplierContact: dto.supplierContact,
    purchaseDate: toIsoDate(dto.purchaseDate ?? warrantyStart),
    warrantyStart,
    warrantyEnd,
    warrantyMonths: dto.warrantyMonths ?? monthsBetween(warrantyStart, warrantyEnd),
    type: requiredMappedValue(warrantyTypeMap, dto.type, "tipo de garantia"),
    observations: dto.observations,
  };
}

export function toCreateApartmentInput(dto: CreateApartmentDto): CreateApartmentInput {
  return { ...dto };
}

export function toUpdateApartmentInput(dto: UpdateApartmentDto): UpdateApartmentInput {
  return { ...dto };
}

export function toCreateSpotInput(dto: CreateSpotDto): CreateParkingSpotInput {
  return { ...dto, type: requiredMappedValue(spotTypeMap, dto.type, "tipo da vaga") };
}

export function toUpdateSpotInput(dto: UpdateSpotDto): UpdateParkingSpotInput {
  return { ...dto, type: optionalMappedValue(spotTypeMap, dto.type, "tipo da vaga") };
}

export function toCreateBrigadierInput(dto: CreateBrigadierDto): CreateBrigadierInput {
  return {
    ...dto,
    role: requiredMappedValue(brigadierRoleMap, dto.role, "funcao do brigadista"),
    certificationDate: toIsoDate(dto.certificationDate),
    certificationExpiry: toIsoDate(dto.certificationExpiry),
  };
}

export function toUpdateBrigadierInput(dto: UpdateBrigadierDto): UpdateBrigadierInput {
  return {
    ...dto,
    role: optionalMappedValue(brigadierRoleMap, dto.role, "funcao do brigadista"),
    certificationDate: dto.certificationDate ? toIsoDate(dto.certificationDate) : undefined,
    certificationExpiry: dto.certificationExpiry ? toIsoDate(dto.certificationExpiry) : undefined,
  };
}

export function toNotifyBrigadiersInput(dto: SendNotificationDto): NotifyBrigadiersInput {
  return {
    ...dto,
    channel: requiredMappedValue(channelMap, dto.channel, "canal de notificacao"),
  };
}
